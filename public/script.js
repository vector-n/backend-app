const tg = window.Telegram.WebApp;
tg.expand(); // Expands the Mini App

let userId;
let username;

async function fetchUserData() {
    try {
        const response = await fetch(`/api/user/${tg.initDataUnsafe.user.id}`);
        const data = await response.json();
        userId = data.telegramId;
        username = data.username;
        document.getElementById("username").innerText = username;
        document.getElementById("points").innerText = data.points;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

document.getElementById("claimReward").addEventListener("click", async () => {
    try {
        const response = await fetch(`/api/reward/${userId}`, { method: "POST" });
        const data = await response.json();
        document.getElementById("points").innerText = data.points;
        alert("✅ Daily reward claimed!");
    } catch (error) {
        console.error("Error claiming reward:", error);
    }
});

document.getElementById("invite").addEventListener("click", () => {
    tg.showPopup({ message: "Invite friends: https://t.me/YOUR_BOT_USERNAME?start=" + userId });
});

async function fetchLeaderboard() {
    try {
        const response = await fetch("/api/leaderboard");
        const leaderboard = await response.json();
        let leaderboardHTML = "";
        leaderboard.forEach((user, index) => {
            leaderboardHTML += `<li>${index + 1}. ${user.username} - ${user.points} points</li>`;
        });
        document.getElementById("leaderboard").innerHTML = leaderboardHTML;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
}

fetchUserData();
fetchLeaderboard();