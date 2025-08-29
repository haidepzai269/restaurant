const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.getAllOrders = async (req, res) => {
    try {
         const result = await pool.query(`
        SELECT id, customer_name, customer_phone, items, total, is_paid,
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
      
      const newOrder = result.rows[0];
      // Parse items nếu cần
      newOrder.items = typeof newOrder.items === "string" ? JSON.parse(newOrder.items) : newOrder.items;
  
      // 🔥 Emit event tới tất cả client qua socket.io
      req.io.emit("newOrder", newOrder);
  
      res.json(newOrder);
    } catch (err) {
      console.error("❌ createOrder:", err);
      res.status(500).json({ error: "Lỗi khi tạo đơn hàng" });
    }
};
  
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_paid } = req.body;

    const result = await pool.query(
      `UPDATE orders 
       SET is_paid = $1
       WHERE id = $2
       RETURNING *`,
      [is_paid, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    const updatedOrder = result.rows[0];
    updatedOrder.items = typeof updatedOrder.items === "string" ? JSON.parse(updatedOrder.items) : updatedOrder.items;

    // emit realtime
    req.io.emit("orderUpdated", updatedOrder);

    res.json(updatedOrder);
  } catch (err) {
    console.error("❌ updateOrderStatus:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn" });
  }
};
