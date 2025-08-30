let foods = [];
let cart = [];

const foodList = document.getElementById("food-list");

// Lấy dữ liệu từ backend
async function loadFoods() {
  try {
    const res = await fetch("/api/foods");
    foods = await res.json();
    renderFoods(foods);
  } catch (err) {
    console.error("❌ Lỗi tải foods:", err);
  }
}

// Render menu ra HTML
// function renderFoods(list) {
//   foodList.innerHTML = "";

//   list.forEach((food, index) => {
//     // Nếu nhiều hơn 10 món thì dùng card layout
//     if (list.length > 10) {
//       const col = document.createElement("div");
//       col.className = "col-md-6 col-lg-4";
//       col.innerHTML = `
//         <div class="card h-100 shadow food-card" data-aos="fade-up">
//           <img src="${food.img}" class="card-img-top" alt="${food.name}">
//           <div class="card-body">
//             <h5 class="card-title fw-bold">${food.name}</h5>
//             <p class="card-text text-muted">
//               ${food.description || "Món ăn hấp dẫn, chế biến chuẩn vị."}
//             </p>
//             <p class="text-warning fw-bold">${food.price.toLocaleString()}₫</p>
//             ${food.sale ? '<span class="badge bg-danger">Sale</span>' : ""}
//           </div>
//           <div class="card-footer bg-transparent border-0">
//             <button class="btn btn-outline-primary w-100" onclick="addToCart(${food.id})">
//               + Thêm món
//             </button>
//           </div>
//         </div>
//       `;
//       foodList.appendChild(col);
//     } else {
//       // layout cũ: ảnh trái - text phải
//       const row = document.createElement("div");
//       row.className = "row align-items-center mb-5 food-row";
//       row.setAttribute("data-aos", "fade-up");
//       row.innerHTML = `
//         <div class="col-md-6 ${index % 2 ? "order-md-2" : ""} text-center">
//           <img src="${food.img}" alt="${food.name}" class="img-fluid rounded shadow">
//         </div>
//         <div class="col-md-6 ${index % 2 ? "order-md-1" : ""}">
//           <h3 class="fw-bold">${food.name}</h3>
//           <p class="text-muted">${food.description || "Món ăn hấp dẫn, chế biến chuẩn vị."}</p>
//           <p class="text-warning fw-bold">${food.price.toLocaleString()}₫</p>
//           ${food.sale ? '<span class="badge bg-danger mb-2">Sale</span><br>' : ""}
//           <button class="btn btn-outline-primary" onclick="addToCart(${food.id})">+ Thêm món</button>
//         </div>
//       `;
//       foodList.appendChild(row);
//     }
//   });
// }

