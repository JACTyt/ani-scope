'use client';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Psychological', 'Mecha', 'Music',
];

interface GenreSelectorProps {
  selected: string[];
  onChange: (genres: string[]) => void;
}

export function GenreSelector({ selected, onChange }: GenreSelectorProps) {
  const toggle = (genre: string) => {
    onChange(
      selected.includes(genre)
        ? selected.filter((g) => g !== genre)
        : [...selected, genre]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">
          Filter by genre{' '}
          <span className="text-text-subtle">(leave empty for any)</span>
        </p>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const active = selected.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => toggle(genre)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                active
                  ? 'bg-accent text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-surface text-text-muted border border-border hover:border-accent/50 hover:text-text-primary'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
