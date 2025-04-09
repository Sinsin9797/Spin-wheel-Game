// ==== CONFIGURATION ====
const spinLimit = 3;
const spinCost = 5; // 5 Telegram Stars per spin
const withdrawMinCoins = 50;

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
let userStars = 100; // default starting stars
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
  if (spinsToday >= spinLimit) return alert("Daily spin limit reached.");
  if (userStars < spinCost) return alert("Not enough Telegram Stars.");

  const spinSound = new Audio("sounds/spin.mp3");
  if (!isMuted) spinSound.play();

  const result = rewards[Math.floor(Math.random() * rewards.length)];
  showResult(result);
  logToGoogleSheets(result);
  sendToTelegram(result);

  spinsToday++;
  userStars -= spinCost;
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

// ==== WITHDRAW ====
function requestWithdraw() {
  if (userCoins < withdrawMinCoins) {
    alert(`Minimum ${withdrawMinCoins} coins required to withdraw.`);
    return;
  }

  const message = `Withdraw Request: ${userName} | Coins: ${userCoins}`;
  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatID,
      text: message
    })
  });

  alert("Withdraw request sent to admin!");
}

// ==== USER DATA ====
function loadUserData() {
  userName = localStorage.getItem("username") || "";
  spinsToday = parseInt(localStorage.getItem("spinsToday")) || 0;
  userCoins = parseInt(localStorage.getItem("userCoins")) || 0;
  userStars = parseInt(localStorage.getItem("userStars")) || 100;

  document.getElementById("nameInput").value = userName;
}

function saveUserData() {
  localStorage.setItem("username", userName);
  localStorage.setItem("spinsToday", spinsToday);
  localStorage.setItem("userCoins", userCoins);
  localStorage.setItem("userStars", userStars);
}

// ==== TELEGRAM ====
function sendToTelegram(result) {
  const msg = `Winner: ${userName}\nPrize: ${result.label}\nCoins: ${result.coins}\nRemaining Stars: ${userStars}`;
  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatID,
      text: msg
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
      coins: result.coins,
      starsLeft: userStars
    })
  });
}

// ==== CONFETTI ====
function launchConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
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
  referralCode = btoa(userName).substring(0, 10);
  document.getElementById("referralLink").value = `${window.location.href}?ref=${referralCode}`;
}

// ==== COINS DISPLAY ====
function showCoins() {
  document.getElementById("coinDisplay").innerText =
    `Coins: ${userCoins} | Stars: ${userStars}`;
}

// ==== LEADERBOARD ====
function updateLeaderboard() {
  document.getElementById("leaderboard").innerText =
    `${userName} - ${userCoins} coins`;
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
