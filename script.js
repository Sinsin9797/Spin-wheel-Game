// Spin Wheel Final Version - All Features Included const canvas = document.getElementById("wheel"); const ctx = canvas.getContext("2d"); const spinBtn = document.getElementById("spinBtn"); const muteBtn = document.getElementById("muteBtn"); const darkToggle = document.getElementById("darkModeToggle"); const resultEl = document.getElementById("result"); const usernameInput = document.getElementById("username"); const referralInput = document.getElementById("referralCode"); const leaderboardEl = document.getElementById("leaderboard");

let segments = []; let angle = 0; let spinning = false; let muted = false; let coins = {};

const spinSound = new Audio("sounds/spin.mp3"); const winSound = new Audio("sounds/win.mp3");

const spinLimit = 3; const userSpins = {};

fetch("rewards.json") .then(res => res.json()) .then(data => { segments = data.rewards; drawWheel(); });

function drawWheel() { const numSegments = segments.length; const arcSize = (2 * Math.PI) / numSegments;

ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(angle);

for (let i = 0; i < numSegments; i++) { const startAngle = i * arcSize; const endAngle = startAngle + arcSize;

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

} ctx.restore(); }

function spinWheel() { const username = usernameInput.value.trim(); const referral = referralInput.value.trim(); if (!username) return alert("Please enter your name."); if (!segments.length || spinning) return;

const today = new Date().toLocaleDateString(); const userKey = ${username}_${today};

if (!userSpins[userKey]) userSpins[userKey] = 0; if (userSpins[userKey] >= spinLimit) return alert("Spin limit reached for today!");

userSpins[userKey]++;

if (!muted) { spinSound.currentTime = 0; spinSound.play(); }

spinning = true; const spinAngle = Math.random() * 10 + 10; const duration = 3000; const start = performance.now();

function animate(now) { const elapsed = now - start; const progress = Math.min(elapsed / duration, 1); angle = spinAngle * easeOutCubic(progress); drawWheel();

if (progress < 1) {
  requestAnimationFrame(animate);
} else {
  spinning = false;
  if (!muted) {
    winSound.currentTime = 0;
    winSound.play();
  }
  showResult(username, referral);
  triggerConfetti();
  showAd();
}

}

requestAnimationFrame(animate); }

function showResult(username, referral) { const normalizedAngle = angle % (2 * Math.PI); const segmentAngle = (2 * Math.PI) / segments.length; const index = Math.floor(((2 * Math.PI - normalizedAngle + segmentAngle / 2) % (2 * Math.PI)) / segmentAngle); const result = segments[index];

resultEl.innerText = ${username}, You won: ${result.label};

if (!coins[username]) coins[username] = 0; coins[username] += 10;

if (referral && referral !== username) { if (!coins[referral]) coins[referral] = 0; coins[referral] += 5; }

updateLeaderboard();

fetch("https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec", { method: "POST", body: JSON.stringify({ user: username, reward: result.label, time: new Date().toLocaleString(), coins: coins[username] }), headers: { "Content-Type": "application/json" } });

fetch("https://api.telegram.org/bot7660325670:AAGjyxqcfafCpx-BiYNIRlPG4u5gd7NDxsI/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: "5054074724", text: User: ${username}\nWon: ${result.label}\nCoins: ${coins[username]} }) }); }

function updateLeaderboard() { const sorted = Object.entries(coins).sort((a, b) => b[1] - a[1]).slice(0, 5); leaderboardEl.innerHTML = "<h3>Leaderboard</h3><ol>" + sorted.map(([user, coin]) => <li>${user}: ${coin} coins</li>).join("") + "</ol>"; }

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function triggerConfetti() { const duration = 1000; const end = Date.now() + duration; (function frame() { confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } }); confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } }); if (Date.now() < end) requestAnimationFrame(frame); })(); }

function showAd() { const adBox = document.getElementById("customAd"); adBox.style.display = "block"; }

window.addEventListener("load", () => { const adBox = document.getElementById("customAd"); adBox.style.display = "block"; });

spinBtn.addEventListener("click", spinWheel); muteBtn.addEventListener("click", () => { muted = !muted; muteBtn.innerText = muted ? "Unmute" : "Mute"; }); darkToggle.addEventListener("click", () => { document.body.classList.toggle("dark-mode"); });

