'use client';
import type { AniListScoreDistribution } from '@/types/anilist';

const CHART_H = 96;

export function ScoreChart({ distribution }: { distribution: AniListScoreDistribution[] }) {
  const max = Math.max(...distribution.map((d) => d.amount), 1);
  const total = distribution.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-primary">Score Distribution</p>
        <p className="text-xs text-text-muted">{total.toLocaleString()} ratings</p>
      </div>

      {/* Bars: use position:absolute so height is always in px, never a % of auto */}
      <div className="relative flex items-end gap-1" style={{ height: CHART_H }}>
        {distribution.map(({ score, amount }) => {
          const barH = Math.max(2, Math.round((amount / max) * CHART_H));
          const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
          return (
            <div
              key={score}
              className="relative flex-1 group"
              style={{ height: CHART_H }}
              title={`Score ${score}: ${amount.toLocaleString()} votes (${pct}%)`}
            >
              {/* Bar */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-accent/50 group-hover:bg-accent transition-colors cursor-help"
                style={{ height: barH }}
              />
              {/* Tooltip count on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-surface-elevated border border-border rounded text-[9px] text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {amount.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score labels */}
      <div className="flex gap-1">
        {distribution.map(({ score }) => (
          <div key={score} className="flex-1 text-center">
            <span className="text-[9px] text-text-subtle">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
