const API_URL = "https://backend-app-production-c30b.up.railway.app/";  // Replace with your actual backend URL

const telegram = window.Telegram.WebApp;
const telegramId = telegram.initDataUnsafe?.user?.id || "test_user";

document.getElementById("startFarming").addEventListener("click", startFarming);
document.getElementById("claimSkull").addEventListener("click", claimSkull);
document.getElementById("dailyBonus").addEventListener("click", claimDailyBonus);

// Function to Start Farming
async function startFarming() {
    const response = await fetch(`${API_URL}/start-farming`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId })
    });

    const data = await response.json();
    if (data.farmingEndTime) {
        alert("Farming started! Wait 8 hours to claim.");
        updateUI();
    } else {
        alert(data.error);
    }
}

// Function to Claim Skulls
async function claimSkull() {
    const response = await fetch(`${API_URL}/claim-skull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId })
    });

    const data = await response.json();
    if (data.skullBalance !== undefined) {
        alert("Skulls claimed!");
        document.getElementById("skullBalance").innerText = data.skullBalance;
        updateUI();
    } else {
        alert(data.error);
    }
}

// Function to Claim Daily Bonus
async function claimDailyBonus() {
    const response = await fetch(`${API_URL}/claim-daily-bonus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId })
    });

    const data = await response.json();
    if (data.skullBalance !== undefined) {
        alert("Daily bonus claimed!");
        document.getElementById("skullBalance").innerText = data.skullBalance;
    } else {
        alert(data.error);
    }
}

// Function to Update UI
async function updateUI() {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId })
    });

    const data = await response.json();
    document.getElementById("skullBalance").innerText = data.skullBalance;

    if (data.farmingEndTime) {
        document.getElementById("startFarming").disabled = true;
        countdownTimer(new Date(data.farmingEndTime));
    } else {
        document.getElementById("startFarming").disabled = false;
    }
}

// Function to Show Farming Timer
function countdownTimer(endTime) {
    const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, endTime - now);
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        document.getElementById("startFarming").innerText = remaining > 0
            ? `Farming... ${hours}h ${minutes}m ${seconds}s`
            : "Start Farming";

        if (remaining <= 0) {
            clearInterval(interval);
            document.getElementById("startFarming").disabled = false;
        }
    }, 1000);
}
console.log("Frontend script loaded!");
// Load Initial Data
updateUI();