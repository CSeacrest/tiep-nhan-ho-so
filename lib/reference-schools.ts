import { createClient } from "@supabase/supabase-js";

// Đọc danh sách trường tham chiếu (bảng reference_schools, tạo bởi supabase/reference-schools.sql).
// Dữ liệu công khai nên chỉ dùng khoá publishable (anon) – RLS chỉ cho phép đọc.

export type ReferenceSchool = {
  id: string;
  name: string;
  country: string;
  minGpa: number;
  minIelts: number;
};

export async function getReferenceSchools(): Promise<ReferenceSchool[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[schools] thiếu SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
    return [];
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("reference_schools")
    .select("id, name, country, min_gpa, min_ielts")
    .order("min_gpa", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[schools] không đọc được reference_schools:", error.message);
    return [];
  }
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    minGpa: Number(r.min_gpa),
    minIelts: Number(r.min_ielts),
  }));
}
