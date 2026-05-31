const ANILIST_URL = 'https://graphql.anilist.co';

export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 3600
): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);

  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);

  return json.data;
}
