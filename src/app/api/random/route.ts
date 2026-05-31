import { NextRequest, NextResponse } from 'next/server';
import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_LIST_QUERY } from '@/lib/anilist/queries';
import type { AniListPage, AniListMediaCard, MediaStatus } from '@/types/anilist';

export const revalidate = 0;

const VALID_STATUSES: MediaStatus[] = [
  'FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const genres = searchParams.get('genres')?.split(',').filter(Boolean) ?? [];
  const year = Number(searchParams.get('year') ?? 0);
  const status = searchParams.get('status') ?? '';

  const hasFilters = genres.length > 0 || year > 0 || status !== '';
  const maxPage = hasFilters ? 3 : 5;
  const page = Math.floor(Math.random() * maxPage) + 1;

  const variables: Record<string, unknown> = {
    sort: ['POPULARITY_DESC'],
    perPage: 50,
    page,
  };
  if (genres.length) variables.genre_in = genres;
  if (year > 0) variables.seasonYear = year;
  if (VALID_STATUSES.includes(status as MediaStatus)) variables.status = status;

  try {
    const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
      ANIME_LIST_QUERY,
      variables,
      0
    );
    const pool = data.Page.media;
    if (!pool.length) {
      return NextResponse.json(
        { error: 'No anime found for these filters. Try loosening them.' },
        { status: 404 }
      );
    }
    const winner = pool[Math.floor(Math.random() * pool.length)];
    return NextResponse.json({ winner, pool });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
