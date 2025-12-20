document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadCartPage();

  // Attach to add-to-cart buttons
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      addToCart(name, price);
    });
  });
});

// Add item
function addToCart(name, price,image) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  let item = cart.find(p => p.name === name);
  if (item) item.quantity++;
  else cart.push({ name, price,image, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  alert(name + " added to cart!");
}

// Update cart count in header
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let total = cart.reduce((sum, p) => sum + p.quantity, 0);
  let countEl = document.getElementById("cart-count");
  if (countEl) countEl.innerText = total;
}

// Load cart.html items
function loadCartPage() {
  let table = document.querySelector("#cart-table tbody");
  if (!table) return; // Only run on cart page

  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  table.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    let subtotal = item.price * item.quantity;
    total += subtotal;

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>₹${item.price}</td>
        <td>${item.quantity}</td>
        <td>₹${subtotal}</td>
        <td><button class="remove-btn" onclick="removeItem(${index})">Remove</button></td>
      </tr>
    `;
  });

  document.getElementById("cart-total").innerText = "Total: ₹" + total;
}

// Remove item
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartPage();
  updateCartCount();
}
