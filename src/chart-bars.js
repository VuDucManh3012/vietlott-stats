/**
 * Bieu do cot.
 *
 * Hai dang:
 *  - barChart:     do lon tuyet doi. Cac cot cung MOT mau (chuoi don) - to mau theo gia tri
 *                  se tieu phi kenh mau de lap lai dieu ma chieu cao cot da noi.
 *  - divergingBar: do lech so voi nguong. Hai cuc am/duong dung 2 mau doi lap.
 */

import { escapeHtml, fmt, niceTicks, columnPath, barWidth, markData, labelStep } from './chart-primitives.js';

const W = 1120;
const PAD = { left: 46, right: 12, top: 16, bottom: 34 };

/**
 * Nhan cua duong nguong nam de len cac cot nen phai co mieng nen mau be mat lot phia sau,
 * neu khong chu se chim vao cot va khong doc duoc.
 */
function thresholdLabel(text, xRight, y) {
  const w = text.length * 5.6 + 10;
  return `<rect x="${(xRight - w).toFixed(1)}" y="${(y - 20).toFixed(1)}" width="${w.toFixed(1)}" height="15" fill="var(--surface)" rx="3"/>` +
    `<text class="threshold-label" x="${xRight - 5}" y="${(y - 9).toFixed(1)}" text-anchor="end">${escapeHtml(text)}</text>`;
}

function yAxis(ticks, scale, width) {
  return ticks
    .map((t) => {
      const y = scale(t).toFixed(1);
      return `<line class="grid-line" x1="${PAD.left}" y1="${y}" x2="${width - PAD.right}" y2="${y}"/>` +
        `<text class="tick" x="${PAD.left - 8}" y="${(Number(y) + 4).toFixed(1)}" text-anchor="end">${fmt(t)}</text>`;
    })
    .join('');
}

function xLabels(items, slot, baselineY, count) {
  const step = labelStep(count, slot);
  return items
    .map((item, i) =>
      i % step === 0
        ? `<text class="tick" x="${(PAD.left + i * slot + slot / 2).toFixed(1)}" y="${baselineY + 19}" text-anchor="middle">${escapeHtml(item.label)}</text>`
        : ''
    )
    .join('');
}

/**
 * @param {object} opts
 * @param {Array<{label:string,value:number}>} opts.items
 * @param {number|null} opts.expected muc ky vong ly thuyet -> ve duong nguong
 * @param {{lo:number,hi:number}|null} opts.band dai dao dong ngau nhien (+-2 do lech chuan)
 * @param {string} opts.unit don vi hien trong tooltip
 * @param {string} opts.summary mo ta cho trinh doc man hinh
 */
export function barChart({ items, expected = null, band = null, height = 280, unit = 'lan', labelPrefix = '', summary = '' }) {
  const plotH = height - PAD.top - PAD.bottom;
  const plotW = W - PAD.left - PAD.right;
  const baselineY = PAD.top + plotH;

  const rawMax = Math.max(1, ...items.map((i) => i.value), band?.hi ?? 0);
  const ticks = niceTicks(rawMax);
  const max = Math.max(rawMax, ticks[ticks.length - 1]);
  const y = (v) => PAD.top + plotH - (v / max) * plotH;

  const slot = plotW / items.length;
  const bw = barWidth(slot);

  const bandRect = band
    ? `<rect class="band" x="${PAD.left}" y="${y(band.hi).toFixed(1)}" width="${plotW}" height="${(y(band.lo) - y(band.hi)).toFixed(1)}"/>`
    : '';

  const thresholdLine = expected
    ? `<line class="threshold" x1="${PAD.left}" y1="${y(expected).toFixed(1)}" x2="${W - PAD.right}" y2="${y(expected).toFixed(1)}"/>` +
      thresholdLabel(`kỳ vọng ${fmt(expected, 1)}`, W - PAD.right, y(expected))
    : '';

  const marks = items
    .map((item, i) => {
      const x = PAD.left + i * slot + (slot - bw) / 2;
      const top = y(item.value);
      const h = baselineY - top;
      // Do tre theo thu tu cot cho hieu ung hien dan; chan tran de bieu do dai khong phai cho lau
      return `<path class="mark bar" style="animation-delay:${Math.min(i * 8, 480)}ms" d="${columnPath(x, top, bw, h, true)}"/>`;
    })
    .join('');

  // Vung bat con tro rong hon cot: nham dung cot 18px la kho, nhat la tren man cam ung
  const hits = items
    .map((item, i) => {
      const x = PAD.left + i * slot;
      return `<rect class="hit" x="${x.toFixed(1)}" y="${PAD.top}" width="${slot.toFixed(1)}" height="${plotH}" ` +
        `${markData(labelPrefix + item.label, `${fmt(item.value)} ${unit}`)} data-i="${i}"/>`;
    })
    .join('');

  return `<div class="chart-scroll"><svg viewBox="0 0 ${W} ${height}" class="chart" role="img" tabindex="0"
    aria-label="${escapeHtml(summary)}" style="min-width:${Math.max(560, items.length * 14)}px">
    ${bandRect}${yAxis(ticks, y, W)}
    <line class="axis-line" x1="${PAD.left}" y1="${baselineY}" x2="${W - PAD.right}" y2="${baselineY}"/>
    ${marks}${thresholdLine}
    ${xLabels(items, slot, baselineY, items.length)}
    ${hits}
  </svg></div>`;
}

