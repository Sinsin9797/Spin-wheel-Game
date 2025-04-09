// ==== CONFIGURATION ====
const telegramBotToken = "YOUR_TELEGRAM_BOT_TOKEN";
const telegramChatId = "YOUR_TELEGRAM_CHAT_ID";
const spinCost = 5; // Stars needed per spin
const minWithdrawCoins = 50;

// ==== USER DATA ====
let coins = 100;
let userName = "";
let isMuted = false;
let spinsToday = 0;
const maxSpinsPerDay = 5;

// ==== INIT ====
const nameInput = document.getElementById("nameInput");
const spinBtn = document.getElementById("spinBtn");
const resultDisplay = document.getElementById("resultDisplay");
const coinDisplay = document.getElementById("coinDisplay");
const muteBtn = document.getElementById("muteBtn");
const darkBtn = document.getElementById("darkBtn");
const leaderboard = document.getElementById("leaderboard");

document.addEventListener("DOMContentLoaded", () => {
  loadUserData();
  updateCoinDisplay();
});

// ==== SPIN FUNCTION ====
spinBtn.addEventListener("click", () => {
  userName = nameInput.value || "Guest";
  if (spinsToday >= maxSpinsPerDay) return alert("Daily spin limit reached!");
  if (coins < spinCost) return alert("Not enough stars!");

  coins -= spinCost;
  updateCoinDisplay();
  spinsToday++;

  const rewards = ["Try Again", "10 Coins", "20 Coins", "50 Coins", "Bonus Spin"];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  resultDisplay.innerText = `You won: ${reward}`;
  triggerConfetti();

  if (reward.includes("Coins")) {
    const coinAmt = parseInt(reward.split(" ")[0]);
    coins += coinAmt;
    updateCoinDisplay();
  }

  logToTelegram(`${userName} spun the wheel and won: ${reward}`);
});

// ==== WITHDRAW FUNCTION ====
function requestWithdraw() {
  if (coins < minWithdrawCoins) return alert("Minimum 50 coins required to withdraw.");
  const msg = `Withdraw Request:\nUser: ${userName}\nCoins: ${coins}`;
  logToTelegram(msg);
  alert("Withdraw request sent to admin.");
}

// ==== TELEGRAM LOGGER ====
function logToTelegram(message) {
  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: telegramChatId, text: message }),
  });
}

// ==== COIN DISPLAY ====
function updateCoinDisplay() {
  coinDisplay.innerText = `Coins: ${coins}`;
  localStorage.setItem("coins", coins);
}

// ==== CONFETTI ====
function triggerConfetti() {
  if (!isMuted) {
    const audio = new Audio("sounds/win.mp3");
    audio.play();
  }
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

// ==== DARK MODE ====
darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// ==== MUTE TOGGLE ====
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.innerText = isMuted ? "Unmute" : "Mute";
});

// ==== USER DATA SAVE/LOAD ====
function loadUserData() {
  coins = parseInt(localStorage.getItem("coins")) || 100;
}

// ==== REFERRAL LINK COPY ====
function copyReferral() {
  const referral = `${window.location.href}?ref=${userName}`;
  const input = document.getElementById("referralLink");
  input.value = referral;
  input.select();
  document.execCommand("copy");
  alert("Referral link copied!");
}
