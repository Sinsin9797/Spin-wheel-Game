// Get the canvas element
const wheelCanvas = document.getElementById('wheel');
const ctx = wheelCanvas.getContext('2d');

// Set the canvas dimensions
wheelCanvas.width = 400;
wheelCanvas.height = 400;
const centerX = wheelCanvas.width / 2;
const centerY = wheelCanvas.height / 2;

// Define the wheel segments
const segments = [
  { name: 'Segment 1', color: '#FF0000', reward: 10, icon: null }, // icon: 'path/to/icon1.png'
  { name: 'Segment 2', color: '#00FF00', reward: 20, icon: null },
  { name: 'Segment 3', color: '#0000FF', reward: 30, icon: null },
  { name: 'Segment 4', color: '#FFFF00', reward: 40, icon: null },
  { name: 'Segment 5', color: '#FF00FF', reward: 50, icon: null },
];
const numSegments = segments.length;

// Define the wheel rotation
let rotation = 0;
let spinning = false;
const spinDuration = 3000; // milliseconds
let spinStartTime;
let currentReward = 0;

// Define the spin button
const spinButton = document.getElementById('spin-button');

// Define the result element
const resultElement = document.getElementById('result');

// Define the coins element
const coinsElement = document.getElementById('coins');

// Define the leaderboard element
const leaderboardElement = document.getElementById('leaderboard');

// Define the username input and save button (assuming these exist in your HTML)
const usernameInput = document.getElementById('username-input');
const saveUsernameButton = document.getElementById('save-username-button');

// Define the referral code input and submit button (assuming these exist in your HTML)
const referralCodeInput = document.getElementById('referral-code-input');
const submitReferralButton = document.getElementById('submit-referral-button');

// Define the mute/unmute button (assuming this exists in your HTML)
const soundButton = document.getElementById('sound-button');
let isMuted = false;
const spinSound = new Audio('path/to/spin.mp3'); // Replace with your sound file
const winSound = new Audio('path/to/win.mp3');   // Replace with your sound file

// Define the dark mode toggle button (assuming this exists in your HTML)
const darkModeButton = document.getElementById('dark-mode-toggle');
let isDarkMode = false;

// Define the join Telegram banner element (assuming this exists in your HTML)
const telegramBanner = document.getElementById('telegram-banner');
const telegramLink = 'https://t.me/your_telegram_channel'; // Replace with your Telegram channel link

// Define the user data
let userData = {
  coins: parseInt(localStorage.getItem('userCoins')) || 100,
  spinsToday: parseInt(localStorage.getItem('spinsToday')) || 0,
  lastSpinDate: localStorage.getItem('lastSpinDate') || null,
  leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || [],
  username: localStorage.getItem('username') || '',
  referrals: parseInt(localStorage.getItem('referrals')) || 0,
  referredBy: localStorage.getItem('referredBy') || null,
};

const dailySpinLimit = 5; // Example spin limit

// Define the Telegram bot token and chat ID
const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';
const telegramChatId = 'YOUR_TELEGRAM_CHAT_ID';

// Define the Google Sheets API key and spreadsheet ID
const googleSheetsApiKey = 'YOUR_GOOGLE_SHEETS_API_KEY';
const googleSpreadsheetId = 'YOUR_SPREADSHEET_ID';

// Define the Firebase API key (if using Firebase)
const firebaseApiKey = 'YOUR_FIREBASE_API_KEY';

// Function to save user data to local storage
function saveUserData() {
  localStorage.setItem('userCoins', userData.coins);
  localStorage.setItem('spinsToday', userData.spinsToday);
  localStorage.setItem('lastSpinDate', userData.lastSpinDate);
  localStorage.setItem('leaderboard', JSON.stringify(userData.leaderboard));
  localStorage.setItem('username', userData.username);
  localStorage.setItem('referrals', userData.referrals);
  localStorage.setItem('referredBy', userData.referredBy);
}

// Function to reset daily spin count if a new day
function checkDailySpinReset() {
  const today = new Date().toDateString();
  if (userData.lastSpinDate !== today) {
    userData.spinsToday = 0;
    userData.lastSpinDate = today;
    saveUserData();
  }
}

// Function to draw the wheel
function drawWheel() {
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  ctx.beginPath();
  ctx.arc(centerX, centerY, centerX, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  const angle = Math.PI * 2 / numSegments;
  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * angle;
    const endAngle = (i + 1) * angle;

    ctx.fillStyle = segments[i].color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, centerX, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Draw segment names (optional)
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const textRadius = centerX * 0.7;
    const textAngle = startAngle + angle / 2;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);
    // Rotate text to align with segment
    // ctx.save();
    // ctx.translate(textX, textY);
    // ctx.rotate(textAngle + Math.PI / 2);
    // ctx.fillText(segments[i].name, 0, 0);
    // ctx.restore();

    // Draw custom icons (if provided)
    if (segments[i].icon) {
      const img = new Image();
      img.onload = () => {
        const iconSize = 30;
        const iconRadius = centerX * 0.5;
        const iconAngle = startAngle + angle / 2;
        const iconX = centerX + iconRadius * Math.cos(iconAngle) - iconSize / 2;
        const iconY = centerY + iconRadius * Math.sin(iconAngle) - iconSize / 2;
        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      };
      img.src = segments[i].icon;
    }
  }

  // Draw the pointer
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - centerX - 10);
  ctx.lineTo(centerX - 10, centerY - centerX - 20);
  ctx.lineTo(centerX + 10, centerY - centerX - 20);
  ctx.closePath();
  ctx.fill();
}

