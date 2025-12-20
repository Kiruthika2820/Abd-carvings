// ------------------ GLOBALS ------------------
let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

// ------------------ DISPLAY PRODUCTS ------------------
function displayProducts(list){
    const container = document.getElementById("product-list");
    if(!container) return;
    container.innerHTML = "";
    list.forEach(p => {
        const el = document.createElement("div");
        el.className = "product-card";
        el.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p class="price">₹${p.price}</p>
            <div class="wishlist-icon" onclick="toggleWishlist(${p.id})">
                <i class="fa ${wishlist.includes(p.id)?'fa-solid':'fa-regular'} fa-heart" id="wish-ICON-${p.id}"></i>
            </div>
            <button onclick="addToCart(${p.id})">Add to Cart</button>
        `;
        container.appendChild(el);
    });
}

// ------------------ FETCH PRODUCTS ------------------
async function loadProducts(){
    try{
        const res = await fetch("/api/products"); // Flask API
        products = await res.json();
        displayProducts(products);
    }catch(e){
        console.error("Failed to load products", e);
    }
}

window.addEventListener("DOMContentLoaded", loadProducts);

// ------------------ CART ------------------
// Initialize cart count on page load
  // Update cart count on page load
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Attach click listeners to all add-to-cart buttons
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const price = parseFloat(btn.getAttribute('data-price'));
        addToCart(name, price);
      });
    });
  });

function addToCart(productName, price) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  
  // Check if product already exists, increase quantity if yes
  let existing = cart.find(item => item.name === productName);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name: productName, price: price, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${productName} added to cart!`);
  updateCartCount();
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").innerText = totalItems;
}


function renderCart(){
    const cartDiv = document.getElementById("cart-items");
    if(!cartDiv) return;
    cartDiv.innerHTML = "";
    let total=0;
    cart.forEach((item,i)=>{
        cartDiv.innerHTML += `<p>${item.name} - ₹${item.price} <button onclick="removeFromCart(${i})">Remove</button></p>`;
        total += parseFloat(item.price);
    });
    const totalEl = document.getElementById("total-price");
    if(totalEl) totalEl.innerText = "Total: ₹"+total;
}

function removeFromCart(i){
    cart.splice(i,1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function openCart(){document.getElementById("cart-modal").style.display="block"; renderCart();}
function closeCart(){document.getElementById("cart-modal").style.display="none";}

// ------------------ WISHLIST ------------------
function toggleWishlist(id){
    if(wishlist.includes(id)) wishlist = wishlist.filter(x=>x!==id);
    else wishlist.push(id);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistIcons();
    loadWishlistItems();
}

function updateWishlistIcons(){
    products.forEach(p=>{
        const icon = document.getElementById(`wish-ICON-${p.id}`);
        if(icon){
            icon.classList.toggle("fa-solid", wishlist.includes(p.id));
            icon.classList.toggle("fa-regular", !wishlist.includes(p.id));
        }
    });
}

function openWishlist(){document.getElementById("wishlist-modal").style.display="block"; loadWishlistItems();}
function closeWishlist(){document.getElementById("wishlist-modal").style.display="none";}

function loadWishlistItems(){
    const box = document.getElementById("wishlist-items");
    if(!box) return;
    if(wishlist.length===0){box.innerHTML="<p>No items in wishlist ❤️</p>"; return;}
    let html="";
    wishlist.forEach(id=>{
        const p = products.find(x=>x.id===id);
        if(!p) return;
        html+=`
        <div class="cart-item">
            <img src="${p.image}" alt="">
            <div><h4>${p.name}</h4><p>₹${p.price}</p></div>
            <button onclick="removeWishlist(${id})">Remove</button>
        </div>`;
    });
    box.innerHTML = html;
}

function removeWishlist(id){
    wishlist = wishlist.filter(x=>x!==id);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistIcons();
    loadWishlistItems();
}
function goContact() {
    window.location.href = "contact.html";   // frontend only
    // window.location.href = "/contact";     // Flask route இருந்தா இதை பயன்படுத்தலாம்
}


// ------------------ SEARCH ------------------
function onSearch(){
    const q = document.getElementById("search")?.value.toLowerCase().trim() || "";
    if(!q) displayProducts(products);
    else displayProducts(products.filter(p=>p.name.toLowerCase().includes(q) || (p.category||"").toLowerCase().includes(q)));
}

// ------------------ ADMIN LOGIN ------------------
async function adminLogin(username,password){
    try{
        const res = await fetch("/admin/login", {
            method:"POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({username,password})
        });
        const data = await res.json();
        if(data.status==="success"){
            alert("Welcome Admin!");
            window.location.href="add_product.html";
        } else alert("Wrong Credentials!");
    } catch(e){
        console.error("Admin login failed", e);
    }
}

// ------------------ ADD PRODUCT FORM ------------------
const form = document.getElementById('addProductForm');
if(form){
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const image = document.getElementById('image').files[0];
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('image', image);

        try{
            const res = await fetch('/add_product', { method:'POST', body: formData });
            const data = await res.json();
            alert(data.message);
            form.reset();
        }catch(err){
            console.error(err);
            alert("Failed to add product");
        }
    });
}

// ------------------ PLACE ORDER ------------------
function placeOrder(){
    if(cart.length===0){alert("Cart empty!"); return;}
    const customer = {
        name: document.getElementById("customer-name")?.value || "",
        building: document.getElementById("customer-building")?.value || "",
        place: document.getElementById("customer-place")?.value || "",
        landmark: document.getElementById("customer-landmark")?.value || "",
        district: document.getElementById("customer-district")?.value || "",
        postal: document.getElementById("customer-postal")?.value || "",
        phone: document.getElementById("customer-phone")?.value || ""
    };

    const payload = {
        customer,
        products: cart,
        total: cart.reduce((sum,p)=>sum+parseFloat(p.price),0),
        payment_method: document.getElementById("payment-method")?.value || "cod",
        status: "pending"
    };

    fetch("/place_order", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
    })
    .then(res=>res.json())
    .then(data=>{
        alert(data.message || "Order placed successfully!");
        cart=[]; localStorage.setItem("cart","[]");
        renderCart();
    })
    .catch(err=>{
        console.error(err);
        alert("Failed to place order");
    });
}
