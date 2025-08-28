const pool = require("../db"); // file db.js đã kết nối sẵn tới Neon

// Lấy tất cả review
exports.getReviews = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reviews ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Thêm review mới
exports.addReview = async (req, res) => {
  try {
    const { name, stars, content } = req.body;
    if (!name || !stars || !content) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const result = await pool.query(
      "INSERT INTO reviews (name, stars, content) VALUES ($1, $2, $3) RETURNING *",
      [name, stars, content]
    );

    const saved = result.rows[0];
    // Lưu notification vào Neon
    await pool.query(
    `INSERT INTO notifications (type, title, message, data)
     VALUES ($1, $2, $3, $4)`,
    [
      "review",
      "Đánh giá mới",
      `${name} đã đánh giá ${stars}⭐`,
      JSON.stringify({ reviewId: saved.id, content })
    ]
    );
    // 🔔 Emit sự kiện realtime cho admin
    if (req.io) {
      req.io.emit("newReview", saved);
    }

    res.json(saved);  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Xóa 1 review
exports.deleteReview = async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM reviews WHERE id=$1", [id]);
      res.json({ message: "Đã xóa đánh giá" });
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
  };
  
  // Xóa toàn bộ review
exports.deleteAllReviews = async (req, res) => {
    try {
      await pool.query("DELETE FROM reviews");
      res.json({ message: "Đã xóa toàn bộ đánh giá" });
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
};
  


// Lấy thống kê rating
exports.getRatingStats = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int AS total_reviews,
          AVG(stars)::numeric(10,2) AS avg_rating,
          COUNT(*) FILTER (WHERE stars = 1) AS star1,
          COUNT(*) FILTER (WHERE stars = 2) AS star2,
          COUNT(*) FILTER (WHERE stars = 3) AS star3,
          COUNT(*) FILTER (WHERE stars = 4) AS star4,
          COUNT(*) FILTER (WHERE stars = 5) AS star5
        FROM reviews
      `);
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    }
};
  