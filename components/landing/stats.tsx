// Số liệu lấy từ bộ hỏi–đáp của dịch vụ (lib/chat-knowledge.ts), không thêm con số mới.
const stats = [
  { value: "3", label: "Loại giấy tờ cần chuẩn bị" },
  { value: "Vài phút", label: "Có kết quả đối chiếu sơ bộ" },
  { value: "2–6 tuần", label: "Kết quả chính thức từ trường" },
  { value: "2 gói", label: "Cơ bản & Toàn diện" },
];

export function Stats() {
  return (
    <section aria-label="Điểm nhanh về dịch vụ" className="relative z-10 -mt-4 pb-6">
      <div className="mx-auto max-w-7xl px-6">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border shadow-lg shadow-primary/5 ring-1 ring-border lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card px-6 py-7 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight text-primary md:text-4xl">{s.value}</dd>
              <p aria-hidden className="mt-1.5 text-sm text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
