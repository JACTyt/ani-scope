'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, LayoutGrid, Star, Clock } from 'lucide-react';
import { SeasonSelector } from './SeasonSelector';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import type { AniListMediaCard } from '@/types/anilist';

type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
type View = 'grid' | 'schedule';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function currentSeason(): { season: Season; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const season: Season =
    month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
  return { season, year };
}

function nextSeasonStart(season: Season, year: number): Date {
  const starts: Record<Season, [number, number]> = {
    WINTER: [4, 1], SPRING: [7, 1], SUMMER: [10, 1], FALL: [1, 1],
  };
  const [month] = starts[season];
  return new Date(season === 'FALL' ? year + 1 : year, month - 1, 1);
}

function getDayName(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'long' });
}

function getShortDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function buildSchedule(anime: AniListMediaCard[]) {
  const map = new Map<string, AniListMediaCard[]>();
  for (const item of anime) {
    if (!item.nextAiringEpisode) continue;
    const day = getDayName(item.nextAiringEpisode.airingAt);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(item);
  }
  // Sort within each day by airing time
  for (const [, items] of map) {
    items.sort((a, b) =>
      (a.nextAiringEpisode?.airingAt ?? 0) - (b.nextAiringEpisode?.airingAt ?? 0)
    );
  }
  return map;
}

export function SeasonalGrid() {
  const { season: initSeason, year: initYear } = currentSeason();
  const [season, setSeason] = useState<Season>(initSeason);
  const [year, setYear] = useState(initYear);
  const [anime, setAnime] = useState<AniListMediaCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('grid');

  const isCurrent = season === initSeason && year === initYear;
  const nextStart = isCurrent ? nextSeasonStart(season, year) : null;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seasonal?season=${season}&year=${year}`)
      .then((r) => r.json())
      .then((data: { media: AniListMediaCard[] }) => setAnime(data.media ?? []))
      .finally(() => setLoading(false));
  }, [season, year]);

  // Reset to grid when navigating to a past season (no airing schedule)
  useEffect(() => {
    if (!isCurrent && view === 'schedule') setView('grid');
  }, [isCurrent, view]);

  const schedule = buildSchedule(anime);
  const scheduleDays = DAY_ORDER.filter((d) => schedule.has(d));
  const unscheduled = anime.filter((a) => !a.nextAiringEpisode && isCurrent);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <SeasonSelector season={season} year={year} onChange={(s, y) => { setSeason(s); setYear(y); }} />

        <div className="flex items-center gap-3">
          {nextStart && (
            <p className="text-sm text-text-muted">
              Next season:{' '}
              <span className="text-text-primary font-medium">
                {nextStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
            </p>
          )}

          {/* View toggle — schedule only available for current season */}
          <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                view === 'grid' ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <LayoutGrid size={12} /> Grid
            </button>
            {isCurrent && (
              <button
                onClick={() => setView('schedule')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'schedule' ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <CalendarDays size={12} /> Schedule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <AnimeGrid anime={[]} loading skeletonCount={20} />
      ) : view === 'grid' ? (
        <AnimeGrid anime={anime} />
      ) : (
        <ScheduleView days={scheduleDays} schedule={schedule} unscheduled={unscheduled} />
      )}
    </div>
  );
}

// ─── Schedule view ────────────────────────────────────────────────────────────

function ScheduleView({
  days,
  schedule,
  unscheduled,
}: {
  days: string[];
  schedule: Map<string, AniListMediaCard[]>;
  unscheduled: AniListMediaCard[];
}) {
  if (days.length === 0 && unscheduled.length === 0) {
    return (
      <p className="text-text-muted text-sm text-center py-12">
        No airing schedule data available for this season yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {days.map((day) => {
        const items = schedule.get(day)!;
        const firstDate = items[0]?.nextAiringEpisode
          ? getShortDate(items[0].nextAiringEpisode.airingAt)
          : null;

        return (
          <section key={day}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays size={15} className="text-accent" />
              <h3 className="font-bold text-text-primary">{day}</h3>
              {firstDate && <span className="text-xs text-text-subtle">{firstDate}</span>}
              <span className="text-xs text-text-subtle">· {items.length} title{items.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Anime list for this day */}
            <div className="space-y-2">
              {items.map((anime) => {
                const title = anime.title.english ?? anime.title.romaji;
                const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
                const ep = anime.nextAiringEpisode!;
                const timeStr = getTime(ep.airingAt);

                return (
                  <Link
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-surface border border-border hover:border-accent/30 hover:bg-surface-elevated transition-all group"
                  >
                    {/* Cover */}
                    <div className="relative w-12 shrink-0 rounded-lg overflow-hidden border border-border" style={{ height: 64 }}>
                      <Image src={anime.coverImage.large} alt={title} fill className="object-cover" unoptimized />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                        {title}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-xs text-accent font-medium">Episode {ep.episode}</span>
                        {anime.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-xs text-text-subtle">{g}</span>
                        ))}
                      </div>
                    </div>

                    {/* Right: time + score */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={10} />
                        {timeStr}
                      </span>
                      {score && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-accent">
                          <Star size={9} fill="currentColor" />
                          {score}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Anime without a confirmed next episode */}
      {unscheduled.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <CalendarDays size={15} className="text-text-subtle" />
            <h3 className="font-bold text-text-muted">TBA / Schedule Unknown</h3>
            <span className="text-xs text-text-subtle">· {unscheduled.length} titles</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {unscheduled.map((item) => {
              const t = item.title.english ?? item.title.romaji;
              return (
                <Link key={item.id} href={`/anime/${item.id}`} className="group">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border group-hover:border-accent/40 transition-colors">
                    <Image src={item.coverImage.large} alt={t} fill className="object-cover" unoptimized />
                  </div>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2 group-hover:text-text-primary transition-colors">{t}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
