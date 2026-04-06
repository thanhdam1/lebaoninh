/* =========================
   app-core.js (ONE FILE)
   - Auth (header, lưu/đọc auth)
   - Toast
   - Cart + Drawer + Checkout Modal
   - Public API: window.Auth, window.Shop
   ========================= */
/* === TELEGRAM CONFIG (đặt thật sớm) === */
window.TELEGRAM = {
    enabled: true,
    botToken: '8384185910:AAHqCssUs7_cQxTCh7KwgTj-wN6F-L3TT8g', // token thật của bạn
    chatId: '6343618094'                                        // chat_id bạn lấy từ getUpdates
};

/* ---------- Toast (dùng chung) ---------- */
(function (win, doc) {
    function toast(msg) {
        const t = doc.getElementById('toast');
        if (!t) { alert(msg); return; }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 1800);
    }
    win.__toast = toast;
})(window, document);


/* ---------- AUTH CORE ---------- */
(function (win, doc) {
    const AUTH_KEY = 'hcm-auth';

    function getAuth() {
        const raw = localStorage.getItem(AUTH_KEY);
        if (!raw) return null;
        try {
            const obj = JSON.parse(raw);
            // exp phải là mili-giây
            if (obj.exp && Date.now() > Number(obj.exp)) {
                localStorage.removeItem(AUTH_KEY);
                return null;
            }
            return obj;
        } catch {
            return null;
        }
    }

    function setAuth(payload, ttlMs) {
        const exp = Date.now() + (Number(ttlMs) || 0);
        const obj = { ...(payload || {}), exp };
        localStorage.setItem(AUTH_KEY, JSON.stringify(obj));
        hydrateHeader(); // cập nhật UI ngay
    }

    function clearAuth() {
        localStorage.removeItem(AUTH_KEY);
    }

    function hydrateHeader() {
        const loginBtn = doc.querySelector('.btn-login');
        if (!loginBtn) return;

        const auth = getAuth();

        // Đã đăng nhập -> thay nút bằng user-menu
        if (auth) {
            const initials = (auth.name || 'KH').trim().split(/\s+/)
                .map(p => p[0]).slice(-2).join('').toUpperCase();
            const wrap = doc.createElement('div');
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

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = dd.classList.toggle('open');
                btn.setAttribute('aria-expanded', open);
            });
            doc.addEventListener('click', (e) => {
                if (!wrap.contains(e.target)) { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
            });
            doc.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
            });
            lo.addEventListener('click', () => { clearAuth(); location.reload(); });
        } else {
            // Chưa đăng nhập -> giữ nguyên nút. KHÔNG gắn logic "bắt checkout" ở đây
            // (để Shop xử lý trong 1 nơi duy nhất)
        }
    }

    // chạy khi DOM sẵn sàng
    if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', hydrateHeader);
    } else {
        hydrateHeader();
    }

    // đồng bộ giữa các tab
    win.addEventListener('storage', (e) => { if (e.key === AUTH_KEY) location.reload(); });

    // expose
    win.Auth = { getAuth, setAuth, clearAuth, hydrateHeader };
})(window, document);


