import { NextRequest, NextResponse } from 'next/server';
import { anilistFetch } from '@/lib/anilist/client';
import { SEASONAL_QUERY } from '@/lib/anilist/queries';
import type { AniListPage, AniListMediaCard } from '@/types/anilist';

const VALID_SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = now.getMonth() + 1;
  const defaultSeason = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
  const season = VALID_SEASONS.includes(searchParams.get('season') ?? '')
    ? searchParams.get('season')!
    : defaultSeason;
  const year = Number(searchParams.get('year') ?? now.getFullYear());

  try {
    const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
      SEASONAL_QUERY,
      { season, seasonYear: year, page: 1, perPage: 50 },
      3600
    );
    return NextResponse.json({ ...data.Page, season, year });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
