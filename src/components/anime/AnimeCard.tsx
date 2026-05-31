import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { AniListMediaCard } from '@/types/anilist';

interface AnimeCardProps {
  anime: AniListMediaCard;
  rank?: number;
}

export function AnimeCard({ anime, rank }: AnimeCardProps) {
  const title = anime.title.english ?? anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <Link href={`/anime/${anime.id}`} className="group relative block rounded-lg overflow-hidden bg-surface border border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/5">
      <div className="relative aspect-[3/4]">
        <Image
          src={anime.coverImage.large}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          unoptimized
        />
        {rank && (
          <div className="absolute top-2 left-2 bg-black/80 text-text-primary font-bold text-sm px-2 py-0.5 rounded">
            #{rank}
          </div>
        )}
        {score && (
          <div className="absolute top-2 right-2 bg-black/80 text-accent font-bold text-sm px-2 py-0.5 rounded">
            {score}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end gap-1">
          {anime.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="outline" className="w-fit text-xs">{genre}</Badge>
          ))}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2">{title}</h3>
        <p className="text-xs text-text-muted mt-1">
          {anime.seasonYear ?? '—'} · {anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}
        </p>
      </div>
    </Link>
  );
}
