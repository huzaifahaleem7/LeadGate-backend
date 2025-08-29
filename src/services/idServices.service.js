import ApiError from "../utils/ApiError.js";
import axios from "axios";
import { MARS_API } from "../constants.js";

const runNumberCheck = async (phone) => {
  try {
    const res = await axios.get(
      `${MARS_API.URL}?api_key=${MARS_API.KEY}&phone=${phone}`
    );

    // Mars API returns lead details
    const record = res.data.result && res.data.result[0] ? res.data.result[0] : null;

    console.log(`MarsBPO lookup completed for ${phone}`);

    return record; // just return the lead details
  } catch (error) {
    console.error("MarsBPO lookup failed:", error.message);
    throw new ApiError(500, "MarsBPO API lookup failed", [
      { phone, message: error.message },
    ]);
  }
};

export default runNumberCheck;
