import ApiError from "../utils/ApiError.js";
import { JORNAYA_API } from "../constants.js";
import axios from "axios";

const fetchJornayaData = async (leadId) => {
  try {
    const res = await axios.get(
      `${JORNAYA_API.URL}?token=${encodeURIComponent(leadId)}`,
      {
        auth: {
          username: JORNAYA_API.USER,
          password: JORNAYA_API.PASS,
        },
      }
    );

    if (!res.data) {
      throw new ApiError(404, "No data received from Jornaya API");
    }

    const data = res.data;

    // Playback
    const playbackAvailable = !!data.Playback; // true if Playback field exists

    // TCPA consent check
    const tcpConsent =
      data.TCPA?.toLowerCase().includes("yes") ||
      data.TCPA?.toLowerCase().includes("submitted");

    return {
      raw: data,
      playbackAvailable,
      tcpConsent,
    };
  } catch (error) {
    console.error("Jornaya API Error:", error.message);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || "Failed to fetch Jornaya data"
    );
  }
};

export default fetchJornayaData;
