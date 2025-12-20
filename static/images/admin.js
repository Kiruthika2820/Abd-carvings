// Add new product (with image upload)
async function addProduct() {
    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value.trim();
    const image = document.getElementById("image").files[0]; // File object
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!name || !price || !image) {
        document.getElementById("msg").innerText = "Name, price and image are required";
        return;
    }

    // FormData to send files + other fields
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", image);
    formData.append("category", category);
    formData.append("description", description);

    try {
        const res = await fetch("/add_product", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.message === "Product added successfully") {
            document.getElementById("msg").innerText = "Product added successfully!";
            // Redirect to home after short delay
            setTimeout(() => location.href = "/", 900);
        } else {
            document.getElementById("msg").innerText = "Failed to add product";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("msg").innerText = "Network error";
    }
}