function renderFoods(list) {
  foodList.innerHTML = "";

  // Trường hợp > 20 món: render 3 category box
  if (list.length > 20) {
    foodList.innerHTML = `
    <div class="container mt-4">
      <div class="row g-4 justify-content-center">
        <div class="cl col-md-4">
          <div class="card text-center shadow category-card" onclick="filterCategory('food')">
            <div class="card-body">
              <h3 class="fw-bold"><i class="fa-solid fa-bowl-food"></i> Đồ ăn</h3>
              <p>Xem tất cả món ăn</p>
            </div>
          </div>
        </div>
        <div class="cl col-md-4">
          <div class="card text-center shadow category-card" onclick="filterCategory('drink')">
            <div class="card-body">
              <h3 class="fw-bold"><i class="fa-solid fa-bottle-water"></i> Nước uống</h3>
              <p>Xem tất cả đồ uống</p>
            </div>
          </div>
        </div>
        <div class="cl col-md-4">
          <div class="card text-center shadow category-card" onclick="filterCategory('sale')">
            <div class="card-body">
              <h3 class="fw-bold"><i class="fa-solid fa-fire"></i> Đang sale</h3>
              <p>Xem món khuyến mãi</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    `;
    return;
  }

  // Trường hợp 11–20 món: render card grid
  if (list.length > 10) {
    list.forEach((food) => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card h-100 shadow food-card" data-aos="fade-up">
          <img src="${food.img}" class="card-img-top" alt="${food.name}">
          <div class="card-body">
            <h5 class="card-title fw-bold">${food.name}</h5>
            <p class="card-text text-muted">
              ${food.description || "Món ăn hấp dẫn, chế biến chuẩn vị."}
            </p>
            <p class="text-warning fw-bold">${food.price.toLocaleString()}₫</p>
            ${food.sale ? '<span class="badge bg-danger">Sale</span>' : ""}
          </div>
          <div class="card-footer bg-transparent border-0">
            <button class="btn btn-outline-primary w-100" onclick="addToCart(${food.id})">
              + Thêm món
            </button>
          </div>
        </div>
      `;
      foodList.appendChild(col);
    });
    return;
  }

  // Trường hợp ≤ 10 món: layout cũ (ảnh trái – text phải)
  list.forEach((food, index) => {
    const row = document.createElement("div");
    row.className = "row align-items-center mb-5 food-row";
    row.setAttribute("data-aos", "fade-up");
    row.innerHTML = `
      <div class="col-md-6 ${index % 2 ? "order-md-2" : ""} text-center">
        <img src="${food.img}" alt="${food.name}" class="img-fluid rounded shadow">
      </div>
      <div class="col-md-6 ${index % 2 ? "order-md-1" : ""}">
        <h3 class="fw-bold">${food.name}</h3>
        <p class="text-muted">${food.description || "Món ăn hấp dẫn, chế biến chuẩn vị."}</p>
        <p class="text-warning fw-bold">${food.price.toLocaleString()}₫</p>
        ${food.sale ? '<span class="badge bg-danger mb-2">Sale</span><br>' : ""}
        <button class="btn btn-outline-primary" onclick="addToCart(${food.id})">+ Thêm món</button>
      </div>
    `;
    foodList.appendChild(row);
  });
}

// Giỏ hàng
function addToCart(id) {
  const food = foods.find((f) => f.id === id);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...food, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  cartItems.innerHTML = "";

  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    cartItems.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${item.name} x${item.qty}
        <div>
          <button class="btn btn-sm btn-danger me-2" onclick="removeFromCart(${item.id})">-</button>
          <span class="fw-bold">${(item.price * item.qty).toLocaleString()}₫</span>
        </div>
      </li>
    `;
  });
  cartTotal.innerText = total.toLocaleString();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    showToast("Giỏ hàng trống!");
    return;
  }
  const checkoutModal = new bootstrap.Modal(
    document.getElementById("checkoutModal")
  );
  checkoutModal.show();
}

// Filter theo category hoặc sale
function filterCategory(type) {
  showMenu();   // 👉 đảm bảo bật lại menu khi chọn category
  const title = document.getElementById("menu-title");

  if (type === "all") {
    renderFoods(foods);
    title.textContent = "Thực đơn hôm nay";
  } else if (type === "sale") {
    renderFoods(foods.filter((f) => f.sale));
    title.textContent = "Đang Sale";
  } else if (type === "food") {
    renderFoods(foods.filter((f) => f.category === "food"));
    title.textContent = "Đồ ăn";
  } else if (type === "drink") {
    renderFoods(foods.filter((f) => f.category === "drink"));
    title.textContent = "Nước uống";
  }

  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
}


// Submit form checkout
document
  .getElementById("checkout-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();

    if (!name || !phone) {
      showToast("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const order = {
      customer: { name, phone },
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    };

    try {
      const res = await fetch("/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        // 👉 Lưu thêm vào DB Neon
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
      
        showToast("✅ Đặt món thành công! Cảm ơn bạn.");
        cart = [];
        renderCart();
        document.getElementById("checkout-form").reset();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("checkoutModal")
        );
        modal.hide();
        // 👉 Giống hệt bấm "Trang chủ": xóa từ khóa tìm kiếm + hiển thị "Thực đơn hôm nay" và scroll tới #menu
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = "";
      
        filterCategory("all");
        // 👉 Sau đó cuộn mượt về hero section
        document.getElementById("home").scrollIntoView({ behavior: "smooth" });
      } else {
        showToast("❌ Lỗi khi gửi đơn hàng. Vui lòng thử lại!");
      }
      
    } catch (err) {
      console.error(err);
      showToast("❌ Không thể kết nối máy chủ!");
    }
  });

// Tự động đóng menu khi click 1 mục
document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    const navbarCollapse = document.getElementById("navbarMenu");
    if (navbarCollapse.classList.contains("show")) {
      new bootstrap.Collapse(navbarCollapse).toggle();
    }
  });
});

