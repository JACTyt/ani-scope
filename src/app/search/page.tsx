import { Suspense } from 'react';
import { SearchClient } from './SearchClient';
import { AnimeGrid } from '@/components/anime/AnimeGrid';

export default function SearchPage() {
  return (
    <Suspense fallback={<AnimeGrid anime={[]} loading skeletonCount={20} />}>
      <SearchClient />
    </Suspense>
  );
}
