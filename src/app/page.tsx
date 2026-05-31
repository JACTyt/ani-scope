import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_LIST_QUERY } from '@/lib/anilist/queries';
import { HeroGallery } from '@/components/home/HeroGallery';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import type { AniListPage, AniListMediaCard } from '@/types/anilist';

export const revalidate = 3600;

async function getTrending(perPage: number) {
  const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
    ANIME_LIST_QUERY,
    { sort: ['TRENDING_DESC'], perPage, page: 1 },
    3600
  );
  return data.Page.media;
}

async function getTopRated() {
  const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
    ANIME_LIST_QUERY,
    { sort: ['SCORE_DESC'], perPage: 12, page: 1 },
    3600
  );
  return data.Page.media;
}

async function getAiringToday() {
  const tomorrow = Math.floor(Date.now() / 1000) + 86400;
  const data = await anilistFetch<{ Page: AniListPage<AniListMediaCard> }>(
    ANIME_LIST_QUERY,
    { sort: ['POPULARITY_DESC'], status: 'RELEASING', perPage: 20, page: 1 },
    3600
  );
  return data.Page.media
    .filter((m) => m.nextAiringEpisode && m.nextAiringEpisode.airingAt <= tomorrow)
    .slice(0, 6);
}

export default async function HomePage() {
  const [heroAnime, topRated, airingToday] = await Promise.all([
    getTrending(10),
    getTopRated(),
    getAiringToday(),
  ]);

  const heroSlides = heroAnime.slice(0, 5);
  const trendingGrid = heroAnime.slice(5);

  return (
    <>
      {/* Full-width hero — lives outside the content container */}
      {heroSlides.length > 0 && <HeroGallery anime={heroSlides} />}

      {/* Padded content sections */}
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">
        {trendingGrid.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-4">Trending This Week</h2>
            <AnimeGrid anime={trendingGrid} />
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold text-text-primary mb-4">Top Rated All-Time</h2>
          <AnimeGrid anime={topRated} showRank />
        </section>

        {airingToday.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-4">Airing Today</h2>
            <AnimeGrid anime={airingToday} />
          </section>
        )}
      </div>
    </>
  );
}
