import type { NLPSearchParams } from '@/lib/openai/nlp-parser';

interface ExplanationCardProps {
  params: NLPSearchParams;
}

export function ExplanationCard({ params }: ExplanationCardProps) {
  const { explanation, genres, tags, exclude_genres, score_min } = params;

  return (
    <div className="bg-surface-elevated border border-accent/30 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-accent text-sm font-bold shrink-0">AI</span>
        <p className="text-sm text-text-muted">{explanation}</p>
      </div>
      {(genres.length > 0 || tags.length > 0 || exclude_genres.length > 0 || score_min > 0) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {genres.map((g) => (
            <span key={g} className="px-2 py-0.5 rounded-full bg-accent/20 text-accent">genre: {g}</span>
          ))}
          {tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-info/20 text-info">tag: {t}</span>
          ))}
          {score_min > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-success/20 text-success">score ≥ {score_min}</span>
          )}
          {exclude_genres.map((g) => (
            <span key={g} className="px-2 py-0.5 rounded-full bg-warning/20 text-warning">not: {g}</span>
          ))}
        </div>
      )}
    </div>
  );
}
