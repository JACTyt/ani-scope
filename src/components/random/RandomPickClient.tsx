'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shuffle, RotateCcw, ExternalLink, Star, Clapperboard,
  Volume2, VolumeX, Users, Tv, Building2, CalendarDays,
} from 'lucide-react';
import { GenreSelector } from './GenreSelector';
import type { AniListMediaCard, MediaStatus } from '@/types/anilist';

// ─── Audio ────────────────────────────────────────────────────────────────────

function synthTick(ctx: AudioContext, pitch: number, vol: number) {
  const len = Math.floor(ctx.sampleRate * 0.045);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  const decay = ctx.sampleRate * 0.022;
  for (let i = 0; i < len; i++) {
    data[i] =
      Math.sin((2 * Math.PI * pitch * i) / ctx.sampleRate) *
      Math.exp(-i / decay) *
      vol;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start();
}

function synthWin(ctx: AudioContext) {
  // C-major arpeggio (C5 E5 G5 C6) + final unison
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + i * 0.13;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.start(t);
    osc.stop(t + 0.6);
  });
  // Sustained chord at the end
  notes.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + notes.length * 0.13;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.start(t);
    osc.stop(t + 1.25);
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W = 80;
const CARD_GAP = 8;
const CARD_TOTAL = CARD_W + CARD_GAP;
const WINNER_IDX = 42;
const REEL_COUNT = 52;
const SPIN_MS = 7000;
const TICK_COUNT = 46;
const TICK_RATIO = 1.09; // exponential growth per tick

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = ['Any', ...Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => String(CURRENT_YEAR - i))];

const STATUSES: { value: MediaStatus | ''; label: string }[] = [
  { value: '',                 label: 'Any'      },
  { value: 'RELEASING',        label: 'Airing'   },
  { value: 'FINISHED',         label: 'Finished' },
  { value: 'NOT_YET_RELEASED', label: 'Upcoming' },
  { value: 'HIATUS',           label: 'Hiatus'   },
];

const MUTE_KEY = 'aniscope_muted';
type Phase = 'idle' | 'spinning' | 'done';

// ─── Component ────────────────────────────────────────────────────────────────

