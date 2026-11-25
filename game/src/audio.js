// Tiny WebAudio synth for Dapur Kilat: every sound is generated, no audio
// files. The context only starts on a real gesture, so screenshots stay silent.
export function createAudio() {
  let ctx = null;
  let muted = false;
  let sizzle = null;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext ?? window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      } catch {
        return null;
      }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function blip(freq, dur, type, gain, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  }

  function noiseBurst(dur, gain) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = gain;
    const filter = c.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;
    src.connect(filter).connect(g).connect(c.destination);
    src.start();
  }

  return {
    unlock() {
      ensure();
    },
    click() {
      blip(660, 0.06, 'sine', 0.12);
    },
    chop() {
      noiseBurst(0.07, 0.25);
      blip(180, 0.07, 'triangle', 0.2, 90);
    },
    cookStart() {
      blip(220, 0.12, 'sawtooth', 0.08, 440);
    },
    cooked() {
      blip(880, 0.12, 'sine', 0.15);
      setTimeout(() => blip(1174, 0.18, 'sine', 0.15), 110);
    },
    serve() {
      blip(523, 0.1, 'sine', 0.15);
      setTimeout(() => blip(659, 0.1, 'sine', 0.15), 90);
      setTimeout(() => blip(784, 0.2, 'sine', 0.15), 180);
    },
    fail() {
      blip(220, 0.25, 'sawtooth', 0.12, 110);
    },
    startSizzle() {
      if (muted || sizzle) return;
      const c = ensure();
      if (!c) return;
      const len = c.sampleRate;
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4000;
      const g = c.createGain();
      g.gain.value = 0.03;
      src.connect(filter).connect(g).connect(c.destination);
      src.start();
      sizzle = { src, g };
    },
    stopSizzle() {
      if (!sizzle) return;
      try {
        sizzle.src.stop();
      } catch {}
      sizzle = null;
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    get muted() {
      return muted;
    },
  };
}
