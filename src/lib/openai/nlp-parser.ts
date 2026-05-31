import OpenAI from 'openai';

export interface NLPSearchParams {
  genres: string[];
  tags: string[];
  exclude_genres: string[];
  exclude_tags: string[];
  score_min: number;
  explanation: string;
}

const SYSTEM_PROMPT = `You are an anime search assistant. Extract structured search parameters from the user's natural language query.

Return ONLY a valid JSON object with these exact fields:
- "genres": string[] — AniList genres (Action, Adventure, Comedy, Drama, Fantasy, Horror, Mecha, Mystery, Psychological, Romance, Sci-Fi, Slice of Life, Sports, Supernatural, Thriller)
- "tags": string[] — AniList tags (e.g. "Iyashikei", "School Life", "Healing", "Time Travel", "Isekai")
- "exclude_genres": string[] — genres the user explicitly does not want
- "exclude_tags": string[] — tags to exclude
- "score_min": number — minimum score 0-100 (use 0 if not specified)
- "explanation": string — 1-2 sentences summarising what you understood from the query`;

export async function parseNLPQuery(query: string, apiKey: string): Promise<NLPSearchParams> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content) as NLPSearchParams;
}
