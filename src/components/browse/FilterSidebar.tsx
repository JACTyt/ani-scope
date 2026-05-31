'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutGrid, TrendingUp, Star, Clock, ArrowUpDown,
  Tv, CalendarDays, Tag, X,
} from 'lucide-react';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mecha', 'Mystery', 'Psychological', 'Romance',
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller', 'Music',
];

const STATUSES = [
  { value: 'RELEASING',        label: 'Airing'    },
  { value: 'FINISHED',         label: 'Finished'  },
  { value: 'NOT_YET_RELEASED', label: 'Upcoming'  },
  { value: 'HIATUS',           label: 'Hiatus'    },
  { value: 'CANCELLED',        label: 'Cancelled' },
];

const SORTS = [
  { value: 'POPULARITY_DESC', label: 'Popularity', Icon: LayoutGrid  },
  { value: 'SCORE_DESC',      label: 'Score',       Icon: Star        },
  { value: 'TRENDING_DESC',   label: 'Trending',    Icon: TrendingUp  },
  { value: 'START_DATE_DESC', label: 'Newest',      Icon: Clock       },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeGenres = searchParams.getAll('genre');
  const activeStatuses = searchParams.getAll('status');
  const activeSort = searchParams.get('sort') ?? 'POPULARITY_DESC';
  const activeYear = searchParams.get('year') ?? '';

  const totalActive = activeGenres.length + activeStatuses.length + (activeYear ? 1 : 0);

  function push(params: URLSearchParams) {
    params.set('page', '1');
    router.push(`/browse?${params.toString()}`);
  }

  function setSort(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set('sort', value);
    push(p);
  }

  function toggleGenre(genre: string) {
    const p = new URLSearchParams(searchParams.toString());
    const existing = p.getAll('genre');
    p.delete('genre');
    if (existing.includes(genre)) {
      existing.filter((v) => v !== genre).forEach((v) => p.append('genre', v));
    } else {
      [...existing, genre].forEach((v) => p.append('genre', v));
    }
    push(p);
  }

  function toggleStatus(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    const existing = p.getAll('status');
    p.delete('status');
    if (existing.includes(value)) {
      existing.filter((v) => v !== value).forEach((v) => p.append('status', v));
    } else {
      [...existing, value].forEach((v) => p.append('status', v));
    }
    push(p);
  }

  function setYear(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set('year', value); else p.delete('year');
    push(p);
  }

  function resetAll() {
    router.push('/browse');
  }

  return (
    <aside className="w-60 shrink-0 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <ArrowUpDown size={13} />
          Filters
          {totalActive > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">
              {totalActive}
            </span>
          )}
        </h2>
        {totalActive > 0 && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-text-subtle hover:text-accent transition-colors"
          >
            <X size={11} /> Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <section className="space-y-1.5">
        <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest flex items-center gap-1.5">
          <ArrowUpDown size={10} /> Sort by
        </p>
        <div className="space-y-0.5">
          {SORTS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                activeSort === value
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Year */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest flex items-center gap-1.5">
          <CalendarDays size={10} /> Year
        </p>
        <select
          value={activeYear}
          onChange={(e) => setYear(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%2364748b' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '2rem',
          }}
        >
          <option value="">Any year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </section>

      <div className="border-t border-border" />

      {/* Status — multi-select */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest flex items-center gap-1.5">
          <Tv size={10} /> Status
          {activeStatuses.length > 0 && (
            <span className="px-1 rounded bg-accent/20 text-accent text-[9px]">{activeStatuses.length}</span>
          )}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(({ value, label }) => {
            const active = activeStatuses.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleStatus(value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  active
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'border-border text-text-subtle hover:border-accent/30 hover:text-text-muted'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Genres */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest flex items-center gap-1.5">
          <Tag size={10} /> Genres
          {activeGenres.length > 0 && (
            <span className="px-1 rounded bg-accent/20 text-accent text-[9px]">{activeGenres.length}</span>
          )}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((genre) => {
            const active = activeGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-2 py-0.5 rounded text-xs border transition-all ${
                  active
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'border-border text-text-subtle hover:border-accent/30 hover:text-text-muted'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
