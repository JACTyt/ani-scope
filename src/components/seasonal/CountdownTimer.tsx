'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  label: string;
}

function formatDuration(ms: number) {
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => formatDuration(targetDate.getTime() - Date.now()));

  useEffect(() => {
    const tick = () => setRemaining(formatDuration(targetDate.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!remaining) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4 inline-flex flex-col items-center gap-2">
      <p className="text-xs text-text-subtle uppercase tracking-wider">{label}</p>
      <div className="flex gap-3 text-center">
        {remaining.days > 0 && (
          <div>
            <div className="text-2xl font-bold text-accent">{remaining.days}</div>
            <div className="text-[10px] text-text-subtle">days</div>
          </div>
        )}
        <div>
          <div className="text-2xl font-bold text-text-primary">{pad(remaining.hours)}</div>
          <div className="text-[10px] text-text-subtle">hrs</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-text-primary">{pad(remaining.minutes)}</div>
          <div className="text-[10px] text-text-subtle">min</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-text-primary">{pad(remaining.seconds)}</div>
          <div className="text-[10px] text-text-subtle">sec</div>
        </div>
      </div>
    </div>
  );
}
