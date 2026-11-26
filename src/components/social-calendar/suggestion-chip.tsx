"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PostingSuggestion } from "./model";
import { FORMAT_META } from "./model";
import { formatTime } from "./model";

export function SuggestionChip({
  suggestion,
  date,
  accent,
  onSchedule,
}: {
  suggestion: PostingSuggestion;
  date: string;
  accent: string;
  onSchedule: (suggestion: PostingSuggestion, date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = FORMAT_META[suggestion.contentType];
  const Icon = meta.icon;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full min-w-0 items-center gap-1 overflow-hidden rounded-md border border-dashed bg-white/60 px-2 py-1.5 text-left text-[11px] font-medium transition hover:bg-white"
        style={{ borderColor: accent, color: accent }}
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">💡 {meta.label} idea</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accent}1a` }}
                >
                  <Icon className="h-4 w-4" style={{ color: accent }} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{meta.label} idea</p>
                  <p className="text-xs text-ink-soft">
                    {suggestion.day} · {formatTime(suggestion.time)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-ink-soft hover:bg-cream-dim hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-ink">{suggestion.contentSuggestion}</p>
            {suggestion.reason && (
              <p className="mt-2.5 rounded-lg bg-cream-dim px-3 py-2 text-xs text-ink-soft">
                💡 {suggestion.reason}
              </p>
            )}
            <button
              onClick={() => {
                onSchedule(suggestion, date);
                setOpen(false);
              }}
              className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: accent }}
            >
              Schedule this
            </button>
          </div>
        </div>
      )}
    </>
  );
}
