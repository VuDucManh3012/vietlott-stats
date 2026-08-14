/**
 * Muc bao cao: kiem tra gia thuyet "khong the co 2 ky trung giai cao nhat".
 *
 * Trinh bay ca ba con so mot luc - xac suat ly thuyet, so lan ky vong, va so lan THUC TE -
 * de nguoi doc tu doi chieu, thay vi chi dua ra ket luan.
 */

import { table, section, fmt } from './report-page.js';

/**
 * Ty le phan tram voi so chu so thap phan tu dieu chinh.
 * Lam tron cung 1 chu so se bien ca 12 cap lan 1 cap thanh "0,0%" - mat sach thong tin
 * o dung cho dang chu y nhat cua bang.
 */
function pct(p) {
  const v = p * 100;
  if (v === 0) return '0%';
  const digits = Math.min(4, Math.max(1, 1 - Math.floor(Math.log10(Math.abs(v)))));
  return `${fmt(v, digits)}%`;
}

/**
 * @param {object} dup ket qua tu stats-duplicates.js
 * @param {string} what mo ta "giai cao nhat" cua san pham nay
 */
export function duplicateSection(dup, what) {
  const found = dup.duplicates.length;

  const verdict = found
    ? `<b>Đã xảy ra ${found} lần.</b> Giả thuyết bị bác bỏ bằng chính dữ liệu lịch sử.`
    : `<b>Chưa từng xảy ra trong ${fmt(dup.total)} kỳ.</b> Nhưng xác suất để điều đó xảy ra
       chỉ là ${pct(dup.chance)} — nên việc chưa gặp là điều <b>dự kiến</b>, không phải bằng chứng
       rằng có luật cấm trùng.`;

  const numbers = table(
    ['Chỉ số', 'Giá trị'],
    [
      { cells: ['Số kỳ đã quay', fmt(dup.total)], tip: { v: fmt(dup.total), l: 'Tổng số kỳ thu thập được cho sản phẩm này.' } },
      { cells: [`Số kết quả khả dĩ (${what})`, fmt(dup.possible)],
        tip: { v: fmt(dup.possible), l: 'Số kết quả khác nhau mà giải cao nhất có thể ra.' } },
      { cells: ['Số cặp kỳ đem so sánh', fmt(dup.pairs)],
        tip: { v: fmt(dup.pairs), l: 'Mỗi kỳ được so với mọi kỳ khác. Số cặp tăng theo bình phương số kỳ — đây là lý do khả năng trùng cao hơn trực giác nhiều.' } },
      { cells: ['Số cặp trùng kỳ vọng', fmt(dup.expectedDup, 2)],
        tip: { v: fmt(dup.expectedDup, 2), l: 'Số cặp trùng trung bình nếu quay hoàn toàn ngẫu nhiên.' } },
      { cells: ['Xác suất có ít nhất 1 cặp trùng', pct(dup.chance)],
        tip: { v: pct(dup.chance), l: 'Tính theo bài toán trùng ngày sinh.' } },
      { cells: ['Số cặp trùng thực tế', fmt(found)],
        tip: { v: fmt(found), l: found ? 'Đếm trực tiếp trên dữ liệu đã thu thập.' : 'Không tìm thấy cặp nào trùng hoàn toàn.' } },
    ]
  );

  const list = found
    ? `<h2>Các kỳ trùng nhau</h2>${table(
        ['Kết quả trùng', 'Kỳ thứ nhất', 'Kỳ thứ hai'],
        dup.duplicates.map((d) => [
          d.key.replace(/-/g, ' · '),
          `${d.draws[1].drawId} (${d.draws[1].date})`,
          `${d.draws[0].drawId} (${d.draws[0].date})`,
        ])
      )}`
    : '';

  // Rieng lotto: cho thay muc trung gan nhat da tung dat toi
  const overlap = dup.overlap
    ? `<h2>Hai kỳ bất kỳ trùng nhau bao nhiêu số</h2>
       <p class="caption">Xét toàn bộ ${fmt(dup.pairs)} cặp kỳ. Mức trùng cao nhất từng đạt được là
       <b>${dup.maxOverlap} số</b>.</p>
       ${table(
         ['Số số trùng nhau', 'Số cặp kỳ', 'Tỷ lệ'],
         dup.overlap.map((count, i) => ({
           cells: [i, fmt(count), pct(count / dup.pairs)],
           tip: { v: fmt(count), l: `Có ${fmt(count)} cặp kỳ trùng nhau đúng ${i} số.` },
         }))
       )}`
    : '';

  return section(
    'Đã có kỳ nào trùng giải cao nhất chưa?',
    `Không có cơ chế nào ngăn hai kỳ ra cùng kết quả — kỳ trước không loại bộ số khỏi kỳ sau.
     Nên câu hỏi đúng không phải "có thể hay không" mà là "xác suất bao nhiêu, và đã xảy ra chưa".`,
    `<p style="margin:0 0 16px">${verdict}</p>${numbers}${list}${overlap}`
  );
}