/* ---------- SHOP CORE (Cart + Drawer + Checkout) ---------- */
(function (win, doc) {
    const LS_CART = 'cart';
    const LS_ORDERS = 'orders';

    // helpers
    const $ = (sel, root = doc) => root.querySelector(sel);
    const el = (html) => { const d = doc.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
    const vnd = (x) => (Number(x) || 0).toLocaleString('vi-VN') + '₫';
    const toast = (msg) => win.__toast ? win.__toast(msg) : alert(msg);

    // CART state
    let CART = [];
    try { CART = JSON.parse(localStorage.getItem(LS_CART) || '[]'); } catch { CART = []; }

    function saveCart() {
        localStorage.setItem(LS_CART, JSON.stringify(CART));
        updateBadge();
        renderCart();
    }

    function updateBadge() {
        const badge = $('#cartCount');
        if (!badge) return;
        const c = CART.reduce((s, i) => s + (Number(i.qty) || 0), 0);
        badge.textContent = String(c);
    }

    function addToCart(item, qty = 1) {
        const id = Number(item.id);
        const found = CART.find(x => Number(x.id) === id);
        if (found) found.qty += (Number(qty) || 1);
        else CART.push({ id, name: item.name, price: Number(item.price) || 0, image: item.image || '', qty: Number(qty) || 1 });
        toast('Đã thêm vào giỏ hàng!');
        saveCart();
    }

    // Drawer
    const drawer = $('#cartDrawer');
    const drawerBackdrop = $('#drawerBackdrop');
    const cartBtn = $('#cartBtn');
    const cartClose = $('#cartClose');
    const cartItemsWrap = $('#cartItems');
    const subtotalEl = $('#subtotal');


    // === đặt trong IIFE SHOP CORE, ngay dưới khai báo LS_CART/LS_ORDERS ===
    function loadCartFromLS() {
        try { CART = JSON.parse(localStorage.getItem(LS_CART) || '[]'); }
        catch { CART = []; }
    }

    const _setItem = localStorage.setItem;
    localStorage.setItem = function (k, v) {
        _setItem.apply(this, arguments);         // gọi bản gốc
        if (k === LS_CART) {                     // có ai vừa ghi giỏ hàng
            loadCartFromLS();                      // đồng bộ state
            updateBadge();                         // cập nhật badge UI
            // (tuỳ chọn) nếu đang mở drawer, render lại
            try { renderCart && renderCart(); } catch { }
        }
    };

    function syncCartBadgeAndUI() {
        loadCartFromLS();
        updateBadge();
    }


    function openDrawer() {
        if (!drawer) return;
        syncCartBadgeAndUI()

            ; drawer.classList.add('open'); drawerBackdrop?.classList.add('show'); renderCart();
    }
    function closeDrawer() { if (!drawer) return; drawer.classList.remove('open'); drawerBackdrop?.classList.remove('show'); }

    cartBtn?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
    cartClose?.addEventListener('click', closeDrawer);
    drawerBackdrop?.addEventListener('click', closeDrawer);

    function renderCart() {
        if (!cartItemsWrap || !subtotalEl) return;
        cartItemsWrap.innerHTML = '';
        let sum = 0;

        CART.forEach(it => {
            const qty = Number(it.qty) || 1;
            const price = Number(it.price) || 0;
            sum += price * qty;

            const row = el(`
        <div class="cart-item">
          <img src="${it.image || ''}" alt="${(it.name || '').replace(/"/g, '&quot;')}"/>
          <div>
            <h5>${it.name || ''}</h5>
            <div class="meta">${vnd(price)} × ${qty}</div>
            <div class="qty">
              <button class="dec" aria-label="Giảm">-</button>
              <input class="q" type="number" value="${qty}" min="1"/>
              <button class="inc" aria-label="Tăng">+</button>
            </div>
          </div>
          <div>
            <div><b>${vnd(price * qty)}</b></div>
            <button class="rm" style="margin-top:8px;border:none;background:none;color:#888;cursor:pointer">Xóa</button>
          </div>
        </div>
      `);

            row.querySelector('.dec').onclick = () => { it.qty = Math.max(1, qty - 1); saveCart(); };
            row.querySelector('.inc').onclick = () => { it.qty = qty + 1; saveCart(); };
            row.querySelector('.q').onchange = (e) => { it.qty = Math.max(1, Number(e.target.value) || 1); saveCart(); };
            row.querySelector('.rm').onclick = () => { CART = CART.filter(x => Number(x.id) !== Number(it.id)); saveCart(); };

            cartItemsWrap.appendChild(row);
        });

        subtotalEl.textContent = vnd(sum);
    }

    // init badge + drawer content
    updateBadge(); renderCart();

    // Checkout modal
    const checkoutModal = $('#checkoutModal');
    const checkoutForm = $('#checkoutForm');
    const placeOrderBtn = $('#placeOrderBtn');
    const closeCheckout = $('#closeCheckout');

    function openCheckoutModalPrefill() {
        if (!checkoutModal) return;
        const auth = (win.Auth && typeof win.Auth.getAuth === 'function') ? win.Auth.getAuth() : null;
        if (auth && checkoutForm) {
            const f = checkoutForm.querySelectorAll('input,select,textarea');
            if (f[0] && !f[0].value) f[0].value = auth.name || '';
            if (f[1] && !f[1].value) f[1].value = auth.phone || '';
            if (f[2] && !f[2].value) f[2].value = auth.email || '';
        }
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

    // Nút "Thanh toán" (trong drawer)
    (function bindCheckoutBtn() {
        const btn = doc.querySelector('.btn.checkout');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!CART.length) { toast('Giỏ hàng đang trống!'); return; }
            const auth = (win.Auth && typeof win.Auth.getAuth === 'function') ? win.Auth.getAuth() : null;

            if (!auth) {
                const next = encodeURIComponent(location.pathname + location.search);
                location.href = `/dangnhap.html`;
                return;
            }
            openCheckoutModalPrefill();
        });
    })();

    // Helpers order
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
        CART = [];
        localStorage.removeItem(LS_CART);
        $('#cartItems')?.replaceChildren();
        if ($('#subtotal')) $('#subtotal').textContent = vnd(0);
        updateBadge();
        closeDrawer();
    }

    placeOrderBtn?.addEventListener('click', () => {
        if (!checkoutForm?.checkValidity()) { checkoutForm?.reportValidity?.(); return; }
        loadCartFromLS();
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

        const orders = getOrders();
        orders.unshift(order);
        setOrders(orders);

        // ➜ Gửi Telegram
        sendOrderToTelegram(order);

        clearCartAndUI();
        closeCheckoutModal();
        resetCheckoutForm();
        toast('Đặt hàng thành công! Mã đơn: ' + order.orderId);

        // hook cho trang khác nếu cần
        (Shop._onPlaced || []).forEach(fn => { try { fn(order); } catch { } });
    });

    // expose
    const Shop = win.Shop || {};
    Shop.addToCart = addToCart;
    Shop.openCart = openDrawer;
    Shop.closeCart = closeDrawer;
    Shop.getCart = () => JSON.parse(JSON.stringify(CART));
    Shop.onOrderPlaced = (fn) => { (Shop._onPlaced = Shop._onPlaced || []).push(fn); };
    Shop.utils = { vnd, toast };
    win.Shop = Shop;

})(window, document);


