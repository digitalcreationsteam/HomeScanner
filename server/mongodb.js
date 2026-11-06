const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Debug: Check if the environment variable is actually loading
    if (!process.env.MONGODB_URI) {
      console.log("⚠️ WARNING: MONGODB_URI is undefined. Checking .env loading...");
      // If it's undefined here, it means index.js didn't load it properly.
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;