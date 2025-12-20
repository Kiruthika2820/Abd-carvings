// ------------------ GLOBALS ------------------
let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// ------------------ FETCH PRODUCTS ------------------
async function fetchProducts(){
    try{
        const res = await fetch("/products"); // Flask backend API
        products = await res.json();
        loadProduct();
    } catch(e){
        console.error("Failed to load products", e);
    }
}

// ------------------ GET PRODUCT FROM URL ------------------
function getProductFromURL() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    return products.find(p => p.id === productId);
}

// ------------------ LOAD MAIN PRODUCT ------------------
function loadProduct() {
    const product = getProductFromURL() || products[0];
    if(!product) return;

    document.getElementById("main-product-img").src = product.image;
    document.getElementById("main-product-name").innerText = product.name;
    document.getElementById("main-product-price").innerText = "₹" + product.price;

    // Add to Cart
    document.getElementById("add-cart-btn").onclick = () => addToCart(product.id);

    // Buy Now
    document.getElementById("buy-now-btn").onclick = () => {
        localStorage.setItem("buyNowProduct", JSON.stringify(product));
        window.location.href = "checkout.html"; // example checkout page
    }

    // Load similar products
    const similar = products.filter(p => p.category === product.category && p.id !== product.id);
    const container = document.getElementById("similar-products");
    container.innerHTML = "";
    similar.forEach(p => {
        const el = document.createElement("div");
        el.className = "similar-product-card";
        el.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <p>${p.name}</p>
            <button onclick="viewProduct(${p.id})">View</button>
        `;
        container.appendChild(el);
    });
}

// ------------------ VIEW PRODUCT ------------------
function viewProduct(id){
    window.location.href = `product_detail.html?id=${id}`;
}

// ------------------ ADD TO CART ------------------
function addToCart(id){
    const product = products.find(p=>p.id===id);
    if(!product) return;
    cart.push({id: product.id, name: product.name, price: product.price, image: product.image});
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(product.name + " added to cart!");
}

// ------------------ INIT ------------------
window.addEventListener("DOMContentLoaded", fetchProducts);
