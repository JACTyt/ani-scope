# AniScope v1.0 — Design Specification

**Date:** 2026-05-30  
**Status:** Approved  
**Scope:** v1.0 (no auth, no user system, no community features)  
**v1.5+ deferred:** Authentication, user accounts, watch history, ratings, reviews, collections, community features

---

## 1. Overview

AniScope is a full-stack anime discovery and tracking platform. v1.0 delivers four core pillars without requiring any user account:

1. **Browse & Discover** — catalog with rich filtering
2. **Trending & Rankings** — community-driven leaderboards powered by AniList signals
3. **Seasonal Tracker** — current and past season airing schedules with episode countdowns
4. **NLP Search** — natural language queries parsed by an LLM into AniList GraphQL filters (user-provided OpenAI key)

---

## 2. Architecture

### 2.1 Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 15 (App Router) |
| Styling | TailwindCSS v4 |
| Language | TypeScript |
| Anime data | AniList GraphQL API (free, no key required) |
| NLP search | OpenAI API (user-provided BYOK key) |
| Caching | Next.js ISR + `fetch` cache (built-in) |
| Database | None in v1.0 — AniList is the source of truth |
| Deployment | Vercel (single project) |

### 2.2 Guiding Principles

- **AniList is the source of truth.** No anime data is stored in a database. All reads go through AniList GraphQL, cached by Next.js ISR.
- **No backend service.** Next.js API routes handle all server-side logic. No separate FastAPI or Express server.
- **No database in v1.0.** PostgreSQL is deferred to v1.5 when user accounts and community data require persistence.
- **NLP search is progressive enhancement.** The app is fully functional without an OpenAI key — search falls back to tag/genre filtering.
- **Single deployment target.** One Next.js repository deployed to Vercel. No Railway, no Neon, no extra services.

### 2.3 System Diagram

```
Browser (React UI)
  │  OpenAI key stored in localStorage
  │
  ▼
Next.js 15 — Vercel
  ├── App Router Pages (RSC + ISR)
  │     / · /browse · /anime/[id] · /trending · /seasonal · /search
  │
  ├── API Routes (Next.js Route Handlers)
  │     /api/anime          → AniList proxy + fetch cache
  │     /api/anime/[id]     → detail + similar anime
  │     /api/trending       → trending/rankings
  │     /api/seasonal       → airing schedule
  │     /api/search/nlp     → OpenAI query parser → AniList
  │     /api/search         → structured AniList query
  │
  └── Next.js Cache
        Pages (ISR):  Home 1h · Trending 1h · Seasonal 1h · Detail 24h
        API routes:   fetch cache with matching revalidate windows
        │
        ▼
  AniList GraphQL API          OpenAI API (BYOK)
  (free, no key needed)        (user's own key, per-request)
```

---

## 3. Data Layer

### 3.1 AniList as Source of Truth

All anime data is fetched from AniList GraphQL (`https://graphql.anilist.co`) and cached via Next.js `fetch` with `next: { revalidate: N }`. No sync jobs, no cron, no database writes.

**Key AniList capabilities used:**

| Feature | AniList Query |
|---|---|
| Browse/catalog | `Page.media` filtered by genre, tag, year, studio, status, sort |
| Anime detail | `Media(id)` with full metadata |
| Similar anime | `Media.recommendations` + separate tag-overlap query |
| Trending | `Page.media(sort: TRENDING_DESC)` |
| Top rated | `Page.media(sort: SCORE_DESC)` |
| Most popular | `Page.media(sort: POPULARITY_DESC)` |
| Most favourited | `Page.media(sort: FAVOURITES_DESC)` |
| Seasonal schedule | `Page.media(season, seasonYear)` + `airingSchedule` |
| Characters/staff | `Media.characters`, `Media.staff` |

### 3.2 Caching Strategy

| Data | Revalidation | Rationale |
|---|---|---|
| Anime detail page | 24h | Rarely changes once a show is airing |
| Trending / Rankings | 1h | AniList scores and trending update frequently |
| Seasonal schedule | 1h | Air times and episode counts can update |
| Browse / catalog | 6h | Genre/tag data is stable |
| NLP search results | No cache | User-specific query, always fresh |

### 3.3 Rate Limiting

AniList allows 90 requests/minute per IP. With ISR caching, only one request fires per revalidation window regardless of how many users are served. No rate limit handling is needed in v1.0.

---

## 4. Pages & Routing

### 4.1 Route Map

