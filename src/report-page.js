/** Khung trang va cac manh dung chung cua bao cao HTML. */

import fs from 'node:fs';
import { REPORT_CSS } from './report-style.js';
import { REPORT_JS } from './report-interaction.js';
import { PICKER_JS } from './report-picker-js.js';
import { escapeHtml, fmt, markData } from './chart-primitives.js';

/**
 * Nhung thang ma nguon random-picker.js vao trang.
 *
 * Lam vay de thuat toan sinh day so chi co MOT nguon: CLI va trang web chay cung mot ma.
 * Module nay khong import gi nen bo `export` di la chay duoc trong trinh duyet.
 */
function pickerAlgorithmSource() {
  const src = fs.readFileSync(new URL('./random-picker.js', import.meta.url), 'utf8');
  return src.replace(/^export /gm, '');
}

export const DISCLAIMER = `<div class="note">
  <p><b>Đọc kỹ trước khi dùng.</b> Đây là thống kê mô tả dữ liệu lịch sử, không phải công cụ dự đoán.</p>
  <p>Mỗi kỳ quay Vietlott là độc lập: quả bóng không nhớ những lần quay trước, nên kết quả đã ra
  <b>không làm thay đổi xác suất</b> của kỳ sắp tới. Một số "khô hạn 40 kỳ" có xác suất ra đúng bằng
  số vừa ra kỳ trước.</p>
  <p>Vùng nền xám trên các biểu đồ là dải dao động ngẫu nhiên ±2 độ lệch chuẩn. Một bộ số hoàn toàn
  ngẫu nhiên cũng sẽ có khoảng 95% các cột nằm trong vùng này — nằm trong dải nghĩa là
  <b>chênh lệch quan sát được chỉ là nhiễu</b>, không phải quy luật.</p>
</div>`;

export function page({ title, body, extraCss = '' }) {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${REPORT_CSS}
${extraCss}</style>
</head>
<body>
<div class="wrap">${body}</div>
<script>${pickerAlgorithmSource()}
${PICKER_JS}
${REPORT_JS}</script>
</body>
</html>`;
}

export function masthead() {
  return `<div class="masthead">
  <div>
    <h1>Thống kê tần suất Vietlott</h1>
    <p class="sub">Nguồn vietlott.vn · xuất lúc ${new Date().toLocaleString('vi-VN')}</p>
  </div>
  <button class="theme-toggle" type="button">Giao diện tối</button>
</div>`;
}

/** So dan dat toan trang - chi dung DUNG MOT lan moi trang. */
export function hero(value, caption) {
  return `<div class="hero"><b>${escapeHtml(value)}</b><span>${escapeHtml(caption)}</span></div>`;
}

/**
 * O KPI. Moi o co the kem `tip` giai thich con so nghia la gi - o KPI it (4-5 o) nen cho
 * focus duoc bang ban phim, khong lam ngap thu tu tab.
 */
export function kpiRow(items) {
  const cells = items
    .map((i) => {
      const tip = i.tip ? ` tabindex="0" ${markData(i.tip, i.value)}` : '';
      return `<div class="kpi"${tip}><span>${escapeHtml(i.label)}</span><b>${escapeHtml(i.value)}</b></div>`;
    })
    .join('');
  return `<div class="kpis">${cells}</div>`;
}

/**
 * Bang du lieu. Moi dong la mang o, HOAC { cells, tip: { v, l } } de gan chu thich noi:
 * `v` la con so dan dat hien to o dau tooltip, `l` la cau dien giai ben duoi.
 *
 * Dong co tooltip khong dat tabindex: noi dung tooltip chi la dien giai suy ra tu chinh cac o
 * dang hien, khong chua so lieu moi - nen khong co gi bi khoa sau thao tac hover.
 *
 * Moi o deu duoc escape: ten giai lay tu HTML cua vietlott.vn nen coi la du lieu khong tin cay.
 */
export function table(headers, rows) {
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const body = rows
    .map((row) => {
      const cells = Array.isArray(row) ? row : row.cells;
      const attrs = !Array.isArray(row) && row.tip ? ` ${markData(row.tip.l, row.tip.v)}` : '';
      return `<tr${attrs}>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`;
    })
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/**
 * Bang du lieu di kem moi bieu do. Bat buoc phai co: bieu do khong the doc bang trinh doc
 * man hinh, va tooltip khong duoc phep la duong duy nhat de lay so lieu.
 */
export function tableView(summary, headers, rows) {
  return `<details class="tableview">
  <summary>${escapeHtml(summary)}</summary>
  ${table(headers, rows)}
</details>`;
}

export function section(title, caption, content) {
  return `<h2>${escapeHtml(title)}</h2>
${caption ? `<p class="caption">${caption}</p>` : ''}
<div class="panel">${content}</div>`;
}

export const footer = `<footer>Nguồn dữ liệu: vietlott.vn · Công cụ tự dùng, không liên kết với Vietlott.</footer>`;

export { fmt };
