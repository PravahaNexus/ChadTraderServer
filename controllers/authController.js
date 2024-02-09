const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");

exports.protect = catchAsync(async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token || token === "NA") {
      res.status(200).json({
        status: "failed",
        data: "uaa",
      });
      return;
    }

    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    if (decodedToken) {
      next();
    }
  } catch (error) {
    console.log(error);
    return next(new AppError("500", "Internal server error"));
  }
});
