const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

let segments = [];
let angle = 0;
let spinning = false;

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
  spinning = true;

  const spinSound = new Audio("sounds/spin.mp3");
  spinSound.play().catch(e => console.log("Spin sound error:", e));

  const spinAngle = Math.random() * 10 + 10;
  const duration = 3000;
  const start = performance.now();
  const startAngle = angle;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    angle = startAngle + spinAngle * easeOutCubic(progress);

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      const winSound = new Audio("sounds/win.mp3");
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

  // Telegram Integration with correct chat_id
  fetch("https://api.telegram.org/bot7660325670:AAGjyxqcfafCpx-BiYNIRlPG4u5gd7NDxsI/sendMessage", {
    method: "POST",
    body: JSON.stringify({
      chat_id: "5054074724",
      text: `You won: ${resultText}`
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).catch(err => console.error("Telegram error:", err));
}

// Spin button click
spinBtn.addEventListener("click", () => {
  if (!spinning) {
    spinWheel();
  }
});
