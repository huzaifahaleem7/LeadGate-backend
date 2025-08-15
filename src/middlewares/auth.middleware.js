import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../constants.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized access, no token provided");
  }

  const decoded_token = jwt.verify(token, ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded_token._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "invalid Token");
  }

  req.user = user;
  next();
});

export default verifyJwt;
