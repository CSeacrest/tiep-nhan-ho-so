import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@supabase/server/core";
import { FILE_RULES, MAX_FILE_BYTES, extractDocument, isDocKind, sniffMime } from "@/lib/documents";
import { DOCUMENT_BUCKET, PROFILE_COOKIE } from "@/lib/student-profile";
import { UUID_RE } from "@/lib/chat-log";

// Học viên nộp giấy tờ: kiểm tra file → OpenAI đọc → lưu file (bucket riêng tư) + thông tin đã trích xuất vào Supabase.
// Chỉ chạy ở server; khoá OpenAI và khoá secret Supabase không bao giờ xuống trình duyệt.
export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT = 10; // lượt nộp tối đa / IP / phút
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
  }
  return recent.length > RATE_LIMIT;
}

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return fail(429, "Bạn thao tác hơi nhanh, vui lòng đợi một chút rồi thử lại.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Yêu cầu không hợp lệ.");
  }
  const kind = form.get("kind");
  const file = form.get("file");
  if (!isDocKind(kind) || !(file instanceof File)) return fail(400, "Yêu cầu không hợp lệ.");

  const rule = FILE_RULES[kind];
  if (file.size === 0) return fail(400, "File trống.");
  if (file.size > MAX_FILE_BYTES) return fail(413, "File quá lớn (tối đa 8 MB).");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffMime(bytes);
  if (!mime || !rule.mimes.includes(mime)) return fail(415, `Loại giấy tờ này chỉ nhận file ${rule.label}.`);

  // Hồ sơ gắn với cookie httpOnly (JavaScript trong trình duyệt không đọc được). Chưa có thì tạo mới.
  const jar = await cookies();
  const existing = jar.get(PROFILE_COOKIE)?.value;
  const profileId = existing && UUID_RE.test(existing) ? existing.toLowerCase() : randomUUID();

  let result;
  try {
    result = await extractDocument(kind, bytes, mime);
  } catch (err) {
    // Không ghi nội dung giấy tờ vào log, chỉ ghi lý do lỗi
    console.error("[portal] lỗi đọc giấy tờ:", err instanceof Error ? err.message : err);
    return fail(502, "Hệ thống chưa đọc được giấy tờ lúc này. Bạn thử lại sau ít phút nhé.");
  }

  try {
    const supabase = createAdminClient();
    const ext = mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg";
    const storagePath = `${profileId}/${kind}-${Date.now()}.${ext}`;

    const up = await supabase.storage.from(DOCUMENT_BUCKET).upload(storagePath, bytes, { contentType: mime, upsert: false });
    if (up.error) throw up.error;

    const prof = await supabase
      .from("student_profiles")
      .upsert({ id: profileId, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (prof.error) throw prof.error;

    const old = await supabase.from("student_documents").select("storage_path").eq("profile_id", profileId).eq("kind", kind).maybeSingle();

    const doc = await supabase.from("student_documents").upsert(
      {
        profile_id: profileId,
        kind,
        file_name: file.name.replace(/[\u0000-\u001f<>"\/]/g, "").slice(0, 150) || `${kind}.${ext}`,
        mime_type: mime,
        size_bytes: file.size,
        storage_path: storagePath,
        status: result.ok ? "hop_le" : "can_nop_lai",
        reason: result.reason,
        extracted: result.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,kind" },
    );
    if (doc.error) throw doc.error;

    // Xoá file cũ của loại giấy tờ này (nếu nộp lại)
    if (old.data?.storage_path && old.data.storage_path !== storagePath) {
      await supabase.storage.from(DOCUMENT_BUCKET).remove([old.data.storage_path]);
    }
  } catch (err) {
    console.error("[portal] lỗi lưu hồ sơ:", err instanceof Error ? err.message : err);
    return fail(500, "Không lưu được giấy tờ. Bạn thử lại sau ít phút nhé.");
  }

  jar.set(PROFILE_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return Response.json({ ok: result.ok, reason: result.reason });
}
