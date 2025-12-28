from flask import Flask, render_template, request, redirect, session, url_for, jsonify
import json, os,random

app = Flask(__name__)
app.secret_key = "VERY_SECRET_ADMIN_KEY_987654"

# ================= CONFIG =================
PRODUCT_FILE = "products.json"
ORDER_FILE = "orders.json"
REVIEW_FILE = "reviews.json"

ADMIN_USERNAME = "Fasith"
ADMIN_PASSWORD = "fasithsara5454sara5454fasith"

# ================= HELPERS =================
def load_json(file, default):
    if not os.path.exists(file):
        return default
    with open(file, encoding="utf-8") as f:
        return json.load(f)

def save_json(file, data):
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def load_products():
    return load_json(PRODUCT_FILE, [])

def get_product(pid):
    for p in load_products():
        if int(p["id"]) == int(pid):
            return p
    return None

def load_orders():
    return load_json(ORDER_FILE, [])

def save_orders(data):
    save_json(ORDER_FILE, data)

def load_reviews():
    return load_json(REVIEW_FILE, {})

def save_reviews(data):
    save_json(REVIEW_FILE, data)

app.jinja_env.globals.update(load_reviews=load_reviews)

# ================= FRONTEND =================
@app.route("/")
def index():
    cart = session.get("cart", {})
    return render_template(
        "index.html",
        products=load_products(),
        cart_count=sum(cart.values())
    )
@app.route("/products")
def products():
    with open(PRODUCT_FILE) as f:
        products = json.load(f)
    return render_template("products.html", products=products)


@app.route("/product/<int:product_id>")
def product_detail(product_id):
    product = get_product(product_id)
    if not product:
        return "Product not found", 404

    cart = session.get("cart", {})
    return render_template(
        "product_detail.html",
        product=product,
        cart_count=sum(cart.values())
    )

# ================= CART =================
@app.route("/add_to_cart/<int:product_id>", methods=["POST"])
def add_to_cart(product_id):
    cart = session.get("cart", {})
    cart[str(product_id)] = cart.get(str(product_id), 0) + 1
    session["cart"] = cart
    session.modified = True
    return jsonify({"status":"ok"})

@app.route("/cart")
def cart_page():
    cart = session.get("cart", {})
    cart_items, total = [], 0
    for pid, qty in cart.items():
        product = get_product(pid)
        if product:
            p = product.copy()
            p["quantity"] = qty
            p["subtotal"] = qty * float(p["price"])
            total += p["subtotal"]
            cart_items.append(p)
    return render_template(
        "cart.html",
        cart_items=cart_items,
        total=total,
        cart_count=sum(cart.values())
    )

@app.route("/remove_cart/<int:product_id>")
def remove_cart(product_id):
    cart = session.get("cart", {})
    cart.pop(str(product_id), None)
    session["cart"] = cart
    return redirect("/cart")

@app.route("/clear_cart")
def clear_cart():
    session.pop("cart", None)
    return redirect("/cart")
@app.route("/buy_now/<int:product_id>")
def buy_now(product_id):
    product = get_product(product_id)
    if not product:
        return "Product not found", 404

    # Buy now = only one product
    session["cart"] = {str(product_id): 1}
    session.modified = True

    # 🔥 ONLY DELIVERY PAGE
    return redirect(url_for("delivery_address"))

@app.route("/checkout/delivery", methods=["GET", "POST"])
def delivery_address():
    if request.method == "POST":
        session["address"] = {
            "name": request.form["name"],
            "phone": request.form["phone"],
            "building": request.form["building"],
            "street": request.form["street"],
            "city": request.form["city"],
            "state": request.form["state"],
            "pincode": request.form["pincode"]
        }
        return redirect(url_for("order_summary"))

    return render_template("checkout.html")

# ================= BUY NOW =================
@app.route("/checkout/<int:product_id>")
def checkout_single(product_id):
    product = get_product(product_id)
    if not product:
        return "Product not found", 404
    # clear cart and add only this product
    session["cart"] = {str(product_id): 1}
    session.modified = True
    return redirect(url_for("checkout_cart"))

# ================= CHECKOUT =================
@app.route("/checkout_cart", methods=["GET", "POST"])
def checkout_cart():
    cart = session.get("cart", {})
    if not cart:
        return redirect("/cart")
    
    cart_items, total = [], 0
    for pid, qty in cart.items():
        product = get_product(pid)
        if product:
            p = product.copy()
            p["quantity"] = qty
            p["subtotal"] = float(p["price"]) * qty
            total += p["subtotal"]
            cart_items.append(p)
    return render_template("checkout_cart.html", cart_items=cart_items, total=total)

