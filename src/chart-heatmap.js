/**
 * Ma tran nhiet cho so lan hai con so cung ra trong mot ky.
 *
 * Ma hoa do lon lien tuc -> dung thang DON SAC (mot mau, nhat den dam). Thang cau vong
 * se lam nguoi doc hieu sai thu tu vi mau khong co thu tu tu nhien.
 */

import { escapeHtml, fmt, markData } from './chart-primitives.js';

const RAMP = ['--seq-100', '--seq-200', '--seq-300', '--seq-400', '--seq-500', '--seq-600', '--seq-700'];

/**
 * @param {{matrix:number[][], size:number, summary?:string}} opts
 */
export function heatmap({ matrix, size, summary = '' }) {
  const cell = 15;
  const pad = 30;
  const dim = pad + size * cell + 6;

  let max = 1;
  for (let a = 1; a <= size; a++) {
    for (let b = 1; b <= size; b++) if (a !== b) max = Math.max(max, matrix[a][b]);
  }

  const cells = [];
  for (let a = 1; a <= size; a++) {
    for (let b = 1; b <= size; b++) {
      if (a === b) continue;
      const v = matrix[a][b];
      if (!v) continue;
      // Buoc thap nhat danh cho gia tri gan 0 nen duoc phep lui ve gan mau nen
      const idx = Math.min(RAMP.length - 1, Math.floor((v / max) * RAMP.length));
      cells.push(
        `<rect class="mark" x="${pad + (b - 1) * cell}" y="${pad + (a - 1) * cell}" ` +
        `width="${cell - 2}" height="${cell - 2}" rx="2" fill="var(${RAMP[idx]})" ` +
        `${markData(`${a} + ${b}`, `${fmt(v)} ky cung ra`)}/>`
      );
    }
  }

  const axis = [];
  for (let i = 5; i <= size; i += 5) {
    axis.push(`<text class="tick" x="${pad + (i - 1) * cell + (cell - 2) / 2}" y="${pad - 9}" text-anchor="middle">${i}</text>`);
    axis.push(`<text class="tick" x="${pad - 7}" y="${pad + (i - 1) * cell + cell - 5}" text-anchor="end">${i}</text>`);
  }

  return `<div class="chart-scroll"><svg viewBox="0 0 ${dim} ${dim}" class="chart" role="img" tabindex="0"
    aria-label="${escapeHtml(summary)}" style="min-width:${Math.min(760, dim)}px;max-width:${dim}px">
    ${cells.join('')}${axis.join('')}
  </svg></div>${legend(max)}`;
}

/** Thang mau lien tuc bat buoc phai co chu giai, khong thi khong doc duoc gia tri. */
function legend(max) {
  const swatches = RAMP.map(
    (v, i) => `<span style="background:var(${v});width:26px;height:10px;display:inline-block"
      aria-label="muc ${i + 1}"></span>`
  ).join('');
  return `<div style="display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;color:var(--ink-2)">
    <span>ít</span><span style="display:flex;gap:2px">${swatches}</span><span>nhiều (tối đa ${fmt(max)} kỳ)</span>
  </div>`;
}
