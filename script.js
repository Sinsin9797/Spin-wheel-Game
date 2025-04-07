const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

let segments = [];
let angle = 0;
let spinning = false;

const spinSound = new Audio("sounds/spin.mp3");
const winSound = new Audio("sounds/win.mp3");

// Preload sounds
spinSound.preload = 'auto';
spinSound.load();
winSound.preload = 'auto';
winSound.load();

// Load rewards from rewards.json
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

    const textAngle = startAngle + arcSize / 2;
    const x = Math.cos(textAngle) * 100;
    const y = Math.sin(textAngle) * 100;

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(segments[i], x, y);
  }

  ctx.restore();
}

function spinWheel() {
  if (spinning) return;

  // Play sound only after user interaction (safe autoplay)
  try {
    spinSound.currentTime = 0;
    spinSound.play();
  } catch (err) {
    console.log("Spin sound blocked or failed:", err);
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
      winSound.currentTime = 0;
      winSound.play();
      showResult();
    }
  }

  requestAnimationFrame(animate);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function showResult() {
  const normalizedAngle = angle % (2 * Math.PI);
  const segmentAngle = (2 * Math.PI) / segments.length;
  const index = Math.floor(((2 * Math.PI - normalizedAngle + segmentAngle / 2) % (2 * Math.PI)) / segmentAngle);

  const resultText = segments[index] || "Invalid Segment";
  document.getElementById("result").innerText = "You won: " + resultText;
}

spinBtn.addEventListener("click", spinWheel);
