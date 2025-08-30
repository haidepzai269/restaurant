const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "tmp/" }); // file tạm, upload lên Cloudinary xong có thể xóa
const { getPaymentInfo, updatePaymentInfo } = require("../controllers/payment.controller");

router.get("/", getPaymentInfo);
router.post("/", upload.single("qr_file"), updatePaymentInfo);

module.exports = router;
