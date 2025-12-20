async function placeOrder() {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if(cart.length === 0){
        alert("Cart is empty!");
        return;
    }

    // Collect delivery details
    const delivery = {
        name: document.getElementById("customer-name").value,
        building: document.getElementById("customer-building").value,
        place: document.getElementById("customer-place").value,
        landmark: document.getElementById("customer-landmark").value,
        district: document.getElementById("customer-district").value,
        postal: document.getElementById("customer-postal").value,
        phone: document.getElementById("customer-phone").value
    };

    const payload = {cart, delivery};

    try{
        const res = await fetch("/submit_order", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if(data.status === "success"){
            alert("Order placed successfully!");
            localStorage.setItem("cart", "[]"); // clear cart
            renderCart(); // update cart UI
        } else {
            alert("Failed to place order!");
        }
    } catch(e){
        console.error("Error submitting order:", e);
        alert("Network error!");
    }
}
