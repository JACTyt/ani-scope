const CARD_FIELDS = `
  id
  title { romaji english native }
  genres
  tags { name rank }
  averageScore
  popularity
  favourites
  episodes
  status
  season
  seasonYear
  coverImage { large extraLarge color }
  bannerImage
  studios(isMain: true) { nodes { name isAnimationStudio } }
  nextAiringEpisode { airingAt episode }
`;

export const ANIME_LIST_QUERY = `
  query AnimeList(
    $page: Int
    $perPage: Int
    $sort: [MediaSort]
    $genre_in: [String]
    $tag_in: [String]
    $status: MediaStatus
    $status_in: [MediaStatus]
    $season: MediaSeason
    $seasonYear: Int
    $search: String
    $averageScore_greater: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage lastPage total }
      media(
        type: ANIME
        sort: $sort
        genre_in: $genre_in
        tag_in: $tag_in
        status: $status
        status_in: $status_in
        season: $season
        seasonYear: $seasonYear
        search: $search
        averageScore_greater: $averageScore_greater
      ) { ${CARD_FIELDS} }
    }
  }
`;

export const ANIME_DETAIL_QUERY = `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      ${CARD_FIELDS}
      description(asHtml: false)
      duration
      trailer { id site }
      stats { scoreDistribution { score amount } }
      recommendations(perPage: 10, sort: [RATING_DESC]) {
        nodes {
          rating
          mediaRecommendation {
            id
            title { romaji english }
            coverImage { large }
            averageScore
            genres
          }
        }
      }
      characters(sort: [ROLE, RELEVANCE], perPage: 6) {
        edges {
          role
          node { name { full } image { medium } }
        }
      }
      staff(sort: [RELEVANCE], perPage: 4) {
        nodes { name { full } image { medium } primaryOccupations }
      }
      externalLinks { id url site type color icon }
    }
  }
`;

export const TRENDING_QUERY = `
  query Trending($page: Int, $perPage: Int, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage total }
      media(type: ANIME, sort: $sort, season: $season, seasonYear: $seasonYear) {
        ${CARD_FIELDS}
      }
    }
  }
`;

export const SEASONAL_QUERY = `
  query Seasonal($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage total }
      media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC]) {
        ${CARD_FIELDS}
        airingSchedule(notYetAired: false, perPage: 1) {
          nodes { airingAt episode }
        }
      }
    }
  }
`;
