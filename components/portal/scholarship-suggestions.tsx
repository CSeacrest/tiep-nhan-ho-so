"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Result = { suggestions: { scholarship: string; school: string; support: string; reason: string }[]; summary: string };

export function ScholarshipSuggestions({ passedCount }: { passedCount: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/scholarships", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as Partial<Result> & { error?: string };
      if (!res.ok || !data.suggestions) throw new Error(data.error || "Chưa gợi ý được lúc này. Bạn thử lại nhé.");
      setResult({ suggestions: data.suggestions, summary: data.summary ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa gợi ý được lúc này.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gợi ý học bổng</CardTitle>
        <p className="text-sm text-muted-foreground">
          {passedCount > 0
            ? "AI tra cứu học bổng của các trường bạn đạt yêu cầu và chọn học bổng phù hợp với hồ sơ của bạn."
            : "Bạn cần đạt yêu cầu đầu vào của ít nhất một trường để nhận gợi ý học bổng."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {passedCount > 0 && (
          <Button onClick={run} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Đang tra cứu…" : result ? "Gợi ý lại" : "Gợi ý học bổng cho tôi"}
          </Button>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {result && (
          <div className="space-y-3">
            {result.summary && <p className="text-sm">{result.summary}</p>}
            {result.suggestions.map((s) => (
              <div key={`${s.school}-${s.scholarship}`} className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{s.scholarship}</p>
                  <p className="text-sm font-semibold text-green-700">{s.support}</p>
                </div>
                <p className="text-sm text-muted-foreground">{s.school}</p>
                <p className="mt-2 text-sm">{s.reason}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Gợi ý mang tính tham khảo, kết quả cuối cùng do trường xét duyệt.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
