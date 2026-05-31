import { NextRequest, NextResponse } from 'next/server';
import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_DETAIL_QUERY, ANIME_LIST_QUERY } from '@/lib/anilist/queries';
import type { AniListMediaDetail, AniListPage, AniListMediaCard } from '@/types/anilist';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const animeId = Number(id);
  if (!Number.isFinite(animeId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const data = await anilistFetch<{ Media: AniListMediaDetail }>(
      ANIME_DETAIL_QUERY,
      { id: animeId },
      86400
    );
    const anime = data.Media;

    const topTags = anime.tags.slice(0, 5).map((t) => t.name);
    let tagSimilar: AniListMediaCard[] = [];
    if (topTags.length > 0) {
      const similar = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
        ANIME_LIST_QUERY,
        { tag_in: topTags, sort: ['POPULARITY_DESC'], perPage: 10 },
        86400
      );
      tagSimilar = similar.Page.media.filter((m) => m.id !== animeId).slice(0, 6);
    }

    return NextResponse.json({ anime, tagSimilar });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
