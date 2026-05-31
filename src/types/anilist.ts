export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type MediaSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
export type MediaSort =
  | 'TRENDING_DESC'
  | 'POPULARITY_DESC'
  | 'SCORE_DESC'
  | 'FAVOURITES_DESC'
  | 'START_DATE_DESC'
  | 'TITLE_ROMAJI';

export interface AniListTitle {
  romaji: string;
  english: string | null;
  native: string;
}

export interface AniListCoverImage {
  large: string;
  extraLarge: string;
  color: string | null;
}

export interface AniListTag {
  name: string;
  rank: number;
}

export interface AniListStudio {
  name: string;
  isAnimationStudio: boolean;
}

export interface AniListNextAiringEpisode {
  airingAt: number;
  episode: number;
}

export interface AniListScoreDistribution {
  score: number;
  amount: number;
}

export interface AniListCharacterEdge {
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  node: {
    name: { full: string };
    image: { medium: string };
  };
}

export interface AniListStaffNode {
  name: { full: string };
  image: { medium: string };
  primaryOccupations: string[];
}

export interface AniListRecommendation {
  rating: number;
  mediaRecommendation: {
    id: number;
    title: AniListTitle;
    coverImage: { large: string };
    averageScore: number | null;
    genres: string[];
  } | null;
}

export interface AniListMediaCard {
  id: number;
  title: AniListTitle;
  genres: string[];
  tags: AniListTag[];
  averageScore: number | null;
  popularity: number;
  favourites: number;
  episodes: number | null;
  status: MediaStatus;
  season: MediaSeason | null;
  seasonYear: number | null;
  coverImage: AniListCoverImage;
  bannerImage: string | null;
  studios: { nodes: AniListStudio[] };
  nextAiringEpisode: AniListNextAiringEpisode | null;
}

export interface AniListExternalLink {
  id: number;
  url: string;
  site: string;
  type: 'STREAMING' | 'INFO' | 'SOCIAL' | 'COUNTDOWN' | string;
  color: string | null;
  icon: string | null;
}

export interface AniListMediaDetail extends AniListMediaCard {
  description: string | null;
  duration: number | null;
  trailer: { id: string; site: string } | null;
  stats: { scoreDistribution: AniListScoreDistribution[] } | null;
  recommendations: { nodes: AniListRecommendation[] } | null;
  characters: { edges: AniListCharacterEdge[] } | null;
  staff: { nodes: AniListStaffNode[] } | null;
  externalLinks: AniListExternalLink[] | null;
}

export interface AniListPageInfo {
  currentPage: number;
  hasNextPage: boolean;
  lastPage: number;
  total: number;
}

export interface AniListPage<T> {
  pageInfo: AniListPageInfo;
  media: T[];
}
