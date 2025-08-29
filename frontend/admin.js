const socket = io();

async function loadFoods() {
  const res = await fetch('/api/foods');
  const foods = await res.json();
  const list = document.getElementById('foodList');
  list.innerHTML = "";

  foods.forEach(f => {
    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${f.name}</strong> - ${f.price}₫
      </div>
      <div>
        <button class="btn btn-sm btn-warning me-2 edit-btn">Sửa</button>
        <button class="btn btn-sm btn-danger delete-btn">Xóa</button>
      </div>
    `;

    // Xóa
    li.querySelector('.delete-btn').addEventListener('click', async () => {
      if (confirm(`Xóa món "${f.name}"?`)) {
        const res = await fetch('/api/foods/' + f.id, { method: 'DELETE' });
        if (res.ok) {
          showToast("✅ Đã xóa");
          loadFoods();
        } else {
          showToast("❌ Lỗi khi xóa");
        }
      }
    });

    // Sửa
    li.querySelector('.edit-btn').addEventListener('click', () => {
      document.getElementById("edit-id").value = f.id;
      document.getElementById("edit-name").value = f.name;
      document.getElementById("edit-price").value = f.price;
      document.getElementById("edit-description").value = f.description || "";
      document.getElementById("edit-category").value = f.category;
      document.getElementById("edit-sale").checked = f.sale;

      new bootstrap.Modal(document.getElementById("editModal")).show();
    });

    list.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', loadFoods);

// Form thêm món
document.getElementById('foodForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch('/api/foods', {
    method: 'POST',
    body: formData
  });
  if (res.ok) {
    showToast('✅ Thêm món thành công!');
    e.target.reset();
  } else {
    showToast('❌ Lỗi khi thêm món');
  }
});

// Form sửa món
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;
  const formData = new FormData(e.target);
  const res = await fetch('/api/foods/' + id, {
    method: 'PUT',
    body: formData
  });
  if (res.ok) {
    showToast("✅ Cập nhật thành công!");
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
    loadFoods();
  } else {
    showToast("❌ Lỗi khi cập nhật");
  }
});

// Socket realtime
socket.on("foodAdded", loadFoods);
socket.on("foodDeleted", loadFoods);
socket.on("foodUpdated", loadFoods);



// hiển thị danh sách
let allFoods = []; // lưu toàn bộ dữ liệu

async function loadFoods() {
  const list = document.getElementById('foodList');
  list.innerHTML = "";

  // Hiện skeleton trước khi fetch dữ liệu
  for (let i = 0; i < 5; i++) {
    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div style="flex:1">
        <div class="skeleton skeleton-line" style="width:70%"></div>
        <div class="skeleton skeleton-line" style="width:40%"></div>
      </div>
      <div class="d-flex">
        <div class="skeleton skeleton-btn"></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
    `;
    list.appendChild(li);
  }

  try {
    const res = await fetch('/api/foods');
    const foods = await res.json();
    renderList(foods); // gọi hàm render chính
  } catch (err) {
    console.error("Error loading foods", err);
  }
}


function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const sale = document.getElementById('filterSale').value;

  let filtered = allFoods.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search);
    const matchCategory = category ? f.category === category : true;
    const matchSale = sale ? (String(f.sale) === sale) : true;
    return matchSearch && matchCategory && matchSale;
  });

  renderList(filtered);
}

function renderList(foods) {
  const list = document.getElementById('foodList');
  list.innerHTML = "";

  foods.forEach(f => {
    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    if (f.sale) li.classList.add("sale-highlight");
    li.innerHTML = `
  <div>
    <strong>${f.name}</strong> - ${f.price}₫
  </div>
  <div>
    <button class="btn btn-sm btn-warning me-2 edit-btn">Sửa</button>
    <button class="btn btn-sm btn-danger delete-btn">Xóa</button>
  </div>
     `;
    

    // xử lý Xóa
    li.querySelector('.delete-btn').addEventListener('click', async () => {
      if (confirm(`Xóa món "${f.name}"?`)) {
        const res = await fetch('/api/foods/' + f.id, { method: 'DELETE' });
        if (res.ok) {
          showToast("✅ Đã xóa");
          loadFoods();
        } else {
          showToast("❌ Lỗi khi xóa");
        }
      }
    });

    // xử lý Sửa
    li.querySelector('.edit-btn').addEventListener('click', () => {
      document.getElementById("edit-id").value = f.id;
      document.getElementById("edit-name").value = f.name;
      document.getElementById("edit-price").value = f.price;
      document.getElementById("edit-description").value = f.description || "";
      document.getElementById("edit-category").value = f.category;
      document.getElementById("edit-sale").checked = f.sale;

      new bootstrap.Modal(document.getElementById("editModal")).show();
    });

    list.appendChild(li);
  });
}