// Function to get the winning segment index
function getWinningSegment() {
  const normalizedRotation = rotation % (2 * Math.PI);
  const segmentAngle = Math.PI * 2 / numSegments;
  const winningSegmentIndex = Math.floor((2 * Math.PI - normalizedRotation) / segmentAngle);
  return winningSegmentIndex;
}

// Function to handle the end of the spin
function onSpinEnd() {
  spinning = false;
  const winningSegmentIndex = getWinningSegment();
  const winningSegment = segments[winningSegmentIndex];
  currentReward = winningSegment.reward;

  resultElement.textContent = `You landed on ${winningSegment.name} and won ${currentReward} coins!`;
  userData.coins += currentReward;
  updateCoinsDisplay();

  // Confetti effect
  showConfetti();

  // Play win sound
  if (!isMuted) {
    winSound.play();
  }

  // Update leaderboard
  updateLeaderboard();

  // Send Telegram message
  const telegramMessage = `User ${userData.username || 'Anonymous'} spun and won ${currentReward} coins! Total coins: ${userData.coins}, Spins today: ${userData.spinsToday}/${dailySpinLimit}`;
  sendTelegramMessage(telegramMessage);

  // Log to Google Sheets
  logToGoogleSheets(userData);

  saveUserData();
}

// Function to spin the wheel
function spinWheel() {
  checkDailySpinReset();
  if (spinning) return;
  if (userData.coins < 10) {
    resultElement.textContent = 'Not enough coins to spin!';
    return;
  }
  if (userData.spinsToday >= dailySpinLimit) {
    resultElement.textContent = `You have reached your daily spin limit of ${dailySpinLimit}.`;
    return;
  }

  spinning = true;
  userData.coins -= 10;
  userData.spinsToday++;
  updateCoinsDisplay();
  saveUserData();

  const randomSpinAngle = Math.PI * 2 * 5 + Math.random() * Math.PI * 2; // Spin 5 full circles + some random amount
  const animationDuration = spinDuration;
  spinStartTime = Date.now();

  function animateSpin() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - spinStartTime;

    if (elapsedTime >= animationDuration) {
      rotation = randomSpinAngle;
      spinning = false;
      onSpinEnd();
      drawWheel();
      return;
    }

    const ease = (t) => t * t * (3 - 2 * t); // Ease-in-out function
    const timeFraction = ease(elapsedTime / animationDuration);
    rotation = randomSpinAngle * timeFraction;

    drawWheel();
    requestAnimationFrame(animateSpin);
  }

  // Play spin sound
  if (!isMuted) {
    spinSound.play();
  }

  resultElement.textContent = 'Spinning...';
  animateSpin();
}

// Function to update coins display
function updateCoinsDisplay() {
  coinsElement.textContent = `Coins: ${userData.coins}`;
}

// Function to update leaderboard
function updateLeaderboard() {
  if (userData.username) {
    const existingEntryIndex = userData.leaderboard.findIndex(entry => entry.username === userData.username);
    if (existingEntryIndex !== -1) {
      userData.leaderboard[existingEntryIndex].coins = userData.coins;
    } else {
      userData.leaderboard.push({ username: userData.username, coins: userData.coins });
    }
    userData.leaderboard.sort((a, b) => b.coins - a.coins);
    localStorage.setItem('leaderboard', JSON.stringify(userData.leaderboard));
  }
  leaderboardElement.textContent = `Leaderboard: ${userData.leaderboard.slice(0, 5).map(entry => `${entry.username || 'Anonymous'}: ${entry.coins}`).join(', ')}`;
}

// Function to send a message to Telegram
function sendTelegramMessage(message) {
  if (!telegramBotToken || !telegramChatId) {
    console.warn('Telegram bot token or chat ID not configured.');
    return;
  }
  const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramChatId}&text=${message}`;
  fetch(telegramUrl)
    .then(response => response.json())
    .then(data => console.log('Telegram message sent:', data))
    .catch(error => console.error('Error sending Telegram message:', error));
}

// Function to log to Google Sheets
function logToGoogleSheets(data) {
  if (!googleSheetsApiKey || !googleSpreadsheetId) {
    console.warn('Google Sheets API key or spreadsheet ID not configured.');
    return;
  }
  const googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${googleSpreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED&key=${googleSheetsApiKey}`;
  fetch(googleSheetsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [[data.username, data.coins, data.spinsToday, data.referrals, new Date().toISOString()]]
    }),
  })
    .then(response => response.json())
    .then(data => console.log('Logged to Google Sheets:', data))
    .catch(error => console.error('Error logging to Google Sheets:', error));
}

