import mongoose from "mongoose";
import runDNCCheck from "../src/services/dncService.service.js"; // adjust path if needed
import dotenv from "dotenv";
import connection from "../src/db/index.js";

dotenv.config();

// Connect to MongoDB
connection()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const leadId = null; // Put an existing Lead _id from your DB
const phone = "+13526283899"; // Test phone number

(async () => {
  try {
    console.log(leadId, phone);
    const result = await runDNCCheck(leadId, phone);
    console.log("DNC API result:", result);
  } catch (err) {
    console.error("API error:", err);
  } finally {
    mongoose.disconnect();
  }
})();
