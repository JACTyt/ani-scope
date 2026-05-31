import { NextRequest, NextResponse } from 'next/server';
import { anilistFetch } from '@/lib/anilist/client';
import { TRENDING_QUERY } from '@/lib/anilist/queries';
import type { AniListPage, AniListMediaCard } from '@/types/anilist';

const VALID_SORTS = ['TRENDING_DESC', 'SCORE_DESC', 'POPULARITY_DESC', 'FAVOURITES_DESC'];

function currentSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
  return { season, year };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = VALID_SORTS.includes(searchParams.get('sort') ?? '')
    ? searchParams.get('sort')!
    : 'TRENDING_DESC';
  const timeFilter = searchParams.get('time') ?? 'all';

  const variables: Record<string, unknown> = { sort: [sort], page: 1, perPage: 50 };

  if (timeFilter === 'season') {
    const { season, year } = currentSeason();
    variables.season = season;
    variables.seasonYear = year;
  } else if (timeFilter === 'year') {
    variables.seasonYear = new Date().getFullYear();
  }

  try {
    const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
      TRENDING_QUERY,
      variables,
      3600
    );
    return NextResponse.json(data.Page);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