// Gắn event cho filter
document.addEventListener('DOMContentLoaded', () => {
  loadFoods();
  loadNotifications();
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('filterCategory').addEventListener('change', applyFilters);
  document.getElementById('filterSale').addEventListener('change', applyFilters);
});



// Load danh sách đánh giá với lọc
async function loadReviews() {
  try {
    const res = await fetch("/api/reviews");
    const reviews = await res.json();

    // Lấy giá trị filter
    const starFilter = document.getElementById("filterStars").value;
    const timeFilter = document.getElementById("filterTime").value;

    let filtered = reviews;

    // Lọc theo số sao
    if (starFilter) {
      filtered = filtered.filter(r => r.stars == starFilter);
    }

    // Lọc theo thời gian
    if (timeFilter) {
      const now = new Date();
      filtered = filtered.filter(r => {
        const created = new Date(r.created_at);
        if (timeFilter === "today") {
          return created.toDateString() === now.toDateString();
        } else if (timeFilter === "week") {
          const diffDays = (now - created) / (1000 * 60 * 60 * 24);
          return diffDays <= 7;
        } else if (timeFilter === "month") {
          const diffDays = (now - created) / (1000 * 60 * 60 * 24);
          return diffDays <= 30;
        }
        return true;
      });
    }

    // Render bảng
    const tbody = document.getElementById("reviewList");
    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center">Không có đánh giá nào</td></tr>`;
      return;
    }

    filtered.forEach(r => {
      const tr = document.createElement("tr");
      tr.dataset.id = r.id;
      tr.innerHTML = `
        <td>${r.name}</td>
        <td>${"⭐".repeat(r.stars)}</td>
        <td>${r.content}</td>
        <td>${new Date(r.created_at).toLocaleString("vi-VN")}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteReview(${r.id})">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi khi load reviews", err);
  }
}

// Xóa 1 đánh giá
async function deleteReview(id) {
  if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
  try {
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadReviews();
    } else {
      alert("Không thể xóa đánh giá!");
    }
  } catch (err) {
    console.error("Lỗi khi xóa review", err);
  }
}

// Xóa toàn bộ đánh giá
async function deleteAllReviews() {
  if (!confirm("Bạn có chắc muốn xóa toàn bộ đánh giá?")) return;
  try {
    const res = await fetch(`/api/reviews`, { method: "DELETE" });
    if (res.ok) {
      loadReviews();
    } else {
      alert("Không thể xóa toàn bộ đánh giá!");
    }
  } catch (err) {
    console.error("Lỗi khi xóa toàn bộ reviews", err);
  }
}

document.getElementById("reviews-tab").addEventListener("click", loadReviews);
document.getElementById("btnFilter").addEventListener("click", loadReviews);
document.getElementById("btnDeleteAllReviews").addEventListener("click", deleteAllReviews);



// Export đánh giá ra CSV
async function exportReviewsCSV() {
  try {
    const res = await fetch("/api/reviews");
    const reviews = await res.json();

    if (!reviews || reviews.length === 0) {
      alert("Không có đánh giá nào để export!");
      return;
    }

    // Tạo dữ liệu CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tên,Sao,Nội dung,Ngày\n";
    reviews.forEach(r => {
      const row = [
        `"${r.name}"`,
        r.stars,
        `"${r.content.replace(/"/g, '""')}"`, // escape dấu nháy
        new Date(r.created_at).toLocaleString("vi-VN")
      ];
      csvContent += row.join(",") + "\n";
    });

    // Tạo link tải
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reviews.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error("Lỗi khi export CSV", err);
  }
}

