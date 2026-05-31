'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Play } from 'lucide-react';
import type { AniListMediaCard } from '@/types/anilist';

interface HeroGalleryProps {
  anime: AniListMediaCard[];
}

export function HeroGallery({ anime }: HeroGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const active = anime[activeIndex];

  useEffect(() => {
    if (isHovering) return;
    const timer = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % anime.length);
      setProgressKey((k) => k + 1);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeIndex, isHovering, anime.length]);

  const switchTo = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setProgressKey((k) => k + 1);
  };

  if (!active) return null;

  const title = active.title.english ?? active.title.romaji;
  const score = active.averageScore ? (active.averageScore / 10).toFixed(1) : null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '72vh', minHeight: '500px' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background layers — cross-fade via opacity */}
      {anime.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            backgroundImage: `url(${item.bannerImage ?? item.coverImage.extraLarge})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex items-center gap-8 px-8 lg:px-14 py-10">
        {/* Cover art */}
        <div className="relative shrink-0 w-44 aspect-[3/4] rounded-xl overflow-hidden border border-accent/40 shadow-[0_0_60px_rgba(168,85,247,0.4)] hidden sm:block">
          <Image
            src={active.coverImage.extraLarge}
            alt={title}
            fill
            className="object-cover transition-opacity duration-500"
            unoptimized
          />
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <p className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-1.5">
              <Star size={11} fill="currentColor" />
              Trending Now
            </p>
            <h1
              className="text-4xl lg:text-5xl font-bold text-white leading-tight line-clamp-2"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              {title}
            </h1>
            {active.title.english && active.title.romaji !== title && (
              <p className="text-white/50 mt-1 text-sm">{active.title.romaji}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {score && (
              <span className="flex items-center gap-1 text-2xl font-bold text-accent drop-shadow">
                <Star size={18} fill="currentColor" className="mb-0.5" />
                {score}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                active.status === 'RELEASING'
                  ? 'bg-success/25 text-success border border-success/30'
                  : 'bg-white/10 text-white/70 border border-white/10'
              }`}
            >
              {active.status.replace(/_/g, ' ')}
            </span>
            {active.season && (
              <span className="px-2.5 py-0.5 rounded-md text-xs bg-white/10 text-white/70 border border-white/10">
                {active.season} {active.seasonYear}
              </span>
            )}
            {active.episodes && (
              <span className="text-white/50 text-sm">{active.episodes} eps</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {active.genres.slice(0, 5).map((g) => (
              <span
                key={g}
                className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>

          <Link
            href={`/anime/${active.id}`}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-[0_0_24px_rgba(168,85,247,0.6)] active:scale-95"
          >
            <Play size={14} fill="currentColor" />
            View Anime
          </Link>
        </div>

        {/* Numbered sidebar — dark glass panel ensures readability on any banner */}
        <div className="shrink-0 w-56 hidden lg:flex flex-col gap-0.5 bg-black/55 backdrop-blur-md rounded-2xl p-3 border border-white/10">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pb-1">
            Top 5 Trending
          </p>
          {anime.map((item, i) => {
            const itemTitle = item.title.english ?? item.title.romaji;
            const itemScore = item.averageScore
              ? (item.averageScore / 10).toFixed(1)
              : '—';
            const isActive = i === activeIndex;

            return (
              <div
                key={item.id}
                onMouseEnter={() => switchTo(i)}
                className={`group relative flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive ? 'bg-white/15' : 'hover:bg-white/8'
                }`}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full" />
                )}

                <span
                  className={`text-sm font-bold w-5 shrink-0 text-center ${
                    isActive ? 'text-accent' : 'text-white/40 group-hover:text-white/60'
                  }`}
                >
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold line-clamp-1 ${
                      isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}
                  >
                    {itemTitle}
                  </p>
                  {isActive && (
                    <div className="h-0.5 bg-white/15 rounded-full mt-1.5 overflow-hidden">
                      <div
                        key={progressKey}
                        className="h-full bg-accent rounded-full"
                        style={{
                          animation: 'hero-progress 5s linear forwards',
                          animationPlayState: isHovering ? 'paused' : 'running',
                        }}
                      />
                    </div>
                  )}
                </div>

                <span
                  className={`text-xs font-bold shrink-0 flex items-center gap-0.5 ${
                    isActive ? 'text-accent' : 'text-white/40 group-hover:text-white/60'
                  }`}
                >
                  <Star size={9} fill="currentColor" />
                  {itemScore}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom fade into page background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
    </section>
  );
}
