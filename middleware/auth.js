const jwt = require("jsonwebtoken");
const User = require("../models/User.models");

// we create middleware function for auth
const auth = async (req, res, next) => {
  try {
    //get token  from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access Denied. No token Provided" });
    }
    //verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //get user from databasse
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Token is valid but user not found" });
    }
    //add user to req obj
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

module.exports = auth;
