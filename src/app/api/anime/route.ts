import { NextRequest, NextResponse } from 'next/server';
import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_LIST_QUERY } from '@/lib/anilist/queries';
import type { AniListPage, AniListMediaCard } from '@/types/anilist';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const variables: Record<string, unknown> = {
    page: Number(searchParams.get('page') ?? 1),
    perPage: Number(searchParams.get('perPage') ?? 20),
    sort: [searchParams.get('sort') ?? 'POPULARITY_DESC'],
  };

  if (searchParams.get('genre')) variables.genre_in = searchParams.getAll('genre');
  if (searchParams.get('tag')) variables.tag_in = searchParams.getAll('tag');
  const statusValues = searchParams.getAll('status').filter(Boolean);
  if (statusValues.length === 1) variables.status = statusValues[0];
  else if (statusValues.length > 1) variables.status_in = statusValues;
  if (searchParams.get('season')) variables.season = searchParams.get('season');
  if (searchParams.get('seasonYear')) variables.seasonYear = Number(searchParams.get('seasonYear'));
  if (searchParams.get('year')) variables.seasonYear = Number(searchParams.get('year'));
  if (searchParams.get('search')) variables.search = searchParams.get('search');
  if (searchParams.get('minScore')) variables.averageScore_greater = Number(searchParams.get('minScore'));

  try {
    const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
      ANIME_LIST_QUERY,
      variables,
      21600
    );
    return NextResponse.json(data.Page);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
