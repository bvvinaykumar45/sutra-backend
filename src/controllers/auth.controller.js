import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  emailVerificationContent,
  forgotPasswordContent,
  sendEmail,
} from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access & refresh tokens.",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, userName, password, fullName, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(400, "User with email or username already exists", []);
  }

  const user = await User.create({
    email,
    userName,
    password,
    isEmailVerified: false,
    ...(fullName && { fullName }),
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationContent(
      user.userName,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered successfully and verification email is sent.",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exists!");
  }

  const isPasswordValid = await user.validatePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  const loggedInUser = await User.findById(user._id).select(
    "_id userName email",
  );
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("access-token", accessToken, cookieOptions)
    .cookie("refresh-token", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User is successfully logged in",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .clearCookie("access-token", cookieOptions)
    .clearCookie("refresh-token", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Email Verification Token invalid/expired!");
  }

  user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;
  user.isEmailVerified = true;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,
      },
      "Email is verified",
    ),
  );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationContent(
      user.userName,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Verification mail has been sent to your registered email",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const userRefreshToken =
    req.cookies?.["refresh-token"] ||
    req.body?.["refresh-token"] ||
    req.header("Authorization").split(" ")[1];

  if (!userRefreshToken) {
    throw new ApiError(400, "Refresh Token is required");
  }

  let payload;
  try {
    payload = jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const user = await User.findOne({ _id: payload._id }).select(
    "_id userName email refreshToken",
  );

  if (!user.refreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  user.refreshToken = refreshToken;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("access-token", accessToken, cookieOptions)
    .cookie("refresh-token", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user }, "Access Token is refreshed successfully"),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({ email }).select("_id userName email");

  if (!user) {
    throw new ApiError(404, "User does not exists!");
  }

  const { hashedToken, unhashedToken, tokenExpiry } =
    user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save();

  await sendEmail({
    email: user?.email,
    subject: "Password Reset Email",
    mailgenContent: forgotPasswordContent(
      user.userName,
      `${req.protocol}://${req.hostname}:5137/forgot-password/${unhashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Reset Password Email has been sent successfully.",
      ),
    );
});

export {
  forgotPassword,
  getCurrentUser,
  login,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  verifyEmail,
};
