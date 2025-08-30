const User = require("../models/User.models");
const jwt = require("jsonwebtoken");

// helper function to create tokens
const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //check if user exist
    const existingUser = await User.findOne({ email });
    // if true then send an error message
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    //if email not found in DB
    const user = new User({ name, email, password });
    await user.save();

    //create token for users
    const token = createToken(user._id);

    //send response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Encountered errors registering users, please try again later",
      error: error.message,
    });
  }
};

// login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }
    // check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }
    //create token
    const token = createToken(user._id);
    //send response
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      messge: "Error Logging In",
      error: error.message,
    });
  }
};

// User profile
const getProfile = async (req, res) => {
  try {
    //req.user is set up by auth middleware
    // const user = await User.findById(req.user._id).select("-password");
    const user = req.user;
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting profile",
      error: error.message,
    });
  }
};
module.exports = { register, login, getProfile };
