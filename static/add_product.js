// ------------------ CHECK ADMIN SESSION ------------------
async function checkAdminSession() {
    try {
        const res = await fetch('/check_admin');
        const data = await res.json();
        if(!data.admin){
            alert("Please login as admin!");
            window.location.href = '/';
        }
    } catch(err){
        console.error("Failed to check admin session", err);
        window.location.href = '/';
    }
}
checkAdminSession();

// ------------------ LOGOUT ------------------
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
    logoutBtn.addEventListener('click', async ()=>{
        try {
            await fetch('/logout');
        } catch(err){ console.error(err); }
        window.location.href = '/';
    });
}

// ------------------ ADD PRODUCT FORM ------------------
const addProductForm = document.getElementById('addProductForm');
if(addProductForm){
    addProductForm.addEventListener('submit', async (e)=>{
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const price = document.getElementById('price').value.trim();
        const image = document.getElementById('image').files[0];

        if(!name || !price || !image){
            alert("Name, price, and image are required!");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('image', image);

        try{
            const res = await fetch('/add_product', { method: 'POST', body: formData });
            const data = await res.json();

            if(res.status === 200){
                alert(data.message || "Product added successfully!");
                addProductForm.reset();
            } else if(res.status === 401){
                alert("Unauthorized! Please login.");
                window.location.href = '/';
            } else {
                alert(data.message || "Failed to add product.");
            }
        } catch(err){
            console.error(err);
            alert("Network error. Try again!");
        }
    });
}
