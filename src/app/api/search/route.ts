import { NextRequest, NextResponse } from 'next/server';
import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_LIST_QUERY } from '@/lib/anilist/queries';
import type { AniListPage, AniListMediaCard } from '@/types/anilist';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const variables: Record<string, unknown> = {
    page: 1,
    perPage: 20,
    sort: ['POPULARITY_DESC'],
  };

  if (searchParams.get('genre')) variables.genre_in = searchParams.getAll('genre');
  if (searchParams.get('tag')) variables.tag_in = searchParams.getAll('tag');
  if (searchParams.get('minScore')) variables.averageScore_greater = Number(searchParams.get('minScore'));

  try {
    const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
      ANIME_LIST_QUERY,
      variables,
      0
    );
    return NextResponse.json(data.Page);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
