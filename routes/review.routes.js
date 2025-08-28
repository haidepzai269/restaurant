const express = require("express");
const router = express.Router();
const { addReview, getReviews, deleteReview, deleteAllReviews } = require("../controllers/review.controller");

// Lấy danh sách đánh giá
router.get("/", getReviews);

// Thêm đánh giá mới
router.post("/", addReview);

router.delete("/:id", deleteReview);
router.delete("/", deleteAllReviews);

module.exports = router;
