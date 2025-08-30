const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Cloudinary
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getPaymentInfo = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payment_info ORDER BY id DESC LIMIT 1");
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy payment info" });
  }
};

exports.updatePaymentInfo = async (req, res) => {
  try {
    const { bank_name, account_number, account_name } = req.body;
    let qr_url = null;

    if (req.file) {
      // Upload ảnh QR lên Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "qr_codes"
      });
      qr_url = uploadResult.secure_url;
    }

    await pool.query(
      "INSERT INTO payment_info (bank_name, account_number, account_name, qr_url) VALUES ($1,$2,$3,$4)",
      [bank_name, account_number, account_name, qr_url]
    );

    res.json({ success: true, message: "Cập nhật thông tin thanh toán thành công", qr_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi khi cập nhật" });
  }
};
