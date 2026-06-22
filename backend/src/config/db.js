// backend/src/config/db.js
import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("✅ MongoDB Disconnected");
  } catch (error) {
    console.error("❌ MongoDB Disconnect Error:", error);
  }
};

/**
 * Get connection status
 * @returns {boolean} Connection status
 */
export const getConnectionStatus = () => {
  return isConnected;
};

/**
 * Get MongoDB connection instance
 * @returns {mongoose.Connection} Mongoose connection
 */
export const getConnection = () => {
  return mongoose.connection;
};

// Event listeners
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 MongoDB disconnected");
  isConnected = false;
});

// Handle application termination
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

export default connectDB;
