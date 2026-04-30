# Il ou Elle

A tiny two-player guess-the-person game. One player thinks of someone, the other guesses by asking questions out loud (over phone / video).

Stack: Next.js (App Router) + Supabase (Postgres + Realtime).

---

## 1. Set up Supabase (one time, ~2 minutes)

1. Go to https://supabase.com, sign in, create a new project. Pick any name and password. Wait for it to provision.
2. Open the project's **SQL Editor** and run this:

   ```sql
   create table il_ou_elle_rooms (
       id            uuid primary key default gen_random_uuid(),
       created_at    timestamptz not null default now(),
       player1_id    text not null,
       player2_id    text,
       thinker_id    text,
       secret        text,
       status        text not null default 'waiting',
       winner_id     text
   );

   alter publication supabase_realtime add table il_ou_elle_rooms;

   alter table il_ou_elle_rooms enable row level security;
   create policy "anyone can read" on il_ou_elle_rooms for select using (true);
   create policy "anyone can insert" on il_ou_elle_rooms for insert with check (true);
   create policy "anyone can update" on il_ou_elle_rooms for update using (true) with check (true);
   ```

3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

## 2. Run locally

```bash
cp .env.local.example .env.local
# paste the URL and anon key into .env.local
npm install
npm run dev
```

Open two browser windows (one regular, one incognito so they have different localStorage IDs) at http://localhost:3000 and play.

## 3. Deploy to Vercel

1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com/new, import the repo.
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) from your Supabase project.
4. Deploy. Share the URL.

---

## How it works

- A single `rooms` row holds the entire game state (`waiting → thinking → guessing → done`).
- Both browsers subscribe to that row via Supabase Realtime — every change propagates in ~100 ms.
- Player identity is a UUID stored in `localStorage`. No login.
- The match is case-insensitive and trims whitespace.

## Known v1 tradeoff

The secret name is stored in plaintext in a publicly-readable row, so a determined guesser could open devtools and cheat. This is fine for a kid playing with grandma. To lock it down, replace the client-side `submitGuess` check with a Supabase RPC function and remove `select` access on the `secret` column.
