const express = require("express");
const {
  getAllProducts,
  createProduct,
  getProductById,
} = require("../controllers/productController");
const auth = require("../middleware/auth");

const router = express.Router();

//public
router.get("/", getAllProducts);
router.post("/create-product", auth, createProduct);
router.get("/:id", getProductById);

module.exports = router;
