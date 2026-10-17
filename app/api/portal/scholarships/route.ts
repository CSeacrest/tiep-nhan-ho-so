import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { UUID_RE } from "@/lib/chat-log";
import { matchSchools } from "@/lib/school-matching";
import { suggestScholarships } from "@/lib/scholarship-advisor";
import { PROFILE_COOKIE, getProfileDocuments } from "@/lib/student-profile";

// Gợi ý học bổng cho học viên đang có cookie hồ sơ. Hồ sơ đọc ở server; AI chỉ nhận điểm số và tên trường
// (không gửi họ tên, ngày sinh, số giấy tờ).
export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT = 5; // lượt / IP / phút (mỗi lượt gọi AI nhiều lần)
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

  const profileId = (await cookies()).get(PROFILE_COOKIE)?.value;
  if (!profileId || !UUID_RE.test(profileId)) return fail(400, "Bạn chưa nộp giấy tờ nào.");

  const docs = await getProfileDocuments(profileId.toLowerCase());
  const { gpa, ielts, matches } = await matchSchools(docs);
  const ieltsDoc = docs.ielts?.extracted;
  if (gpa == null || ielts == null || !ieltsDoc) return fail(400, "Cần nộp bảng điểm và chứng chỉ IELTS hợp lệ trước.");

  const passed = matches.filter((m) => m.passed).map((m) => m.school.name);
  try {
    const result = await suggestScholarships(
      {
        gpa,
        ielts: {
          overall: ielts,
          listening: ieltsDoc.listening,
          reading: ieltsDoc.reading,
          writing: ieltsDoc.writing,
          speaking: ieltsDoc.speaking,
        },
      },
      passed,
    );
    return Response.json(result);
  } catch (err) {
    console.error("[scholarships] lỗi gợi ý:", err instanceof Error ? err.message : err);
    return fail(502, "Hệ thống chưa gợi ý được lúc này. Bạn thử lại sau ít phút nhé.");
  }
}
