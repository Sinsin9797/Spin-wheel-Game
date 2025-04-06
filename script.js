function spin() {
    const items = ["100", "200", "300", "Try Again", "500", "Jackpot"];
    const randomIndex = Math.floor(Math.random() * items.length);
    const result = items[randomIndex];
    document.getElementById("result").innerText = "You won: " + result;
}
