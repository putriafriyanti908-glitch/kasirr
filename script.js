const services = [
    { id: 1, name: "Make Up", price: 150000, image: "makeup.jpg" },
    { id: 2, name: "Hair Styling", price: 75000, image: "hair.jpg" },
    { id: 3, name: "Creambath", price: 60000, image: "creambath.jpg" },
    { id: 4, name: "Pedicure", price: 50000, image: "pedicure.jpg" },
    { id: 5, name: "Manicure", price: 50000, image: "manicure.jpg..webp" },
    { id: 6, name: "Facial", price: 100000, image: "facial.jpg" }
];

let orders = [];
let lastReceipt = "";

const rupiah = number =>
    "Rp" + Number(number).toLocaleString("id-ID");

function parseMoney(value) {
    return Number(String(value).replace(/\D/g, "")) || 0;
}

function renderServices() {
    const container = document.getElementById("serviceList");

    container.innerHTML = services.map(service => `
        <div class="service">
            <img src="${service.image}"
                 class="service-image"
                 alt="${service.name}"
                 onerror="this.style.display='none'">

            <h3>${service.name}</h3>
            <p>${rupiah(service.price)}</p>

            <button onclick="addOrder(${service.id})">
                Tambah Pesanan
            </button>
        </div>
    `).join("");
}

function addOrder(id) {
    const service = services.find(item => item.id === id);
    const existing = orders.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        orders.push({
            id: service.id,
            name: service.name,
            price: service.price,
            qty: 1
        });
    }

    renderOrders();
}

function editOrder(id, field, value) {
    const order = orders.find(item => item.id === id);
    if (!order) return;

    if (field === "qty") {
        order.qty = Math.max(1, Number(value) || 1);
    }

    if (field === "price") {
        order.price = Math.max(0, parseMoney(value));
    }

    renderOrders();
}

function removeOrder(id) {
    orders = orders.filter(item => item.id !== id);
    renderOrders();
}

function getTotals() {
    const subtotal = orders.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    const discountPercent = Math.min(
        100,
        Math.max(0, Number(document.getElementById("discount").value) || 0)
    );

    const discount = subtotal * discountPercent / 100;
    const total = subtotal - discount;

    return { subtotal, discount, total };
}

function renderOrders() {
    const container = document.getElementById("orderList");

    if (orders.length === 0) {
        container.innerHTML = "<p>Belum ada pesanan.</p>";
    } else {
        container.innerHTML = orders.map(item => `
            <div class="order-item">
                <div>
                    <b>${item.name}</b>
                    <p>Harga satuan: ${rupiah(item.price)}</p>
                </div>

                <label>
                    Jumlah
                    <input type="number" min="1" value="${item.qty}"
                        onchange="editOrder(${item.id}, 'qty', this.value)">
                </label>

                <label>
                    Harga
                    <input type="text" value="${item.price.toLocaleString('id-ID')}"
                        onchange="editOrder(${item.id}, 'price', this.value)">
                </label>

                <b>${rupiah(item.price * item.qty)}</b>

                <button class="danger" onclick="removeOrder(${item.id})">
                    Hapus
                </button>
            </div>
        `).join("");
    }

    updateTotals();
}

function updateTotals() {
    const { subtotal, discount, total } = getTotals();

    document.getElementById("subtotal").textContent = rupiah(subtotal);
    document.getElementById("discountAmount").textContent = rupiah(discount);
    document.getElementById("total").textContent = rupiah(total);

    const cash = parseMoney(
        document.getElementById("cashReceived").value
    );

    document.getElementById("change").textContent =
        rupiah(Math.max(0, cash - total));
}

function makeReceipt() {
    const customer = document.getElementById("customerName").value.trim()
        || "Pelanggan";

    const { subtotal, discount, total } = getTotals();
    const cash = parseMoney(
        document.getElementById("cashReceived").value
    );

    const details = orders.map(item =>
        `${item.name}\n${item.qty} x ${rupiah(item.price)} = ${rupiah(item.qty * item.price)}`
    ).join("\n\n");

    return `
================================
       SALON CANTIKA
     STRUK PEMBAYARAN
================================
Tanggal: ${new Date().toLocaleString("id-ID")}
Pelanggan: ${customer}

--------------------------------
${details}
--------------------------------
Subtotal: ${rupiah(subtotal)}
Diskon: ${rupiah(discount)}
TOTAL: ${rupiah(total)}
Uang diterima: ${rupiah(cash)}
Kembalian: ${rupiah(cash - total)}
================================
       Terima kasih!
================================
`.trim();
}

document.getElementById("discount").addEventListener("input", updateTotals);
document.getElementById("cashReceived").addEventListener("input", updateTotals);

document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (orders.length === 0) {
        alert("Tambahkan layanan terlebih dahulu!");
        return;
    }

    const { total } = getTotals();
    const cash = parseMoney(
        document.getElementById("cashReceived").value
    );

    if (cash < total) {
        document.getElementById("paymentMessage").textContent =
            "Uang pembayaran masih kurang!";
        return;
    }

    lastReceipt = makeReceipt();

    document.getElementById("receiptEditor").value = lastReceipt;
    document.getElementById("receiptArea").hidden = false;
    document.getElementById("paymentMessage").textContent =
        "Pembayaran berhasil! Struk sudah dibuat.";

    document.getElementById("receiptMessage").textContent = "";
});

document.getElementById("viewReceiptBtn").addEventListener("click", () => {
    if (!lastReceipt) {
        alert("Belum ada struk pembayaran!");
        return;
    }

    document.getElementById("receiptEditor").value = lastReceipt;
    document.getElementById("receiptArea").hidden = false;
});

document.getElementById("saveReceiptBtn").addEventListener("click", () => {
    const edited = document.getElementById("receiptEditor").value.trim();

    if (!edited) {
        alert("Isi struk tidak boleh kosong!");
        return;
    }

    lastReceipt = edited;
    document.getElementById("receiptMessage").textContent =
        "Perubahan struk berhasil disimpan!";
});

document.getElementById("deleteReceiptBtn").addEventListener("click", () => {
    if (!lastReceipt) return;

    if (confirm("Yakin ingin menghapus struk ini?")) {
        lastReceipt = "";
        document.getElementById("receiptEditor").value = "";
        document.getElementById("receiptArea").hidden = true;
        document.getElementById("receiptMessage").textContent =
            "Struk berhasil dihapus.";
    }
});

document.getElementById("downloadReceiptBtn").addEventListener("click", () => {
    if (!lastReceipt) return;

    const blob = new Blob([lastReceipt], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "struk-salon.txt";
    link.click();

    URL.revokeObjectURL(url);
});

document.getElementById("resetBtn").addEventListener("click", () => {
    orders = [];
    document.getElementById("customerName").value = "";
    document.getElementById("discount").value = 0;
    document.getElementById("cashReceived").value = "";
    document.getElementById("paymentMessage").textContent = "";
    renderOrders();
});

renderServices();
renderOrders();