const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const muteBtn = document.getElementById("muteBtn");
const darkToggle = document.getElementById("darkModeToggle");

let segments = [];
let angle = 0;
let spinning = false;
let muted = false;

const spinSound = new Audio("sounds/spin.mp3");
const winSound = new Audio("sounds/win.mp3");

// Load rewards with icons
fetch("rewards.json")
  .then(res => res.json())
  .then(data => {
    segments = data.rewards;
    drawWheel();
  });

function drawWheel() {
  const numSegments = segments.length;
  const arcSize = (2 * Math.PI) / numSegments;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);

  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, canvas.width / 2, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = `hsl(${i * 360 / numSegments}, 80%, 60%)`;
    ctx.fill();

    // Add Icon
    const icon = new Image();
    icon.src = segments[i].icon;
    const iconAngle = startAngle + arcSize / 2;
    const x = Math.cos(iconAngle) * 130 - 15;
    const y = Math.sin(iconAngle) * 130 - 15;
    icon.onload = () => ctx.drawImage(icon, x, y, 30, 30);

    // Add text
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(segments[i].label, Math.cos(iconAngle) * 90, Math.sin(iconAngle) * 90);
  }

  ctx.restore();
}

function spinWheel() {
  if (spinning) return;

  if (!muted) {
    spinSound.currentTime = 0;
    spinSound.play();
  }

  spinning = true;
  const spinAngle = Math.random() * 10 + 10;
  const duration = 3000;
  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    angle = spinAngle * easeOutCubic(progress);

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      if (!muted) {
        winSound.currentTime = 0;
        winSound.play();
      }
      showResult();
      triggerConfetti();
    }
  }

  requestAnimationFrame(animate);
}

function showResult() {
  const normalizedAngle = angle % (2 * Math.PI);
  const segmentAngle = (2 * Math.PI) / segments.length;
  const index = Math.floor(((2 * Math.PI - normalizedAngle + segmentAngle / 2) % (2 * Math.PI)) / segmentAngle);

  const result = segments[index];
  document.getElementById("result").innerText = `You won: ${result.label}`;

  // Google Sheets logging (replace if needed)
  fetch("YOUR_GOOGLE_SHEET_WEBHOOK", {
    method: "POST",
    body: JSON.stringify({ reward: result.label, time: new Date().toLocaleString() }),
    headers: { "Content-Type": "application/json" }
  });

  // Telegram alert (final working code)
  fetch("https://api.telegram.org/bot7660325670:AAGjyxqcfafCpx-BiYNIRlPG4u5gd7NDxsI/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: "5054074724",
      text: `You won: ${result.label}`
    }),
    mode: "no-cors"
  });

  console.log("Telegram message sent!");
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function triggerConfetti() {
  const duration = 1 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