// Function to handle referrals
function handleReferral(referralCode) {
  if (!referralCode || userData.referredBy) {
    return;
  }
  // In a real application, you would likely verify the referral code against a database
  // For this example, we'll just award coins and mark as referred
  userData.referrals++;
  userData.coins += 20; // Example referral bonus
  userData.referredBy = referralCode;
  updateCoinsDisplay();
  saveUserData();

  const telegramMessage = `User ${userData.username || 'Anonymous'} used referral code ${referralCode}. Total referrals: ${userData.referrals}, Coins: ${userData.coins}`;
  sendTelegramMessage(telegramMessage);
}

// Function to handle username save
function handleUsernameSave(username) {
  if (username) {
    userData.username = username;
    localStorage.setItem('username', username);
    updateLeaderboard();
    const telegramMessage = `Username saved: ${userData.username}`;
    sendTelegramMessage(telegramMessage);
  }
}

// Function to toggle sound
function toggleSound() {
  isMuted = !isMuted;
  soundButton.textContent = isMuted ? 'Unmute' : 'Mute';
}

// Function to toggle dark mode
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  // You might want to save dark mode preference to local storage as well
}

// Function to show confetti
function showConfetti() {
  // You can implement a simple confetti animation here using the canvas or a library
  console.log('Confetti!');
  // Example using a simple alert:
  // alert('Congratulations!');
}

// Function to handle Telegram Stars based spins (requires external integration)
function handleTelegramStarsSpin() {
  // This would require communication with the Telegram bot/API to check for stars
  // For a simple example, let's assume the user has some "stars" that they can manually input
  const stars = parseInt(prompt('Enter the number of Telegram Stars to use for spins:', '1'));
  if (stars > 0) {
    const spinsToAward = stars; // Example: 1 star = 1 spin
    userData.spinsToday = Math.max(0, userData.spinsToday - spinsToAward); // Allow using stars to spin even if limit reached
    saveUserData();
    alert(`Awarded ${spinsToAward} extra spins using Telegram Stars.`);
  }
}

// Function to handle withdraw request (requires backend logic for actual withdrawal)
function requestWithdrawal() {
  const amount = parseInt(prompt('Enter the amount of coins to withdraw:', ''));
  if (amount > 0 && amount <= userData.coins) {
    // Log the request to Telegram
    const telegramMessage = `Withdrawal request from ${userData.username || 'Anonymous'}: ${amount} coins.`;
    sendTelegramMessage(telegramMessage);
    alert('Withdrawal request submitted.');
    // In a real application, you would send this request to a backend server for processing
  } else {
    alert('Invalid withdrawal amount.');
  }
}

// Function to handle /spin Telegram command (This logic would be on your Telegram bot server)
function handleTelegramSpinCommand() {
  // This function is a placeholder for the logic that would run on your Telegram bot server
  // When a user sends /spin to your bot, your bot would trigger a spin for that user
  console.log('/spin command received (server-side logic needed)');
}

// Function to handle /withdraw Telegram command (This logic would be on your Telegram bot server)
function handleTelegramWithdrawCommand() {
  // This function is a placeholder for the logic that would run on your Telegram bot server
  // When a user sends /withdraw to your bot, your bot would process their withdrawal request
  console.log('/withdraw command received (server-side logic needed)');
}

// Function to handle reward claim (depends on the nature of rewards)
function claimReward() {
  alert(`You have ${userData.coins} coins. Rewards can be claimed based on the coin balance (implementation depends on your reward system).`);
  // Implementation for claiming rewards would go here, potentially involving backend communication
}

// Event listeners
if (spinButton) {
  spinButton.addEventListener('click', spinWheel);
}

if (saveUsernameButton && usernameInput) {
  saveUsernameButton.addEventListener('click', () => handleUsernameSave(usernameInput.value));
}

if (submitReferralButton && referralCodeInput) {
  submitReferralButton.addEventListener('click', () => handleReferral(referralCodeInput.value));
}

if (soundButton) {
  soundButton.addEventListener('click', toggleSound);
}

if (darkModeButton) {
  darkModeButton.addEventListener('click', toggleDarkMode);
}

if (telegramBanner) {
  telegramBanner.addEventListener('click', () => window.open(telegramLink, '_blank'));
}

// Initial setup
checkDailySpinReset();
updateCoinsDisplay();
updateLeaderboard();
drawWheel();

// Example of how you might trigger Telegram Stars based spins (you'd need a UI button for this)
// const telegramStarsButton = document.getElementById('telegram-stars-spin');
// if (telegramStarsButton) {
//   telegramStarsButton.addEventListener('click', handleTelegramStarsSpin);
// }

// Example of how you might trigger a withdraw request (you'd need a UI button for this)
// const withdrawButton = document.getElementById('withdraw-button');
// if (withdrawButton) {
//   withdrawButton.addEventListener('click', requestWithdrawal);
// }

// Example of how you might trigger reward claim (you'd need a UI button for this)
// const claimRewardButton = document.getElementById('claim-reward-button');
// if (claimRewardButton) {
//   claimRewardButton.addEventListener('click', claimReward);
// }
