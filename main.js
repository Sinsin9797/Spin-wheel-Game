const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const segments = ["10", "20", "30", "50"];
const colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"];
const spinBtn = document.getElementById("spinBtn");

let angle = 0;
let spinning = false;

function drawWheel() {
  const numSegments = segments.length;
  const arcSize = (2 * Math.PI) / numSegments;

  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * arcSize;
    const endAngle = startAngle + arcSize;

    // Draw color segment
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();

    // Draw text
    const textAngle = startAngle + arcSize / 2;
    const x = canvas.width / 2 + Math.cos(textAngle) * 100;
    const y = canvas.height / 2 + Math.sin(textAngle) * 100;
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(segments[i], x, y);
  }
}

function spinWheel() {
  if (spinning) return;

  spinning = true;
  const spinTime = 3000;
  const spins = 10 + Math.random() * 10;
  const targetAngle = (Math.PI * 2 * spins) + Math.random() * Math.PI * 2;

  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / spinTime, 1);
    angle = targetAngle * easeOutCubic(progress);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawWheel();
    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      showResult();
    }
  }

  requestAnimationFrame(animate);
}

function showResult() {
  const index = Math.floor((segments.length - (angle / (2 * Math.PI) * segments.length)) % segments.length);
  alert("You won: " + segments[index]);
}

function easeOutCubic(t) {
  return (--t) * t * t + 1;
}

drawWheel();
spinBtn.addEventListener("click", spinWheel);
