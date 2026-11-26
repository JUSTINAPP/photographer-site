"use client";

import { SocialPost } from "./model";
import { CHANNEL_COLORS } from "./model";
import { FORMAT_META } from "./model";
import { STATUS_META } from "./model";
import { getMonthGrid, todayISO } from "./model";
import { cn } from "./model";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthView({
  reference,
  posts,
  onDayClick,
  onPostClick,
}: {
  reference: Date;
  posts: SocialPost[];
  onDayClick: (date: string) => void;
  onPostClick: (post: SocialPost) => void;
}) {
  const weeks = getMonthGrid(reference);
  const TODAY_ISO = todayISO();

  function postsFor(date: string): SocialPost[] {
    return posts.filter((p) => p.scheduledDate === date);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="border-l border-border px-3 py-2 text-center text-xs font-medium text-ink-soft first:border-l-0">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
          {week.map(({ date, inMonth }) => {
            const dayPosts = postsFor(date);
            const visible = dayPosts.slice(0, 3);
            const overflow = dayPosts.length - visible.length;
            const dayNum = parseInt(date.split("-")[2], 10);
            return (
              <button
                key={date}
                onClick={() => onDayClick(date)}
                className={cn(
                  "flex min-h-[104px] flex-col gap-1 border-l border-border p-2 text-left align-top transition first:border-l-0 hover:bg-cream-dim/50",
                  !inMonth && "bg-cream-dim/30"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    date === TODAY_ISO ? "bg-gold text-white" : inMonth ? "text-ink" : "text-ink-soft/50"
                  )}
                >
                  {dayNum}
                </span>
                <div className="space-y-1">
                  {visible.map((post) => {
                    const colors = CHANNEL_COLORS[post.channel];
                    const format = post.format ? FORMAT_META[post.format] : null;
                    const FormatIcon = format?.icon;
                    const status = STATUS_META[post.status];
                    return (
                      <div
                        key={post.id}
                        role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onPostClick(post); } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPostClick(post);
                        }}
                        className="flex min-w-0 items-center gap-1 overflow-hidden rounded border-l-2 px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderLeftColor: status.border,
                        }}
                      >
                        {FormatIcon && <FormatIcon className="h-2.5 w-2.5 shrink-0" style={{ color: format!.color }} strokeWidth={2.5} />}
                        <span className="min-w-0 flex-1 truncate">{post.title}</span>
                      </div>
                    );
                  })}
                  {overflow > 0 && <p className="px-1.5 text-[10px] text-ink-soft">+{overflow} more</p>}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
