import { getReferenceSchools, type ReferenceSchool } from "@/lib/reference-schools";
import type { ProfileDocuments } from "@/lib/student-profile";

export type SchoolMatch = { school: ReferenceSchool; passed: boolean };

export type MatchResult = {
  gpa: number | null; // điểm học tập quy về thang 10 (null nếu chưa có hoặc thang khác)
  ielts: number | null; // điểm IELTS tổng
  otherScale: boolean; // bảng điểm hợp lệ nhưng không theo thang 10
  matches: SchoolMatch[]; // rỗng nếu thiếu điểm
};

// So điểm học tập và IELTS của học viên với điểm chuẩn từng trường (chỉ khi giấy tờ hợp lệ).
export async function matchSchools(docs: ProfileDocuments): Promise<MatchResult> {
  const t = docs.transcript?.status === "hop_le" ? docs.transcript.extracted : null;
  const ielts = docs.ielts?.status === "hop_le" ? (docs.ielts.extracted?.overall ?? null) : null;
  const gpa = t?.gpa != null && (t.gpaScale == null || t.gpaScale === 10) ? t.gpa : null;
  const otherScale = t?.gpa != null && gpa == null;

  const matches =
    gpa != null && ielts != null
      ? (await getReferenceSchools()).map((school) => ({
          school,
          passed: gpa >= school.minGpa && ielts >= school.minIelts,
        }))
      : [];
  return { gpa, ielts, otherScale, matches };
}
