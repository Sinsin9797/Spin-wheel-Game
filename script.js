// ==== CONFIGURATION ====
const spinLimit = 3; // spins per user/day
const rewards = [
  { label: "Bonus", icon: "bonus.png", coins: 50 },
  { label: "Try Again", icon: "tryagain.png", coins: 0 },
  { label: "Gift", icon: "gift.png", coins: 100 },
  { label: "Bronze Coin", icon: "bronze.png", coins: 10 },
  { label: "Silver Coin", icon: "silver.png", coins: 20 },
  { label: "Gold Coin", icon: "gold.png", coins: 30 }
];

const telegramBotToken = "YOUR_TELEGRAM_BOT_TOKEN";
const telegramChatID = "YOUR_CHAT_ID";
const googleSheetsWebhook = "YOUR_GOOGLE_SHEETS_WEBHOOK_URL";

// ==== STATE ====
let userName = "";
let spinsToday = 0;
let userCoins = 0;
let referralCode = "";
let isMuted = false;
let darkMode = false;

// ==== INIT ====
function initGame() {
  loadUserData();
  populateWheel();
  setupEventListeners();
  generateReferral();
  updateLeaderboard();
  showCoins();
}

// ==== WHEEL SETUP ====
function populateWheel() {
  const wheel = document.getElementById("wheel");
  rewards.forEach(reward => {
    const segment = document.createElement("div");
    segment.className = "segment";
    segment.innerHTML = `<img src="icons/${reward.icon}" alt="${reward.label}" />`;
    wheel.appendChild(segment);
  });
}

// ==== SPIN LOGIC ====
function spinWheel() {
  if (!userName) return alert("Please enter your name.");
  if (spinsToday >= spinLimit) return alert("Spin limit reached for today.");

  const spinSound = new Audio("sounds/spin.mp3");
  if (!isMuted) spinSound.play();

  const result = rewards[Math.floor(Math.random() * rewards.length)];
  showResult(result);
  logToGoogleSheets(result);
  sendToTelegram(result);

  spinsToday++;
  userCoins += result.coins;
  saveUserData();
  updateLeaderboard();
  showCoins();
}

function showResult(result) {
  const winSound = new Audio("sounds/win.mp3");
  if (!isMuted && result.coins > 0) winSound.play();
  launchConfetti();
  document.getElementById("resultDisplay").innerText =
    `You won: ${result.label} (+${result.coins} coins)`;
}

// ==== USER DATA ====
function loadUserData() {
  const storedName = localStorage.getItem("username");
  const storedSpins = localStorage.getItem("spinsToday");
  const storedCoins = localStorage.getItem("userCoins");

  if (storedName) userName = storedName;
  if (storedSpins) spinsToday = parseInt(storedSpins);
  if (storedCoins) userCoins = parseInt(storedCoins);

  document.getElementById("nameInput").value = userName;
}

function saveUserData() {
  localStorage.setItem("username", userName);
  localStorage.setItem("spinsToday", spinsToday);
  localStorage.setItem("userCoins", userCoins);
}

// ==== TELEGRAM ====
function sendToTelegram(result) {
  const message = `Winner: ${userName} | Prize: ${result.label} | Coins: ${result.coins}`;
  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatID,
      text: message
    })
  });
}

// ==== GOOGLE SHEETS ====
function logToGoogleSheets(result) {
  fetch(googleSheetsWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: userName,
      reward: result.label,
      coins: result.coins
    })
  });
}

// ==== CONFETTI ====
function launchConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// ==== DARK MODE ====
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  darkMode = !darkMode;
}

// ==== MUTE TOGGLE ====
function toggleMute() {
  isMuted = !isMuted;
  document.getElementById("muteBtn").innerText = isMuted ? "Unmute" : "Mute";
}

// ==== REFERRAL SYSTEM ====
function generateReferral() {
  if (!userName) return;
  const code = btoa(userName).substring(0, 10);
  referralCode = code;
  const link = `${window.location.href.split('?')[0]}?ref=${code}`;
  document.getElementById("referralLink").value = link;
}

// ==== COINS DISPLAY ====
function showCoins() {
  document.getElementById("coinDisplay").innerText = `Coins: ${userCoins}`;
}

// ==== LEADERBOARD ====
function updateLeaderboard() {
  document.getElementById("leaderboard").innerText = `${userName} - ${userCoins} coins`;
}

// ==== EVENT LISTENERS ====
function setupEventListeners() {
  document.getElementById("spinBtn").onclick = spinWheel;
  document.getElementById("muteBtn").onclick = toggleMute;
  document.getElementById("darkBtn").onclick = toggleDarkMode;
  document.getElementById("nameInput").onchange = e => {
    userName = e.target.value;
    saveUserData();
    generateReferral();
    updateLeaderboard();
  };
}

// ==== ON LOAD ====
document.addEventListener("DOMContentLoaded", initGame);
