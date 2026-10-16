// Web Audio API Focus Soundscape & Haptic Engine
// Generates authentic ambient noise and focus frequencies client-side without external dependencies.

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private currentGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.currentGain && !this.isMuted) {
      this.currentGain.gain.setTargetAtTime(this.volume, this.ctx?.currentTime || 0, 0.1);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.currentGain && this.ctx) {
      this.currentGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public stopSoundscape() {
    if (this.currentSource) {
      try {
        if ('stop' in this.currentSource && typeof (this.currentSource as AudioScheduledSourceNode).stop === 'function') {
          (this.currentSource as AudioScheduledSourceNode).stop();
        }
        this.currentSource.disconnect();
      } catch {
        // ignore
      }
      this.currentSource = null;
    }
    if (this.currentGain) {
      this.currentGain.disconnect();
      this.currentGain = null;
    }
  }

  public playSoundscape(type: 'rain' | 'binaural_gamma' | 'deep_space' | 'cyber_fan') {
    this.initContext();
    if (!this.ctx) return;

    this.stopSoundscape();

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    gainNode.connect(this.ctx.destination);
    this.currentGain = gainNode;

    if (type === 'binaural_gamma') {
      // 40Hz Gamma wave for active mental concentration
      // Left ear: 200Hz, Right ear: 240Hz
      const merger = this.ctx.createChannelMerger(2);
      
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = 200;

      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = 240;

      const gainL = this.ctx.createGain();
      gainL.gain.value = 0.35;
      const gainR = this.ctx.createGain();
      gainR.gain.value = 0.35;

      oscL.connect(gainL);
      oscR.connect(gainR);

      gainL.connect(merger, 0, 0); // Left channel
      gainR.connect(merger, 0, 1); // Right channel

      merger.connect(gainNode);

      oscL.start();
      oscR.start();

      this.currentSource = {
        stop: () => {
          try {
            oscL.stop();
            oscR.stop();
          } catch {}
        },
        disconnect: () => {
          oscL.disconnect();
          oscR.disconnect();
          gainL.disconnect();
          gainR.disconnect();
          merger.disconnect();
        }
      } as unknown as AudioNode;
      return;
    }

    // Noise based generators:
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'rain') {
      // Rain: modulated pink noise with highpass and bandpass
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();
      this.currentSource = whiteNoise;

    } else if (type === 'deep_space') {
      // Brown noise (deep rumble of space)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Gain compensation
      }

      const brownNoise = this.ctx.createBufferSource();
      brownNoise.buffer = noiseBuffer;
      brownNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      brownNoise.connect(filter);
      filter.connect(gainNode);
      brownNoise.start();
      this.currentSource = brownNoise;

    } else if (type === 'cyber_fan') {
      // Steady cooling fan drone
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const fanNoise = this.ctx.createBufferSource();
      fanNoise.buffer = noiseBuffer;
      fanNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 320;
      filter.Q.value = 2.0;

      // Add low hum oscillator
      const humOsc = this.ctx.createOscillator();
      humOsc.type = 'triangle';
      humOsc.frequency.value = 85;

      const humGain = this.ctx.createGain();
      humGain.gain.value = 0.2;
      humOsc.connect(humGain);

      fanNoise.connect(filter);
      filter.connect(gainNode);
      humGain.connect(gainNode);

      fanNoise.start();
      humOsc.start();

      this.currentSource = {
        stop: () => {
          try {
            fanNoise.stop();
            humOsc.stop();
          } catch {}
        },
        disconnect: () => {
          fanNoise.disconnect();
          humOsc.disconnect();
          filter.disconnect();
          humGain.disconnect();
        }
      } as unknown as AudioNode;
    }
  }

  // Play precision harmonic bell chime for milestone or timer completion
  public playChime(kind: 'start' | 'complete' | 'tick' | 'check') {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (kind === 'complete') {
      // Harmonic Tibetan sing bowl / success chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // Solfeggio 528Hz transformation tone
      osc.frequency.exponentialRampToValueAtTime(1056, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
    } else if (kind === 'start') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (kind === 'check') {
      // Tactile high-frequency check ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.05); // C6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (kind === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  }
}

export const soundEngine = new AudioEngine();

// Mobile haptic pulse utility
export function triggerHaptic(pattern: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (pattern === 'light') {
        navigator.vibrate(15);
      } else if (pattern === 'medium') {
        navigator.vibrate(35);
      } else if (pattern === 'success') {
        navigator.vibrate([20, 40, 30]);
      } else if (pattern === 'warning') {
        navigator.vibrate([40, 50, 40]);
      }
    } catch {
      // Ignore vibration error
    }
  }
}
