import { NextRequest, NextResponse } from 'next/server';
import { parseNLPQuery } from '@/lib/openai/nlp-parser';
import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_LIST_QUERY } from '@/lib/anilist/queries';
import type { AniListPage, AniListMediaCard } from '@/types/anilist';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-openai-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing x-openai-key header' }, { status: 400 });
  }

  let body: { query?: string };
  try {
    body = await request.json() as { query?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.query?.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  try {
    const params = await parseNLPQuery(body.query, apiKey);

    const variables: Record<string, unknown> = {
      sort: ['SCORE_DESC'],
      perPage: 20,
      page: 1,
    };
    if (params.genres.length) variables.genre_in = params.genres;
    if (params.tags.length) variables.tag_in = params.tags;
    if (params.score_min > 0) variables.averageScore_greater = params.score_min;

    const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
      ANIME_LIST_QUERY,
      variables,
      0
    );

    const results = data.Page.media.filter(
      (m) => !params.exclude_genres.some((g) => m.genres.includes(g))
    );

    return NextResponse.json({ params, results, pageInfo: data.Page.pageInfo });
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes('401') || message.includes('Incorrect API key')) {
      return NextResponse.json({ error: 'Invalid OpenAI API key' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
