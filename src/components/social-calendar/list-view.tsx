"use client";

import { SocialPost } from "./model";
import { CHANNEL_COLORS, CHANNEL_LABELS } from "./model";
import { FORMAT_META } from "./model";
import { STATUS_META } from "./model";
import { Badge } from "./badge";
import { formatDate, formatTime } from "./model";

export function ListView({
  posts,
  onPostClick,
}: {
  posts: SocialPost[];
  onPostClick: (post: SocialPost) => void;
}) {
  const sorted = [...posts].sort((a, b) =>
    (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime)
  );

  const grouped = sorted.reduce<Record<string, SocialPost[]>>((acc, p) => {
    (acc[p.scheduledDate] ??= []).push(p);
    return acc;
  }, {});

  const badgeVariant = (status: SocialPost["status"]) => status;

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      {Object.entries(grouped).map(([date, items], idx) => (
        <div key={date} className={idx > 0 ? "border-t border-border" : undefined}>
          <div className="bg-cream-dim/60 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {formatDate(date)}
          </div>
          {items.map((post) => {
            const colors = CHANNEL_COLORS[post.channel];
            const format = post.format ? FORMAT_META[post.format] : null;
            const FormatIcon = format?.icon;
            const status = STATUS_META[post.status];
            return (
              <button
                key={post.id}
                onClick={() => onPostClick(post)}
                className="flex w-full items-center gap-4 border-t border-l-4 border-border/60 px-5 py-3 text-left transition hover:bg-cream-dim/40 first:border-t-0"
                style={{ borderLeftColor: status.border }}
              >
                <span className="w-16 shrink-0 text-xs text-ink-soft">{formatTime(post.scheduledTime)}</span>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.bg }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                  <p className="truncate text-xs text-ink-soft">{post.caption}</p>
                </div>
                {format && (
                  <span
                    className="hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white sm:flex"
                    style={{ backgroundColor: format.color }}
                  >
                    {FormatIcon && <FormatIcon className="h-2.5 w-2.5" strokeWidth={2.5} />}
                    {format.label}
                  </span>
                )}
                <span className="hidden shrink-0 text-xs text-ink-soft sm:block">{CHANNEL_LABELS[post.channel]}</span>
                <Badge variant={badgeVariant(post.status)}>{post.status}</Badge>
              </button>
            );
          })}
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-soft">No posts to show.</p>
      )}
    </div>
  );
}
