// ==== CONFIGURATION ====
const spinLimit = 3;
const telegramBotToken = "YOUR_TELEGRAM_BOT_TOKEN";
const telegramChatID = "YOUR_CHAT_ID";
const googleSheetsWebhook = "YOUR_GOOGLE_SHEETS_WEBHOOK_URL";
const minWithdrawCoins = 50;
const spinCost = 5; // Telegram Stars required

const rewards = [
  { label: "Bonus", icon: "bonus.png", coins: 50 },
  { label: "Try Again", icon: "tryagain.png", coins: 0 },
  { label: "Gift", icon: "gift.png", coins: 100 },
  { label: "Bronze Coin", icon: "bronze.png", coins: 10 },
  { label: "Silver Coin", icon: "silver.png", coins: 20 },
  { label: "Gold Coin", icon: "gold.png", coins: 30 }
];

// ==== STATE ====
let userName = "";
let spinsToday = 0;
let userCoins = 0;
let isMuted = false;
let darkMode = false;
let referralCode = "";

// ==== INIT ====
document.addEventListener("DOMContentLoaded", initGame);

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
  if (!userName) return alert("Enter your name.");
  if (spinsToday >= spinLimit) return alert("Spin limit reached!");
  if (!confirm(`Spinning costs ${spinCost} Telegram Stars. Proceed?`)) return;

  if (!isMuted) new Audio("sounds/spin.mp3").play();

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
  if (!isMuted && result.coins > 0) new Audio("sounds/win.mp3").play();
  launchConfetti();
  document.getElementById("resultDisplay").innerText =
    `You won: ${result.label} (+${result.coins} coins)`;
}

// ==== TELEGRAM & SHEETS ====
function sendToTelegram(result) {
  const msg = `🎉 Winner: ${userName}\n🏆 Prize: ${result.label}\n💰 Coins: ${result.coins}`;
  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: telegramChatID, text: msg })
  });
}

function logToGoogleSheets(result) {
  fetch(googleSheetsWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: userName,
      reward: result.label,
      coins: result.coins,
      timestamp: new Date().toLocaleString()
    })
  });
}

// ==== WITHDRAW ====
function requestWithdraw() {
  if (userCoins < minWithdrawCoins) {
    alert(`Minimum ${minWithdrawCoins} coins required to withdraw.`);
    return;
  }
  const message = `💸 Withdraw Request\nName: ${userName}\nCoins: ${userCoins}`;
  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: telegramChatID, text: message })
  });
  alert("Withdraw request sent to admin.");
}

// ==== CONFETTI ====
function launchConfetti() {
  confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
}

// ==== USER DATA ====
function loadUserData() {
  userName = localStorage.getItem("username") || "";
  spinsToday = parseInt(localStorage.getItem("spinsToday")) || 0;
  userCoins = parseInt(localStorage.getItem("userCoins")) || 0;
  document.getElementById("nameInput").value = userName;
}

function saveUserData() {
  localStorage.setItem("username", userName);
  localStorage.setItem("spinsToday", spinsToday);
  localStorage.setItem("userCoins", userCoins);
}

// ==== UTILITY ====
function toggleMute() {
  isMuted = !isMuted;
  document.getElementById("muteBtn").innerText = isMuted ? "Unmute" : "Mute";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  darkMode = !darkMode;
}

function generateReferral() {
  if (!userName) return;
  referralCode = btoa(userName).substring(0, 10);
  document.getElementById("referralLink").value = `${window.location.href}?ref=${referralCode}`;
}

function copyReferral() {
  const input = document.getElementById("referralLink");
  input.select();
  document.execCommand("copy");
  alert("Referral link copied!");
}

function showCoins() {
  document.getElementById("coinDisplay").innerText = `Coins: ${userCoins}`;
}

function updateLeaderboard() {
  document.getElementById("leaderboard").innerText = `${userName} - ${userCoins} coins`;
}

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
