'use client';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid, TrendingUp, CalendarDays, Shuffle,
  Sparkles, Search, Star, Loader2, ArrowRight,
} from 'lucide-react';
import type { AniListMediaCard } from '@/types/anilist';

const LINKS = [
  { href: '/browse',   label: 'Browse',    Icon: LayoutGrid   },
  { href: '/trending', label: 'Trending',  Icon: TrendingUp   },
  { href: '/seasonal', label: 'Seasonal',  Icon: CalendarDays },
  { href: '/random',   label: 'Random',    Icon: Shuffle      },
  { href: '/search',   label: 'AI Search', Icon: Sparkles     },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AniListMediaCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/anime?search=${encodeURIComponent(trimmed)}&sort=SEARCH_MATCH&perPage=7`,
        );
        const data = await res.json() as { media?: AniListMediaCard[] };
        setResults(data.media ?? []);
        setOpen(true);
        setHighlighted(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const navigateTo = (id: number) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    router.push(`/anime/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      navigateTo(results[highlighted].id);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (highlighted >= 0 && results[highlighted]) {
      navigateTo(results[highlighted].id);
      return;
    }
    if (!query.trim()) return;
    setOpen(false);
    setQuery('');
    setResults([]);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const showDropdown = open && (loading || results.length > 0) && query.trim().length >= 2;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-wider text-accent hover:text-accent/80 transition-colors shrink-0"
        >
          ANISCOPE
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 text-sm font-medium shrink-0">
          {LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Search with autocomplete */}
        <div ref={wrapperRef} className="relative flex-1 max-w-xs ml-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (results.length > 0) setOpen(true); }}
                placeholder="Search anime…"
                className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-border bg-background text-sm text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none transition-colors"
                autoComplete="off"
              />
              {loading && (
                <Loader2
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle animate-spin"
                />
              )}
            </div>
          </form>

          {/* Autocomplete dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              {/* Skeleton while first load */}
              {loading && results.length === 0 ? (
                <div className="p-2 space-y-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg animate-pulse">
                      <div className="w-10 h-14 rounded-md bg-surface-elevated shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-surface-elevated rounded w-3/4" />
                        <div className="h-2.5 bg-surface-elevated rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <ul className="p-1.5 space-y-0.5">
                    {results.map((item, i) => {
                      const title = item.title.english ?? item.title.romaji;
                      const score = item.averageScore
                        ? (item.averageScore / 10).toFixed(1)
                        : null;
                      const isHighlighted = i === highlighted;

                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => navigateTo(item.id)}
                            onMouseEnter={() => setHighlighted(i)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                              isHighlighted
                                ? 'bg-accent/10 border-l-2 border-accent pl-1.5'
                                : 'hover:bg-surface-elevated border-l-2 border-transparent'
                            }`}
                          >
                            {/* Cover thumbnail */}
                            <div className="relative w-10 shrink-0 rounded-md overflow-hidden border border-border"
                              style={{ height: 54 }}>
                              <Image
                                src={item.coverImage.large}
                                alt={title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold line-clamp-1 ${isHighlighted ? 'text-text-primary' : 'text-text-muted'}`}>
                                {title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {score && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-accent">
                                    <Star size={8} fill="currentColor" />
                                    {score}
                                  </span>
                                )}
                                <span className="text-[10px] text-text-subtle line-clamp-1">
                                  {item.genres.slice(0, 3).join(' · ')}
                                </span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Footer: full search link */}
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => { setOpen(false); setQuery(''); setResults([]); }}
                    className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-text-muted hover:text-accent hover:bg-surface-elevated transition-colors"
                  >
                    <span>
                      See all results for{' '}
                      <span className="text-text-primary font-medium">"{query.trim()}"</span>
                    </span>
                    <ArrowRight size={12} />
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
