//import the packages we just installed
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const cors = require("cors");

//Enable usage of .env files. this must always be a the top most part of your server/app/index.js file
require("dotenv").config();

//Craete the express application
const app = express();

//set up middlewares (code that runs for every request)
app.use(cors());
app.use(express.json());

//connect DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Db connection successful");
  } catch (error) {
    console.error("DB connection failed:", error.message);
  }
};

connectDB();

//our port
const PORT = process.env.PORT || 5000;

//create endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    // status: ok,
    message: "Hello this is the home endpoint of our backend",
    data: {
      name: "E-Commerce-Backend",
      class: "Feb 2025 class",
      efficiency: "Beginner",
    },
  });
});

//actual endpoints
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

//start server
app.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
