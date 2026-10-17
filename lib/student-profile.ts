import { createAdminClient } from "@supabase/server/core";
import type { DocKind, ExtractedByKind } from "@/lib/documents";

// Hồ sơ học viên trong Supabase (bảng tạo bởi supabase/student-documents.sql).
// DỮ LIỆU RIÊNG TƯ: chỉ đọc/ghi ở server bằng khoá secret; RLS không có policy nên trình duyệt không truy cập được.

export const PROFILE_COOKIE = "profile_id";
export const DOCUMENT_BUCKET = "student-documents";

export type StoredDocument<K extends DocKind = DocKind> = {
  kind: K;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: "hop_le" | "can_nop_lai";
  reason: string | null;
  extracted: ExtractedByKind[K] | null;
  updatedAt: string;
};

export type ProfileDocuments = { [K in DocKind]?: StoredDocument<K> };

export async function getProfileDocuments(profileId: string): Promise<ProfileDocuments> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("student_documents")
      .select("kind, file_name, mime_type, size_bytes, status, reason, extracted, updated_at")
      .eq("profile_id", profileId);
    if (error) throw error;

    const docs: Record<string, StoredDocument> = {};
    for (const r of data) {
      docs[r.kind] = {
        kind: r.kind,
        fileName: r.file_name,
        mimeType: r.mime_type,
        sizeBytes: r.size_bytes,
        status: r.status,
        reason: r.reason,
        extracted: r.extracted,
        updatedAt: r.updated_at,
      };
    }
    return docs as ProfileDocuments;
  } catch (err) {
    console.error("[profile] không đọc được hồ sơ:", err instanceof Error ? err.message : err);
    return {};
  }
}