// tìm kiếm 
function applySearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = foods.filter(f => f.name.toLowerCase().includes(keyword));
  renderFoods(filtered);
}

// Gắn sự kiện khi DOM ready
document.addEventListener("DOMContentLoaded", () => {
  loadFoods();
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }
});

// Load menu khi DOM ready
document.addEventListener("DOMContentLoaded", loadFoods);




// đánh giá 
// Xử lý chọn sao
const stars = document.querySelectorAll("#starRating i");
const starInput = document.getElementById("reviewStars");

stars.forEach(star => {
  star.addEventListener("click", () => {
    const value = star.getAttribute("data-value");
    starInput.value = value;

    // Reset tất cả sao về rỗng
    stars.forEach(s => s.classList.remove("fa-solid"));
    stars.forEach(s => s.classList.add("fa-regular"));

    // Tô vàng từ sao 1 -> sao được chọn
    for (let i = 0; i < value; i++) {
      stars[i].classList.remove("fa-regular");
      stars[i].classList.add("fa-solid");
    }
  });
});

// Xử lý gửi form
document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("reviewName").value.trim();
  const stars = document.getElementById("reviewStars").value;
  const content = document.getElementById("reviewContent").value.trim();

  if (!name || !stars || !content) {
    showToast("Vui lòng nhập đầy đủ thông tin và chọn số sao!", "warning");
    return;
  }

  try {
    // trong submit form
    const starsValue = document.getElementById("reviewStars").value;

    const res = await fetch("/api/reviews", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, stars: starsValue, content })
    });


    if (res.ok) {
      showToast("Cảm ơn bạn đã gửi đánh giá!", "success");
      e.target.reset();
      document.querySelectorAll("#starRating i").forEach(s => {
        s.classList.remove("fa-solid");
        s.classList.add("fa-regular");
      });
      
    } else {
      showToast("Lỗi khi gửi đánh giá!", "error");
    }
  } catch (err) {
    showToast("Không thể kết nối server!", "error");
  }
});



async function loadTickerReviews() {
  try {
    const res = await fetch("/api/reviews");
    const reviews = await res.json();

    if (!reviews || reviews.length === 0) return;

    const ticker = document.getElementById("tickerContent");
    ticker.innerHTML = "";

    const list = reviews.slice(0, 10);

    for (let repeat = 0; repeat < 2; repeat++) {
      list.forEach(r => {
        const item = document.createElement("div");
        item.className = "ticker-item";
        item.innerText = `${r.name}: ${"⭐".repeat(r.stars)} - ${r.content}`;
        item.title = r.content; // tooltip khi hover

        // Khi click vào review => mở modal
        item.addEventListener("click", () => {
          document.getElementById("reviewModalBody").innerHTML = `
            <p><strong>${r.name}</strong> - ${"⭐".repeat(r.stars)}</p>
            <p>${r.content}</p>
          `;
          const modal = new bootstrap.Modal(document.getElementById("reviewModal"));
          modal.show();
        });

        ticker.appendChild(item);
      });
    }
  } catch (err) {
    console.error("Lỗi khi load ticker reviews", err);
  }
}


document.addEventListener("DOMContentLoaded", loadTickerReviews);


function showMenu() {
  document.getElementById("menu").style.display = "block";
  document.getElementById("cart").style.display = "block";
  document.getElementById("faq").style.display = "block";
  document.getElementById("reviews").style.display = "block";

  document.getElementById("orders").style.display = "none";
}


// Xử lý nút "Khám phá Menu"
document.querySelectorAll('a[href="#menu"]').forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();   // chặn nhảy thẳng anchor mặc định
    showMenu();           // đảm bảo menu hiện lại
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
  });
});




function showPayment() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("cart").style.display = "none";
  document.getElementById("faq").style.display = "none";
  document.getElementById("reviews").style.display = "none";
  document.getElementById("orders").style.display = "none";

  document.getElementById("payment").style.display = "block";

  loadPaymentInfo();
}

async function loadPaymentInfo() {
  try {
    const res = await fetch("/api/payment");
    const data = await res.json();

    document.getElementById("bankName").textContent = data.bank_name;
    document.getElementById("accountNumber").textContent = data.account_number;
    document.getElementById("accountName").textContent = data.account_name;
    document.getElementById("qrImage").src = data.qr_url;
  } catch (err) {
    console.error("❌ Lỗi load payment info", err);
  }
}



