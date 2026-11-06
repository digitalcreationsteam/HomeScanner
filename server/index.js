const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const connectDB = require("./mongodb");
const demoRoutes = require("./route/demo");

const app = express();

// Middleware
app.use(cors({
  origin: ["https://api.spacexstudio.com", "http://localhost:3000"], // Add your actual live domain here
  methods: ["GET", "POST"],
}));
app.use(express.json());

// Connect to Database
connectDB();

// Use Routes (This adds /api to the front of your routes)
app.use("/api", demoRoutes);

// Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});