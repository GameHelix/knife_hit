# 🗡️ Knife Hit

A precision timing browser game built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. Throw knives at a spinning log without hitting the knives already stuck in it!

---

## Features

- **10 progressively harder levels** — faster rotation, more pre-placed knives, direction changes
- **3 difficulty tiers** — Easy / Medium / Hard (adjusts speed and knife density)
- **Boss levels** — Special levels (4, 8, 10) with red glowing rings
- **Apple pickups** — Bonus score objects on the log
- **Combo system** — Consecutive successful throws multiply your score
- **Sound effects** — Web Audio API synthesized SFX (throw, stick, collision, apple, level-up)
- **Background music** — Toggleable synthesized arpeggio
- **High score persistence** — Saved to `localStorage`
- **Pause / resume** — Press `Escape` or `P`, or tap the pause button
- **Responsive & mobile-first** — Scales to any viewport; touch controls included
- **Neon dark theme** — Deep-space background with cyan/purple neon accents
- **60 fps Canvas rendering** — HTML5 Canvas game loop with requestAnimationFrame

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Rendering | HTML5 Canvas API |
| Audio | Web Audio API (synthesized, no asset files needed) |
| Fonts | Google Fonts — Orbitron |
| Deployment | Vercel (zero-config) |

---

## Controls

### Desktop
| Action | Key / Input |
|---|---|
| Throw knife | `Space`, `↑`, `Enter`, or **left-click** anywhere |
| Pause / Resume | `Escape` or `P` |
| Toggle SFX | 🔊 button (top-right HUD) |
| Toggle Music | 🎵 button (top-right HUD) |

### Mobile / Tablet
| Action | Gesture |
|---|---|
| Throw knife | **Tap** anywhere on the canvas |
| Pause | Tap ⏸ button |
| Toggle audio | Tap the icons in the HUD |

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd knife_hit

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Deploy to Vercel

This project is **zero-config Vercel compatible**.

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B — GitHub Integration

1. Push the repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click **Deploy** — no environment variables or extra configuration needed

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (metadata, fonts, viewport)
│   ├── page.tsx                # Entry page
│   └── globals.css             # Global styles + Tailwind imports
├── components/
│   ├── Game.tsx                # Main orchestrator (canvas + overlays)
│   ├── GameLoader.tsx          # Client-side dynamic import wrapper
│   ├── HUD.tsx                 # Score / level / controls overlay
│   ├── StartScreen.tsx         # Main menu + difficulty selection
│   ├── GameOverScreen.tsx      # Game over overlay
│   └── LevelCompleteScreen.tsx # Level success overlay
├── hooks/
│   ├── useGameState.ts         # Game state reducer (all game logic)
│   ├── useGameLoop.ts          # RAF loop, physics, Canvas rendering
│   ├── useSound.ts             # Web Audio API sound engine
│   └── useHighScore.ts         # localStorage high score
├── utils/
│   ├── constants.ts            # Level definitions, scoring, config
│   ├── collision.ts            # Knife collision detection
│   └── gameEngine.ts           # Log physics, knife/apple positioning
└── types/
    └── game.ts                 # TypeScript interfaces
```

---

## Gameplay Rules

1. Select a difficulty and press a button to start
2. A knife waits at the bottom — **tap / click / Space** to throw it
3. The knife flies upward and sticks into the spinning log
4. **Never hit a knife that's already stuck** — instant game over
5. Collect red apples on the log for **+50 bonus points**
6. Clear all your knives in a level to advance to the next
7. Boss levels (4, 8, 10) spin faster and show a red glow ring

---

## License

MIT