| Route | Rendering | Description |
|---|---|---|
| `/` | ISR 1h | Home: hero banner, weekly trending, top rated, today's airing, NLP search bar |
| `/browse` | Client (CSR) | Catalog with filter sidebar and infinite scroll |
| `/anime/[id]` | ISR 24h | Full detail page: metadata, characters, similar anime, trailer |
| `/trending` | ISR 1h | Leaderboard tabs: Trending · Top Rated · Most Popular · Most Favourited |
| `/seasonal` | ISR 1h | Airing schedule grid by weekday with episode countdowns |
| `/search` | Client (CSR) | NLP search input, key setup modal, results with explanation cards |

### 4.2 Page Details

#### `/` — Home (ISR 1h)
- Full-width hero with the most-trending anime of the current season (cover art, score, synopsis snippet)
- Horizontal scroll row: "Trending this week" (top 6, sort: `TRENDING_DESC`)
- Horizontal scroll row: "Top rated all-time" (top 10, sort: `SCORE_DESC`)
- "Airing today" section: shows with an episode scheduled within the next 24 hours (computed server-side at revalidation time using current UTC date)
- Prominent NLP search bar in the hero area

#### `/browse` — Catalog
- Left sidebar with collapsible filter groups: Genre (multi-select), Tags (multi-select), Year (range or dropdown), Studio (searchable select), Status (Airing / Finished / Upcoming / Hiatus / Cancelled), Minimum Score (slider)
- Main content: responsive card grid, infinite scroll via AniList pagination cursor
- Sort bar above grid: Popularity · Score · Trending · Newest · Alphabetical
- Active filters shown as removable chips at the top of the grid
- Filter state lives in URL search params (`?genre=Fantasy&sort=SCORE_DESC`) for shareability

