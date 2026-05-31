import Image from 'next/image';
import Link from 'next/link';
import type { AniListMediaCard, AniListRecommendation } from '@/types/anilist';

interface SimilarAnimeProps {
  recommendations: AniListRecommendation[];
  tagSimilar: AniListMediaCard[];
}

export function SimilarAnime({ recommendations, tagSimilar }: SimilarAnimeProps) {
  const recItems = recommendations
    .filter((r) => r.mediaRecommendation)
    .map((r) => r.mediaRecommendation!);

  const seen = new Set<number>();
  const merged = [...recItems, ...tagSimilar].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 6);

  if (merged.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold text-text-primary mb-4">Similar Anime</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {merged.map((anime) => (
          <Link key={anime.id} href={`/anime/${anime.id}`} className="shrink-0 w-28 group">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2 border border-border group-hover:border-accent/50 transition-colors">
              <Image
                src={anime.coverImage.large}
                alt={anime.title.english ?? anime.title.romaji}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-xs text-text-muted line-clamp-2 group-hover:text-text-primary transition-colors">
              {anime.title.english ?? anime.title.romaji}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
