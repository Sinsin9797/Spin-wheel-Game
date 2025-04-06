const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

let segments = [];
let angle = 0;
let spinning = false;

// Corrected sound paths
const spinSound = new Audio("spin.mp3");
const winSound = new Audio("win.mp3");

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

  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = `hsl(${i * 360 / numSegments}, 80%, 60%)`;
    ctx.fill();

    const textAngle = startAngle + arcSize / 2;
    const x = canvas.width / 2 + Math.cos(textAngle) * 100;
    const y = canvas.height / 2 + Math.sin(textAngle) * 100;

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(segments[i], x, y);
  }
}

function spinWheel() {
  if (spinning) return;

  spinning = true;
  spinSound.play(); // Play spin sound

  const spinAngle = Math.random() * 10 + 10;
  const duration = 3000;
  const start = performance.now();

  function animate(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    angle += spinAngle * easeOutCubic(progress);

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      showResult();
      winSound.play(); // Play win sound
      spinning = false;
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
