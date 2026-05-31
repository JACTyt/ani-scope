import { Suspense } from 'react';
import { SeasonalGrid } from '@/components/seasonal/SeasonalGrid';
import { AnimeGrid } from '@/components/anime/AnimeGrid';

export const revalidate = 3600;

export default function SeasonalPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Seasonal Anime</h1>
      <Suspense fallback={<AnimeGrid anime={[]} loading skeletonCount={20} />}>
        <SeasonalGrid />
      </Suspense>
    </div>
  );
}
