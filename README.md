# 🌸 AniScope

> **Your intelligent anime discovery, tracking, and community platform.**

AniScope is a full-stack anime platform that combines real-time trending data, personalized AI-powered recommendations, community reviews, and seasonal tracking — all in one place. Think of it as a modern alternative to MyAnimeList and AniList, but built with a strong AI discovery engine at its core. Point your scope at the anime world and never miss what's worth watching.

---

## ✨ Features

### 🤖 AI-Powered Discovery
- **Natural language search** — Ask things like *"anime with political intrigue similar to Code Geass but without mecha"* or *"something relaxing after work"*
- **Semantic similarity engine** — Embeddings-based recommendations that understand plot, tone, and themes
- **Explainable recommendations** — Every suggestion comes with a clear reasoning card
- **Smart search by mood, character type, or description**
- **AI trend prediction** — Forecasts potential hits next season based on studio history and community signals

### 📊 Trending & Rankings
- **Weekly trending** — Most discussed anime by user activity, ratings, reviews, and watchlist additions
- **Monthly rankings** — Most watched, highest rated, most added to watchlist, fastest growing
- **Global statistics** — Genre popularity charts, top studios, top characters, all-time greats

### 📅 Seasonal Anime Tracker
- Full airing schedule organized by day of the week
- Countdown to next episode
- Episode tracker per user
- Push notifications for new episodes
- Filter by genre, studio, year, and airing status (Airing / Finished / Upcoming / Hiatus / Cancelled)

### ⭐ Community
- **1–10 rating system** with average score and full rating distribution
- **Structured reviews** — Story · Characters · Animation · Soundtrack · Overall
- **User collections** — Create and share curated lists like *"Hidden Gems"*, *"Best Fantasy Anime"*, or *"Must Watch Before 2027"*
- **User profiles** with personal statistics (anime watched, episodes, hours, favorite genre)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, TailwindCSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Anime Data | AniList GraphQL API |
| AI / ML | Sentence embeddings, semantic search, recommendation engine |
| Auth | JWT-based authentication |
| Infra | Docker, Docker Compose |

---

## 🗂️ Project Structure

```
aniscope/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── api/            # API client layer
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── ai/             # Recommendation & embedding engine
├── ml/                     # Standalone ML pipeline
│   ├── embeddings/         # Anime embedding generation
│   ├── recommender/        # Similarity & ranking models
│   └── trends/             # Trend prediction models
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/aniscope.git
cd aniscope
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Fill in your values: database URL, JWT secret, API keys
```

### 3. Start with Docker

```bash
docker-compose up --build
```

The app will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### 4. Run locally (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 AI Recommendation Engine

AniScope uses a multi-stage recommendation pipeline:

1. **Embedding generation** — Each anime is embedded using a fine-tuned sentence transformer trained on titles, descriptions, genres, and tags.
2. **Collaborative filtering** — User rating history is used to identify similar users and surface anime they loved.
3. **Content-based similarity** — Cosine similarity over embeddings enables tag-agnostic matching.
4. **Re-ranking** — Results are re-ranked by recency, community score, and the user's genre preferences.

```
User profile + query
       ↓
Embedding model → similarity search (vector DB)
       ↓
Collaborative filter layer
       ↓
Re-ranking (score × recency × genre affinity)
       ↓
Explained recommendations
```

---

## 🗃️ Database Schema (Simplified)

```
Anime           — id, title, description, genres[], tags[], studio, season, year, status
Users           — id, username, email, profile, favorite_genres[], favorite_studios[]
Ratings         — user_id, anime_id, score, created_at
Reviews         — user_id, anime_id, story, characters, animation, soundtrack, overall, text
WatchHistory    — user_id, anime_id, episodes_watched, status, updated_at
Collections     — user_id, name, description, anime_ids[]
Statistics      — anime_id, daily_popularity, weekly_popularity, monthly_popularity
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/anime` | List anime with filters |
| GET | `/anime/{id}` | Anime details |
| GET | `/trending/weekly` | Weekly trending |
| GET | `/rankings/monthly` | Monthly rankings |
| GET | `/seasonal` | Current season schedule |
| POST | `/recommend` | Personalized recommendations |
| POST | `/search/ai` | Natural language search |
| POST | `/ratings` | Submit a rating |
| POST | `/reviews` | Submit a review |
| GET | `/users/{id}/profile` | User profile & stats |

Full API reference is available at `/docs` (Swagger UI) when the backend is running.

---

## 📦 Data Sources

AniScope uses the **[AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/)** as its primary anime data source.

**Why AniList?**
- Free to use, no API key required
- GraphQL — fetch exactly the fields you need in a single request
- Rich, well-structured metadata: genres, tags, studios, staff, characters, relations
- Actively maintained and reliable (first-party API, not a scraper)
- Supports OAuth — users can optionally link their AniList account to import their existing list and ratings
- Covers seasonal data, airing schedules, scores, and popularity metrics out of the box

**Example query:**
```graphql
query ($season: MediaSeason, $year: Int) {
  Page {
    media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
      id
      title { romaji english }
      genres
      tags { name }
      averageScore
      episodes
      status
      coverImage { large }
      studios { nodes { name } }
    }
  }
}
```

AniList data is fetched and cached in PostgreSQL to reduce external API calls and support AniScope's own ranking and recommendation logic on top.

---

## 🌐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aniscope

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRE_MINUTES=60

# AI / ML
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_DB_URL=http://localhost:6333

# External APIs
ANILIST_API_URL=https://graphql.anilist.co
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [MyAnimeList](https://myanimelist.net) for inspiration
- [AniList API](https://anilist.gitbook.io/anilist-apiv2-docs/) — primary anime data source (GraphQL)
- [Sentence Transformers](https://www.sbert.net/) — for the embedding backbone

---

<p align="center">Built with ❤️ for the anime community</p>
