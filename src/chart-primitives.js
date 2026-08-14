/**
 * Cac manh dung chung de dung bieu do SVG.
 *
 * Khong dung thu vien chart nao de file HTML xuat ra la self-contained, mo duoc offline.
 */

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

/** Dinh dang so theo kieu Viet Nam (dau cham ngan cach hang nghin). */
export function fmt(n, digits = 0) {
  return Number(n).toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/**
 * Chon buoc chia truc thanh so tron (1/2/5 x 10^n) thay vi chia deu may phan tuy y.
 *
 * LUU Y: moc cuoi co the DUNG TRUOC `max` (vd max=27 -> moc cuoi 20). Ben goi phai tu lay
 * Math.max(max, moc cuoi) lam dinh thang, neu khong mark se ve tran ra ngoai vung ve.
 *
 * @returns {number[]} cac gia tri moc tron, bat dau tu 0
 */
export function niceTicks(max, target = 4) {
  if (max <= 0) return [0];
  const raw = max / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const ticks = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

/**
 * Duong bao cot: bo tron 4px o dau mut du lieu, vuong o duong goc.
 * Bo tron ca 4 goc se lam mat cot ngan "noi" khoi truc, sai voi gia tri that.
 *
 * @param {number} x canh trai
 * @param {number} yTop bien tren cua cot
 * @param {number} w chieu rong
 * @param {number} h chieu cao
 * @param {boolean} roundTop true = dau mut o tren (gia tri duong)
 */
export function columnPath(x, yTop, w, h, roundTop = true) {
  const r = Math.min(4, w / 2, Math.max(0, h));
  const yBot = yTop + h;
  if (h <= 0.2) return `M${x},${yTop} L${x + w},${yTop}`;

  return roundTop
    ? `M${x},${yBot} L${x},${yTop + r} Q${x},${yTop} ${x + r},${yTop} ` +
      `L${x + w - r},${yTop} Q${x + w},${yTop} ${x + w},${yTop + r} L${x + w},${yBot} Z`
    : `M${x},${yTop} L${x},${yBot - r} Q${x},${yBot} ${x + r},${yBot} ` +
      `L${x + w - r},${yBot} Q${x + w},${yBot} ${x + w},${yBot - r} L${x + w},${yTop} Z`;
}

/**
 * Tinh be rong cot: chan tren 24px va luon chua 2px khoang trong ngan cach.
 * Cot day kin o se lam bieu do nang ne, khoang trong moi la thu tach cac cot.
 */
export function barWidth(slot) {
  return Math.max(1, Math.min(24, slot - 2));
}

/** Gan nhan cho mark de tang tooltip doc duoc (noi dung chen bang textContent). */
export function markData(label, value) {
  return `data-l="${escapeHtml(label)}" data-v="${escapeHtml(value)}"`;
}

/** Chon buoc nhan truc X sao cho nhan khong chen nhau. */
export function labelStep(count, slot, minPx = 26) {
  return Math.max(1, Math.ceil(minPx / Math.max(slot, 1)) , Math.ceil(count / 40));
}
