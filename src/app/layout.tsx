import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/components/ui/NavBar';

export const metadata: Metadata = {
  title: 'AniScope — Anime Discovery',
  description: 'Discover, track, and explore anime with AI-powered search',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
