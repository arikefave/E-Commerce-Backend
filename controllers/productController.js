const Product = require("../models/Product.models");
const mongoose = require("mongoose");

const getAllProducts = async (req, res) => {
  try {
    // query the current productt cactologue from the db
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    // filter object
    const filter = { isActive: true };
    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      filter.inStock = true;
      filter.stockQuantity = { $gt: 0 };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    //pagination
    const skip = (Number(page) - 1) * Number(limit);

    //build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // //execute query
    // const products = await Product.find(filter)
    //   .populate("createdBy", "name email")
    //   .sort(sort)
    //   .skip(skip)
    //   .limit(Number(limit));
    // //get total count for pagination
    // const total = Product.countDocuments(filter);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNextPage: skip + products.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    // get the product info from the req(client)
    const productData = { ...req.body, createdBy: req.user.userId };

    //calling the schema which will be theguide on how the product above will be stored in the db
    const product = new Product(productData);

    //store data in db
    await product.save();

    //populate the createdBy field foer response
    await product.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.log(error.message);
    //SKU unique
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this SKU already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating this product",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id).populate(
      "createdBy",
      "name email"
    );
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product found",
      data: product,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating products",
      error: error.message,
    });
  }
};

// Soft delete
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    // const product = await Product.deleteOne(id);
    // const product = await Product.findByIdAndDelete(id);
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(204).json({
      success: true,
      message: "Product successfully deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
