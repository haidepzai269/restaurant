require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const { requireAdmin } = require('./middleware/auth.middleware');

// SQLite
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Nodemailer (nếu bạn muốn gửi mail thật)
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',   // đổi chuỗi bí mật
  resave: false,
  saveUninitialized: false
}));

// ================= DB setup =================
let db;
(async () => {
  db = await open({
    filename: './restaurant.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  // Hardcode tài khoản admin lần đầu
  const admin = await db.get("SELECT * FROM admin WHERE email = ?", ["haidepzai2692006@gmail.com"]);
  if (!admin) {
    await db.run("INSERT INTO admin (email, password) VALUES (?, ?)", ["haidepzai2692006@gmail.com", "admin123"]);
    console.log("✔ Admin mặc định: haidepzai2692006@gmail.com / admin123");
  }
})();

// ================= Auth API =================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await db.get("SELECT * FROM admin WHERE email = ? AND password = ?", [email, password]);
  if (admin) {
    req.session.isAdmin = true; // lưu session login
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Sai email hoặc mật khẩu!" });
  }
});
// public routes
// --- BẢO VỆ admin.html trước khi static được mount ---
const frontendPath = path.join(__dirname, 'frontend');

app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

// Cho phép public auth/home (nếu cần)
app.get(['/auth.html', '/home.html'], (req, res) => {
  res.sendFile(path.join(frontendPath, req.path));
});

// --- Cuối cùng mới mount static để phục vụ CSS/JS/IMG ---
app.use(express.static(frontendPath));
// 5. Cuối cùng mới cho static (CSS, JS, ảnh…)
// app.use(express.static(path.join(__dirname, 'frontend')));
app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;
  const admin = await db.get("SELECT * FROM admin WHERE email = ?", [email]);

  if (!admin) {
    return res.json({ success: false, message: "Email không tồn tại!" });
  }

  // Cách 1: Trả thẳng về cho demo
  if (process.env.MAIL_MODE === "demo") {
    return res.json({ success: true, message: `Mật khẩu của bạn là: ${admin.password}` });
  }

  // Cách 2: Gửi mail thật
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Nhà hàng" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Khôi phục mật khẩu Admin",
      text: `Mật khẩu của bạn là: ${admin.password}`
    });

    res.json({ success: true, message: "Mật khẩu đã được gửi tới email của bạn!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Lỗi khi gửi email!" });
  }
});


// đổi mật khẩu 
// ================= Đổi mật khẩu =================
app.post('/api/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.json({ success: false, message: "Thiếu thông tin!" });
  }

  try {
    // kiểm tra mật khẩu cũ
    const admin = await db.get("SELECT * FROM admin WHERE email = ? AND password = ?", [email, oldPassword]);
    if (!admin) {
      return res.json({ success: false, message: "Mật khẩu cũ không đúng!" });
    }

    // cập nhật mật khẩu mới
    await db.run("UPDATE admin SET password = ? WHERE email = ?", [newPassword, email]);

    res.json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});
// ================= Lấy email admin =================
app.get('/api/admin-email', async (req, res) => {
  try {
    const admin = await db.get("SELECT email FROM admin LIMIT 1");
    if (admin) {
      res.json({ email: admin.email });
    } else {
      res.json({ email: "" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ email: "" });
  }
});

// ================== Các route khác ==================
const foodRoutes = require('./routes/foodRoutes');
const reviewRoutes = require("./routes/review.routes");
const notificationRoutes = require("./routes/notification.routes");
const reviewController = require("./controllers/review.controller");
const orderRoutes = require("./routes/order.routes");

app.use((req, res, next) => { req.io = io; next(); });
app.use('/api/foods', foodRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/api/reviews/stats", reviewController.getRatingStats);
app.use("/api/orders", orderRoutes);

// order
// Proxy đơn hàng sang n8n webhook
app.post("/order", async (req, res) => {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return res.status(500).json({ error: "Thiếu N8N_WEBHOOK_URL trong .env" });
    }

    console.log("📩 Nhận đơn hàng từ client:", req.body);

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      console.error("❌ Lỗi khi gửi tới n8n:", response.status, response.statusText);
      return res.status(response.status).json({ error: "Gửi tới n8n thất bại" });
    }

    const data = await response.json();
    console.log("✅ Đơn hàng đã được gửi tới n8n:", data);

    res.json(data);
  } catch (err) {
    console.error("🔥 Lỗi xử lý /order:", err);
    res.status(500).json({ error: "Proxy error" });
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔴 Client disconnected:', socket.id));
});

server.listen(PORT, () => console.log(`🚀 Server chạy tại: http://localhost:${PORT}`));
