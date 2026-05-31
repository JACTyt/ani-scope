import { Suspense } from 'react';
import { FilterSidebar } from '@/components/browse/FilterSidebar';
import { BrowseClient } from '@/components/browse/BrowseClient';
import { AnimeGrid } from '@/components/anime/AnimeGrid';

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Browse Anime</h1>
      <div className="flex gap-8">
        <Suspense fallback={null}>
          <FilterSidebar />
        </Suspense>
        <Suspense fallback={<AnimeGrid anime={[]} loading skeletonCount={20} />}>
          <BrowseClient />
        </Suspense>
      </div>
    </div>
  );
}