document.getElementById("btnExportReviews").addEventListener("click", exportReviewsCSV);


// ================== SOCKET.IO - Thông báo review mới ==================
const notifBtn = document.getElementById("btnNotifications");
const badgeEl = document.getElementById("reviewBadge");
const notifList = document.getElementById("notificationList");

// Toggle dropdown khi bấm chuông
notifBtn.addEventListener("click", () => {
  const showing = notifList.style.display !== "none";
  notifList.style.display = showing ? "none" : "block";
  if (!showing) {
    resetBadge();
  }
});

function incrementBadge() {
  const current = parseInt(badgeEl.textContent || "0", 10) + 1;
  badgeEl.textContent = current;
  badgeEl.style.display = "inline-block";
}

function resetBadge() {
  badgeEl.textContent = "0";
  badgeEl.style.display = "none";
}

function prependNotificationItem(review) {
  if (notifList.querySelector("p")) {
    notifList.innerHTML = "";
  }
  const item = document.createElement("div");
  item.className = "border-bottom py-2 d-flex justify-content-between align-items-start";
  item.innerHTML = `
    <div>
      <div class="d-flex justify-content-between">
        <strong>${escapeHTML(review.name)}</strong>
        <span class="small text-nowrap">⭐${review.stars}</span>
      </div>
      <div class="small text-muted">${new Date(review.created_at).toLocaleString("vi-VN")}</div>
      <div class="small">${escapeHTML(review.content).slice(0, 160)}${review.content.length > 160 ? "…" : ""}</div>
    </div>
    <button class="btn btn-sm btn-link text-danger ms-2" title="Ẩn thông báo" onclick="removeNotification(this)">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;
  notifList.prepend(item);
}
function removeNotification(btn) {
  btn.closest("div").remove();
  // Nếu rỗng thì hiện lại "Chưa có thông báo"
  if (notifList.children.length === 0) {
    notifList.innerHTML = `<p class="mb-1 text-muted small m-0">Chưa có thông báo</p>`;
  }
}


function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Lắng nghe review mới từ server
socket.on("newReview", (review) => {
  incrementBadge();
  prependNotificationItem(review);

  // rung chuông
  notifBtn.classList.add("ring");
  setTimeout(() => notifBtn.classList.remove("ring"), 1200);

  // nếu đang ở tab Reviews thì thêm dòng vào bảng
  const reviewsTabActive = document.getElementById("reviews")?.classList.contains("active");
  if (reviewsTabActive) {
    tryAppendToTableWithCurrentFilters(review);
  }
});

function tryAppendToTableWithCurrentFilters(review) {
  const starFilter = document.getElementById("filterStars").value;
  const timeFilter = document.getElementById("filterTime").value;

  // lọc sao
  if (starFilter && String(review.stars) !== String(starFilter)) return;

  // lọc thời gian
  if (timeFilter) {
    const now = new Date();
    const created = new Date(review.created_at);
    const sameDay = created.toDateString() === now.toDateString();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);

    if (timeFilter === "today" && !sameDay) return;
    if (timeFilter === "week" && diffDays > 7) return;
    if (timeFilter === "month" && diffDays > 30) return;
  }

  const tbody = document.getElementById("reviewList");
  const emptyRow = tbody.querySelector("td[colspan]");
  if (emptyRow) tbody.innerHTML = "";

  const tr = document.createElement("tr");
  tr.dataset.id = r.id;
  tr.innerHTML = `
    <td>${escapeHTML(review.name)}</td>
    <td>${"⭐".repeat(review.stars)}</td>
    <td>${escapeHTML(review.content)}</td>
    <td>${new Date(review.created_at).toLocaleString("vi-VN")}</td>
    <td>
      <button class="btn btn-sm btn-danger" onclick="deleteReview(${review.id})">Xóa</button>
    </td>
  `;
  tbody.prepend(tr);
}


async function loadNotifications() {
  try {
    const res = await fetch("/api/notifications");
    const notifs = await res.json();

    notifList.innerHTML = "";
    if (notifs.length === 0) {
      notifList.innerHTML = `<p class="mb-1 text-muted small m-0">Chưa có thông báo</p>`;
      badgeEl.style.display = "none";
      return;
    }

    let unread = 0;

    notifs.forEach(n => {
      if (!n.is_read) unread++;
      const data = n.data ? (typeof n.data === "string" ? JSON.parse(n.data) : n.data) : {};

      const item = document.createElement("div");
      item.className = "border-bottom py-2 d-flex justify-content-between align-items-start notif-item";
      item.dataset.reviewId = data.reviewId || "";
      item.dataset.notifId = n.id; // lưu id notification
      
      item.innerHTML = `
        <div class="notif-click" style="cursor:pointer;flex:1">
          <div class="fw-bold">${n.title}</div>
          <div class="small text-muted">${new Date(n.created_at).toLocaleString("vi-VN")}</div>
          <div class="small">${n.message}</div>
        </div>
        <button class="btn btn-sm btn-link text-danger ms-2" onclick="deleteNotification(${n.id}, this)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      notifList.appendChild(item);
    });

    if (unread > 0) {
      badgeEl.textContent = unread;
      badgeEl.style.display = "inline-block";
    } else {
      badgeEl.style.display = "none";
    }
  } catch (err) {
    console.error("Lỗi khi load notifications", err);
  }
}


