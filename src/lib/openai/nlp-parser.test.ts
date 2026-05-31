import { describe, it, expect, vi } from 'vitest';
import { parseNLPQuery } from './nlp-parser';

const MOCK_PARAMS = {
  genres: ['Slice of Life'],
  tags: ['Iyashikei'],
  exclude_genres: ['Action'],
  exclude_tags: [],
  score_min: 70,
  explanation: 'Calm, feel-good anime with everyday themes.',
};

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify(MOCK_PARAMS) } }],
        }),
      },
    },
  })),
}));

describe('parseNLPQuery', () => {
  it('returns structured params from OpenAI response', async () => {
    const result = await parseNLPQuery('relaxing slice of life', 'sk-test');
    expect(result.genres).toContain('Slice of Life');
    expect(result.explanation).toBe('Calm, feel-good anime with everyday themes.');
  });

  it('includes exclude_genres in the result', async () => {
    const result = await parseNLPQuery('relaxing, no action', 'sk-test');
    expect(result.exclude_genres).toContain('Action');
  });
});
