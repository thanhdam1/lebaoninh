// ------- Slider --------
const slides = document.querySelector('.slides');
const dotsWrap = document.getElementById('sliderDots');
const imgs = document.querySelectorAll('.slides img');
let i = 0;
imgs.forEach((_, idx) => {
  const b = document.createElement('button');
  b.addEventListener('click', () => go(idx));
  dotsWrap.appendChild(b);
});
const dots = dotsWrap.querySelectorAll('button');
function renderSlide() { slides.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, idx) => d.classList.toggle('active', idx === i)); }
function go(n) { i = (n + imgs.length) % imgs.length; renderSlide(); }
let timer = setInterval(() => go(i + 1), 5000);
document.getElementById('slider').addEventListener('mouseenter', () => clearInterval(timer));
document.getElementById('slider').addEventListener('mouseleave', () => timer = setInterval(() => go(i + 1), 5000));
renderSlide();

// ---- Danh mục hiển thị & icon ----
const CATS = {
  sinhnhat: { label: 'Hoa sinh nhật', icon: 'fa-cake-candles' },
  khaitruong: { label: 'Hoa khai trương', icon: 'fa-gift' },
  totnghiep: { label: 'Hoa tốt nghiệp', icon: 'fa-graduation-cap' },
  giohoa: { label: 'Giỏ hoa', icon: 'fa-basket-shopping' },
  gaubong: { label: 'Hoa gấu bông', icon: 'fa-heart' },        // hoặc fa-paw
  hopmica: { label: 'Hộp hoa mica', icon: 'fa-gem' }
};
// Thứ tự render trên trang chủ:
const CAT_ORDER = ['sinhnhat', 'khaitruong', 'totnghiep', 'giohoa', 'gaubong', 'hopmica'];
// ------- Products data (with provided images) --------
const products = [
  // Giữ nguyên 10 sp sinh nhật của bạn (đã có ảnh thật)
  { id: 101, name: 'Bó Hoa Sinh Nhật Rose Pastel Tweedia', price: 890000, old: 960000, cat: 'sinhnhat', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2025/07/Bo-Hoa-Sinh-Nhat-Rose-Pastel-Lamtinh-3.webp' },
  { id: 102, name: 'Bó Hoa Hồng Sophie LoveHeart', price: 980000, old: 1050000, cat: 'sinhnhat', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2025/09/Bo-Hoa-Hong-Sophie-LoveHeart-2-png.webp' },
  { id: 103, name: 'Hoa bó Cẩm Tú Cầu', price: 920000, cat: 'sinhnhat', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2024/12/Hoa-Bo-Cam-Tu-Cau-Sweetheart-Hydrangeas-jpg.webp' },
  { id: 104, name: 'Bó Hoa Đồng Tiền Hồng Kem Dâu Baby', price: 760000, cat: 'sinhnhat', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2025/06/Bo-Hoa-Dong-Tien-Kem-Dau-Baby.webp' },
  { id: 105, name: 'Bó Hoa Sen Hàn Quốc', price: 1150000, cat: 'sinhnhat', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2025/03/z6403949272039_5f641666bc203eb0b8fbd2903cf6847f.webp' },
  { id: 106, name: 'Bó Hoa Cúc Mẫu Đơn Xanh Đằm Thắm', price: 990000, cat: 'sinhnhat', image: 'https://order.vuonhoatuoi.vn/wp-content/uploads/2025/04/z6015237411969_fbb633eca012db3c888774c609938137-jpg.webp' },
  { id: 107, name: 'Bó Hoa Hồng Sinh Nhật Xanh BlueBaby', price: 930000, cat: 'sinhnhat', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2024/09/z5817968056297_8fce44b8236409aabb6401ba192870ff-jpg.webp' },
  { id: 108, name: 'Lẵng Hoa Hồng Vàng Vũ Nữ Chân Tình', price: 1450000, cat: 'sinhnhat', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2022/07/La%CC%86%CC%83ng-hoa-ho%CC%82%CC%80ng-va%CC%80ng-vu%CC%83-nu%CC%9B%CC%83.webp' },
  { id: 109, name: 'Bó Hoa Dâu Tươi', price: 880000, cat: 'sinhnhat', image: 'https://alohoatuoi.com.vn/wp-content/uploads/2021/03/hoa-dau-tay-CT07-700.jpg' },
  { id: 110, name: 'Bó Hoa Trái Cây Tươi', price: 990000, cat: 'sinhnhat', image: 'https://alohoatuoi.com.vn/wp-content/uploads/2021/03/hoa-dau-tay-CT03-1200.jpg' },
];

// ===== Khai trương (12 sp) =====
const khaitruong = [
  { name: 'Tài Lộc Đại Cát', image: 'https://hoatuoishop.com/wp-content/uploads/2024/12/hoa-khai-truong-gia-re-10.jpg' },
  { name: 'Tài Cát Thịnh Vượng', image: 'https://hoatuoishop.com/wp-content/uploads/2023/11/hoa-khai-truong-quan-phu-nhuan-111.jpg' },
  { name: 'Vững Niềm Tin', image: 'https://hoatuoishop.com/wp-content/uploads/2019/05/hoachucmung1tang-400x500.jpg' },
  { name: 'Hoa Khai Trương SG050', image: 'https://tiemhoatigon.com/wp-content/uploads/hoa-khai-truong-kt050-247x296.webp' },
  { name: 'Hoa Chúc Mừng Sang Trọng', image: 'https://tramhoa.com/wp-content/uploads/2024/04/ke-hoa-khai-truong-kt056-sang-trong.jpg' },
  { name: 'Khai Trương Phát Đạt', image: 'https://hoatuoidatviet.vn/upload/sanpham/ke-hoa-mung-khai-truong-phat-dat-87450420_600x667.jpeg' },
  { name: 'Khai Trương Hồng Phát', image: 'https://shophoatuoi.saigonhoa.com/wp-content/uploads/2022/11/ke-hoa-khai-truong-hong-phat-1.jpg' },
  { name: 'Thuận Buồm Xuôi Gió', image: 'https://shophoatuoi68.com/upload/sanpham/z5058863190691be44eb36d75e284145b1f81c7a41032f-2183.jpg' },
  { name: 'Khai Trương Thành Công', image: 'https://hoathanhnha.com/wp-content/uploads/Hoa-Khai-Truong-KT001.webp' },
  { name: 'Phát Tài, Phát Lộc SG001', image: 'https://saigonhoa.com/wp-content/uploads/2020/06/phat-loc-cam-binh.jpg' },
  { name: 'Phát Tài, Phát Lộc SG002', image: 'https://hoacuatroi.vn/wp-content/uploads/2021/03/hoa-lan-ho-diep-22.jpg' },
  { name: 'Phát Đạt 1098', image: 'https://hoacuatroi.vn/wp-content/uploads/2021/07/hkt-1.jpg' },
].map((it, idx) => ({
  id: 200 + idx,
  name: it.name,
  price: 1500000 + idx * 20000,
  cat: 'khaitruong',
  image: it.image,
}));

// ===== Tốt nghiệp (15 sp) =====
const totnghiep = [
  { name: 'Vững Tin 001', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyNOwRYRiztXShd1HB0nzf33hlegmeKEstGQ&s' },
  { name: 'Vững Tin 002', image: 'https://shophoasunny.vn/wp-content/uploads/2024/07/Thiet-ke-chua-co-ten-9-3.png' },
  { name: 'Hạnh Phúc Trào Dâng', image: 'https://hoatuoishop.com/wp-content/uploads/2019/05/hoadepqa-min.jpg' },
  { name: 'Hoa Hướng Dương Tốt Nghiệp', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2023/01/23.webp' },
  { name: 'Thành Danh Vươn Xa SG811', image: 'https://dienhoasaigon.com.vn/wp-content/uploads/2024/09/k16-300x400.jpg' },
  { name: 'Tốt Nghiệp SG017', image: 'https://7fgarden.com/wp-content/uploads/2024/12/hoa-tot-nghiep-979x1024.webp' },
  { name: 'Tốt Nghiệp SG018', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR00Fz2sMJ2klGKhNf4kYZLHIFxmEKwxhHnQ&s' },
  { name: 'Tốt Nghiệp SG022', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2025/09/Bo-Hoa-Tuoi-Flower-B-2-png-1200x1440.webp' },
  { name: 'Hoa Thạch Thảo Trắng Nhỏ Cổ Điển', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2022/08/Bo-Hoa-Thach-Thao-Vintage_18.webp' },
  { name: 'Hoa Tana Cỏ Đồng Tiền', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2021/11/z4386498690404_ddf851f6569180952a3e97116738d1ca.webp' },
  { name: 'Hoa Thạch Thảo Trắng SG167', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2022/03/z3304868186506_a3a830d3f69cc0ddd6ceb7c6301656c7-scaled.webp' },
  { name: 'Hoa Hồng Cẩm Chướng Mini', image: 'https://order.vuonhoatuoi.vn/wp-content/uploads/2025/04/22.webp' },
  { name: 'Hoa tốt nghiệp 2025', image: 'https://dienhoayeuthuong.com.vn/storage/products/0ZBR9gdlgCBUo4Ei7LOzLQbVXDiVHDo0iDgZGGsK.jpg' },
  { name: 'Hoa tốt nghiệp không lỗi thời', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGGbUMtw3tmzSPC4Oc4RctQkKLarX1JJqUSw&s' },
].map((it, idx) => ({
  id: 300 + idx,
  name: it.name,
  price: 650000 + idx * 15000,
  cat: 'totnghiep',
  image: it.image,
}));

// ===== Giỏ hoa (12 sp) =====
const giohoa = [
  { name: 'Giỏ Hoa Hẹn Ước', image: 'https://diachishophoa.com/uploads/sanpham/dec-1557970481-dyqf.jpg' },
  { name: 'Giỏ Hoa Yêu Thương', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQahFnUFCn_nEspIJAUoEQThwIXy_QbRm_wrQ&s' },
  { name: 'Giỏ Hoa Hy Vọng', image: 'https://tramhoa.com/wp-content/uploads/2019/09/Gio-Hoa-TH-G029-Hy-Vong-Moi.webp' },
  { name: 'Giỏ Hoa Thủy Chung', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR8FLrCjHPNp2ALsdBhgk0fZrMoftdRpC7-g&s' },
  { name: 'Thay Lời Muốn Nói', image: 'https://floli.vn/uploads/gio-hoa-chuc-mung-thay-loi-muon-noi-gh1050-2.jpg' },
  { name: 'Tặng Mẹ Yêu', image: 'https://img.poemflowers.com/emmvdFZM1j-3LrXSSEvoCFXpzAbxxySqAx4Zw82uvIQ/rs:fill:1200:1200:0/aHR0cHM6Ly9maWxlcy5wb2VtZmxvd2Vycy5jb20vd2ViZWNvbS8yMDI0LzAyLzZkZmYzZDFhN2Q5Mjc2MGExNTM4YjQxZDA2ODU1MDg5LmpwZw.jpg' },
  { name: 'Kỉ Niệm Ngày Cưới', image: 'https://hoathangtu.com/wp-content/uploads/2023/10/IMG_1152-Large.jpeg' },
  { name: 'Eden Bloom', image: 'https://product.hstatic.net/200000846175/product/img_7438_f9280ae895284604bb8c22aba2d77532_master.jpg' },
  { name: 'Sai Gon Drace', image: 'https://www.saigonroses.com/image/catalog/1_A_SGR_New/Product_Images/arrangement_17.jpg' },
  { name: 'Hồng Dịu Dàng', image: 'https://product.hstatic.net/200000501225/product/12_6c98190764a3443693a43e0d02e7b404_f8a888be179f40e199747721d72a22b9_1024x1024.jpg' },
  { name: 'Thì Thầm Mùa Xuân', image: 'https://img.mayflower.vn/2020/12/Thi-tham-mua-xuan-650k.jpg' },
  { name: 'Hương Sớm Mai', image: 'https://hoatuoidatviet.vn/upload/sanpham/gio-hoa-huong-duong-blue-7018.jpg' },
].map((it, idx) => ({
  id: 400 + idx,
  name: it.name,
  price: 990000 + idx * 30000,
  cat: 'giohoa',
  image: it.image,
}));

// ===== Gấu bông (6 sp) =====
const gaubong = [
  { name: 'Bó Hoa Ngọt Ngào', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGkLQL0CjaTXKcWvDkXDQGACD8Luh5heEm6A&s' },
  { name: 'Bó Hoa Gấu Yêu Thương', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0RBub4Q4l1FV7enhBRGNeAq_EZQcrtrfNmQ&s' },
  { name: 'Nụ Cười Gấu', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZUFzG3JbLfNdDhMhI-ImgnFLFQdKuHZ_5kg&s' },
  { name: 'Love Hug', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqgqr5dfGwmZ-u98r-S7DvCNNcP2SWZaGixQ&s' },
  { name: 'Sweet Moment', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2024/01/phonto-83-9.webp' },
  { name: 'Mừng Ngày Của Em', image: 'https://canhdonghoatuoi.com/wp-content/uploads/2024/08/Chua-co-ten-1080-x-1080-px-2.png' },
].map((it, idx) => ({
  id: 500 + idx,
  name: it.name,
  price: 720000 + idx * 25000,
  cat: 'gaubong',
  image: it.image,
}));

// ===== Hộp hoa mica (9 sp) =====
const hopmica = [
  { name: 'Bloom Box Sai Gon', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2025/04/Hop-Hoa-Mica-Tulip-Whispers-png.webp' },
  { name: 'Kỷ Niệm Lấp Lánh', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXOdAS8p7xB5yPgVQ5vhY4Ar4903enWUgrWQ&s' },
  { name: 'Tim Trong Hộp', image: 'https://hoadephongnhung.com/wp-content/uploads/2021/03/Hop-hoa-sap-MS051.jpg' },
  { name: 'Hơi Thở Thiên Nhiên', image: 'https://flower24.vn/wp-content/uploads/2024/06/hop-hoa-mica-flower25.webp' },
  { name: 'Pure Sai Gon', image: 'https://hoagiaynhunxoan.com/wp-content/uploads/2024/04/hop-mica-hoa-sap-xanh.jpg' },
  { name: 'The Green Box', image: 'https://flower24.vn/wp-content/uploads/2024/06/hop-hoa-mica-flower24-2.webp' },
  { name: 'Sweet Box', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6QmigDKcQTZW1imQ5CxTvhgZAXYLxd30kAg&s' },
  { name: 'Yêu Thương Còn Mãi', image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/347/446/products/hop-hoa-sinh-nhat-dep-o-ba-dinh-ha-noi.jpg?v=1701741236287' },
  { name: 'Forever Bloom', image: 'https://vuonhoatuoi.vn/wp-content/uploads/2025/08/Hop-Hoa-Vai-Mica-Tuoi-A-4-247x247.webp' },
].map((it, idx) => ({
  id: 600 + idx,
  name: it.name,
  price: 1290000 + idx * 40000,
  cat: 'hopmica',
  image: it.image,
}));

// Gộp tất cả
products.push(...khaitruong, ...totnghiep, ...giohoa, ...gaubong, ...hopmica);

try { localStorage.setItem('productsCatalog', JSON.stringify(products)); } catch (e) { }
// ------- Utilities --------
const grid = document.getElementById('productGrid');
function vnd(x) { return x.toLocaleString('vi-VN') + '₫'; }
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

// ------- Render Cards --------

// Render cards như cũ
function card(p) {
  const elCard = el(`
    <div class="card" data-id="${p.id}" data-cat="${p.cat}">
      <div class="thumb"><img src="${p.image}" alt="${p.name}"/></div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="price">
          ${p.old ? `<span class="old">${vnd(p.old)}</span>` : ''}
          <span class="cur">${vnd(p.price)}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn outline view">Xem nhanh</button>
        <button class="btn addBtn">Thêm vào giỏ</button>
      </div>
    </div>
  `);
  return elCard;
}


let currentList = [...products];
let currentFilter = 'all';

function sectionTitle(catKey) {
  const meta = CATS[catKey] || { label: catKey, icon: 'fa-leaf' };
  return `
    <div class="cat-divider">
      <span class="label">
        <i class="fa-solid ${meta.icon}" aria-hidden="true"></i>
        ${meta.label}
      </span>
    </div>
  `;
}


// ====== RENDER THEO NHÓM DANH MỤC ======
function renderGrid(list) {
  grid.innerHTML = '';

  // Khi lọc theo 1 danh mục: thêm 1 divider của danh mục đó
  if (currentFilter !== 'all') {
    const catItems = list.filter(p => p.cat === currentFilter);
    if (catItems.length) {
      grid.insertAdjacentHTML('beforeend', sectionTitle(currentFilter));
      catItems.forEach(p => grid.appendChild(card(p)));
    }
    return;
  }

  // Khi ở "Tất cả": render lần lượt các nhóm theo CAT_ORDER
  CAT_ORDER.forEach(cat => {
    const items = list.filter(p => p.cat === cat);
    if (!items.length) return;
    grid.insertAdjacentHTML('beforeend', sectionTitle(cat));
    items.forEach(p => grid.appendChild(card(p)));
  });
}

renderGrid(currentList);


// ====== Filter (chips & nav) ======
function applyFilter(cat) {
  currentFilter = cat;
  // active chip
  document.querySelectorAll('.chip').forEach(c =>
    c.classList.toggle('active', c.dataset.filter === cat || (cat === 'all' && c.dataset.filter === 'all'))
  );
  // danh sách theo filter
  currentList = (cat === 'all') ? [...products] : products.filter(p => p.cat === cat);
  applySort(); // sẽ gọi renderGrid ở cuối
}

document.getElementById('chips').addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  applyFilter(b.dataset.filter);
});
document.getElementById('navList').addEventListener('click', (e) => {
  const a = e.target.closest('a[data-cat]'); if (!a) return;
  e.preventDefault();
  applyFilter(a.dataset.cat);
  window.scrollTo({ top: document.querySelector('.toolbar').offsetTop - 20, behavior: 'smooth' });
});

// ====== Sort (có tác dụng trong từng nhóm) ======
const sortSelect = document.getElementById('sortSelect');
function applySort() {
  const v = sortSelect.value;

  // Sắp xếp nhưng vẫn giữ nhóm; ta sort trong từng nhóm sau khi render
  // Nên ở đây chỉ chuẩn hoá comparator:
  const cmp = (a, b) => (v === 'priceAsc' ? a.price - b.price :
    v === 'priceDesc' ? b.price - a.price : 0);

  if (currentFilter === 'all') {
    // sort theo nhóm: tạo bản sao để không phá currentList gốc
    const sorted = [];
    CAT_ORDER.forEach(cat => {
      const items = currentList.filter(p => p.cat === cat);
      if (v !== 'default') items.sort(cmp);
      sorted.push(...items);
    });
    renderGrid(sorted);
  } else {
    const list = [...currentList];
    if (v !== 'default') list.sort(cmp);
    renderGrid(list);
  }
}
sortSelect.addEventListener('change', applySort);

// ------- Search --------
document.getElementById('searchBtn').addEventListener('click', () => {
  const q = document.getElementById('searchInput').value.toLowerCase();
  currentList = products.filter(p => p.name.toLowerCase().includes(q));
  applySort();
});

// ------- Product Detail Modal --------
const modal = document.getElementById('detailModal');
const modalClose = document.getElementById('modalClose');
const detailImg = document.getElementById('detailImg');
const detailName = document.getElementById('detailName');
const detailOld = document.getElementById('detailOld');
const detailCur = document.getElementById('detailCur');
const detailBreadcrumb = document.getElementById('detailBreadcrumb');
const qtyInput = document.getElementById('qty');
let currentProduct = null;

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

function openDetail(p) {
  currentProduct = p;

  // set thông tin hình + text
  detailImg.src = p.image;
  detailImg.alt = p.name;
  detailName.textContent = p.name;
  detailOld.textContent = p.old ? vnd(p.old) : '';
  detailCur.textContent = vnd(p.price);
  detailBreadcrumb.innerHTML = `Trang chủ / Hoa ${labelCat(p.cat)} / <b>${p.name}</b>`;
  qtyInput.value = 1;

  // set link Xem chi tiết + lưu lastProduct
  const vdl = document.getElementById('viewDetailLink');
  if (vdl) vdl.href = `./chitiet.html?id=${p.id}`;
  try { localStorage.setItem('lastProduct', JSON.stringify(p)); } catch (e) { }

  // mở modal
  modal.classList.add('show');
}

modalClose.addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
document.getElementById('minus').addEventListener('click', () => { const v = Math.max(1, (+qtyInput.value || 1) - 1); qtyInput.value = v; });
document.getElementById('plus').addEventListener('click', () => { qtyInput.value = (+qtyInput.value || 1) + 1; });
document.getElementById('addToCart').addEventListener('click', () => { if (currentProduct) { addToCart(currentProduct, +qtyInput.value || 1); modal.classList.remove('show'); } });

function labelCat(c) {
  return ({
    sinhnhat: 'sinh nhật',
    khaitruong: 'khai trương',
    totnghiep: 'tốt nghiệp',
    giohoa: 'giỏ hoa',
    gaubong: 'gấu bông',
    hopmica: 'hộp mica'
  }[c] || c);
}

// ------- Cart (drawer + localStorage) --------
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const drawerBackdrop = document.getElementById('drawerBackdrop');
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function openCart() { cartDrawer.classList.add('open'); drawerBackdrop.classList.add('show'); renderCart(); }
function closeCart() { cartDrawer.classList.remove('open'); drawerBackdrop.classList.remove('show'); }
cartBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
cartClose.addEventListener('click', closeCart);
drawerBackdrop.addEventListener('click', closeCart);

function addToCart(p, qty = 1) {
  const found = cart.find(i => i.id === p.id);
  if (found) found.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty });
  toast('Đã thêm vào giỏ hàng!');
  saveCart();
}
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}
function changeQty(id, delta) {
  const it = cart.find(i => i.id === id); if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart();
}
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCount();
  renderCart();
}
function updateCount() {
  const c = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = c;
}
function renderCart() {
  cartItems.innerHTML = '';
  let sum = 0;
  cart.forEach(it => {
    sum += it.price * it.qty;
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
    row.querySelector('.dec').addEventListener('click', () => changeQty(it.id, -1));
    row.querySelector('.inc').addEventListener('click', () => changeQty(it.id, +1));
    row.querySelector('.q').addEventListener('change', (e) => { it.qty = Math.max(1, +e.target.value || 1); saveCart(); });
    row.querySelector('.rm').addEventListener('click', () => removeFromCart(it.id));
    cartItems.appendChild(row);
  });
  document.getElementById('subtotal').textContent = vnd(sum);
}
updateCount();

// ------- Toast --------
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

// Home link scroll to top
document.getElementById('homeLink').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });



/* ===============================
   ✦ CHECKOUT FLOW (THEO LOGIC YÊU CẦU) ✦
   - Gắn handler cho nút "Thanh toán" trong cart drawer
   - Nếu chưa login: chuyển /dangnhap.html?next=path
   - Nếu đã login: mở modal thanh toán, prefill từ auth
   - "ĐẶT HÀNG": validate → lưu đơn vào localStorage.orders → clear cart
   =============================== */

// --- Helpers đơn hàng
function getOrders() { try { return JSON.parse(localStorage.getItem('orders')) || []; } catch { return []; } }
function setOrders(list) { localStorage.setItem('orders', JSON.stringify(list || [])); }
function genOrderId() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HTSG-${y}${m}${day}${hh}${mm}-${rand}`;
}

// --- Lấy lại vài phần tử đã có sẵn trên trang
const checkoutModal = document.getElementById('checkoutModal');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const checkoutForm = document.getElementById('checkoutForm');
const closeCheckout = document.getElementById('closeCheckout');

// Nếu bạn đã có toast() ở trên thì dùng lại; nếu chưa, fallback alert
function toast2(msg, type) { if (typeof toast === 'function') return toast(msg, type); alert(msg); }

// Prefill form từ auth
function openCheckoutModalPrefill() {
  if (!checkoutModal) return;
  const auth = window.Auth?.getAuth?.() || null; // dùng getAuth bạn đã định nghĩa ở trên
  if (auth && checkoutForm) {
    const fields = checkoutForm.querySelectorAll('input, select, textarea');
    // Thứ tự theo HTML bạn cung cấp:
    // 0 Họ tên | 1 SĐT | 2 Email | 3 Địa chỉ | 4 Tỉnh/TP(select) | 5 datetime-local | 6 Lời nhắn
    if (fields[0] && !fields[0].value) fields[0].value = auth.name || '';
    if (fields[1] && !fields[1].value) fields[1].value = auth.phone || '';
    if (fields[2] && !fields[2].value) fields[2].value = auth.email || '';
  }

  // Đóng cart drawer nếu đang mở để tránh chồng UI
  const cartDrawerEl = document.getElementById('cartDrawer');
  const backdropEl = document.getElementById('drawerBackdrop');
  if (cartDrawerEl?.classList.contains('open')) {
    cartDrawerEl.classList.remove('open');
    backdropEl?.classList.remove('show');
  }

  checkoutModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeCheckoutModal() {
  checkoutModal?.classList.remove('show');
  document.body.style.overflow = '';
}
closeCheckout?.addEventListener('click', closeCheckoutModal);
checkoutModal?.addEventListener('click', (e) => { if (e.target === checkoutModal) closeCheckoutModal(); });

// Gắn handler cho nút "Thanh toán" trong cart drawer (class .btn.checkout)
(function bindCheckoutButton() {
  const btn = document.querySelector('.btn.checkout');
  if (!btn) return;

  // Xóa mọi listener "cũ" kiểu chuyển /thanhtoan.html nếu có (không cần, vì mình sẽ chặn mặc định)
  btn.addEventListener('click', (e) => {
    e.preventDefault();

    // Lấy giỏ hiện tại
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { cart = []; }

    if (!cart.length) {
      toast2('Giỏ hàng đang trống, vui lòng chọn sản phẩm trước nhé!', 'warn');
      return;
    }

    // Kiểm tra đăng nhập
    const auth = window.Auth?.getAuth?.() || null;
    if (!auth) {
      const next = encodeURIComponent(location.pathname);
      location.href = `/dangnhap.html?next=${next}`;
      return;
    }

    // Đã đăng nhập → mở modal thanh toán
    openCheckoutModalPrefill();
  });
})();

// Xử lý "ĐẶT HÀNG"
placeOrderBtn?.addEventListener('click', () => {
  // Validate form dựa vào required trong HTML
  if (!checkoutForm?.checkValidity()) {
    checkoutForm?.reportValidity?.();
    return;
  }

  // Lấy giỏ hiện tại
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { cart = []; }
  if (!cart.length) {
    toast2('Giỏ hàng trống, không thể đặt.', 'warn');
    return;
  }

  // Đọc form
  const fields = checkoutForm.querySelectorAll('input, select, textarea');
  const customer = {
    name: fields[0]?.value?.trim() || '',
    phone: fields[1]?.value?.trim() || '',
    email: fields[2]?.value?.trim() || '',
    address: fields[3]?.value?.trim() || '',
    city: fields[4]?.value || ''
  };
  const deliveryAt = fields[5]?.value || '';
  const note = fields[6]?.value?.trim() || '';

  // Phương thức thanh toán
  const payChecked = document.querySelector('input[name="pay"]:checked');
  // ưu tiên value nếu có; nếu không, suy luận theo label
  let payMethod = payChecked?.value || '';
  if (!payMethod) {
    const labelTxt = (payChecked?.nextSibling?.textContent || '').toLowerCase();
    payMethod = labelTxt.includes('chuyển') ? 'BANK' : 'COD';
  }
  const payment = { method: payMethod === 'BANK' ? 'BANK' : 'COD', status: payMethod === 'BANK' ? 'PENDING' : 'UNPAID' };

  // Tính tiền
  const subtotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
  const shipping = 0;
  const discount = 0;
  const totals = { subtotal, shipping, discount, grandTotal: subtotal + shipping - discount };

  // Tạo đơn & lưu
  const order = {
    orderId: genOrderId(),
    createdAt: new Date().toISOString(),
    items: cart,
    totals,
    customer,
    payment,
    note,
    delivery: { type: 'SHIP', deliveryAt, status: 'SCHEDULED' },
    status: 'NEW'
  };

  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);

  // Cập nhật badge & subtotal hiển thị nếu có
  try {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = '0';
    const subtotalEl = document.getElementById('subtotal');
    if (subtotalEl) subtotalEl.textContent = (0).toLocaleString('vi-VN') + '₫';
    const cartItems = document.getElementById('cartItems');
    if (cartItems) cartItems.innerHTML = '';
  } catch { }

  // Đóng modal + thông báo
  closeCheckoutModal();
  clearCartAndUI()
  resetCheckoutForm();     // <<--- xóa sạch dữ liệu form thanh toán
  localStorage.removeItem('cart'); // làm chắc (đã set [] ở trên, removeItem để không còn key)
  toast2('Đặt hàng thành công! Mã đơn: ' + order.orderId, 'success');

  // Nếu muốn điều hướng:
  // setTimeout(()=> location.href = '/don-hang.html', 800);
});


// function resetCheckoutForm() {
//   try {
//     // Xóa dữ liệu form
//     checkoutForm?.reset();

//     // Set lại mặc định (nếu cần chắc chắn)
//     const cod = document.querySelector('input[name="pay"][value="COD"]');
//     if (cod) cod.checked = true;

//     // Một số trình duyệt không reset datetime-local đúng, set tay:
//     const dt = checkoutForm?.querySelector('input[type="datetime-local"]');
//     if (dt) dt.value = '';

//     // Select về option đầu
//     const city = checkoutForm?.querySelector('select');
//     if (city) city.selectedIndex = 0;

//     // Nếu bạn có lưu nháp thanh toán ở localStorage thì xóa luôn (phòng xa)
//     localStorage.removeItem('checkoutInfo');
//     localStorage.removeItem('checkoutDraft');
//   } catch { }
// }


// function clearCartAndUI() {
//   // XÓA TRONG BỘ NHỚ & STORAGE
//   cart = [];                                  // <— rất quan trọng
//   localStorage.removeItem('cart');

//   // CẬP NHẬT UI DRAWER
//   const cartItemsEl = document.getElementById('cartItems');
//   if (cartItemsEl) cartItemsEl.innerHTML = '';

//   const subtotalEl = document.getElementById('subtotal');
//   if (subtotalEl) subtotalEl.textContent = vnd(0);

//   updateCount();                               // badge về 0

//   // Đóng drawer nếu đang mở (tránh thấy “bóng ma” dữ liệu cũ)
//   try { closeCart(); } catch { }
// }



