'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { ExplanationCard } from '@/components/search/ExplanationCard';
import { KeySetupModal } from '@/components/search/KeySetupModal';
import type { AniListMediaCard } from '@/types/anilist';
import type { NLPSearchParams } from '@/lib/openai/nlp-parser';

const STORAGE_KEY = 'aniscope_openai_key';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const [openaiKey, setOpenaiKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AniListMediaCard[]>([]);
  const [explanation, setExplanation] = useState<NLPSearchParams | null>(null);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setOpenaiKey(localStorage.getItem(STORAGE_KEY));
  }, []);

  const runSearch = useCallback(async (q: string, key: string | null) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setExplanation(null);
    setHasSearched(true);

    if (key) {
      // NLP search
      try {
        const res = await fetch('/api/search/nlp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-openai-key': key },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json() as { results?: AniListMediaCard[]; params?: NLPSearchParams; error?: string };
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem(STORAGE_KEY);
            setOpenaiKey(null);
            setError('Invalid API key. Please update your key.');
          } else {
            setError(data.error ?? 'Search failed');
          }
          setResults([]);
        } else {
          setResults(data.results ?? []);
          setExplanation(data.params ?? null);
        }
      } catch {
        setError('Network error. Please try again.');
        setResults([]);
      }
    } else {
      // Fallback: structured text search
      try {
        const params = new URLSearchParams({ search: q, sort: 'SCORE_DESC' });
        const res = await fetch(`/api/anime?${params}`);
        const data = await res.json() as { media?: AniListMediaCard[] };
        setResults(data.media ?? []);
      } catch {
        setError('Search failed. Please try again.');
        setResults([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setInput(q);
      runSearch(q, openaiKey);
    }
    // only on mount / q change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    runSearch(input.trim(), openaiKey);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Search Anime</h1>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={openaiKey ? 'Try "dark fantasy with redemption arc"…' : 'Search anime…'}
          className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Key banner */}
      <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border text-sm">
        {openaiKey ? (
          <span className="text-success text-xs">AI search enabled</span>
        ) : (
          <span className="text-text-subtle text-xs">Add an OpenAI key to enable AI-powered natural language search</span>
        )}
        <button
          onClick={() => setShowKeyModal(true)}
          className="text-xs text-accent hover:underline"
        >
          {openaiKey ? 'Change key' : 'Set up key'}
        </button>
      </div>

      {/* Explanation */}
      {explanation && <ExplanationCard params={explanation} />}

      {/* Error */}
      {error && <p className="text-sm text-warning">{error}</p>}

      {/* Results */}
      {loading ? (
        <AnimeGrid anime={[]} loading skeletonCount={20} />
      ) : hasSearched ? (
        results.length > 0 ? (
          <AnimeGrid anime={results} />
        ) : (
          <p className="text-text-muted text-sm">No results found. Try different keywords.</p>
        )
      ) : null}

      <KeySetupModal
        open={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={(key) => { setOpenaiKey(key); runSearch(input, key); }}
      />
    </div>
  );
}
