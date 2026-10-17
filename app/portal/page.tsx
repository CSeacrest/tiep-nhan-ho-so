import { cookies } from "next/headers";
import { LogOut } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  DocumentUploader,
  type UploadSlot,
} from "@/components/portal/document-uploader";
import { ExtractedInfo } from "@/components/portal/extracted-info";
import { SchoolMatch } from "@/components/portal/school-match";
import { UUID_RE } from "@/lib/chat-log";
import { ScholarshipSuggestions } from "@/components/portal/scholarship-suggestions";
import { matchSchools } from "@/lib/school-matching";
import {
  PROFILE_COOKIE,
  getProfileDocuments,
  type StoredDocument,
} from "@/lib/student-profile";

// Dữ liệu riêng của từng học viên (theo cookie) nên luôn render mới ở server
export const dynamic = "force-dynamic";

function slot(
  base: Pick<UploadSlot, "kind" | "title" | "accept" | "mimes">,
  doc: StoredDocument | undefined,
): UploadSlot {
  return {
    ...base,
    fileName: doc?.fileName,
    status: doc?.status ?? "chua_nop",
    reason: doc?.reason,
  };
}

export default async function PortalPage() {
  const profileId = (await cookies()).get(PROFILE_COOKIE)?.value;
  const docs =
    profileId && UUID_RE.test(profileId)
      ? await getProfileDocuments(profileId.toLowerCase())
      : {};

  const name =
    docs.identity?.extracted?.fullName ??
    docs.transcript?.extracted?.fullName ??
    docs.ielts?.extracted?.fullName;

  const { matches, otherScale } = await matchSchools(docs);
  const passedCount = matches.filter((m) => m.passed).length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">Xin chào,</p>
            <h1 className="text-2xl font-medium tracking-tight">
              {name ?? "Học viên mới"}
            </h1>
          </div>
          <Button variant="outline">
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Giấy tờ cần nộp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nộp đủ 3 loại giấy tờ dưới đây, hệ thống sẽ tự trích xuất thông tin
            và đối chiếu điểm chuẩn giúp bạn.
          </p>

          <div className="mt-6">
            <DocumentUploader
              slots={[
                slot(
                  {
                    kind: "transcript",
                    title: "Bảng điểm (PDF)",
                    accept: "Chấp nhận PDF, tối đa 8 MB",
                    mimes: "application/pdf",
                  },
                  docs.transcript,
                ),
                slot(
                  {
                    kind: "ielts",
                    title: "Ảnh chứng chỉ IELTS",
                    accept: "Chấp nhận JPG, PNG, tối đa 8 MB",
                    mimes: "image/jpeg,image/png",
                  },
                  docs.ielts,
                ),
                slot(
                  {
                    kind: "identity",
                    title: "Ảnh CMND/CCCD hoặc hộ chiếu",
                    accept: "Chấp nhận JPG, PNG, tối đa 8 MB",
                    mimes: "image/jpeg,image/png",
                  },
                  docs.identity,
                ),
              ]}
            />
          </div>

          <Button size="lg" className="mt-6 w-full sm:w-auto">
            Nộp hồ sơ
          </Button>
        </section>

        <section className="mt-12 space-y-6">
          <ExtractedInfo docs={docs} />
          {otherScale && (
            <p className="text-sm text-muted-foreground">
              Điểm học tập trên bảng điểm không theo thang 10 nên chưa tự đối
              chiếu được; tư vấn viên sẽ quy đổi giúp bạn.
            </p>
          )}
          <SchoolMatch matches={matches} />
          <ScholarshipSuggestions passedCount={passedCount} />
        </section>
      </main>
    </>
  );
}
