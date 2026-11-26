"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { SocialPost } from "./model";
import { CHANNEL_COLORS, CHANNEL_LABELS } from "./model";
import { FORMAT_META } from "./model";
import { STATUS_META } from "./model";
import { todayISO } from "./model";
import { PostingSuggestion } from "./model";
import { SuggestionChip } from "./suggestion-chip";
import { cn } from "./model";

// Hour rows the grid renders — 6am to 10pm covers every slot the seeded
// content and AI suggestions actually use. Anything scheduled outside this
// window is clamped into the nearest edge row rather than silently dropped.
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

function hourLabel(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

function clampedHourOf(time: string): number {
  const hour = parseInt(time.split(":")[0], 10);
  if (Number.isNaN(hour)) return START_HOUR;
  return Math.min(END_HOUR, Math.max(START_HOUR, hour));
}

export interface SuggestionSlot {
  date: string;
  suggestion: PostingSuggestion;
}

export function WeekView({
  weekDates,
  posts,
  onSlotClick,
  onPostClick,
  suggestionSlots = [],
  accent,
  onScheduleSuggestion,
}: {
  weekDates: string[];
  posts: SocialPost[];
  onSlotClick: (date: string, time: string) => void;
  onPostClick: (post: SocialPost) => void;
  suggestionSlots?: SuggestionSlot[];
  accent?: string;
  onScheduleSuggestion?: (suggestion: PostingSuggestion, date: string) => void;
}) {
  const TODAY_ISO = todayISO();
  const dayLabels = weekDates.map((d) => {
    const date = new Date(`${d}T00:00:00`);
    return {
      date: d,
      weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      day: date.getDate(),
    };
  });

  function itemsForCell(date: string, hour: number): { time: string; key: string; node: ReactNode }[] {
    const cellPosts = posts.filter((p) => p.scheduledDate === date && clampedHourOf(p.scheduledTime) === hour);
    const cellSuggestions = suggestionSlots.filter(
      (s) => s.date === date && clampedHourOf(s.suggestion.time) === hour
    );

    return [
      ...cellPosts.map((post) => {
        const colors = CHANNEL_COLORS[post.channel];
        const format = post.format ? FORMAT_META[post.format] : null;
        const FormatIcon = format?.icon;
        const status = STATUS_META[post.status];
        const StatusIcon = status.icon;
        return {
          time: post.scheduledTime,
          key: post.id,
          node: (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPostClick(post);
              }}
              className="w-full min-w-0 overflow-hidden rounded-md border-2 px-2 py-1.5 text-left text-[11px] leading-tight transition hover:brightness-95"
              style={{
                backgroundColor: colors.bg,
                borderColor: status.border,
                color: colors.text,
              }}
            >
              <div className="flex min-w-0 items-center gap-1">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colors.dot }}
                  title={CHANNEL_LABELS[post.channel]}
                />
                <p className="min-w-0 flex-1 truncate font-medium">{post.title}</p>
                {FormatIcon && (
                  <FormatIcon className="h-3 w-3 shrink-0" style={{ color: format!.color }} strokeWidth={2.5} />
                )}
                <span className="shrink-0" title={status.label}>
                  <StatusIcon className="h-3 w-3" style={{ color: status.border }} />
                </span>
              </div>
              <p className="mt-0.5 text-[10px] opacity-70">{post.scheduledTime}</p>
            </button>
          ),
        };
      }),
      ...cellSuggestions.map(({ suggestion }, i) => ({
        time: suggestion.time,
        key: `suggestion-${date}-${hour}-${i}`,
        node: (
          <div onClick={(e) => e.stopPropagation()}>
            <SuggestionChip
              suggestion={suggestion}
              date={date}
              accent={accent ?? "#c9a84c"}
              onSchedule={onScheduleSuggestion ?? (() => {})}
            />
          </div>
        ),
      })),
    ].sort((a, b) => a.time.localeCompare(b.time));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <div className="min-w-[1040px]">
        {/* Header row: blank hour-gutter cell + 7 day headers */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border">
          <div />
          {dayLabels.map(({ date, weekday, day }) => (
            <div
              key={date}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 border-l border-border py-3",
                date === TODAY_ISO && "bg-gold/5"
              )}
            >
              <span className="text-xs font-medium text-ink-soft">{weekday}</span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold",
                  date === TODAY_ISO ? "bg-gold text-white" : "text-ink"
                )}
              >
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Hour-gridded body. Each hour is its own row; a busy hour on a busy
            day grows that row's height across every column (CSS grid rows
            size to the tallest cell) instead of squeezing any day narrower. */}
        <div>
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border/60 last:border-b-0">
              <div className="flex items-start justify-end border-r border-border/60 px-2 py-2 text-[11px] font-medium text-ink-soft">
                {hourLabel(hour)}
              </div>
              {dayLabels.map(({ date }) => {
                const items = itemsForCell(date, hour);
                return (
                  <div
                    key={date}
                    onClick={() => onSlotClick(date, `${hour.toString().padStart(2, "0")}:00`)}
                    className={cn(
                      "group flex min-h-[44px] min-w-0 cursor-pointer flex-col gap-1.5 overflow-hidden border-l border-border/70 p-1.5 transition hover:bg-cream-dim/40",
                      date === TODAY_ISO && "bg-gold/[0.03]"
                    )}
                  >
                    {items.length === 0 ? (
                      <span className="flex h-full min-h-[28px] items-center justify-center opacity-0 transition group-hover:opacity-100">
                        <Plus className="h-3 w-3 text-ink-soft" />
                      </span>
                    ) : (
                      items.map((item) => (
                        <div key={item.key} className="min-w-0">
                          {item.node}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
