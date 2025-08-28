const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant-foods",   // thư mục trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// Routes
router.get("/", foodController.getFoods);
router.post("/", upload.single("img"), foodController.addFood);
// DELETE món ăn theo id
router.delete("/:id", foodController.deleteFood);
// sửa 
router.put('/:id', upload.single("img"), foodController.updateFood);

module.exports = router;
