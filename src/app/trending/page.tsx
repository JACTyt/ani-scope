import { Suspense } from 'react';
import { TrendingClient } from '@/components/trending/TrendingClient';
import { AnimeGrid } from '@/components/anime/AnimeGrid';

export const revalidate = 3600;

export default function TrendingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Trending & Rankings</h1>
      <Suspense fallback={<AnimeGrid anime={[]} loading skeletonCount={20} />}>
        <TrendingClient />
      </Suspense>
    </div>
  );
}