/**
 * Cot phan cuc quanh muc 0: tren nguong ve mot mau, duoi nguong ve mau doi lap.
 * @param {{items:Array<{label:string,value:number}>, band?:{lo:number,hi:number}|null}} opts
 */
export function divergingBar({ items, band = null, height = 260, unit = '', labelPrefix = '', summary = '' }) {
  const plotH = height - PAD.top - PAD.bottom;
  const plotW = W - PAD.left - PAD.right;

  const absMax = Math.max(1, ...items.map((i) => Math.abs(i.value)), Math.abs(band?.hi ?? 0));
  const half = niceTicks(absMax, 3);
  // Moc truc tron co the dung truoc gia tri lon nhat -> phai lay max cua ca hai,
  // neu khong cot vuot gia tri moc cuoi se ve tran ra ngoai vung ve va de len nhan truc.
  const max = Math.max(absMax, half[half.length - 1]);
  const zeroY = PAD.top + plotH / 2;
  const y = (v) => zeroY - (v / max) * (plotH / 2);

  const ticks = [...half.slice(1).map((t) => -t).reverse(), 0, ...half.slice(1)];
  const grid = ticks
    .map((t) => {
      const yy = y(t).toFixed(1);
      return `<line class="grid-line" x1="${PAD.left}" y1="${yy}" x2="${W - PAD.right}" y2="${yy}"/>` +
        `<text class="tick" x="${PAD.left - 8}" y="${(Number(yy) + 4).toFixed(1)}" text-anchor="end">${t > 0 ? '+' : ''}${fmt(t)}</text>`;
    })
    .join('');

  const bandRect = band
    ? `<rect class="band" x="${PAD.left}" y="${y(band.hi).toFixed(1)}" width="${plotW}" height="${(y(band.lo) - y(band.hi)).toFixed(1)}"/>`
    : '';

  const slot = plotW / items.length;
  const bw = barWidth(slot);

  const marks = items
    .map((item, i) => {
      const x = PAD.left + i * slot + (slot - bw) / 2;
      const up = item.value >= 0;
      const top = up ? y(item.value) : zeroY;
      const h = Math.abs(y(item.value) - zeroY);
      return `<path class="mark ${up ? 'bar-pos' : 'bar-neg'}" style="animation-delay:${Math.min(i * 8, 480)}ms" d="${columnPath(x, top, bw, h, up)}"/>`;
    })
    .join('');

  const hits = items
    .map((item, i) => {
      const x = PAD.left + i * slot;
      const sign = item.value >= 0 ? '+' : '';
      return `<rect class="hit" x="${x.toFixed(1)}" y="${PAD.top}" width="${slot.toFixed(1)}" height="${plotH}" ` +
        `${markData(labelPrefix + item.label, `${sign}${fmt(item.value, 1)} ${unit}`)} data-i="${i}"/>`;
    })
    .join('');

  return `<div class="chart-scroll"><svg viewBox="0 0 ${W} ${height}" class="chart" role="img" tabindex="0"
    aria-label="${escapeHtml(summary)}" style="min-width:${Math.max(560, items.length * 14)}px">
    ${bandRect}${grid}${marks}
    <line class="axis-line" x1="${PAD.left}" y1="${zeroY}" x2="${W - PAD.right}" y2="${zeroY}"/>
    ${xLabels(items, slot, PAD.top + plotH, items.length)}
    ${hits}
  </svg></div>`;
}
