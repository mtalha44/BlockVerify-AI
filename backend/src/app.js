import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import blockchainConfig from "./config/blockchain.js";
import redisConfig from "./config/redis.js";
import queueService from "./services/queue/queueService.js";

import authRoutes from "./routes/authRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import excelRoutes from "./routes/excelRoutes.js";
import revocationRoutes from "./routes/revocationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/revoke", revocationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    blockchain: blockchainConfig.getWeb3() ? "connected" : "disconnected",
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// Initialize services
const initializeServices = async () => {
  try {
    await connectDB();
    await blockchainConfig.initialize();
    await redisConfig.initialize();
    await queueService.initialize();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📡 Blockchain: ${blockchainConfig.getWeb3() ? "Connected" : "Disconnected"}`,
      );
      console.log(`👛 Wallet: ${blockchainConfig.getAccount()?.address}`);
    });
  } catch (error) {
    console.error("Service initialization failed:", error);
    process.exit(1);
  }
};

initializeServices();

export default app;
