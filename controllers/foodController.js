const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Lấy danh sách món ăn
exports.getFoods = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM foods ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Lỗi getFoods:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Thêm món ăn
exports.addFood = async (req, res) => {
  try {
    const { name, price, category, sale, description } = req.body;
    const parsedPrice = parseInt(price, 10);
    const isSale = sale === "on" || sale === "true" || sale === true;

    // URL ảnh (Cloudinary)
    const imgUrl = req.file ? req.file.path : null;

    const result = await pool.query(
      "INSERT INTO foods (name, price, img, category, sale, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [name, parsedPrice, imgUrl, category, isSale, description]
    );

    const newFood = result.rows[0];
    res.json(newFood);

    // 📢 Emit realtime event
    if (req.io) {
      req.io.emit("foodAdded", newFood);
    }
  } catch (err) {
    console.error("❌ Lỗi addFood:", err);
    res.status(500).json({ error: "Insert error" });
  }
};

// Xóa món ăn
exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM foods WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Food not found" });
    }

    const deletedFood = result.rows[0];
    res.json({ message: "Xóa món thành công", food: deletedFood });

    // 📢 Emit realtime event
    if (req.io) {
      req.io.emit("foodDeleted", deletedFood);
    }
  } catch (err) {
    console.error("❌ Lỗi deleteFood:", err);
    res.status(500).json({ error: "Delete error" });
  }
};


// Cập nhật món ăn
exports.updateFood = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, category, sale, description } = req.body;
      const parsedPrice = parseInt(price, 10);
      const isSale = sale === "on" || sale === "true" || sale === true;
  
      // Ảnh mới (nếu có upload)
      const imgUrl = req.file ? req.file.path : null;
  
      const result = await pool.query(
        `UPDATE foods
         SET name=$1, price=$2, category=$3, sale=$4, description=$5, img=COALESCE($6, img)
         WHERE id=$7 RETURNING *`,
        [name, parsedPrice, category, isSale, description, imgUrl, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Food not found" });
      }
  
      // realtime
      req.io.emit("foodUpdated", result.rows[0]);
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ Lỗi updateFood:", err);
      res.status(500).json({ error: "Update error" });
    }
  };
  