import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileDocuments } from "@/lib/student-profile";

const show = (v: string | number | null | undefined, digits?: number) =>
  v == null || v === "" ? "Chưa có" : typeof v === "number" && digits != null ? v.toFixed(digits) : String(v);

function Group({ title, empty, fields }: { title: string; empty: boolean; fields: { label: string; value: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {empty ? (
        <p className="mt-2 text-sm text-muted-foreground">Chưa nộp giấy tờ này.</p>
      ) : (
        <dl className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((f) => (
            <div key={f.label} className="rounded-lg bg-muted/40 p-3">
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 text-base font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function ExtractedInfo({ docs }: { docs: ProfileDocuments }) {
  const t = docs.transcript?.extracted;
  const i = docs.ielts?.extracted;
  const d = docs.identity?.extracted;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đã trích xuất</CardTitle>
        <p className="text-sm text-muted-foreground">
          Đây là thông tin hệ thống đọc được từ giấy tờ bạn đã nộp, kiểm tra lại xem có đúng không nhé.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Group
          title="Bảng điểm"
          empty={!t}
          fields={[
            { label: "Họ tên", value: show(t?.fullName) },
            { label: "Ngày sinh", value: show(t?.dateOfBirth) },
            {
              label: "Điểm học tập tổng kết",
              value: t?.gpa == null ? "Chưa có" : `${t.gpa}${t.gpaScale ? ` (thang ${t.gpaScale})` : ""}`,
            },
          ]}
        />
        <Group
          title="Chứng chỉ IELTS"
          empty={!i}
          fields={[
            { label: "Họ tên trên chứng chỉ", value: show(i?.fullName) },
            { label: "Nghe (Listening)", value: show(i?.listening, 1) },
            { label: "Đọc (Reading)", value: show(i?.reading, 1) },
            { label: "Viết (Writing)", value: show(i?.writing, 1) },
            { label: "Nói (Speaking)", value: show(i?.speaking, 1) },
            { label: "Điểm tổng (Overall)", value: show(i?.overall, 1) },
            { label: "Ngày thi", value: show(i?.testDate) },
          ]}
        />
        <Group
          title="CMND/CCCD hoặc hộ chiếu"
          empty={!d}
          fields={[
            { label: "Họ tên", value: show(d?.fullName) },
            { label: "Ngày sinh", value: show(d?.dateOfBirth) },
            { label: "Số giấy tờ", value: show(d?.idNumber) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
