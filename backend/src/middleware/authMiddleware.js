const User = require("../models/User");

const {
  verifyAccessToken,
} = require("../utils/jwt");

const AppError = require("../utils/errors");

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AppError(
        "Access token is required",
        401,
        "ACCESS_TOKEN_REQUIRED"
      );
    }

    const token = authorization.split(" ")[1];

    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      throw new AppError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN"
      );
    }

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      throw new AppError(
        "User not found",
        401,
        "USER_NOT_FOUND"
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;