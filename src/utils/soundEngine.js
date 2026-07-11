// src/utils/soundEngine.js
// Generates sounds using Web Audio API — no audio files needed

var audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency, duration, type, volume, startTime) {
  var ctx  = getCtx();
  var osc  = ctx.createOscillator();
  var gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type      = type || 'sine';
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume || 0.3, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Uber-style new order ringtone for runners
// 3 ascending beep-beep-beep pattern, repeats twice
export function playOrderRingtone() {
  try {
    var ctx   = getCtx();
    var now   = ctx.currentTime;
    var notes = [
      { f: 880,  t: 0.00, d: 0.12 },
      { f: 1100, t: 0.15, d: 0.12 },
      { f: 1320, t: 0.30, d: 0.18 },
      // pause
      { f: 880,  t: 0.65, d: 0.12 },
      { f: 1100, t: 0.80, d: 0.12 },
      { f: 1320, t: 0.95, d: 0.18 },
      // final emphasis
      { f: 1320, t: 1.30, d: 0.10 },
      { f: 1320, t: 1.42, d: 0.10 },
      { f: 1760, t: 1.55, d: 0.30 },
    ];

    notes.forEach(function(n) {
      playTone(n.f, n.d, 'sine', 0.4, now + n.t);
    });
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

// Soft notification chime for status updates
export function playNotificationSound() {
  try {
    var ctx = getCtx();
    var now = ctx.currentTime;
    playTone(880,  0.12, 'sine', 0.25, now);
    playTone(1100, 0.20, 'sine', 0.20, now + 0.14);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

// Success chime for delivered
export function playSuccessSound() {
  try {
    var ctx   = getCtx();
    var now   = ctx.currentTime;
    var notes = [
      { f: 523, t: 0.00, d: 0.15 },
      { f: 659, t: 0.16, d: 0.15 },
      { f: 784, t: 0.32, d: 0.15 },
      { f: 1047,t: 0.48, d: 0.30 },
    ];
    notes.forEach(function(n) {
      playTone(n.f, n.d, 'triangle', 0.3, now + n.t);
    });
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}