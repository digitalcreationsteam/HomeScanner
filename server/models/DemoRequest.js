const mongoose = require("mongoose");

const DemoRequestSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    company:     { type: String, required: true, trim: true },
    designation: { type: String, required: true, enum: ["Builder", "Developer"] },
    phone:       { type: String, required: true, trim: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    projectSize: {
      type: String,
      required: true,
      enum: ["Up to 50 units", "51–100 units", "101–300 units", "301–500 units", "500+ units"],
    },
    notes:       { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// 👇 THIS IS THE FIX 👇
const DemoRequest = mongoose.model("DemoRequest", DemoRequestSchema);

module.exports = DemoRequest; 