import { render, screen } from '@testing-library/react';
import { AnimeCard } from './AnimeCard';
import type { AniListMediaCard } from '@/types/anilist';

const mockAnime: AniListMediaCard = {
  id: 1,
  title: { romaji: 'Boku no Hero Academia', english: 'My Hero Academia', native: 'Hero' },
  genres: ['Action', 'Comedy'],
  tags: [],
  averageScore: 80,
  popularity: 100000,
  favourites: 50000,
  episodes: 13,
  status: 'FINISHED',
  season: 'SPRING',
  seasonYear: 2016,
  coverImage: { large: '/cover.jpg', extraLarge: '/cover-xl.jpg', color: '#FF0000' },
  bannerImage: null,
  studios: { nodes: [{ name: 'BONES', isAnimationStudio: true }] },
  nextAiringEpisode: null,
};

describe('AnimeCard', () => {
  it('renders the english title when available', () => {
    render(<AnimeCard anime={mockAnime} />);
    expect(screen.getByText('My Hero Academia')).toBeInTheDocument();
  });

  it('falls back to romaji title when english is null', () => {
    render(<AnimeCard anime={{ ...mockAnime, title: { ...mockAnime.title, english: null } }} />);
    expect(screen.getByText('Boku no Hero Academia')).toBeInTheDocument();
  });

  it('displays the score as a decimal out of 10', () => {
    render(<AnimeCard anime={mockAnime} />);
    expect(screen.getByText('8.0')).toBeInTheDocument();
  });

  it('links to the correct anime detail page', () => {
    render(<AnimeCard anime={mockAnime} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/anime/1');
  });
});
