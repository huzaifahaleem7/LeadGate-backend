import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { NODE_ENV, REFRESH_TOKEN_SECRET } from "../constants.js";
import jwt from "jsonwebtoken";

//generateAccessAndRefreshToken
const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    // console.log(`AccessToken is ${accessToken}`);
    // console.log(`RefreshToken is ${refreshToken}`);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log(
      `Error while generating access and refresh Tokens ${error.message}`
    );
    throw new ApiError(500, "Error while generating Tokens");
  }
};

//signup
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

//login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const validatePassword = await user.isValidPassword(password);
  if (!validatePassword) {
    throw new ApiError(400, "Please enter the correct password");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: NODE_ENV,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loginUser,
          accessToken,
          refreshToken,
        },
        "User login successfully"
      )
    );
});

//logout
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      refreshToken: null,
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: NODE_ENV,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

//refreshToken
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access, no refresh token provided");
  }

  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    REFRESH_TOKEN_SECRET
  );
  if (!decodedRefreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const user = await User.findById(decodedRefreshToken._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: NODE_ENV,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed successfully"
      )
    );
});

// | Feature / Endpoint | Accessible By       | Notes                                       |
// | ------------------ | ------------------- | ------------------------------------------- |
// | signup             | Public              | Default role: agent                         |
// | login              | Public              | All roles (agent, teamlead, admin)          |
// | logout             | All logged-in users | Clears tokens                               |
// | refreshAccessToken | All logged-in users | Issues new access token using refresh token |
// | getUserProfile     | Logged-in user      | Returns own profile                         |
// | updateUserProfile  | Logged-in user      | Update own info/password                    |
// | getAllUsers        | Admin               | Can see all users                           |
// | getUserById        | Admin               | Can see any user details                    |
// | deleteUser         | Admin               | Can delete any user                         |
// | updateUserRole     | Admin               | Assign/change roles (agent/teamlead/admin)  |
// | resetUserPassword  | Admin               | Reset password for any user                 |
// | adminMiddleware    | N/A                 | Protect admin routes                        |
// | teamLeadMiddleware | N/A                 | Protect team lead routes                    |
// | agentMiddleware    | N/A                 | Protect agent routes                        |


export { signup, login, logout, refreshAccessToken };
