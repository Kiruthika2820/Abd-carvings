document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect username and password
    const data = new FormData();
    data.append('username', document.getElementById('username').value);
    data.append('password', document.getElementById('password').value);

    try {
        const res = await fetch('/admin/login', {  // Flask route
            method: 'POST',
            body: data
        });

        const json = await res.json();

        if (json.status === "success") {        // Flask response
            alert("Login successful!");
            window.location.href = "/add_product.html";
        } else {
            alert("Invalid login");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Server error");
    }
});
