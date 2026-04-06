/* ==== Utils chung ==== */
function vnd(x) { return (Number(x) || 0).toLocaleString('vi-VN') + '₫'; }
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) { alert(msg); return; }
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
}

/* ==== Auth ==== */
const AUTH_KEY = 'hcm-auth';
function getAuth() {
    const raw = localStorage.getItem(AUTH_KEY); if (!raw) return null;
    try {
        const o = JSON.parse(raw);
        if (o.exp && Date.now() > o.exp) { localStorage.removeItem(AUTH_KEY); return null; }
        return o;
    } catch { return null; }
}

/* ==== Cart (localStorage) ==== */
let CART = [];
try { CART = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { }

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(CART));
    updateCartBadge(); renderCart();
}
function updateCartBadge() {
    const c = CART.reduce((s, i) => s + (Number(i.qty) || 0), 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = String(c);
}
function renderCart() {
    const wrap = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    if (!wrap || !subtotalEl) return;
    wrap.innerHTML = ''; let sum = 0;
    CART.forEach(it => {
        sum += (Number(it.price) || 0) * (Number(it.qty) || 1);
        const row = el(`
      <div class="cart-item">
        <img src="${it.image}" alt="${it.name}"/>
        <div>
          <h5>${it.name}</h5>
          <div class="meta">${vnd(it.price)} × ${it.qty}</div>
          <div class="qty">
            <button class="dec">-</button>
            <input class="q" type="number" value="${it.qty}" min="1"/>
            <button class="inc">+</button>
          </div>
        </div>
        <div>
          <div><b>${vnd(it.price * it.qty)}</b></div>
          <button class="rm" style="margin-top:8px;border:none;background:none;color:#888;cursor:pointer">Xóa</button>
        </div>
      </div>
    `);
        row.querySelector('.dec').onclick = () => { it.qty = Math.max(1, (it.qty || 1) - 1); saveCart(); };
        row.querySelector('.inc').onclick = () => { it.qty = (it.qty || 1) + 1; saveCart(); };
        row.querySelector('.q').onchange = (e) => { it.qty = Math.max(1, Number(e.target.value) || 1); saveCart(); };
        row.querySelector('.rm').onclick = () => { CART = CART.filter(x => x.id !== it.id); saveCart(); };
        wrap.appendChild(row);
    });
    subtotalEl.textContent = vnd(sum);
}
updateCartBadge(); renderCart();

/* ==== Cart Drawer open/close ==== */
(function bindDrawer() {
    const openBtn = document.getElementById('cartBtn');
    const drawer = document.getElementById('cartDrawer');
    const closeBtn = document.getElementById('cartClose');
    const backdrop = document.getElementById('drawerBackdrop');
    if (!drawer) return;

    const open = () => { drawer.classList.add('open'); backdrop?.classList.add('show'); renderCart(); };
    const close = () => { drawer.classList.remove('open'); backdrop?.classList.remove('show'); };

    openBtn?.addEventListener('click', (e) => { e.preventDefault(); open(); });
    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);
})();

/* ==== Checkout Modal ==== */
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const closeCheckout = document.getElementById('closeCheckout');

function openCheckoutModalPrefill() {
    if (!checkoutModal) return;
    const auth = getAuth();
    if (auth && checkoutForm) {
        const f = checkoutForm.querySelectorAll('input,select,textarea');
        if (f[0] && !f[0].value) f[0].value = auth.name || '';
        if (f[1] && !f[1].value) f[1].value = auth.phone || '';
        if (f[2] && !f[2].value) f[2].value = auth.email || '';
    }
    // đóng drawer nếu đang mở
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    drawer?.classList.remove('open'); backdrop?.classList.remove('show');

    checkoutModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeCheckoutModal() {
    checkoutModal?.classList.remove('show');
    document.body.style.overflow = '';
}
closeCheckout?.addEventListener('click', closeCheckoutModal);
checkoutModal?.addEventListener('click', (e) => { if (e.target === checkoutModal) closeCheckoutModal(); });

/* Nút Thanh toán trong drawer */
(function bindCheckoutButton() {
    const btn = document.querySelector('.btn.checkout');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        let cart = []; try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { }
        if (!cart.length) { toast('Giỏ hàng đang trống!'); return; }

        const auth = getAuth();
        if (!auth) {
            const next = encodeURIComponent(location.pathname);
            location.href = `/dangnhap.html?next=${next}`;
            return;
        }
        openCheckoutModalPrefill();
    });
})();

/* Đặt hàng */
function genOrderId() {
    const d = new Date();
    const id = `HTSG-${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    return id;
}
function getOrders() { try { return JSON.parse(localStorage.getItem('orders')) || []; } catch { return []; } }
function setOrders(x) { localStorage.setItem('orders', JSON.stringify(x || [])); }

function resetCheckoutForm() {
    try {
        checkoutForm?.reset();
        const dt = checkoutForm?.querySelector('input[type="datetime-local"]'); if (dt) dt.value = '';
        const city = checkoutForm?.querySelector('select'); if (city) city.selectedIndex = 0;
    } catch { }
}
function clearCartAndUI() {
    CART = []; localStorage.removeItem('cart');
    document.getElementById('cartItems')?.replaceChildren();
    const st = document.getElementById('subtotal'); if (st) st.textContent = vnd(0);
    updateCartBadge();
}

placeOrderBtn?.addEventListener('click', () => {
    if (!checkoutForm?.checkValidity()) { checkoutForm?.reportValidity?.(); return; }

    let cart = []; try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { }
    if (!cart.length) { toast('Giỏ hàng trống, không thể đặt.'); return; }

    const f = checkoutForm.querySelectorAll('input,select,textarea');
    const customer = {
        name: f[0]?.value?.trim() || '',
        phone: f[1]?.value?.trim() || '',
        email: f[2]?.value?.trim() || '',
        address: f[3]?.value?.trim() || '',
        city: f[4]?.value || ''
    };
    const deliveryAt = f[5]?.value || '';
    const note = f[6]?.value?.trim() || '';

    const pay = document.querySelector('input[name="pay"]:checked');
    let method = (pay?.value || '').toUpperCase();
    if (!method) { const t = (pay?.nextSibling?.textContent || '').toLowerCase(); method = t.includes('chuyển') ? 'BANK' : 'COD'; }

    const subtotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
    const order = {
        orderId: genOrderId(),
        createdAt: new Date().toISOString(),
        items: cart,
        totals: { subtotal, shipping: 0, discount: 0, grandTotal: subtotal },
        customer,
        payment: { method, status: method === 'BANK' ? 'PENDING' : 'UNPAID' },
        note,
        delivery: { type: 'SHIP', deliveryAt, status: 'SCHEDULED' },
        status: 'NEW'
    };

    const orders = getOrders(); orders.unshift(order); setOrders(orders);
    clearCartAndUI(); closeCheckoutModal(); resetCheckoutForm();
    toast('Đặt hàng thành công! Mã đơn: ' + order.orderId);
});
