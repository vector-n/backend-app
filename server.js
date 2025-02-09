require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { Telegraf } = require("telegraf");
const cors = require("cors");
const path = require("path");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  username: String,
  points: { type: Number, default: 0 },
  referredBy: { type: String, default: null },
});

const User = mongoose.model("User", UserSchema);

// 🎮 Telegram Bot Commands
bot.start(async (ctx) => {
  const { id, username } = ctx.from;

  let user = await User.findOne({ telegramId: id });
  if (!user) {
    user = new User({ telegramId: id, username });
    await user.save();
  }

  ctx.reply(`💀 Welcome, ${username}! You have ${user.points} points.  
Click here to open the Mini App: [Open Game](https://convertible-onion-rover-story.trycloudflare.com/)`, { parse_mode: "Markdown" });
});

bot.command("leaderboard", async (ctx) => {
  const topUsers = await User.find().sort({ points: -1 }).limit(5);
  let message = "🏆 Leaderboard 🏆\n\n";
  topUsers.forEach((user, index) => {
    message += `${index + 1}. ${user.username} - ${user.points} points\n`;
  });

  ctx.reply(message);
});

bot.command("refer", async (ctx) => {
  ctx.reply(`📢 Invite friends using this link:  
https://t.me/Skeleton_gamebot?start=${ctx.from.id}`);
});

// Start the bot
bot.launch();
console.log("🤖 Bot is running!");

// 🌐 Mini App API Routes
app.get("/api/user/:id", async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.id });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

app.post("/api/reward/:id", async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.id });
  if (user) {
    user.points += 10; // Daily reward points
    await user.save();
    res.json({ points: user.points });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  const topUsers = await User.find().sort({ points: -1 }).limit(5);
  res.json(topUsers);
});

// Root Route
app.get("/", (req, res) => {
  res.send("💀 Skeleton Game API Running!");
});

// Start Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


