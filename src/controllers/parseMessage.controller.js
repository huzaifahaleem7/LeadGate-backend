import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const parseMessage = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { message } = req.body;
  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  const phoneRegex = /\b\d{10}\b/g;

  const jornayaRegex =
    /\b[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\b/g;

  const phone = message.match(phoneRegex);
  const jornayaId = message.match(jornayaRegex);
  if (!phone || !jornayaId) {
    throw new ApiError(400, "Phone number or jornaya ID not found in message");
  }
  const result = {
    phone: phone[0],
    jornayaId: jornayaId[0],
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { leads: [result] },
        "Phone and Jornaya ID parsed successfully"
      )
    );
});

export { parseMessage };
