/**
 * Khoi "sinh day so ngau nhien" trong bao cao HTML.
 *
 * Du lieu ky cu duoc nhung thang vao trang de bam nut la co ket qua ngay, khong can mo terminal
 * va van dung duoc khi khong co mang.
 *
 * Cach nhung:
 *  - lotto: mot chuoi duy nhat, moi ky chiem (so bong x 2) ky tu. Nhe hon JSON rat nhieu.
 *  - max3d: mot chuoi, moi ky chiem 60 ky tu (20 bo 3 chu so). Nhung ca 20 bo chu khong nhung
 *    san pool: loi choi 6 chu so co 1.000.000 kha nang, nhung pool ra se phinh trang vai MB.
 */

import { escapeHtml, fmt } from './chart-primitives.js';

/** Nen danh sach ky thanh chuoi co dinh do rong: '030817202731' + '020819303643' + ... */
export function packDraws(draws) {
  return draws.map((d) => d.numbers.map((n) => String(n).padStart(2, '0')).join('')).join('');
}

/** Nen ky Max 3D: moi ky 60 ky tu, xep theo thu tu giai DB(2) - Nhat(4) - Nhi(6) - Ba(8). */
export function packMax3d(draws) {
  return draws.map((tiers) => tiers.flat().join('')).join('');
}

const MODE_LABELS = {
  top: 'Tránh trùng giải cao nhất',
  all: 'Tránh trùng mọi giải',
};

/** Chu thich rieng cho Max 3D: hai loi choi co khong gian dat cuoc khac han nhau. */
function max3dHint(data) {
  const parts = [`Đối chiếu với ${fmt(data.total)} kỳ đã quay.`];

  if (data.counts.d3) {
    const left = data.counts.d3.all;
    parts.push(`<b>Bộ 3 chữ số</b> (1.000 khả năng): còn ${fmt(data.counts.d3.top)} bộ chưa từng ra ở
      giải Đặc biệt; ở chế độ "tránh trùng mọi giải" ${left === 0
        ? 'không còn bộ nào — mọi bộ số đều đã xuất hiện ở một giải nào đó'
        : `chỉ còn ${fmt(left)}`}.`);
  }

  parts.push(`<b>Bộ 6 chữ số</b> (1.000.000 khả năng): đã có ${fmt(data.counts.d6.top)} bộ trúng giải
    Đặc biệt hoặc Phụ Đặc biệt, ${fmt(data.counts.d6.all)} bộ trúng từ giải Ba trở lên. Chế độ "tránh
    trùng mọi giải" chỉ phủ tới giải Ba — giải Tư/Năm/Sáu chỉ cần trùng <i>một</i> bộ 3 chữ số nên
    không thể tránh.`);

  return parts.join(' ');
}

/**
 * @param {object} product cau hinh san pham
 * @param {object} data du lieu nhung ({kind:'lotto'|'max3d', ...})
 */
export function pickerSection(product, data) {
  const id = escapeHtml(product.id);

  const hint =
    data.kind === 'lotto'
      ? `Đối chiếu với ${fmt(data.total)} kỳ đã quay. "Tránh trùng mọi giải" nghĩa là trùng dưới
         ${data.minMatch} số với <b>mọi</b> kỳ cũ — ràng buộc này thường không có lời giải, và công cụ
         sẽ báo rõ thay vì quay vòng vô hạn.`
      : max3dHint(data);

  // Chi hien o chon loi choi khi san pham that su co hai loi choi (Max 3D Pro chi co mot)
  const playField = data.plays?.length > 1
    ? `<label class="field">
      <span>Lối chơi</span>
      <select class="pick-play">
        ${data.plays.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.label)}</option>`).join('')}
      </select>
    </label>`
    : '';

  return `<h2>Sinh dãy số ngẫu nhiên</h2>
<p class="caption">${hint}</p>
<div class="panel picker" data-picker="${id}">
  <div class="picker-controls">
    ${playField}<label class="field">
      <span>Chế độ</span>
      <select class="pick-mode">
        <option value="top">${MODE_LABELS.top}</option>
        <option value="all">${MODE_LABELS.all}</option>
      </select>
    </label>
    <label class="field">
      <span>Số dãy</span>
      <input class="pick-count" type="number" min="1" max="20" value="5" inputmode="numeric">
    </label>
    <button class="pick-go" type="button">Sinh dãy</button>
  </div>
  <div class="pick-out" role="status" aria-live="polite"></div>
  <p class="pick-note">Tránh trùng kỳ cũ <b>không</b> làm tăng cơ hội trúng thưởng.
  Mọi dãy số đều có xác suất y hệt nhau ở kỳ sắp tới.</p>
  <script type="application/json" class="pick-data">${JSON.stringify(data)}</script>
</div>`;
}
