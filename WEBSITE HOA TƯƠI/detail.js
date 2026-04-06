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

  // Gắn Add to Cart cho trang chi tiết
  const addBtn = document.getElementById('addToCart');
  addBtn?.addEventListener('click', () => {
    const qty = Math.max(1, Number(document.getElementById('qty')?.value) || 1);

    // Ưu tiên dùng core từ app-core.js
    if (window.Shop?.addToCart) {
      window.Shop.addToCart(p, qty);
    } else {
      // Fallback: ghi trực tiếp vào localStorage (phòng khi chưa có app-core)
      let cart = [];
      try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { }
      const found = cart.find(i => Number(i.id) === Number(p.id));
      if (found) found.qty += qty;
      else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty });
      localStorage.setItem('cart', JSON.stringify(cart));
      const badge = document.getElementById('cartCount');
      if (badge) badge.textContent = String(cart.reduce((s, i) => s + (Number(i.qty) || 0), 0));
      (window.__toast ? __toast : alert)('Đã thêm vào giỏ hàng!');
    }
  });


  // // Add to cart (dùng format cart giống trang chủ)
  // const btnAdd = document.getElementById('btnAdd');
  // btnAdd.addEventListener('click', () => {
  //   const qty = Math.max(1, Number(document.getElementById('qty').value) || 1);
  //   let cart = [];
  //   try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { }
  //   const found = cart.find(i => Number(i.id) === Number(p.id));
  //   if (found) found.qty += qty;
  //   else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty });
  //   localStorage.setItem('cart', JSON.stringify(cart));
  //   // Cập nhật badge đơn giản:
  //   const badge = document.getElementById('cartCount');
  //   const c = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  //   if (badge) badge.textContent = c;
  //   alert('Đã thêm vào giỏ hàng!');
  // });

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



