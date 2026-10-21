const intro = document.getElementById('intro');
const reveal = document.getElementById('reveal');
const gift = document.getElementById('giftButton');
const openButton = document.getElementById('openButton');
const replayButton = document.getElementById('replayButton');
const musicButton = document.getElementById('musicButton');
const heartsLayer = document.getElementById('hearts');
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

let opened = false;
let animationFrame = null;
let confettiPieces = [];
let audioContext = null;
let musicOn = false;
let musicTimer = null;

function showSurprise() {
  if (opened) {
    celebrate();
    return;
  }
  opened = true;
  gift.classList.add('opening');
  openButton.disabled = true;
  openButton.textContent = 'Opening your surprise…';

  setTimeout(() => {
    intro.classList.remove('active');
    reveal.classList.add('active');
    launchConfetti(190);
    makeHearts(32);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 650);
}

gift.addEventListener('click', showSurprise);
openButton.addEventListener('click', showSurprise);
replayButton.addEventListener('click', celebrate);

function celebrate() {
  launchConfetti(150);
  makeHearts(26);
  const name = document.querySelector('.name');
  name.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
    { duration: 650, easing: 'ease-out' }
  );
}

function makeHearts(count) {
  const symbols = ['♡', '♥', '✧', '💜'];
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 22}px`;
    heart.style.animationDuration = `${4 + Math.random() * 5}s`;
    heart.style.animationDelay = `${Math.random() * 1.8}s`;
    heartsLayer.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
  }
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchConfetti(count) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: w * 0.5 + (Math.random() - 0.5) * Math.min(w * 0.8, 500),
      y: h * 0.34 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 9,
      vy: -2 - Math.random() * 8,
      gravity: 0.12 + Math.random() * 0.1,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
      life: 100 + Math.random() * 65,
      color: ['#ff8bd4', '#d5b6ff', '#fff0fb', '#a987ff', '#ffcaec'][Math.floor(Math.random() * 5)]
    });
  }
  if (!animationFrame) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confettiPieces = confettiPieces.filter(p => p.life > 0 && p.y < window.innerHeight + 30);

  for (const p of confettiPieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.spin;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, p.life / 25);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.7);
    ctx.restore();
  }

  if (confettiPieces.length) {
    animationFrame = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    animationFrame = null;
  }
}

// Gentle synthesized chime tones. Audio starts only after the visitor taps the button.
musicButton.addEventListener('click', async () => {
  if (musicOn) {
    stopTones();
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    musicButton.textContent = 'Audio is not supported here';
    return;
  }

  audioContext = audioContext || new AudioContextClass();
  if (audioContext.state === 'suspended') await audioContext.resume();
  musicOn = true;
  musicButton.setAttribute('aria-pressed', 'true');
  musicButton.textContent = '♫ Turn tones off';
  playChimePattern();
  musicTimer = setInterval(playChimePattern, 3600);
});

function playChimePattern() {
  if (!audioContext || !musicOn) return;
  const now = audioContext.currentTime;
  const notes = [523.25, 659.25, 783.99, 659.25];
  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.42;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.07, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.4);
  });
}

function stopTones() {
  musicOn = false;
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  musicButton.setAttribute('aria-pressed', 'false');
  musicButton.textContent = '♫ Play soft tones';
}

// A few subtle floating hearts are present before the gift is opened.
makeHearts(10);
