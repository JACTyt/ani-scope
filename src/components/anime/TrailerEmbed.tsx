'use client';
import { useState } from 'react';

interface TrailerEmbedProps {
  trailer: { id: string; site: string };
}

export function TrailerEmbed({ trailer }: TrailerEmbedProps) {
  const [accepted, setAccepted] = useState(false);

  if (trailer.site !== 'youtube') return null;

  if (!accepted) {
    return (
      <div className="aspect-video w-full rounded-xl bg-surface-elevated border border-border flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-text-muted text-sm">This trailer loads from YouTube</p>
        <button
          onClick={() => setAccepted(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          Load Trailer
        </button>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${trailer.id}`}
        title="Anime trailer"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
