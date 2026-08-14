require("dotenv").config();

const app = require("../app");
const connectDB = require("../config/db");

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) return;

  await connectDB();
  isConnected = true;
};

module.exports = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};