# ================= ORDER SUMMARY =================
@app.route("/checkout/summary")
def order_summary():
    cart = session.get("cart", {})
    address = session.get("address")

    if not cart or not address:
        return redirect(url_for("products"))

    cart_items, total = [], 0
    for pid, qty in cart.items():
        product = get_product(pid)
        if product:
            subtotal = float(product["price"]) * qty
            cart_items.append({
                "name": product["name"],
                "price": product["price"],
                "quantity": qty,
                "subtotal": subtotal,
                "image": product["image"]
            })
            total += subtotal

    return render_template(
        "order_summary.html",
        cart_items=cart_items,
        total=total,
        address=address
    )
def get_product(pid):
    with open(PRODUCT_FILE) as f:
        products = json.load(f)
    for p in products:
        if str(p["id"]) == str(pid):
            return p
    return None


# ================= PAYMENT =================
@app.route("/payment", methods=["POST"])
def payment():
    return render_template("payment.html")
@app.route("/verify_payment", methods=["POST"])
def verify_payment():
    payment_method = request.form.get("payment_method")

    # Save payment info in session
    session["payment"] = {
        "method": payment_method
    }

    # Generate OTP (demo)
    otp = random.randint(100000, 999999)
    session["payment_otp"] = str(otp)

    print("DEBUG OTP:", otp)  # terminal-la OTP show aagum

    return render_template("payment_verify.html")

# ================= CONFIRM ORDER =================
@app.route("/confirm_order", methods=["POST"])
def confirm_order():
    user_otp = request.form.get("otp")
    real_otp = session.get("payment_otp")

    if user_otp != real_otp:
        return "Invalid OTP. Payment verification failed.", 400

    address = session.get("address")
    cart = session.get("cart")
    payment = session.get("payment")

    cart_items = []
    total = 0

    for pid, qty in cart.items():
        product = get_product(pid)
        if product:
            item = product.copy()
            item["quantity"] = qty
            item["subtotal"] = float(item["price"]) * qty
            total += item["subtotal"]
            cart_items.append(item)

    return render_template(
        "confirm_order.html",
        address=address,
        cart_items=cart_items,
        total=total,
        payment_method=payment["method"]
    )
@app.route("/order_success", methods=["POST"])
def order_success():
    order = {
        "id": "ORD12345",
        "status": "Placed"
    }
    return render_template("order_success.html", order=order)
@app.route("/")
def home():
    return redirect("index.html")


# ================= WISHLIST =================
@app.route("/wishlist")
def wishlist():
    wishlist_ids = session.get("wishlist", [])
    products = []

    with open(PRODUCT_FILE) as f:
        all_products = json.load(f)

    for p in all_products:
        if p["id"] in wishlist_ids:
            products.append(p)

    return render_template("wishlist.html", wishlist=products)

@app.route("/remove_from_wishlist/<int:product_id>", methods=["POST"])
def remove_from_wishlist(product_id):
    wishlist = session.get("wishlist", [])

    if product_id in wishlist:
        wishlist.remove(product_id)
        session["wishlist"] = wishlist

    return redirect(url_for("wishlist"))


@app.route("/add_to_wishlist/<int:product_id>", methods=["POST"])
def add_to_wishlist(product_id):
    wishlist = session.get("wishlist", [])

    if product_id not in wishlist:
        wishlist.append(product_id)
        session["wishlist"] = wishlist

    return jsonify({"message": "Added to wishlist ❤️"})




# ================= WRITE REVIEW =================
@app.route("/write_review/<int:product_id>", methods=["POST"])
def write_review(product_id):
    reviews = load_reviews()
    product_reviews = reviews.get(str(product_id), [])
    review = {
        "name": request.form["name"],
        "rating": request.form["rating"],
        "comment": request.form["comment"]
    }
    product_reviews.append(review)
    reviews[str(product_id)] = product_reviews
    save_reviews(reviews)
    return redirect(request.referrer or f"/product/{product_id}")
def admin_required():
    if not session.get("is_admin"):
        return redirect("/admin/login")

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        email = request.form["username"]
        password = request.form["password"]

        if email == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["admin"] = True
            return redirect("/admin/dashboard")
        else:
            return "Invalid admin credentials"

    return render_template("admin_login.html")
@app.route("/admin/dashboard")
def admin_dashboard():
    if not session.get("admin"):
        return redirect("/admin/login")

    return render_template("admin_dashboard.html")
@app.route("/admin/orders")
def admin_orders():
    if not session.get("is_admin"):
        return redirect("/admin/login")

    return render_template("admin_orders.html")
@app.route("/admin/reviews")
def admin_reviews():
    if not session.get("is_admin"):
        return redirect("/admin/login")

    return render_template("admin_reviews.html")
@app.route("/admin/products")
def admin_products():
    if not session.get("admin"):
        return redirect("/admin/login")

    return render_template("admin_products.html")
@app.route("/admin/edit-product/<id>")
def edit_product(id):
    if not session.get("is_admin"):
        return redirect("/admin/login")
@app.route("/admin/delete-product/<id>")
def delete_product(id):
    if not session.get("is_admin"):
        return redirect("/admin/login")
@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    return redirect("/admin/login")

# ================= RUN =================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render sets PORT automatically
    app.run(host="0.0.0.0", port=port)
