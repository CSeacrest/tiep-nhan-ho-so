import { Award, BookOpen, MapPin } from "lucide-react";
import { schools } from "@/lib/mock-data";

export function SchoolScores() {
  return (
    <section id="diem-chuan" className="scroll-mt-24 bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Điểm chuẩn</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Biết mình đủ điều kiện vào trường nào
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sau khi nộp đủ hồ sơ, hệ thống tự so điểm học tập và điểm IELTS của bạn với điểm chuẩn từng trường
            và báo ngay trường nào đủ điều kiện.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <li
              key={school.id}
              className="rounded-3xl bg-card p-6 shadow-sm shadow-primary/5 ring-1 ring-border duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <h3 className="text-lg font-semibold leading-snug">{school.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {school.country}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-accent/70 p-3.5">
                  <BookOpen className="size-4 text-primary" />
                  <p className="mt-2 text-xl font-semibold text-accent-foreground">{school.minGpa.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">GPA tối thiểu</p>
                </div>
                <div className="rounded-2xl bg-accent/70 p-3.5">
                  <Award className="size-4 text-primary" />
                  <p className="mt-2 text-xl font-semibold text-accent-foreground">{school.minIelts.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">IELTS tối thiểu</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Dữ liệu minh hoạ để tham khảo. Điểm chuẩn thực tế do từng trường quy định.
        </p>
      </div>
    </section>
  );
}
