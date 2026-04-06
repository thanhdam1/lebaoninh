// danhmuc.js – trang liệt kê theo danh mục (?cat=...)
// Đọc productsCatalog từ localStorage (đã lưu ở trang chủ)

(function () {
  const grid = document.getElementById('grid');
  const chips = document.getElementById('chips');
  const sortSelect = document.getElementById('sortSelect');
  const qs = new URLSearchParams(location.search);
  const initialCat = qs.get('cat') || 'all';

  const CATS = {
    sinhnhat: { label: 'Hoa sinh nhật', icon: 'fa-cake-candles' },
    khaitruong: { label: 'Hoa khai trương', icon: 'fa-gift' },
    totnghiep: { label: 'Hoa tốt nghiệp', icon: 'fa-graduation-cap' },
    giohoa: { label: 'Giỏ hoa', icon: 'fa-basket-shopping' },
    gaubong: { label: 'Hoa gấu bông', icon: 'fa-heart' },
    hopmica: { label: 'Hộp hoa mica', icon: 'fa-gem' },
  };
  const CAT_ORDER = ['sinhnhat', 'khaitruong', 'totnghiep', 'giohoa', 'gaubong', 'hopmica'];

  function vnd(x) { return (Number(x) || 0).toLocaleString('vi-VN') + '₫'; }

  let products = [];
  try { products = JSON.parse(localStorage.getItem('productsCatalog') || '[]'); } catch { }
  if (!products.length) {
    products = [];
  }

  let currentFilter = initialCat;
  highlightChip(initialCat);
  updateBreadcrumb(initialCat);
  applySort();

  // events
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    currentFilter = b.dataset.filter;
    highlightChip(currentFilter);
    updateBreadcrumb(currentFilter);
    applySort();
    history.replaceState(null, '', location.pathname + (currentFilter === 'all' ? '' : `?cat=${currentFilter}`));
  });
  sortSelect.addEventListener('change', applySort);

  function highlightChip(c) {
    document.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x.dataset.filter === c));
  }

  function card(p) {
    const a = document.createElement('a');
    a.href = `./chitiet.html?id=${p.id}`;
    a.className = 'card';
    a.style.textDecoration = 'none';
    a.style.color = 'inherit';
    a.innerHTML = `
      <div class="thumb"><img src="${p.image}" alt="${p.name}"></div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="price"><span class="cur">${vnd(p.price)}</span></div>
      </div>
    `;
    return a;
  }

  function sectionTitle(key) {
    const meta = CATS[key] || { label: key, icon: 'fa-leaf' };
    return `
    <div class="cat-divider">
      <span class="label">
        <i class="fa-solid ${meta.icon}"></i>
        ${meta.label}
      </span>
    </div>
  `;
  }


  function applySort() {
    const v = sortSelect.value;
    const cmp = (a, b) => (v === 'priceAsc' ? a.price - b.price : v === 'priceDesc' ? b.price - a.price : 0);
    renderGrid(cmp);
  }

  function renderGrid(cmp) {
    grid.innerHTML = '';
    const listAll = [...products];

    if (currentFilter === 'all') {
      CAT_ORDER.forEach(cat => {
        const items = listAll.filter(p => p.cat === cat);
        if (!items.length) return;
        if (cmp) items.sort(cmp);
        grid.insertAdjacentHTML('beforeend', sectionTitle(cat));
        items.forEach(p => grid.appendChild(card(p)));
      });
    } else {
      const items = listAll.filter(p => p.cat === currentFilter);
      if (cmp) items.sort(cmp);
      grid.insertAdjacentHTML('beforeend', sectionTitle(currentFilter));
      items.forEach(p => grid.appendChild(card(p)));
    }
  }

  function updateBreadcrumb(cat) {
    const bc = document.getElementById('bc');
    const label = ({
      all: 'Tất cả',
      sinhnhat: 'Hoa sinh nhật', khaitruong: 'Hoa khai trương', totnghiep: 'Hoa tốt nghiệp',
      giohoa: 'Giỏ hoa', gaubong: 'Hoa gấu bông', hopmica: 'Hộp hoa mica'
    }[cat] || cat);
    bc.innerHTML = `Trang chủ / Danh mục / <b>${label}</b>`;
  }
})();
