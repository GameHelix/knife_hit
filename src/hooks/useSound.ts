'use client';
// Sound management hook using Web Audio API
import { useRef, useCallback, useEffect } from 'react';

export function useSound(soundEnabled: boolean, musicEnabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicNodeRef = useRef<OscillatorNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);

  // Initialize AudioContext on first use
  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  // Play a short synthesized sound
  const playSound = useCallback((type: 'throw' | 'stick' | 'apple' | 'collision' | 'levelUp') => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'throw':
        // Quick whoosh
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'stick':
        // Thud
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'apple':
        // Chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.1);
        osc.frequency.setValueAtTime(1760, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'collision':
        // Crash / explosion
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'levelUp':
        // Triumphant rising notes
        [440, 550, 660, 880].forEach((freq, i) => {
          const o2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          o2.connect(g2);
          g2.connect(ctx.destination);
          o2.type = 'sine';
          o2.frequency.setValueAtTime(freq, now + i * 0.1);
          g2.gain.setValueAtTime(0.2, now + i * 0.1);
          g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
          o2.start(now + i * 0.1);
          o2.stop(now + i * 0.1 + 0.15);
        });
        break;
    }
  }, [soundEnabled, getCtx]);

  // Background music (simple looping arpeggio)
  useEffect(() => {
    if (!musicEnabled) {
      // Stop music
      if (musicNodeRef.current) {
        try { musicNodeRef.current.stop(); } catch { /* ignore */ }
        musicNodeRef.current = null;
      }
      return;
    }

    const ctx = getCtx();
    if (!ctx) return;

    // Simple pulsing bass note as "music"
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.connect(ctx.destination);
    musicGainRef.current = gain;

    // We'll use a repeating setTimeout-based arpeggio instead of OscillatorNode loop
    const notes = [110, 138, 165, 220, 165, 138];
    let noteIdx = 0;
    let stopped = false;

    const playNote = () => {
      if (stopped) return;
      const ctx2 = getCtx();
      if (!ctx2 || !musicEnabled) return;
      const o = ctx2.createOscillator();
      const g = ctx2.createGain();
      o.connect(g);
      g.connect(ctx2.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(notes[noteIdx % notes.length], ctx2.currentTime);
      g.gain.setValueAtTime(0.06, ctx2.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.4);
      o.start(ctx2.currentTime);
      o.stop(ctx2.currentTime + 0.4);
      noteIdx++;
      setTimeout(playNote, 450);
    };

    playNote();

    return () => { stopped = true; };
  }, [musicEnabled, getCtx]);

  return { playSound };
}
