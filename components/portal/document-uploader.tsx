"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, IdCard, Loader2, Medal, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DocStatusBadge } from "@/components/status-badge";
import type { DocStatus } from "@/lib/mock-data";

type Kind = "transcript" | "ielts" | "identity";

export interface UploadSlot {
  kind: Kind;
  title: string;
  accept: string; // mô tả hiển thị
  mimes: string; // thuộc tính accept của <input>
  fileName?: string;
  status: DocStatus;
  reason?: string | null;
}

const ICONS = { transcript: FileText, ielts: Medal, identity: IdCard } as const;
const MAX_BYTES = 8 * 1024 * 1024;

export function DocumentUploader({ slots }: { slots: UploadSlot[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Kind | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Kind, string>>>({});
  const inputs = useRef<Partial<Record<Kind, HTMLInputElement | null>>>({});

  async function upload(kind: Kind, file: File) {
    setErrors((e) => ({ ...e, [kind]: undefined }));
    if (file.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, [kind]: "File quá lớn (tối đa 8 MB)." }));
      return;
    }
    setBusy(kind);
    try {
      const body = new FormData();
      body.set("kind", kind);
      body.set("file", file);
      const res = await fetch("/api/portal/documents", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Không nộp được giấy tờ. Bạn thử lại nhé.");
      router.refresh(); // tải lại dữ liệu từ server để hiện kết quả trích xuất
    } catch (err) {
      setErrors((e) => ({ ...e, [kind]: err instanceof Error ? err.message : "Không nộp được giấy tờ." }));
    } finally {
      setBusy(null);
      const input = inputs.current[kind];
      if (input) input.value = ""; // cho phép chọn lại cùng một file
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {slots.map((slot) => {
        const Icon = ICONS[slot.kind];
        const loading = busy === slot.kind;
        const status: DocStatus = loading ? "dang_xu_ly" : slot.status;
        return (
          <div key={slot.kind}>
            <Card className="flex aspect-video flex-col items-center justify-center gap-2 border-none bg-foreground/5 p-6 shadow-none ring-0">
              {loading ? <Loader2 className="size-7 animate-spin text-muted-foreground" /> : <Icon className="size-7 text-muted-foreground" />}
              <span className="max-w-full truncate px-4 text-xs text-muted-foreground">
                {loading ? "Đang đọc giấy tờ…" : (slot.fileName ?? "Chưa nộp")}
              </span>
            </Card>

            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{slot.title}</h3>
                <DocStatusBadge status={status} />
              </div>
              <p className="mt-3 text-balance text-muted-foreground">
                {!loading && slot.status === "can_nop_lai" && slot.reason ? (
                  <>
                    Cần nộp lại: <span className="text-red-600">{slot.reason}</span>
                  </>
                ) : (
                  slot.accept
                )}
              </p>
              {errors[slot.kind] && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {errors[slot.kind]}
                </p>
              )}
              <input
                ref={(el) => {
                  inputs.current[slot.kind] = el;
                }}
                type="file"
                accept={slot.mimes}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(slot.kind, file);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                disabled={busy !== null}
                onClick={() => inputs.current[slot.kind]?.click()}
              >
                <Upload className="size-4" />
                {slot.fileName ? "Nộp lại" : "Chọn file"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
