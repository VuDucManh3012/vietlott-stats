/**
 * Ghep toan bo san pham vao MOT file HTML self-contained (CSS + SVG + JS noi tuyen, khong CDN).
 *
 * Moi san pham la mot tab. Khung trang, bang mau va script chi xuat hien mot lan - de doi chieu
 * giua cac san pham ma khong phai mo nhieu file, va tranh lap lai ~15KB CSS/JS bon lan.
 */

import { page, masthead, footer, DISCLAIMER } from './report-page.js';
import { accentRules } from './report-style.js';
import { lottoSection, max3dSection } from './report-sections.js';
import { drawsRail } from './report-draws.js';
import { escapeHtml } from './chart-primitives.js';

/** Thanh tab chuyen san pham. Dung role tablist de trinh doc man hinh hieu dung cau truc. */
function tabBar(items) {
  const buttons = items
    .map(
      (it, i) => `<button class="tab" role="tab" type="button" data-accent="${escapeHtml(it.id)}"
      id="tab-${escapeHtml(it.id)}" aria-controls="panel-${escapeHtml(it.id)}"
      aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}">${escapeHtml(it.label)}</button>`
    )
    .join('');
  return `<div class="tabs" role="tablist" aria-label="Chọn sản phẩm">${buttons}</div>`;
}

/** Moi panel la luoi 2 cot: thong ke ben trai, danh sach ket qua cac ky cuon rieng ben phai. */
function panels(items) {
  return items
    .map(
      (it, i) => `<section class="tabpanel" role="tabpanel" data-accent="${escapeHtml(it.id)}"
      id="panel-${escapeHtml(it.id)}"
      aria-labelledby="tab-${escapeHtml(it.id)}"${i === 0 ? '' : ' hidden'}><div class="main">${it.content}</div>${it.rail}</section>`
    )
    .join('');
}

/**
 * @param {Array<{product:object, kind:string, stats:object}>} entries theo dung thu tu muon hien
 */
export function renderCombinedReport(entries) {
  const items = entries.map(({ product, kind, stats }) => ({
    id: product.id,
    label: product.label,
    content: kind === 'lotto' ? lottoSection(stats) : max3dSection(stats),
    rail: drawsRail(product, stats.drawList),
  }));

  const body = `${masthead()}
${DISCLAIMER}
${tabBar(items)}
${panels(items)}
${footer}`;

  return page({ title: 'Thống kê tần suất Vietlott', body, extraCss: accentRules(entries) });
}
