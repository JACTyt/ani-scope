import Image from 'next/image';
import Link from 'next/link';
import type { AniListMediaCard } from '@/types/anilist';

interface RankingTableProps {
  anime: AniListMediaCard[];
  showRank?: boolean;
}

export function RankingTable({ anime, showRank = true }: RankingTableProps) {
  if (anime.length === 0) return null;

  return (
    <div className="space-y-2">
      {anime.map((item, index) => {
        const title = item.title.english ?? item.title.romaji;
        const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : null;

        return (
          <Link
            key={item.id}
            href={`/anime/${item.id}`}
            className="flex items-center gap-4 p-3 rounded-xl bg-surface hover:bg-surface-elevated border border-border hover:border-accent/30 transition-all group"
          >
            {showRank && (
              <span className="w-8 text-center text-lg font-bold text-text-subtle shrink-0">
                {index + 1}
              </span>
            )}
            <div className="relative w-12 aspect-[3/4] rounded-lg overflow-hidden shrink-0">
              <Image
                src={item.coverImage.large}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                {title}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {item.genres.slice(0, 3).map((g) => (
                  <span key={g} className="text-xs text-text-subtle">{g}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {score && (
                <span className="text-sm font-bold text-accent">{score}</span>
              )}
              {item.popularity != null && (
                <span className="text-xs text-text-subtle">{item.popularity.toLocaleString()} fans</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
