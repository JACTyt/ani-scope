import { AnimeCard } from './AnimeCard';
import { AnimeCardSkeleton } from '@/components/ui/Skeleton';
import type { AniListMediaCard } from '@/types/anilist';

interface AnimeGridProps {
  anime: AniListMediaCard[];
  loading?: boolean;
  skeletonCount?: number;
  showRank?: boolean;
}

export function AnimeGrid({ anime, loading = false, skeletonCount = 20, showRank = false }: AnimeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {anime.map((item, i) => (
        <AnimeCard key={item.id} anime={item} rank={showRank ? i + 1 : undefined} />
      ))}
    </div>
  );
}
