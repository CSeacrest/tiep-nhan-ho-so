import { createClient } from "@supabase/supabase-js";

// Gợi ý học bổng bằng function calling (OpenAI): AI được cấp MỘT công cụ tra cứu học bổng theo trường
// và tự quyết định tra cứu trường nào, tự đối chiếu điều kiện với hồ sơ. Code ở đây KHÔNG chứa luật so sánh.

export type StudentSummary = {
  gpa: number; // thang 10
  ielts: { overall: number; listening: number | null; reading: number | null; writing: number | null; speaking: number | null };
};

export type Suggestion = { scholarship: string; school: string; support: string; reason: string };
export type AdvisorResult = { suggestions: Suggestion[]; summary: string };

const MODEL = process.env.OPENAI_EXTRACT_MODEL || "gpt-5.4-mini";
const MAX_ROUNDS = 6; // số vòng gọi công cụ tối đa, tránh vòng lặp vô hạn

type ScholarshipRow = {
  name: string;
  min_gpa: number | null;
  min_ielts: number | null;
  support_text: string;
  reference_schools: { name: string } | null;
};

// Công cụ duy nhất của AI: tra cứu học bổng của một trường. Chỉ đọc dữ liệu công khai (khoá publishable).
async function lookupScholarships(schoolName: string, allowed: string[]) {
  const school = allowed.find((n) => n.toLowerCase() === schoolName.trim().toLowerCase());
  if (!school) return { error: "Trường này không nằm trong danh sách trường học viên đạt yêu cầu.", allowed_schools: allowed };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { error: "Hệ thống chưa cấu hình cơ sở dữ liệu." };

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("scholarships")
    .select("name, min_gpa, min_ielts, support_text, reference_schools!inner(name)")
    .eq("reference_schools.name", school)
    .returns<ScholarshipRow[]>();
  if (error) {
    console.error("[advisor] không tra cứu được học bổng:", error.message);
    return { error: "Không tra cứu được lúc này." };
  }
  return {
    school,
    scholarships: data.map((s) => ({
      name: s.name,
      min_gpa_scale10: s.min_gpa,
      min_ielts: s.min_ielts,
      support: s.support_text,
    })),
  };
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "lookup_scholarships",
      description:
        "Tra cứu danh sách học bổng của MỘT trường: tên học bổng, điều kiện tối thiểu (điểm học tập thang 10, IELTS; null = không yêu cầu) và mức hỗ trợ. Gọi riêng cho từng trường cần xem.",
      parameters: {
        type: "object",
        properties: { school_name: { type: "string", description: "Tên trường, đúng như trong danh sách trường học viên đạt yêu cầu" } },
        required: ["school_name"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
] as const;

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          scholarship: { type: "string" },
          school: { type: "string" },
          support: { type: "string" },
          reason: { type: "string" },
        },
        required: ["scholarship", "school", "support", "reason"],
        additionalProperties: false,
      },
    },
    summary: { type: "string" },
  },
  required: ["suggestions", "summary"],
  additionalProperties: false,
} as const;

const SYSTEM = `Bạn là tư vấn viên du học, gợi ý học bổng cho học viên.
Bạn được cung cấp: điểm học tập (thang 10), điểm IELTS của học viên và danh sách trường học viên ĐÃ đạt yêu cầu đầu vào.
Cách làm:
1. Tự quyết định cần tra cứu học bổng của những trường nào trong danh sách, và gọi công cụ lookup_scholarships cho từng trường đó.
2. Dựa CHỈ vào kết quả công cụ trả về, tự đối chiếu điều kiện từng học bổng với hồ sơ học viên, rồi chọn các học bổng học viên đáp ứng điều kiện. Điều kiện null nghĩa là không yêu cầu điều kiện đó.
3. Sắp xếp học bổng có mức hỗ trợ cao hơn lên trước. Với mỗi gợi ý, "reason" là một câu tiếng Việt nêu rõ điểm của học viên so với điều kiện (ví dụ "Điểm học tập 8.3 ≥ 8.0").
4. Tuyệt đối không bịa tên học bổng, điều kiện hay mức hỗ trợ ngoài kết quả công cụ. Không hứa chắc chắn nhận được học bổng; nội dung là gợi ý, kết quả do trường xét duyệt.
5. Nếu không có học bổng phù hợp, trả suggestions rỗng và giải thích ngắn trong summary.
"summary" là 1-2 câu tiếng Việt tóm tắt cho học viên.`;

type Msg = Record<string, unknown>;

export async function suggestScholarships(student: StudentSummary, passedSchools: string[]): Promise<AdvisorResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("thiếu OPENAI_API_KEY");
  if (passedSchools.length === 0) return { suggestions: [], summary: "Bạn chưa đạt yêu cầu đầu vào của trường nào nên chưa có học bổng để gợi ý." };

  const { ielts: i } = student;
  const profile = `Hồ sơ học viên:
- Điểm học tập tổng kết (thang 10): ${student.gpa}
- IELTS tổng: ${i.overall} (Nghe ${i.listening ?? "?"}, Đọc ${i.reading ?? "?"}, Viết ${i.writing ?? "?"}, Nói ${i.speaking ?? "?"})
- Trường đã đạt yêu cầu đầu vào: ${passedSchools.join("; ")}`;

  const messages: Msg[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: profile },
  ];
  const seen = new Map<string, Set<string>>(); // trường → học bổng đã được công cụ trả về (để kiểm tra AI không bịa)

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        reasoning_effort: "none", // gpt-5.4-mini chỉ cho dùng công cụ khi tắt reasoning ở Chat Completions
        max_completion_tokens: 1500,
        tools: TOOLS,
        response_format: { type: "json_schema", json_schema: { name: "scholarship_suggestions", strict: true, schema: RESULT_SCHEMA } },
        messages,
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

    const body = (await res.json()) as {
      choices?: { message?: { content?: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[];
    };
    const msg = body.choices?.[0]?.message;
    if (!msg) throw new Error("OpenAI không trả kết quả");

    if (msg.tool_calls?.length) {
      messages.push(msg as Msg);
      for (const call of msg.tool_calls) {
        let output: unknown;
        try {
          const args = JSON.parse(call.function.arguments) as { school_name?: unknown };
          output =
            call.function.name === "lookup_scholarships" && typeof args.school_name === "string"
              ? await lookupScholarships(args.school_name, passedSchools)
              : { error: "Công cụ hoặc tham số không hợp lệ." };
        } catch {
          output = { error: "Tham số không hợp lệ." };
        }
        const found = output as { school?: string; scholarships?: { name: string }[] };
        if (found.school && found.scholarships) seen.set(found.school, new Set(found.scholarships.map((s) => s.name)));
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
      }
      continue;
    }

    if (!msg.content) throw new Error("OpenAI không trả nội dung");
    const parsed = JSON.parse(msg.content) as AdvisorResult;
    // Chỉ giữ gợi ý khớp đúng học bổng mà công cụ đã trả về (chặn AI bịa tên), không đánh giá điều kiện ở đây.
    const suggestions = parsed.suggestions.filter((s) => seen.get(s.school)?.has(s.scholarship));
    return { suggestions, summary: parsed.summary };
  }
  throw new Error("AI gọi công cụ quá nhiều vòng");
}
