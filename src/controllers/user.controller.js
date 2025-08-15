import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const signup = asyncHandler(async (req, res) => {
  const { email, username, fullName, password } = req.body;

  if (
    [email, username, fullName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const user = await User.create({
    email,
    username,
    fullName,
    password,
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong");
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, { createdUser }, "User created successfully"));
});

export { signup };
