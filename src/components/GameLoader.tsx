'use client';
// Client component wrapper that dynamically imports the Game (canvas-based, client-only)
import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-cyan-400/60 text-sm tracking-widest font-bold">LOADING...</p>
      </div>
    </div>
  ),
});

export default function GameLoader() {
  return <Game />;
}
