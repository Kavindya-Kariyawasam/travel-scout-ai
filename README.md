# Travel Scout AI

An AI-powered travel experience finder. Describe your ideal trip in plain English and get intelligently matched experiences, with clear reasoning for every suggestion.

> Built with Next.js, Gemini AI, semantic vector search, and Tailwind CSS.

---

## Features

- **Natural language search** - type exactly how you think (_"something adventurous and wild under $150"_)
- **Semantic vector search** - uses real embeddings to understand meaning, not just keywords
- **Grounded AI responses** - results are strictly limited to the curated inventory
- **Match reasoning** - every result explains _why_ it was chosen
- **Similarity scoring** - shows how closely each result matched your query
- **Graceful fallbacks** - helpful guidance when nothing matches

---

## Architecture - RAG Pipeline

This app implements a **Retrieval-Augmented Generation (RAG)** pipeline:

```
User Query
    │
    ▼
┌─────────┐
│ RETRIEVE │  Embed query with Gemini gemini-embedding-001
└────┬────┘  Cosine similarity vs precomputed inventory vectors
     │       Drop items below 0.5 similarity threshold
     ▼
┌─────────┐
│ AUGMENT  │  Build prompt with only semantically relevant candidates
└────┬────┘  Gemini never sees items that aren't relevant
     │
     ▼
┌──────────┐
│ GENERATE │  gemini-2.0-flash reasons over candidates
└────┬─────┘ Returns matched item IDs + reasoning (temperature: 0)
     │
     ▼
┌──────────┐
│ VALIDATE │  Zod schema rejects any ID not in the inventory
└────┬─────┘ Hallucination firewall at the API boundary
     │
     ▼
   Results
```

**Why precomputed embeddings?**
The inventory is static. Generating embeddings once and committing them to the repo means zero embedding cost at runtime for inventory items. Only the user's query is embedded per search. This is a standard production pattern for static datasets.

**Why no price filtering in the retrieval layer?**
Natural language price expressions ("cheap", "below hundred", "under Rs.100") are too varied for regex. The LLM handles all price reasoning in the generation layer where natural language understanding is actually reliable.

---

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 14 (App Router, TypeScript)             |
| AI - Chat       | Gemini `gemini-2.0-flash`                       |
| AI - Embeddings | Gemini `gemini-embedding-001` (3072 dimensions) |
| Validation      | Zod                                             |
| Styling         | Tailwind CSS 3.x                                |
| Icons           | Lucide React                                    |
| Deployment      | Vercel                                          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Kavindya-Kariyawasam/travel-scout-ai.git
cd travel-scout-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Gemini API key to .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable         | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `GEMINI_API_KEY` | Your Google Gemini API key (server-side only, never exposed to client) |

### Regenerating Embeddings

Only needed if the inventory changes:

```bash
npx ts-node --project tsconfig.scripts.json -r tsconfig-paths/register scripts/generateEmbeddings.ts
```

The generated `src/lib/embeddings.json` is committed to the repo so cloning the project works out of the box without needing an API key just to build.

---

## Project Structure

```
travel-scout-ai/
├── src/
│   ├── app/
│   │   ├── api/scout/route.ts     # RAG pipeline entry point
│   │   ├── page.tsx               # Main search UI
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── SearchBar.tsx          # Query input with example chips
│   │   ├── ResultCard.tsx         # Result with tags, price, similarity, AI reasoning
│   │   ├── EmptyState.tsx         # No results state
│   │   └── LoadingSkeleton.tsx    # Loading animation
│   └── lib/
│       ├── inventory.ts           # Curated travel inventory (fixed, never changes at runtime)
│       ├── types.ts               # Shared TypeScript interfaces
│       ├── vectorSearch.ts        # Cosine similarity search over precomputed vectors
│       ├── scorer.ts              # Deprecated keyword scorer (kept for reference)
│       └── embeddings.json        # Precomputed embedding vectors (3072-dim)
├── scripts/
│   └── generateEmbeddings.ts      # One-time embedding generation script
├── tsconfig.scripts.json          # TypeScript config for scripts only
├── .env.example                   # Environment variable template
└── README.md
```

---

## Technical Q&A

### 1. The Technical Hurdle

The most significant challenge was designing the retrieval layer of the RAG pipeline correctly. My initial implementation used a keyword synonym map. Manually mapping words like "surf" to tags like "surfing" and "beach", as a pre-filter before the LLM. It seemed reasonable at first, but I realised it introduced a critical failure mode, if a user's phrasing wasn't in the map, relevant items would be filtered out before Gemini ever saw them. The pre-filter was actively working against the LLM instead of with it.

I scrapped it entirely and replaced it with genuine semantic search using Gemini's embedding model. Each inventory item is converted to a descriptive sentence and embedded once into a 3072-dimensional vector, committed to the repo as `embeddings.json`. At query time, only the user's query is embedded, cosine similarity is computed in-memory against the precomputed vectors, and only items above a 0.5 similarity threshold reach Gemini.

This was a better division of responsibility, vector math handles semantic retrieval, the LLM handles natural language reasoning. Debugging the threshold took several test queries to calibrate, including edge cases like ambiguous phrasing and queries that mentioned numbers unrelated to price.

### 2. The Scalability Approach

With 50,000 travel packages, the current approach of storing vectors in a JSON file and computing cosine similarity in memory would not scale. Loading and comparing 50,000 vectors on every request would be too slow and memory-intensive.

The upgrade path would be:

**Embeddings storage** - migrate `embeddings.json` to a vector database. Supabase with the pgvector extension is a strong choice: it's PostgreSQL-based, has a free tier, and supports approximate nearest neighbour search with `ivfflat` or `hnsw` indexes.

**Retrieval** - replace the in-memory cosine similarity loop with a single SQL query:

```sql
SELECT id, 1 - (vector <=> query_vector) AS similarity
FROM inventory_embeddings
ORDER BY vector <=> query_vector
LIMIT 10;
```

**Hard filters** - apply SQL `WHERE` clauses for price, location, or tags before the vector search, reducing the candidate set before semantic ranking even begins.

**Embedding pipeline** - use a background job (e.g. a Vercel Cron or a queue) to generate and upsert embeddings whenever new inventory items are added.

**Cost controls** - cache embeddings for repeated queries using Redis or Vercel KV, and keep the LLM prompt short by sending only top-k retrieved candidates.

### 3. AI Tools Used — Reflection

I used GitHub Copilot throughout. The most instructive moment was when I was working on the price constraint logic. Copilot suggested adding a regex-based price extractor in the retrieval layer to filter items before the LLM call, patterns like matching "$100" or "under 50" from the query string. On the surface it looked reasonable. But thinking it through, I realised the approach was fundamentally flawed. Natural language price expressions are far too varied for regex to handle reliably. "Below hundred", "under Rs.100", "something cheap", "don't want to spend much", none of these would be caught, and worse, an unrelated number in the query like "I've visited Sri Lanka 3 times" could be misread as a price.

The fix wasn't to write better regex - it was to recognise that price reasoning belongs in the LLM layer where natural language understanding is actually reliable, not in a pre-filter where we're doing brittle string matching. I removed the price logic from the retrieval layer entirely. Copilot was suggesting a local solution to a problem that was better solved one layer up.

---

## Credits

Destination data and project concept inspired by **[Intrepid Travel](https://www.intrepidtravel.com/)** — pioneers of responsible, experience-first travel.

---
