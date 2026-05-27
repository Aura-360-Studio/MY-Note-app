/**
 * Synthesizes a beautiful, rich focal chime sound using the Web Audio API.
 * Zero-dependency, pure mathematical synthesis.
 * Uses an A5 fundamental frequency (880Hz) combined with an E6 fifth harmony (1320Hz)
 * gliding gracefully down to A4 (440Hz) and E5 (660Hz) with an exponential decay.
 */
export function playChimeSound(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 1. Fundamental Oscillator & Gain (Warm Sine)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 1.2);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    // 2. Harmony Oscillator & Gain (Clear Triangle fifth)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1320, now);
    osc2.frequency.exponentialRampToValueAtTime(660, now + 1.2);
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    // Connect node chain
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // Start and clean up sound
    osc1.start(now);
    osc1.stop(now + 1.2);

    osc2.start(now);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.error("Web Audio API failed to synthesize chime sound:", err);
  }
}
