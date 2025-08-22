// testJornaya.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connection from "../src/db/index.js"; // adjust path if needed
import fetchJornayaData from "../src/services/jornayaServices.service.js"; // adjust path if needed

dotenv.config();

connection()
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

const testLeadId = "0DB6949F-9F47-CD76-AE95-D78DFC06E6B4"; // <-- replace with a real Jornaya LeadID

(async () => {
  try {
    console.log("Testing Jornaya API with Lead ID:", testLeadId);

    const result = await fetchJornayaData(testLeadId);

    console.log("Jornaya API result:");
    console.log("Playback Available:", result.playbackAvailable);
    console.log("TCPA Consent:", result.tcpConsent);
    console.log("Full Raw Data:", result.raw);

  } catch (err) {
    console.error("API error:", err.message || err);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
})();