// LOOOOOOOOO

try {
    const ATTEMPT_KEY = 'hcm-attempts';
    function clearAttempts() { localStorage.removeItem(ATTEMPT_KEY); }
    // Nếu block này không cần, comment 3 dòng trên và 4 dòng dưới
    clearAttempts();
    const btn = document.getElementById('submitBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang xử lý…'; }
} catch (e) { /* ignore */ }

// // --- open redirect safe
// function safeNext() {
//     const raw = new URLSearchParams(location.search).get('next');
//     try {
//         if (!raw) return '/trangchu.html';
//         const url = new URL(raw, location.origin);
//         if (url.origin !== location.origin) return '/trangchu.html';
//         return url.pathname + url.search + url.hash;
//     } catch { return '/trangchu.html'; }
// }

// // --- attempts
// function clearAttempts() { localStorage.removeItem(ATTEMPT_KEY); }

// // --- sau khi passOK === true:
// clearAttempts();
// const btn = document.getElementById('submitBtn');
// if (btn) { btn.disabled = true; btn.textContent = 'Đang xử lý…'; }

// // nếu đã có app-core.js:
// if (window.Auth && typeof Auth.setAuth === 'function') {
//     Auth.setAuth(
//         { uid: user.email || user.phone, name: user.name || 'Khách', email: user.email, phone: user.phone },
//         30 * 24 * 60 * 60 * 1000
//     );
// } else {
//     // fallback cũ của bạn:
//     setAuth({ uid: user.email || user.phone, name: user.name || 'Khách', loginAt: Date.now(), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
// }

// // nhớ/không nhớ identifier
// const remember = document.getElementById('remember')?.checked;
// if (remember) {
//     const idVal = idInput.value.includes('@') ? idInput.value.trim() : normalizePhone(idInput.value);
//     localStorage.setItem('hcm-flower-remember', idVal);
// } else {
//     localStorage.removeItem('hcm-flower-remember');
// }

// // toast + chuyển trang
// toast?.classList.add('show');
// setTimeout(() => { location.href = safeNext(); }, 900);













// detail.js – render trang chi tiết dựa trên ?id=...
// Yêu cầu: trang chủ nên lưu 'productsCatalog' và 'lastProduct' vào localStorage.
// (Đã kèm patch bên dưới để bạn thêm vào script.js của trang chủ.)

