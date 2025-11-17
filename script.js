console.log("Admin Dashboard Loaded ✅");

// ===== GLOBALS =====
let allProducts = [];
let allOrders = [];
let allUsers = [];
let editIndex = null;

// ====== Show Section ======
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = (sec.id === sectionId) ? 'block' : 'none');

    if (sectionId === 'products') {
        renderProductsTable();
        populateFilter('2');
    }
    if (sectionId === 'dashboard') updateDashboardCounts();
    if (sectionId === 'orders') renderOrdersTable();
    if (sectionId === 'users') renderUsersTable();
}

// ====== Load Products / Orders / Users ======
async function loadProducts() {
    try {
        const response = await fetch("products.json");
        const jsonProducts = await response.json();
        const localProducts = JSON.parse(localStorage.getItem("addedProducts")) || [];
        allProducts = [...jsonProducts, ...localProducts];

        allOrders = JSON.parse(localStorage.getItem("addedOrders")) || [];
        allUsers = JSON.parse(localStorage.getItem("addedUsers")) || [];

        renderProductsTable();
        updateDashboardCounts();
        populateFilter('2');
        console.log("✅ Products loaded!");
    } catch (err) {
        console.error("❌ Error loading products:", err);
    }
}

// ====== Render Products Table ======
function renderProductsTable(filteredProducts) {
    const products = filteredProducts || allProducts;
    const table = document.querySelector("#productTable2 tbody");
    if (!table) return;

    table.innerHTML = "";
    products.forEach((prod, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${prod.image}" width="50"></td>
            <td>${prod.name}</td>
            <td>${prod.price} EGP</td>
            <td>${prod.category}</td>
            <td class="actions">
                <button onclick="editProduct(${index})" class="edit-btn">Edit</button>
                <button onclick="deleteProduct(${index})" class="delete-btn">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });
}

// ====== Update Dashboard Cards ======
function updateDashboardCounts() {
    document.getElementById('countProducts').textContent = allProducts.length;
    document.getElementById('countOrders').textContent = allOrders.length;
    document.getElementById('countUsers').textContent = allUsers.length;

    const revenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    document.getElementById('countRevenue').textContent = "$" + revenue;
}

// ====== Orders Table ======
function renderOrdersTable() {
    const tbody = document.getElementById("ordersBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (allOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">No orders yet.</td></tr>`;
        return;
    }
    allOrders.forEach((order, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>$${order.total}</td>
            <td>${order.date}</td>
            <td>${order.status}</td>
        `;
        tbody.appendChild(row);
    });
}

// ====== Users Table ======
function renderUsersTable() {
    const tbody = document.getElementById("usersBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (allUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#888;">No users registered.</td></tr>`;
        return;
    }
    allUsers.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.joined}</td>
        `;
        tbody.appendChild(row);
    });
}

// ====== Add Fake Order ======
function addOrder() {
    const id = "ORD" + (allOrders.length + 1);
    const customer = "Customer " + (allOrders.length + 1);
    const total = (Math.random() * 500).toFixed(2);
    const date = new Date().toLocaleDateString();
    const status = "Pending";

    allOrders.push({ id, customer, total, date, status });
    localStorage.setItem("addedOrders", JSON.stringify(allOrders));
    renderOrdersTable();
    updateDashboardCounts();
}

// ====== Add Fake User ======
function addUser() {
    const id = "USR" + (allUsers.length + 1);
    const name = "User " + (allUsers.length + 1);
    const email = `user${allUsers.length + 1}@example.com`;
    const joined = new Date().toLocaleDateString();

    allUsers.push({ id, name, email, joined });
    localStorage.setItem("addedUsers", JSON.stringify(allUsers));
    renderUsersTable();
    updateDashboardCounts();
}

