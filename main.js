<canvas id="wheel" width="300" height="300"></canvas>
<button id="spinBtn">Spin</button>
<div id="result"></div>

<script>
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

let segments = [];
let angle = 0;
let targetAngle = 0;
let spinning = false;

// Load sounds
const spinSound = new Audio("spin.mp3");
const winSound = new Audio("win.mp3");

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
  spinning = true;

  spinSound.play().catch(e => console.warn("Spin sound failed"));

  const spinAngle = Math.random() * 6 + 6; // more realistic spin
  const duration = 3000;
  const startTime = performance.now();
  const startAngle = angle;

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    angle = startAngle + spinAngle * 2 * Math.PI * easedProgress;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      winSound.play().catch(e => console.warn("Win sound failed"));
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

  const result = segments[index];
  document.getElementById("result").innerText = "You won: " + result;
}

spinBtn.addEventListener("click", spinWheel);
</script>
