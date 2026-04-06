/* ==== Auth helpers (dùng chung) ==== */
const AUTH_KEY = 'hcm-auth';

function getAuth() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw);
        if (obj.exp && Date.now() > obj.exp) {
            localStorage.removeItem(AUTH_KEY);
            return null;
        }
        return obj;
    } catch { return null; }
}

function clearAuth() { localStorage.removeItem(AUTH_KEY); }

/* ==== Gắn UI header theo trạng thái đăng nhập ==== */
function hydrateHeader() {
    const auth = getAuth();
    const loginBtn = document.querySelector('.btn-login');
    if (!loginBtn) return;                 // không có nút thì bỏ qua

    // Đã đăng nhập → thay thành menu user
    if (auth) {
        const initials = (auth.name || 'KH').trim().split(/\s+/).map(p => p[0]).slice(-2).join('').toUpperCase();
        const wrap = document.createElement('div');
        wrap.className = 'user-menu';
        wrap.innerHTML = `
      <button class="user-btn" id="userMenuBtn" type="button" aria-haspopup="true" aria-expanded="false">
        <span class="user-avatar">${initials}</span>
        <span class="user-name">${auth.name || 'Khách hàng'}</span>
        <i class="fa-solid fa-caret-down user-caret" aria-hidden="true"></i>
      </button>
      <div class="user-dropdown" id="userDropdown" role="menu" aria-label="Tài khoản">
        <a href="/qldonhang.html" class="user-item">Đơn hàng của tôi</a>
        <a href="/taikhoan.html" class="user-item">Tài khoản</a>
        <hr class="user-divider">
        <button id="logoutBtn" class="user-logout" type="button">Đăng xuất</button>
      </div>
    `;
        loginBtn.replaceWith(wrap);

        const btn = wrap.querySelector('#userMenuBtn');
        const dd = wrap.querySelector('#userDropdown');
        const lo = wrap.querySelector('#logoutBtn');
        btn.addEventListener('click', (e) => { e.stopPropagation(); const open = dd.classList.toggle('open'); btn.setAttribute('aria-expanded', open); });
        document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
        lo.addEventListener('click', () => { clearAuth(); location.reload(); });
    } else {
        // Chưa đăng nhập → giữ nguyên nút và bắt chuyển hướng khi bấm “Thanh toán”
        const checkoutBtn = document.querySelector('.btn.checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const next = encodeURIComponent(location.pathname);
                location.href = `/dangnhap.html?next=${next}`;
            });
        }
    }
}

/* chạy khi DOM sẵn sàng (defer đã đảm bảo) */
document.addEventListener('DOMContentLoaded', hydrateHeader);

/* đồng bộ trạng thái login giữa các tab/trang */
window.addEventListener('storage', (e) => {
    if (e.key === AUTH_KEY) location.reload();
});


/* ============================ *
 *   SHOP CORE – dùng chung     *
 *   Giỏ hàng + Drawer + Checkout
 * ============================ */
