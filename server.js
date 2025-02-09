const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true, required: true },
    skullBalance: { type: Number, default: 0 },
    farmingEndTime: { type: Date, default: null },
    lastDailyBonus: { type: Date, default: null }
});
const User = mongoose.model("User", userSchema);

// API: Register User
app.post("/register", async (req, res) => {
    const { telegramId } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (!user) {
            user = new User({ telegramId });
            await user.save();
        }
        res.json({ skullBalance: user.skullBalance, farmingEndTime: user.farmingEndTime });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// API: Start Farming
app.post("/start-farming", async (req, res) => {
    const { telegramId } = req.body;
    try {
        const user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ error: "User not found" });

        const farmingEndTime = new Date();
        farmingEndTime.setHours(farmingEndTime.getHours() + 8); // 8 hours farming time

        user.farmingEndTime = farmingEndTime;
        await user.save();

        res.json({ message: "Farming started", farmingEndTime });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// API: Claim Skull
app.post("/claim-skull", async (req, res) => {
    const { telegramId } = req.body;
    try {
        const user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (new Date() >= user.farmingEndTime) {
            user.skullBalance += 100;
            user.farmingEndTime = null;
            await user.save();
            res.json({ message: "Skulls claimed", skullBalance: user.skullBalance });
        } else {
            res.status(400).json({ error: "Farming not finished yet" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// API: Claim Daily Bonus
app.post("/claim-daily-bonus", async (req, res) => {
    const { telegramId } = req.body;
    try {
        const user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ error: "User not found" });

        const today = new Date();
        const lastBonusDate = new Date(user.lastDailyBonus);
        
        if (!user.lastDailyBonus || lastBonusDate.toDateString() !== today.toDateString()) {
            user.skullBalance += 10;
            user.lastDailyBonus = today;
            await user.save();
            res.json({ message: "Daily bonus claimed", skullBalance: user.skullBalance });
        } else {
            res.status(400).json({ error: "Daily bonus already claimed today" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));