async function deleteNotification(id, btn) {
  await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  btn.closest("div").remove();
}


// Khi click vào một thông báo
notifList.addEventListener("click", async (e) => {
  const target = e.target.closest(".notif-click");
  if (!target) return;

  const parent = target.closest(".notif-item");
  const reviewId = parent.dataset.reviewId;
  const notifId = parent.dataset.notifId;

  if (!reviewId) return;

  // 1. Đánh dấu đã đọc (gọi API nếu cần)
  await fetch(`/api/notifications/${notifId}/read`, { method: "PUT" });

  // 2. Mở tab Đánh giá
  document.querySelector("#reviews-tab").click();

  // 3. Đợi load xong reviews rồi cuộn tới review
  setTimeout(async () => {
    await loadReviews(); // load lại bảng

    const row = document.querySelector(`#reviewList tr[data-id="${reviewId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("highlight-review");
      setTimeout(() => row.classList.remove("highlight-review"), 2000);
    }
  }, 300);
});



//  Đơn hàng
async function loadOrders() {
  try {
    const res = await fetch("/api/orders");
    const orders = await res.json();
    const container = document.getElementById("ordersList");
    container.innerHTML = "";

    if (!orders || orders.length === 0) {
      container.innerHTML = `<p class="text-muted">Chưa có đơn hàng nào</p>`;
      return;
    }

    orders.forEach(order => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card shadow h-100 border-0 rounded-3">
          <div class="card-body">
            <h5 class="card-title mb-2">
              <i class="fa-solid fa-receipt text-success"></i> Đơn #${order.id}
            </h5>
            <p class="mb-1"><strong>Khách:</strong> ${order.customer_name} (${order.customer_phone})</p>
            <p class="mb-1"><strong>Tổng:</strong> ${order.total.toLocaleString()}₫</p>
            <p class="mb-2 small text-muted">
              <i class="fa-regular fa-clock me-1"></i>
              ${new Date(order.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
            </p>
            <details>
              <summary class="text-primary">Chi tiết món</summary>
              <ul class="mt-2 small">
                ${order.items.map(i =>
                  `<li>${i.name} x${i.qty} - ${(i.price * i.qty).toLocaleString()}₫</li>`
                ).join("")}
              </ul>
            </details>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  } catch (err) {
    console.error("❌ Lỗi loadOrders:", err);
  }
}

// gắn event khi click tab Orders
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("orders-tab").addEventListener("click", loadOrders);
  document.getElementById("btnDeleteAllOrders").addEventListener("click", async () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ đơn hàng?")) return;
    const res = await fetch("/api/orders", { method: "DELETE" });
    if (res.ok) {
      showToast("✅ Đã xóa toàn bộ đơn hàng");
      loadOrders();
    }
  });
});