#### `/anime/[id]` — Detail
- Hero section: large cover art, title (romaji + english), score badge, episode count, status pill, season/year, studio
- Synopsis (collapsible if long)
- Genre and tag chips
- Score distribution bar chart (using AniList's `stats.scoreDistribution`)
- Trailer embed (YouTube, from `Media.trailer` if available)
- Characters section: top 6 characters with role (Main/Supporting)
- Staff section: director, composer
- Similar anime strip: AniList `recommendations` (community-picked) merged with a tag-overlap query (top 6 matches by shared tag count), deduplicated

#### `/trending` — Rankings & Leaderboard
- Tab bar: Trending · Top Rated · Most Popular · Most Favourited
- Time filter: All-time · This Season · This Year
- Ranked list: position number, cover thumbnail, title, score, popularity count, favourites count, genres
- Genre popularity chart: bar chart of genre distribution across top 100 anime
- Top studios: ranked list of studios by average score of their top 10 titles

#### `/seasonal` — Seasonal Tracker
- Season selector: Spring / Summer / Fall / Winter + year (defaults to current season)
- Schedule grid organized by day of week (Mon–Sun + unknown/TBA column)
- Each entry: cover thumbnail, title, episode number, air time (user's local timezone), countdown to next episode
- Filter controls: Genre, Studio, Status
- Countdown timers are client components (live updating); rest of page is ISR

#### `/search` — NLP Search
- Full-width search input with placeholder examples ("anime with political intrigue like Code Geass but no mecha", "something relaxing after work")
- If no OpenAI key is set: modal prompts user to enter their key with a link to `platform.openai.com/api-keys`. Key is saved to `localStorage` under `aniscope_openai_key`
- After query submission: shows "parsed intent" summary (extracted genres, tags, mood, exclusions)
- Results grid with `ExplanationCard` overlay on each result ("Why this matches your query")
- "Search without AI" fallback link opens `/browse` with best-guess filters pre-applied
- Key management: settings icon in corner allows clearing the stored key

---

## 5. API Routes

All routes are Next.js Route Handlers (`app/api/*/route.ts`). They proxy AniList GraphQL and forward cached responses to the client.

| Route | Method | Description |
|---|---|---|
| `/api/anime` | GET | List anime with filters (genre, tag, sort, page, status, year) |
| `/api/anime/[id]` | GET | Anime detail + similar (recommendations + tag overlap) |
| `/api/trending` | GET | Rankings by sort type (trending/score/popularity/favourites) and time filter |
| `/api/seasonal` | GET | Airing schedule for a given season + year |
| `/api/search` | GET | Structured search with explicit params (genre[], tag[], score_min, sort) |
| `/api/search/nlp` | POST | Accepts `{query: string}` + `x-openai-key` header → returns structured params + explanation + results |

### 5.1 NLP Search Route (`/api/search/nlp`)

**Request:**
```
POST /api/search/nlp
Headers: x-openai-key: sk-...
Body: { "query": "relaxing slice of life after work" }
```

**Processing:**
1. Validate `x-openai-key` header is present (return 400 if missing)
2. Call OpenAI Chat Completions with a structured system prompt that instructs extraction of: `genres[]`, `tags[]`, `exclude_genres[]`, `exclude_tags[]`, `score_min`, `explanation` (human-readable summary of the parsed intent)
3. Parse the JSON response from OpenAI
4. Execute AniList GraphQL query using the extracted params
5. Return combined payload: `{ params, explanation, results }`

**Security:**
- OpenAI key is never logged or stored server-side
- Key lives only in the request header (sent over HTTPS)
- User is informed at key-setup time that the key passes through Vercel's edge network
- User can clear the key at any time via the settings control in `/search`

---

## 6. Component Architecture

### 6.1 Server Components (default)
All page-level components and data-fetching wrappers are React Server Components. They fetch AniList data using `fetch` with ISR revalidation and render HTML on the server.

### 6.2 Client Islands
Interactive components are opted into the client via `"use client"`:

| Component | Responsibility |
|---|---|
| `AnimeCard` | Cover, title, score badge, genre chips — base card used everywhere |
| `AnimeGrid` | Responsive card grid with loading skeletons |
| `FilterSidebar` | Genre/tag/year/studio/status filter controls; syncs to URL params |
| `InfiniteScroll` | Wraps `AnimeGrid` on /browse; fetches next page on scroll |
| `CountdownTimer` | Live countdown to next episode air time (ticks every second) |
| `SearchBar` | NLP query input; triggers key setup modal if no key stored |
| `KeySetupModal` | OpenAI key input, saves to localStorage, includes clear action |
| `ExplanationCard` | "Why this matches" overlay on search result cards |
| `RankingTable` | Ranked list with position number, stats, genre chips |
| `SeasonalGrid` | Day-of-week schedule grid; contains `CountdownTimer` per entry |
| `SimilarAnime` | Horizontal strip of similar anime on detail page |
| `TabBar` | Tab navigation for /trending (Trending/Top Rated/Popular/Favourited) |
| `SeasonSelector` | Season + year picker on /seasonal |
| `ScoreChart` | Score distribution bar chart on detail page |
| `TrailerEmbed` | Lazy-loaded YouTube embed with consent placeholder |

### 6.3 Directory Structure

```
src/
├── app/
│   ├── page.tsx                    # Home (SSG)
│   ├── browse/page.tsx             # Catalog (CSR)
│   ├── anime/[id]/page.tsx         # Detail (ISR 24h)
│   ├── trending/page.tsx           # Rankings (ISR 1h)
│   ├── seasonal/page.tsx           # Schedule (ISR 1h)
│   ├── search/page.tsx             # NLP Search (CSR)
│   └── api/
│       ├── anime/route.ts
│       ├── anime/[id]/route.ts
│       ├── trending/route.ts
│       ├── seasonal/route.ts
│       ├── search/route.ts
│       └── search/nlp/route.ts
├── components/
│   ├── anime/                      # AnimeCard, AnimeGrid, SimilarAnime, ScoreChart, TrailerEmbed
│   ├── search/                     # SearchBar, KeySetupModal, ExplanationCard
│   ├── trending/                   # RankingTable, TabBar
│   ├── seasonal/                   # SeasonalGrid, SeasonSelector, CountdownTimer
│   ├── browse/                     # FilterSidebar, InfiniteScroll
│   └── ui/                         # Shared primitives: Button, Badge, Skeleton, Modal
├── lib/
│   ├── anilist/
│   │   ├── client.ts               # fetch wrapper with ISR revalidation
│   │   └── queries/                # GraphQL query strings per feature
│   └── openai/
│       └── nlp-parser.ts           # System prompt + OpenAI call + response parser
└── types/
    └── anilist.ts                  # TypeScript types for AniList API responses
```

---

## 7. Visual Design

**Theme:** Dark Cinematic  
**Palette:** Deep navy (`#0d0d14`) background · Purple accent (`#a855f7`) · Violet secondary (`#6c63ff`) · Slate text (`#e2e8f0` / `#94a3b8`)  
**Typography:** System font stack with heavy weights for scores and titles  
**Cards:** Dark elevated surfaces (`#1a1a2e`) with subtle border and hover glow  
**Rendering:** Cover images from AniList CDN via `next/image` with blur placeholder

---

## 8. Versioning Plan

| Version | Scope |
|---|---|
| **v1.0** | Browse, Trending & Rankings, Seasonal Tracker, NLP Search. No auth, no DB. |
| **v1.5** | Auth (AniList OAuth or custom JWT), user accounts, watch history, ratings, reviews, collections. PostgreSQL added. |
| **v2.0** | Community features, collaborative recommendations, user stats, sharing. |

---

## 9. Out of Scope for v1.0

- User authentication and accounts
- Watch history and episode tracking per user
- Ratings and reviews
- User collections
- Push notifications
- Community features
- Personalized recommendations (requires user history)
- Collaborative filtering
- PostgreSQL / any database
- Trend prediction ML model
- Mobile app
