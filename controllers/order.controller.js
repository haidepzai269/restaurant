const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, customer_name, customer_phone, items, total,
                   created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as created_at
            FROM orders
            ORDER BY created_at DESC
          `);
        const orders = result.rows.map(o => {
        let items = o.items;
        // Nếu items là string thì parse, nếu đã là object (JSONB) thì giữ nguyên
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error("❌ Lỗi parse items:", e, items);
            items = [];
          }
        }
        return { ...o, items };
      });
      res.json(orders);
    } catch (err) {
      console.error("❌ getAllOrders:", err);
      res.status(500).json({ error: "Lỗi khi lấy đơn hàng" });
    }
  };
  
  
  

exports.createOrder = async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (customer_name, customer_phone, items, total)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer.name, customer.phone, JSON.stringify(items), total]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ createOrder:", err);
    res.status(500).json({ error: "Lỗi khi tạo đơn hàng" });
  }
};
