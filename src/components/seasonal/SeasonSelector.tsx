'use client';

type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

interface SeasonSelectorProps {
  season: Season;
  year: number;
  onChange: (season: Season, year: number) => void;
}

const SEASONS: Season[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
const SEASON_MONTHS: Record<Season, string> = {
  WINTER: 'Jan–Mar',
  SPRING: 'Apr–Jun',
  SUMMER: 'Jul–Sep',
  FALL: 'Oct–Dec',
};

function prevSeason(s: Season, y: number): [Season, number] {
  const idx = SEASONS.indexOf(s);
  return idx === 0 ? ['FALL', y - 1] : [SEASONS[idx - 1], y];
}

function nextSeason(s: Season, y: number): [Season, number] {
  const idx = SEASONS.indexOf(s);
  return idx === 3 ? ['WINTER', y + 1] : [SEASONS[idx + 1], y];
}

export function SeasonSelector({ season, year, onChange }: SeasonSelectorProps) {
  const [ps, py] = prevSeason(season, year);
  const [ns, ny] = nextSeason(season, year);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(ps, py)}
        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
        aria-label="Previous season"
      >
        ←
      </button>

      <div className="text-center min-w-36">
        <p className="text-lg font-bold text-text-primary">{season} {year}</p>
        <p className="text-xs text-text-subtle">{SEASON_MONTHS[season]}</p>
      </div>

      <button
        onClick={() => onChange(ns, ny)}
        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
        aria-label="Next season"
      >
        →
      </button>
    </div>
  );
}