export function RandomPickClient() {
  // Filters
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [year, setYear] = useState('Any');
  const [status, setStatus] = useState<MediaStatus | ''>('');

  // Reel state
  const [phase, setPhase] = useState<Phase>('idle');
  const [reelCards, setReelCards] = useState<AniListMediaCard[]>([]);
  const [winner, setWinner] = useState<AniListMediaCard | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Sound
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Load mute pref
  useEffect(() => {
    setMuted(localStorage.getItem(MUTE_KEY) === 'true');
  }, []);

  const toggleMute = () => {
    setMuted((m) => {
      localStorage.setItem(MUTE_KEY, String(!m));
      return !m;
    });
  };

  // Fetch description after reel stops
  useEffect(() => {
    if (phase !== 'done' || !winner) return;
    setDescription(null);
    fetch(`/api/anime/${winner.id}`)
      .then((r) => r.json())
      .then((data: { anime?: { description?: string | null } }) => {
        const raw = data.anime?.description ?? null;
        setDescription(raw ? raw.replace(/<[^>]+>/g, '') : null);
      })
      .catch(() => {});
  }, [phase, winner]);

  const getAudioCtx = () => {
    if (typeof AudioContext === 'undefined') return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const clearTicks = () => {
    tickTimersRef.current.forEach(clearTimeout);
    tickTimersRef.current = [];
  };

  const scheduleTicks = (ctx: AudioContext) => {
    clearTicks();
    // t0 * Σ r^i (i=0..N-1) = SPIN_MS  →  t0 = SPIN_MS*(r-1)/(r^N-1)
    const N = TICK_COUNT;
    const r = TICK_RATIO;
    const t0 = (SPIN_MS * (r - 1)) / (Math.pow(r, N) - 1);
    let elapsed = 0;
    for (let i = 0; i < N; i++) {
      const delay = elapsed;
      elapsed += t0 * Math.pow(r, i);
      const progress = i / N; // 0 = start (fast), 1 = end (slow)
      const pitch = 950 - progress * 520; // 950 Hz → 430 Hz
      const vol = 0.22 + progress * 0.12;  // slightly louder as it slows
      const id = setTimeout(() => {
        if (!muted) synthTick(ctx, pitch, vol);
      }, delay);
      tickTimersRef.current.push(id);
    }
  };

  const spin = async () => {
    if (phase === 'spinning') return;
    setPhase('spinning');
    setError('');
    setWinner(null);
    setDescription(null);

    // Kick-start audio context on user gesture
    const ctx = muted ? null : getAudioCtx();

    const params = new URLSearchParams();
    if (selectedGenres.length) params.set('genres', selectedGenres.join(','));
    if (year !== 'Any') params.set('year', year);
    if (status) params.set('status', status);
    const qs = params.toString() ? `?${params}` : '';

    let data: { winner: AniListMediaCard; pool: AniListMediaCard[] };
    try {
      const res = await fetch(`/api/random${qs}`);
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        setError(body.error ?? 'No anime found. Try different filters.');
        setPhase('idle');
        return;
      }
      data = await res.json() as { winner: AniListMediaCard; pool: AniListMediaCard[] };
    } catch {
      setError('Network error. Please try again.');
      setPhase('idle');
      return;
    }

    const shuffled = [...data.pool].sort(() => Math.random() - 0.5);
    const cards: AniListMediaCard[] = Array.from({ length: REEL_COUNT }, (_, i) =>
      i === WINNER_IDX ? data.winner : shuffled[i % shuffled.length]
    );
    setReelCards(cards);

    // Reset strip without transition
    if (stripRef.current) {
      stripRef.current.style.transition = 'none';
      stripRef.current.style.transform = 'translateX(0px)';
    }

    // Double rAF: commit the reset before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!stripRef.current || !containerRef.current) return;
        const cw = containerRef.current.offsetWidth;
        const targetX = -(WINNER_IDX * CARD_TOTAL + CARD_W / 2 - cw / 2);
        stripRef.current.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.05, 1, 0.25, 1)`;
        stripRef.current.style.transform = `translateX(${targetX}px)`;

        if (ctx) scheduleTicks(ctx);

        setTimeout(() => {
          setWinner(data.winner);
          setPhase('done');
          if (ctx && !muted) synthWin(ctx);
        }, SPIN_MS + 100);
      });
    });
  };

  const mainStudio = winner?.studios.nodes.find((s) => s.isAnimationStudio)?.name
    ?? winner?.studios.nodes[0]?.name;
  const winnerTitle = winner ? (winner.title.english ?? winner.title.romaji) : null;
  const winnerScore = winner?.averageScore ? (winner.averageScore / 10).toFixed(1) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/20 border border-accent/30">
            <Shuffle size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Random Pick</h1>
            <p className="text-text-muted text-sm mt-0.5">Let fate decide your next watch</p>
          </div>
        </div>
        <button
          onClick={toggleMute}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          className="p-2.5 rounded-xl border border-border hover:border-accent/50 bg-surface hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-all"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
        {/* Genre */}
        <div className="p-5">
          <GenreSelector selected={selectedGenres} onChange={setSelectedGenres} />
        </div>

        {/* Year + Status */}
        <div className="p-5 flex flex-wrap gap-6 items-start">
          {/* Year */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted flex items-center gap-1.5">
              <CalendarDays size={13} />
              Year
            </p>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none appearance-none cursor-pointer pr-8"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%2364748b' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted flex items-center gap-1.5">
              <Tv size={13} />
              Status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    status === value
                      ? 'bg-accent text-white shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                      : 'bg-background border border-border text-text-muted hover:border-accent/50 hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={phase === 'spinning'}
        className="w-full py-4 text-lg font-bold rounded-2xl bg-accent hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <Shuffle size={22} className={phase === 'spinning' ? 'animate-spin' : ''} />
        {phase === 'spinning' ? 'Rolling…' : 'Spin the Reel'}
      </button>

      {/* Error */}
      {error && <p className="text-warning text-sm text-center">{error}</p>}

      {/* Reel */}
      {reelCards.length > 0 && (
        <div
          ref={containerRef}
          className="relative h-36 overflow-hidden rounded-2xl border border-border bg-surface"
        >
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent z-10 -translate-x-1/2 shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
          <div className="absolute z-10 -translate-x-1/2" style={{ left: '50%', top: 0, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '10px solid #a855f7' }} />
          <div className="absolute z-10 -translate-x-1/2" style={{ left: '50%', bottom: 0, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '10px solid #a855f7' }} />

          {/* Card strip */}
          <div
            ref={stripRef}
            className="absolute top-0 left-0 flex items-center h-full"
            style={{ gap: CARD_GAP, paddingLeft: CARD_GAP, width: REEL_COUNT * CARD_TOTAL + CARD_GAP }}
          >
            {reelCards.map((card, i) => {
              const isWinner = phase === 'done' && i === WINNER_IDX;
              return (
                <div
                  key={i}
                  className={`relative shrink-0 rounded-lg overflow-hidden border transition-all duration-300 ${
                    isWinner
                      ? 'border-accent scale-105 shadow-[0_0_28px_rgba(168,85,247,0.95)]'
                      : 'border-border'
                  }`}
                  style={{ width: CARD_W, height: 112 }}
                >
                  <Image src={card.coverImage.large} alt={card.title.english ?? card.title.romaji} fill className="object-cover" unoptimized />
                </div>
              );
            })}
          </div>

          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
        </div>
      )}

      {/* Result card */}
      {phase === 'done' && winner && (
        <div
          className="bg-surface-elevated border border-accent/40 rounded-2xl overflow-hidden"
          style={{ animation: 'result-in 0.5s ease-out forwards' }}
        >
          {/* Banner strip */}
          {winner.bannerImage && (
            <div
              className="w-full h-44 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${winner.bannerImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated to-transparent" />
            </div>
          )}

          <div className="flex items-start gap-6 p-6">
            {/* Cover */}
            <div
              className="relative shrink-0 rounded-xl overflow-hidden border border-accent/50 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
              style={{ width: 128, height: 180, marginTop: winner.bannerImage ? -56 : 0 }}
            >
              <Image src={winner.coverImage.extraLarge} alt={winnerTitle!} fill className="object-cover" unoptimized />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-accent text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  <Clapperboard size={11} />
                  Your Pick
                </p>
                <h2 className="text-2xl font-bold text-text-primary line-clamp-2">{winnerTitle}</h2>
                {winner.title.english && winner.title.romaji !== winnerTitle && (
                  <p className="text-text-muted text-sm mt-0.5">{winner.title.romaji}</p>
                )}
              </div>

              {/* Score + quick stats row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {winnerScore && (
                  <span className="flex items-center gap-1 text-xl font-bold text-accent">
                    <Star size={16} fill="currentColor" />
                    {winnerScore}
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  winner.status === 'RELEASING'
                    ? 'bg-success/20 text-success'
                    : 'bg-white/10 text-white/60'
                }`}>
                  {winner.status.replace(/_/g, ' ')}
                </span>
                {winner.episodes && (
                  <span className="flex items-center gap-1 text-sm text-text-muted">
                    <Tv size={12} />
                    {winner.episodes} eps
                  </span>
                )}
                {winner.nextAiringEpisode && (
                  <span className="text-xs text-info">
                    Ep {winner.nextAiringEpisode.episode} airing soon
                  </span>
                )}
              </div>

              {/* Studio / season / popularity row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-subtle">
                {mainStudio && (
                  <span className="flex items-center gap-1">
                    <Building2 size={11} />
                    {mainStudio}
                  </span>
                )}
                {winner.season && winner.seasonYear && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} />
                    {winner.season} {winner.seasonYear}
                  </span>
                )}
                {winner.popularity > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {winner.popularity.toLocaleString()} fans
                  </span>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5">
                {winner.genres.slice(0, 6).map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs border border-accent/20">
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              {description && (
                <p className="text-text-muted text-sm leading-relaxed line-clamp-4">{description}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Link
                  href={`/anime/${winner.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95"
                >
                  <ExternalLink size={14} />
                  View Anime
                </Link>
                <button
                  onClick={spin}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-surface hover:bg-surface-elevated border border-border hover:border-accent/40 text-text-muted hover:text-text-primary rounded-xl text-sm font-medium transition-all"
                >
                  <RotateCcw size={14} />
                  Roll Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
