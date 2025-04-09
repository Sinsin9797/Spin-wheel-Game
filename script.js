const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const muteBtn = document.getElementById("muteBtn");
const darkToggle = document.getElementById("darkModeToggle");
const resultEl = document.getElementById("result");

let segments = [];
let angle = 0;
let spinning = false;
let muted = false;

const spinSound = new Audio("sounds/spin.mp3");
const winSound = new Audio("sounds/win.mp3");

// Load rewards
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

    const icon = new Image();
    icon.src = segments[i].icon;
    const iconAngle = startAngle + arcSize / 2;
    const x = Math.cos(iconAngle) * 100 - 15;
    const y = Math.sin(iconAngle) * 100 - 15;
    icon.onload = () => ctx.drawImage(icon, x, y, 30, 30);

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(segments[i].label, Math.cos(iconAngle) * 70, Math.sin(iconAngle) * 70);
  }

  ctx.restore();
}

function spinWheel() {
  if (spinning || segments.length === 0) return;

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

  resultEl.innerText = `You won: ${result.label}`;

  // Google Sheets Logging (Replace with actual URL)
  fetch("YOUR_GOOGLE_SHEET_WEBHOOK", {
    method: "POST",
    body: JSON.stringify({ reward: result.label, time: new Date().toLocaleString() }),
    headers: { "Content-Type": "application/json" }
  });

  // Telegram Webhook (Replace with actual URL)
  fetch("https://api.telegram.org/botYOUR_TOKEN/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "YOUR_CHAT_ID",
      text: `You won: ${result.label}`
    })
  });
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function triggerConfetti() {
  const duration = 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

spinBtn.addEventListener("click", spinWheel);

muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.innerText = muted ? "Unmute" : "Mute";
});

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
