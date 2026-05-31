'use client';
import { useState, useEffect } from 'react';
import { RankingTable } from './RankingTable';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import type { AniListMediaCard } from '@/types/anilist';

type Tab = 'trending' | 'top-rated' | 'most-popular' | 'most-favourited';
type TimeFilter = 'all' | 'season' | 'year';

const TABS: { id: Tab; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'most-popular', label: 'Most Popular' },
  { id: 'most-favourited', label: 'Most Favourited' },
];

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'season', label: 'This Season' },
  { id: 'year', label: 'This Year' },
];

const TAB_SORT: Record<Tab, string> = {
  trending: 'TRENDING_DESC',
  'top-rated': 'SCORE_DESC',
  'most-popular': 'POPULARITY_DESC',
  'most-favourited': 'FAVOURITES_DESC',
};

export function TrendingClient() {
  const [tab, setTab] = useState<Tab>('trending');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [anime, setAnime] = useState<AniListMediaCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort: TAB_SORT[tab], time: timeFilter });
    fetch(`/api/trending?${params}`)
      .then((r) => r.json())
      .then((data: { media: AniListMediaCard[] }) => setAnime(data.media ?? []))
      .finally(() => setLoading(false));
  }, [tab, timeFilter]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Time filter — only for trending/most-popular */}
        {(tab === 'trending' || tab === 'most-popular') ? (
          <div className="flex gap-1 p-1 bg-surface rounded-lg">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeFilter(tf.id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  timeFilter === tf.id
                    ? 'bg-surface-elevated text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        ) : <div />}

        {/* View toggle */}
        <div className="flex gap-1 p-1 bg-surface rounded-lg">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              view === 'list' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              view === 'grid' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <AnimeGrid anime={[]} loading skeletonCount={20} />
      ) : view === 'list' ? (
        <RankingTable anime={anime} />
      ) : (
        <AnimeGrid anime={anime} showRank />
      )}
    </div>
  );
}