(function (win, doc) {
    // ---- Utils ----
    const LS_CART = 'cart';
    const LS_ORDERS = 'orders';

    const $ = (sel, root = doc) => root.querySelector(sel);
    const $$ = (sel, root = doc) => Array.from(root.querySelectorAll(sel));
    const el = (html) => { const d = doc.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
    const vnd = (x) => (Number(x) || 0).toLocaleString('vi-VN') + '₫';
    const toast = (msg) => {
        const t = $('#toast'); if (!t) { alert(msg); return; }
        t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1800);
    };

    // ---- Auth (tận dụng nếu bạn có auth-core.js) ----
    const getAuth = () => {
        // Dùng window.Auth.getAuth nếu có; nếu không, coi như chưa login
        try { return win.Auth && typeof win.Auth.getAuth === 'function' ? win.Auth.getAuth() : null; }
        catch { return null; }
    };

    // ---- CART state ----
    let CART = [];
    try { CART = JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch { }

    const saveCart = () => {
        localStorage.setItem(LS_CART, JSON.stringify(CART));
        updateBadge(); renderCart();
    };
    const updateBadge = () => {
        const badge = $('#cartCount'); if (!badge) return;
        const c = CART.reduce((s, i) => s + (Number(i.qty) || 0), 0);
        badge.textContent = String(c);
    };

    // Public API để trang khác gọi thêm vào giỏ
    function addToCart(item, qty = 1) {
        const id = Number(item.id);
        const found = CART.find(x => Number(x.id) === id);
        if (found) found.qty += (Number(qty) || 1);
        else CART.push({ id, name: item.name, price: Number(item.price) || 0, image: item.image || '', qty: Number(qty) || 1 });
        toast('Đã thêm vào giỏ hàng!');
        saveCart();
    }

    // ---- Drawer binding ----
    const drawer = $('#cartDrawer');
    const drawerBackdrop = $('#drawerBackdrop');
    const cartBtn = $('#cartBtn');
    const cartClose = $('#cartClose');
    const cartItemsWrap = $('#cartItems');
    const subtotalEl = $('#subtotal');

    const openDrawer = () => { if (!drawer) return; drawer.classList.add('open'); drawerBackdrop?.classList.add('show'); renderCart(); };
    const closeDrawer = () => { if (!drawer) return; drawer.classList.remove('open'); drawerBackdrop?.classList.remove('show'); };
    cartBtn?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
    cartClose?.addEventListener('click', closeDrawer);
    drawerBackdrop?.addEventListener('click', closeDrawer);

    function renderCart() {
        if (!cartItemsWrap || !subtotalEl) return;
        cartItemsWrap.innerHTML = ''; let sum = 0;
        CART.forEach(it => {
            sum += (Number(it.price) || 0) * (Number(it.qty) || 1);
            const row = el(`
        <div class="cart-item">
          <img src="${it.image || ''}" alt="${it.name || ''}"/>
          <div>
            <h5>${it.name || ''}</h5>
            <div class="meta">${vnd(it.price)} × ${it.qty}</div>
            <div class="qty">
              <button class="dec" aria-label="Giảm">-</button>
              <input class="q" type="number" value="${it.qty}" min="1"/>
              <button class="inc" aria-label="Tăng">+</button>
            </div>
          </div>
          <div>
            <div><b>${vnd((Number(it.price) || 0) * (Number(it.qty) || 1))}</b></div>
            <button class="rm" style="margin-top:8px;border:none;background:none;color:#888;cursor:pointer">Xóa</button>
          </div>
        </div>
      `);
            row.querySelector('.dec').onclick = () => { it.qty = Math.max(1, (Number(it.qty) || 1) - 1); saveCart(); };
            row.querySelector('.inc').onclick = () => { it.qty = (Number(it.qty) || 1) + 1; saveCart(); };
            row.querySelector('.q').onchange = (e) => { it.qty = Math.max(1, Number(e.target.value) || 1); saveCart(); };
            row.querySelector('.rm').onclick = () => { CART = CART.filter(x => Number(x.id) !== Number(it.id)); saveCart(); };
            cartItemsWrap.appendChild(row);
        });
        subtotalEl.textContent = vnd(sum);
    }
    updateBadge(); renderCart();

    // ---- Checkout modal ----
    const checkoutModal = $('#checkoutModal');
    const checkoutForm = $('#checkoutForm');
    const placeOrderBtn = $('#placeOrderBtn');
    const closeCheckout = $('#closeCheckout');

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
        closeDrawer();
        checkoutModal.classList.add('show');
        doc.body.style.overflow = 'hidden';
    }
    function closeCheckoutModal() {
        checkoutModal?.classList.remove('show');
        doc.body.style.overflow = '';
    }
    closeCheckout?.addEventListener('click', closeCheckoutModal);
    checkoutModal?.addEventListener('click', (e) => { if (e.target === checkoutModal) closeCheckoutModal(); });

    // Nút thanh toán trong drawer
    (function bindCheckoutBtn() {
        const btn = doc.querySelector('.btn.checkout'); if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!CART.length) { toast('Giỏ hàng đang trống!'); return; }
            const auth = getAuth();
            if (!auth) {
                // chuyển tới trang đăng nhập, quay lại trang hiện tại
                const next = encodeURIComponent(location.pathname);
                location.href = `/dangnhap.html?next=${next}`;
                return;
            }
            openCheckoutModalPrefill();
        });
    })();

    // Helpers đơn hàng
    const getOrders = () => { try { return JSON.parse(localStorage.getItem(LS_ORDERS) || '[]'); } catch { return []; } };
    const setOrders = (list) => localStorage.setItem(LS_ORDERS, JSON.stringify(list || []));
    const genOrderId = () => {
        const d = new Date();
        return `HTSG-${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    };
    function resetCheckoutForm() {
        try {
            checkoutForm?.reset();
            checkoutForm?.querySelector('input[type="datetime-local"]')?.setAttribute('value', '');
            const city = checkoutForm?.querySelector('select'); if (city) city.selectedIndex = 0;
        } catch { }
    }
    function clearCartAndUI() {
        CART = []; localStorage.removeItem(LS_CART);
        $('#cartItems')?.replaceChildren();
        $('#subtotal') && ($('#subtotal').textContent = vnd(0));
        updateBadge();
        closeDrawer();
    }

    placeOrderBtn?.addEventListener('click', () => {
        if (!checkoutForm?.checkValidity()) { checkoutForm?.reportValidity?.(); return; }
        if (!CART.length) { toast('Giỏ hàng trống, không thể đặt.'); return; }

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

        const payEl = doc.querySelector('input[name="pay"]:checked');
        let method = (payEl?.value || '').toUpperCase();
        if (!method) { const t = (payEl?.nextSibling?.textContent || '').toLowerCase(); method = t.includes('chuyển') ? 'BANK' : 'COD'; }

        const subtotal = CART.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
        const order = {
            orderId: genOrderId(),
            createdAt: new Date().toISOString(),
            items: CART,
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
        // hook cho trang khác nếu muốn theo dõi sự kiện
        (Shop._onPlaced || []).forEach(fn => { try { fn(order); } catch { } });
    });

    // ---- Expose API ----
    const Shop = win.Shop || {};
    Shop.addToCart = addToCart;
    Shop.openCart = openDrawer;
    Shop.closeCart = closeDrawer;
    Shop.getCart = () => JSON.parse(JSON.stringify(CART));
    Shop.onOrderPlaced = (fn) => { (Shop._onPlaced = Shop._onPlaced || []).push(fn); };
    Shop.utils = { vnd, toast };
    win.Shop = Shop;

})(window, document);


grid.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.view');
    const addBtn = e.target.closest('.addBtn');
    const cardEl = e.target.closest('.card');
    if (!cardEl) return;
    const pid = +cardEl.dataset.id;
    const p = products.find(x => x.id === pid);
    if (viewBtn) { openDetail(p); }
    if (addBtn) { addToCart(p, 1); }
    if (!viewBtn && !addBtn) { /* click body -> open detail */ if (e.target.closest('.thumb') || e.target.closest('.body')) openDetail(p); }
});