import runDNCCheck from "../src/services/dncService.service.js";

const leadId = null; // Put an existing Lead _id from your DB
const phone = "+13526283899"; // Test phone number

(async () => {
  try {
    console.log(leadId, phone);
    const result = await runDNCCheck(leadId, phone);
    console.log("DNC API result:", result);
  } catch (err) {
    console.error("API error:", err);
  }
})();
