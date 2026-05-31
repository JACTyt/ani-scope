import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Tv, Building2, CalendarDays, Users, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ScoreChart } from '@/components/anime/ScoreChart';
import { TrailerEmbed } from '@/components/anime/TrailerEmbed';
import { SimilarAnime } from '@/components/anime/SimilarAnime';
import type { AniListMediaDetail, AniListMediaCard } from '@/types/anilist';

export const revalidate = 86400;

async function getAnimeDetail(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/anime/${id}`, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json() as Promise<{ anime: AniListMediaDetail; tagSimilar: AniListMediaCard[] }>;
}

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAnimeDetail(id);
  if (!result) notFound();

  const { anime, tagSimilar } = result;
  const title = anime.title.english ?? anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const mainStudio = anime.studios.nodes.find((s) => s.isAnimationStudio)?.name
    ?? anime.studios.nodes[0]?.name;

  return (
    <>
      {/* Full-width banner — lives outside the content container */}
      {anime.bannerImage && (
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: '22rem',
            backgroundImage: `url(${anime.bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

    <div className="mx-auto max-w-5xl px-4 pb-10 space-y-10">

      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-8" style={{ marginTop: anime.bannerImage ? '-8rem' : '2rem' }}>
        <div className="relative shrink-0 w-48 aspect-[3/4] rounded-xl overflow-hidden border border-border shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
          <Image src={anime.coverImage.extraLarge} alt={title} fill className="object-cover" unoptimized />
        </div>

        <div className="flex-1 space-y-4 z-10">
          {/* Titles */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
            {anime.title.english && anime.title.romaji !== title && (
              <p className="text-text-muted mt-1 text-sm">{anime.title.romaji}</p>
            )}
            {anime.title.native && (
              <p className="text-text-subtle mt-0.5 text-xs">{anime.title.native}</p>
            )}
          </div>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-2 items-center">
            {score && (
              <span className="flex items-center gap-1 text-2xl font-bold text-accent">
                <Star size={18} fill="currentColor" />
                {score}
              </span>
            )}
            <Badge variant={anime.status === 'RELEASING' ? 'success' : 'outline'}>
              {anime.status.replace(/_/g, ' ')}
            </Badge>
            {anime.season && (
              <Badge variant="outline">{anime.season} {anime.seasonYear}</Badge>
            )}
            {anime.episodes && (
              <Badge variant="outline">{anime.episodes} ep</Badge>
            )}
            {anime.duration && (
              <Badge variant="outline">{anime.duration} min</Badge>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {mainStudio && (
              <div className="flex items-center gap-2 text-text-muted">
                <Building2 size={13} className="shrink-0 text-text-subtle" />
                <span className="text-text-subtle">Studio</span>
                <span className="text-text-primary font-medium">{mainStudio}</span>
              </div>
            )}
            {anime.season && anime.seasonYear && (
              <div className="flex items-center gap-2 text-text-muted">
                <CalendarDays size={13} className="shrink-0 text-text-subtle" />
                <span className="text-text-subtle">Season</span>
                <span className="text-text-primary font-medium">{anime.season} {anime.seasonYear}</span>
              </div>
            )}
            {anime.episodes && (
              <div className="flex items-center gap-2 text-text-muted">
                <Tv size={13} className="shrink-0 text-text-subtle" />
                <span className="text-text-subtle">Episodes</span>
                <span className="text-text-primary font-medium">{anime.episodes}</span>
              </div>
            )}
            {anime.duration && (
              <div className="flex items-center gap-2 text-text-muted">
                <Clock size={13} className="shrink-0 text-text-subtle" />
                <span className="text-text-subtle">Duration</span>
                <span className="text-text-primary font-medium">{anime.duration} min / ep</span>
              </div>
            )}
            {anime.popularity > 0 && (
              <div className="flex items-center gap-2 text-text-muted">
                <Users size={13} className="shrink-0 text-text-subtle" />
                <span className="text-text-subtle">Popularity</span>
                <span className="text-text-primary font-medium">{anime.popularity.toLocaleString()} fans</span>
              </div>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {anime.genres.map((g) => <Badge key={g}>{g}</Badge>)}
          </div>

          {/* Watch on */}
          {(() => {
            const streamingLinks = (anime.externalLinks ?? []).filter((l) => l.type === 'STREAMING');
            const searchQuery = encodeURIComponent(title);
            const fallbacks = [
              { site: 'Crunchyroll', domain: 'crunchyroll.com',  url: `https://www.crunchyroll.com/search?q=${searchQuery}` },
              { site: 'HiAnime',     domain: 'hianime.to',       url: `https://hianime.to/search?keyword=${searchQuery}` },
              { site: 'AnimeGO',     domain: 'animego.org',      url: `https://animego.org/search/all?q=${searchQuery}` },
              { site: 'YummyAnime', domain: 'yummyanime.club',  url: `https://yummyanime.club/?do=search&subaction=search&story=${searchQuery}` },
              { site: 'AniHub',      domain: 'anihub.in.ua',     url: `https://anihub.in.ua/search?q=${searchQuery}` },
              { site: 'AniTube',     domain: 'anitube.in.ua',    url: `https://anitube.in.ua/?do=search&subaction=search&story=${searchQuery}` },
            ];
            const directSites = new Set(streamingLinks.map((l) => l.site));
            const fallbackLinks = fallbacks.filter((f) => !directSites.has(f.site));
            return (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-text-subtle uppercase tracking-wider">Watch on</p>
                <div className="flex flex-wrap gap-2">
                  {streamingLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 transition-all text-xs font-medium text-accent group"
                    >
                      {link.icon
                        ? <Image src={link.icon} alt="" width={16} height={16} unoptimized className="rounded-sm object-contain" />
                        : <ExternalLink size={11} />}
                      {link.site}
                    </Link>
                  ))}
                  {fallbackLinks.map((link) => (
                    <Link
                      key={link.site}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-accent/30 hover:bg-surface-elevated transition-all text-xs font-medium text-text-muted hover:text-text-primary group"
                    >
                      <Image
                        src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
                        alt=""
                        width={16}
                        height={16}
                        unoptimized
                        className="rounded-sm object-contain"
                      />
                      {link.site}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Synopsis */}
          {anime.description && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-subtle uppercase tracking-wider">Synopsis</p>
              <p className="text-text-muted text-sm leading-relaxed line-clamp-5">
                {anime.description.replace(/<[^>]+>/g, '')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Score Distribution */}
      {anime.stats?.scoreDistribution && anime.stats.scoreDistribution.length > 0 && (
        <ScoreChart distribution={anime.stats.scoreDistribution} />
      )}

      {/* Trailer */}
      {anime.trailer && <TrailerEmbed trailer={anime.trailer} />}

      {/* Characters */}
      {anime.characters?.edges && anime.characters.edges.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">Characters</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {anime.characters.edges.map((edge, i) => (
              <div key={i} className="text-center">
                <div className="relative aspect-square rounded-full overflow-hidden border border-border mb-2">
                  <Image src={edge.node.image.medium} alt={edge.node.name.full} fill className="object-cover" unoptimized />
                </div>
                <p className="text-xs text-text-muted line-clamp-2">{edge.node.name.full}</p>
                <p className="text-[10px] text-text-subtle capitalize">{edge.role.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Anime */}
      <SimilarAnime recommendations={anime.recommendations?.nodes ?? []} tagSimilar={tagSimilar} />
    </div>
    </>
  );
}
