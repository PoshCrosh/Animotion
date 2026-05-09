# 🎬 Animotion

> A gamified animation learning platform. Learn the 12 principles of animation through interactive lessons, a built-in editor, and an AI coach — all wrapped in a Wii U-inspired UI.

---

## 🚀 Deploy in 4 steps

### Step 1 — GitHub
1. Go to [github.com](https://github.com) → Sign in or create account
2. Click **New repository** (top right `+`)
3. Name it `animotion`, set to **Public**, click **Create repository**
4. Open your terminal, navigate to this folder and run:
```bash
git init
git add .
git commit -m "Initial commit — Animotion v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/animotion.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

### Step 2 — Supabase
1. Go to [supabase.com](https://supabase.com) → Sign in → **New project**
2. Choose a name, region, and database password → **Create project**
3. Once ready: go to **SQL Editor** → **New Query** → paste the contents of `supabase/schema.sql` → **Run**
4. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Go to **Authentication → Providers → Google** → enable it
   - You'll need a Google Cloud project with OAuth credentials
   - Add `https://your-project.supabase.co/auth/v1/callback` as an authorized redirect URI

### Step 3 — Anthropic (AI Coach)
1. Go to [console.anthropic.com](https://console.anthropic.com) → **API Keys** → **Create Key**
2. Copy it — this is your `ANTHROPIC_API_KEY`

### Step 4 — Vercel
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **Add New → Project** → import your `animotion` repository
3. In **Environment Variables**, add these three:
   ```
   NEXT_PUBLIC_SUPABASE_URL       = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  = your-anon-key
   NEXT_PUBLIC_SITE_URL           = https://your-app.vercel.app
   ANTHROPIC_API_KEY              = your-anthropic-key
   ```
4. Click **Deploy** — done! 🎉
5. After deploying, go back to Supabase → **Auth → URL Configuration**:
   - Set **Site URL** to your Vercel URL
   - Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**

---

## 💻 Local development

```bash
# Install dependencies
npm install

# Copy the env template and fill in your keys
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Anthropic keys

# Run locally
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project structure

```
animotion/
├── app/                    # Next.js App Router pages
│   ├── api/                # Server-side API routes
│   │   ├── chat/           # AI Coach (Anthropic Claude)
│   │   ├── analyze/        # Animation analyzer
│   │   ├── boss/           # Boss battle evaluator
│   │   ├── leaderboard/    # Real user rankings
│   │   ├── profile/        # Profile get/update
│   │   └── projects/       # Editor project CRUD
│   ├── auth/callback/      # Supabase OAuth handler
│   ├── dashboard/          # Home (Wii U tile grid)
│   ├── lessons/            # World → Section → Lesson flow
│   ├── coach/              # AI chat + 12 skill bars
│   ├── editor/             # Canvas animation editor
│   ├── progress/           # Visual progress map
│   ├── leaderboard/        # Real user rankings
│   ├── profile/            # Skills, stats, achievements
│   ├── videos/             # YouTube video library
│   ├── creator-hub/        # Animation educator showcase
│   ├── settings/           # App preferences
│   └── login/              # Auth page
├── components/
│   ├── layout/             # AppShell, Sidebar, TopBar, Footer
│   ├── lessons/            # ActiveLesson, LessonCard
│   ├── editor/             # ExportModal, ProjectSettingsPanel
│   └── ui/                 # Mascot, XPBar, Modals, etc.
├── hooks/
│   ├── useAuth.js          # Session guard + hydration
│   └── useEditor.js        # Canvas editor state
├── lib/
│   ├── curriculum.js       # All worlds, sections, lessons
│   ├── store.js            # Global state (Context + useReducer)
│   ├── db.js               # Supabase operations
│   ├── utils.js            # XP, rank, formatting helpers
│   ├── animationKnowledge.js  # Book knowledge base
│   └── wiiTheme.js         # Design tokens
└── supabase/
    └── schema.sql          # Run once in Supabase SQL Editor
```

---

## 🎮 Features

- **Gamified learning** — XP, levels, ranks, daily quests
- **5 learning worlds** — 2D, 3D, VFX, Cinematography, Motion Graphics
- **50+ lessons** with quizzes and practical tasks
- **AI Coach "Ani"** — powered by Claude, trained on Thomas & Johnston and Richard Williams
- **Canvas editor** — frame-by-frame animation with layers, onion skin, export to MP4/GIF
- **Leaderboard** — real users ranked by XP
- **Wii U-inspired UI** — frosted glass tiles, cyan glow, Nintendo-soft aesthetics

---

Made by Posh :) · Free forever · No ads