// ====== Open / Close Modal ======
function openModal(isEdit = false) {
    document.getElementById('productModal').style.display = 'flex';
    if (!isEdit) {
        editIndex = null;
        document.getElementById('pName').value = '';
        document.getElementById('pPrice').value = '';
        document.getElementById('pCategory').value = '';
        document.getElementById('pImageFile').value = '';
        document.getElementById('imagePreview').style.display = 'none';
    }
}
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// ====== Image Preview ======
document.getElementById('pImageFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            const preview = document.getElementById('imagePreview');
            preview.src = evt.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// ====== Save / Edit Product ======
function saveProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const category = document.getElementById('pCategory').value;
    const image = document.getElementById('imagePreview').src;

    if (!name || !price || !category || !image) {
        alert("Please fill all fields!");
        return;
    }

    const product = { name, price, category, image };

    if (editIndex !== null) {
        allProducts[editIndex] = product;
        editIndex = null;
    } else {
        allProducts.push(product);
    }

    localStorage.setItem('addedProducts', JSON.stringify(allProducts));
    closeModal();
    renderProductsTable();
    updateDashboardCounts();
    populateFilter('2');
}

// ====== Edit Product ======
function editProduct(index) {
    editIndex = index;
    const prod = allProducts[index];
    document.getElementById('pName').value = prod.name;
    document.getElementById('pPrice').value = prod.price;
    document.getElementById('pCategory').value = prod.category;
    const preview = document.getElementById('imagePreview');
    preview.src = prod.image;
    preview.style.display = 'block';
    openModal(true);
}

// ====== Delete Product ======
function deleteProduct(index) {
    if (confirm("Are you sure to delete this product?")) {
        allProducts.splice(index, 1);
        localStorage.setItem('addedProducts', JSON.stringify(allProducts));
        renderProductsTable();
        updateDashboardCounts();
        populateFilter('2');
    }
}

// ====== Sidebar Active ======
const links = document.querySelectorAll('.sidebar a');
links.forEach(link => {
    link.addEventListener('click', function () {
        links.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// ====== Logout ======
function logout() {
    alert("Logging out...");
}

// ====== Populate Filter ======
function populateFilter(section = '') {
    const filter = document.getElementById(`categoryFilter${section}`);
    if (!filter) return;
    const categories = [...new Set(allProducts.map(p => p.category))];
    filter.innerHTML = '<option value="all">All</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filter.appendChild(opt);
    });
}

// ====== Filter Products ======
function filterProducts(section = '') {
    const filterVal = document.getElementById(`categoryFilter${section}`).value.toLowerCase();
    const table = document.getElementById(`productTable${section}`);
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const category = row.cells[3].textContent.toLowerCase();
        row.style.display = (filterVal === 'all' || category === filterVal) ? '' : 'none';
    });
}

// ====== Search Products ======
function searchProducts(section = '') {
    const query = document.getElementById(`searchInput${section}`).value.toLowerCase();
    const table = document.getElementById(`productTable${section}`);
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        row.style.display = name.includes(query) ? '' : 'none';
    });
}

// ====== Export CSV ======
function exportCSV() {
    let csv = "Name,Price,Category\n";
    allProducts.forEach(p => {
        csv += `${p.name},${p.price},${p.category}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products.csv';
    link.click();
}

// ====== Initialize ======
document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
    loadProducts();
});

// ============ تحميل Settings ============
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
    document.getElementById('adminName').value = settings.name || '';
    document.getElementById('adminEmail').value = settings.email || '';
    document.getElementById('adminPassword').value = settings.password || '';
}

// ============ حفظ Settings ============
function saveSettings() {
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!name || !email) {
        alert("Please fill in name and email!");
        return;
    }

    const settings = { name, email, password };
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    alert("Settings saved successfully!");
}

// ============ تحميل الإعدادات عند فتح الصفحة ============
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});


// ===== Toggle Password =====
const togglePassword = document.getElementById('togglePassword');
const adminPassword = document.getElementById('adminPassword');

togglePassword.addEventListener('click', () => {
    if (adminPassword.type === 'password') {
        adminPassword.type = 'text';
        togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        adminPassword.type = 'password';
        togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
    }
});
