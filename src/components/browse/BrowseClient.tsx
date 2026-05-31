'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { Button } from '@/components/ui/Button';
import type { AniListMediaCard, AniListPageInfo } from '@/types/anilist';

export function BrowseClient() {
  const searchParams = useSearchParams();
  const [anime, setAnime] = useState<AniListMediaCard[]>([]);
  const [pageInfo, setPageInfo] = useState<AniListPageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchAnime = useCallback(async (pageNum: number, append = false) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(pageNum));
    params.set('perPage', '20');
    const res = await fetch(`/api/anime?${params.toString()}`);
    const data = await res.json() as { media: AniListMediaCard[]; pageInfo: AniListPageInfo };
    setAnime((prev) => append ? [...prev, ...data.media] : data.media);
    setPageInfo(data.pageInfo);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchAnime(1, false).finally(() => setLoading(false));
  }, [fetchAnime]);

  async function loadMore() {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    await fetchAnime(next, true);
    setLoadingMore(false);
  }

  return (
    <div className="flex-1 space-y-6">
      <AnimeGrid anime={anime} loading={loading} />
      {!loading && pageInfo?.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
