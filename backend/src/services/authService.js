const bcrypt = require("bcryptjs");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const AppError = require("../utils/errors");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../utils/jwt");

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(
      "Email is already registered",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "member",
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const decodedRefreshToken = verifyRefreshToken(refreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decodedRefreshToken.exp * 1000),
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (token) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  const tokenHash = hashToken(token);

  const tokenRecord = await RefreshToken.findOne({
    tokenHash,
    user: decoded.userId,
  });

  if (!tokenRecord) {
    throw new AppError(
      "Refresh token is invalid or has been revoked",
      401,
      "REFRESH_TOKEN_REVOKED"
    );
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError(
      "User no longer exists",
      401,
      "USER_NOT_FOUND"
    );
  }

  // Rotate the refresh token.
  await RefreshToken.deleteOne({
    _id: tokenRecord._id,
  });

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const decodedNewRefreshToken =
    verifyRefreshToken(newRefreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(decodedNewRefreshToken.exp * 1000),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutUser = async (token) => {
  if (!token) {
    return;
  }

  const tokenHash = hashToken(token);

  await RefreshToken.deleteOne({
    tokenHash,
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};