import ApiError from "../utils/ApiError.js";
import axios from "axios";
import { BLA_API } from "../constants.js";

const runDNCCheck = async (leadId, phone) => {
  try {
    const res = await axios.get(
      `${BLA_API.URL}?key=${BLA_API.KEY}&ver=v3&resp=json&phone=${phone}`
    );
    const dncCode = res.data.code || null;

    console.log(`DNC check completed for ${phone}: ${dncCode}`);

    const isDNC = dncCode && dncCode.toLowerCase() !== "none";
    return { isDNC, dncCode };
  } catch (error) {
    console.error("DNC check failed:", error.message);
    throw new ApiError(500, "DNC API check failed", [
      { phone, message: error.message },
    ]);
  }
};

export default runDNCCheck;