(function () {
    const vnd = (x) => (Number(x) || 0).toLocaleString('vi-VN') + '₫';
    const qs = new URLSearchParams(location.search);
    const id = Number(qs.get('id'));

    // Lấy catalog
    let catalog = [];
    try { catalog = JSON.parse(localStorage.getItem('productsCatalog') || '[]'); } catch { }
    // Nếu không có catalog, vẫn cố đọc lastProduct để hiển thị tối thiểu
    let p = null;
    if (id && catalog?.length) p = catalog.find(x => Number(x.id) === id) || null;
    if (!p) {
        try { p = JSON.parse(localStorage.getItem('lastProduct') || 'null'); } catch { }
    }
    if (!p) {
        document.getElementById('pName').textContent = 'Không tìm thấy sản phẩm';
        return;
    }

    // Render
    document.title = p.name + ' | Hoa Tươi Sài Gòn';
    const bc = document.getElementById('bc');
    bc.innerHTML = `Danh mục / Hoa ${labelCat(p.cat)} / <b>${p.name}</b>`;

    const img = document.getElementById('pImg');
    img.src = p.image; img.alt = p.name;
    document.getElementById('pName').textContent = p.name;
    document.getElementById('pCur').textContent = vnd(p.price);
    document.getElementById('pOld').textContent = p.old ? vnd(p.old) : '';



    // Sản phẩm liên quan (cùng danh mục)
    const relGrid = document.getElementById('relGrid');
    const related = (catalog || []).filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 8);
    related.forEach(r => {
        const card = document.createElement('a');
        card.href = `./chitiet.html?id=${r.id}`;
        card.className = 'card';
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';
        card.style.display = 'block';
        card.innerHTML = `
      <div class="thumb"><img src="${r.image}" alt="${r.name}"></div>
      <div class="body"><h3>${r.name}</h3><div class="price"><span class="cur">${vnd(r.price)}</span></div></div>
    `;
        relGrid.appendChild(card);
    });

    function labelCat(c) {
        return ({
            sinhnhat: 'sinh nhật', khaitruong: 'khai trương', totnghiep: 'tốt nghiệp',
            giohoa: 'giỏ hoa', gaubong: 'gấu bông', hopmica: 'hộp mica'
        }[c] || c);
    }
})();



// escape an toàn khi dùng parse_mode HTML
function esc(s) { return (s == null ? '' : String(s)).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function sendOrderToTelegram(order) {
    if (!TELEGRAM.enabled || !TELEGRAM.botToken || !TELEGRAM.chatId) return;

    const time = new Date(order.createdAt).toLocaleString('vi-VN');
    const items = order.items.map(i => `• ${i.name} × ${i.qty} — ${(i.price || 0).toLocaleString('vi-VN')}₫`).join('\n');

    const text = [
        '🛍 <b>ĐƠN HÀNG MỚI</b>',
        `🧾 Mã: <code>${order.orderId}</code>`,
        `⏰ Lúc: ${time}`,
        `👤 KH: ${order.customer.name} – ${order.customer.phone}`,
        order.customer.email ? `✉️ ${order.customer.email}` : '',
        (order.customer.address || order.customer.city) ? `📍 ${order.customer.address || ''}${order.customer.city ? ', ' + order.customer.city : ''}` : '',
        `💳 Thanh toán: ${order.payment.method} (${order.payment.status})`,
        `🚚 Giao: ${order.delivery.deliveryAt || '—'}`,
        order.note ? `📝 Ghi chú: ${order.note}` : '',
        '',
        '🧺 Sản phẩm:',
        items,
        '',
        `🔶 Tổng: <b>${(order.totals.grandTotal || 0).toLocaleString('vi-VN')}₫</b>`
    ].filter(Boolean).join('\n');

    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM.chatId, text, parse_mode: 'HTML' })
        });

        const data = await res.json();
        if (!data.ok) {
            console.warn('Telegram error:', data);
            // Fallback GET (phòng khi POST bị chặn bởi extension):
            const url = `https://api.telegram.org/bot${TELEGRAM.botToken}/sendMessage?chat_id=${encodeURIComponent(TELEGRAM.chatId)}&parse_mode=HTML&text=${encodeURIComponent(text)}`;
            const res2 = await fetch(url);
            const data2 = await res2.json();
            if (!data2.ok) console.warn('Telegram GET fallback error:', data2);
        }
    } catch (e) {
        console.warn('Không gửi được Telegram:', e);
    }
}



