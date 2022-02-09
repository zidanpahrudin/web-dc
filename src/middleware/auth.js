const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.cookies['token'];

  // Check if not token
  if (!token) {
    return res
      .status(401)
      .json({ status: "failed", message: "No token, authorization denied..", data: [] });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwt").get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ status: "failed", message: "Token is not valid", data: [] });
  }
};
