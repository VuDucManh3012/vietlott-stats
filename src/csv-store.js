/**
 * Doc/ghi CSV cho tung san pham. CSV la nguon du lieu duy nhat (khong dung DB) -> de mo bang Excel,
 * de diff bang git, va de crawl bo sung (chi lay ky moi hon ky da co).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = path.join(ROOT, 'data');
export const REPORT_DIR = path.join(ROOT, 'reports');

export function ensureDirs() {
  for (const dir of [DATA_DIR, REPORT_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

export function csvPath(productId) {
  return path.join(DATA_DIR, `${productId}.csv`);
}

/** Bang giai thuong luu tach khoi bang ket qua: moi ky co NHIEU dong giai, khac nhip crawl. */
export function prizeCsvPath(productId) {
  return path.join(DATA_DIR, `${productId}-prizes.csv`);
}

function serialize(rows, header) {
  const lines = [header.join(',')];
  for (const row of rows) lines.push(header.map((h) => row[h] ?? '').join(','));
  return lines.join('\n') + '\n';
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
  });
}

function readRaw(productId) {
  const file = csvPath(productId);
  if (!fs.existsSync(file)) return [];
  return parseCsv(fs.readFileSync(file, 'utf8'));
}

/** Doc ket qua lotto (6/45, 6/55) da luu, tra ve dang object giong luc parse. */
export function readLottoDraws(product) {
  return readRaw(product.id).map((r) => ({
    drawId: r.draw_id,
    date: r.date,
    numbers: r.numbers.split(' ').map(Number),
    bonus: r.bonus ? Number(r.bonus) : null,
  }));
}

/** Doc ket qua Max 3D da luu (dang long: 1 dong = 1 so trung). */
export function readMax3dRows(product) {
  return readRaw(product.id).map((r) => ({
    drawId: r.draw_id,
    date: r.date,
    prize: r.prize,
    number: r.number,
    slot: Number(r.slot ?? 0),
  }));
}

/** Ghi de toan bo CSV, sap xep ky moi nhat len dau. */
export function writeLottoDraws(product, draws) {
  const sorted = [...draws].sort((a, b) => Number(b.drawId) - Number(a.drawId));
  const rows = sorted.map((d) => ({
    draw_id: d.drawId,
    date: d.date,
    numbers: d.numbers.join(' '),
    bonus: d.bonus ?? '',
  }));
  fs.writeFileSync(csvPath(product.id), serialize(rows, ['draw_id', 'date', 'numbers', 'bonus']), 'utf8');
  return sorted.length;
}

export function writeMax3dRows(product, rows) {
  const sorted = [...rows].sort(
    (a, b) => Number(b.drawId) - Number(a.drawId) || String(a.prize).localeCompare(String(b.prize)) || a.slot - b.slot
  );
  const out = sorted.map((r) => ({
    draw_id: r.drawId,
    date: r.date,
    prize: r.prize,
    number: r.number,
    slot: r.slot,
  }));
  fs.writeFileSync(csvPath(product.id), serialize(out, ['draw_id', 'date', 'prize', 'number', 'slot']), 'utf8');
  return sorted.length;
}

const PRIZE_HEADER = ['draw_id', 'play', 'tier', 'pattern', 'numbers', 'note', 'winners', 'value'];

/**
 * Doc bang giai thuong da luu.
 * @returns {Map<string, Array>} khoa la draw_id, gia tri la cac dong giai cua ky do (giu nguyen thu tu)
 */
export function readPrizes(product) {
  const file = prizeCsvPath(product.id);
  if (!fs.existsSync(file)) return new Map();

  const byDraw = new Map();
  for (const r of parseCsv(fs.readFileSync(file, 'utf8'))) {
    if (!byDraw.has(r.draw_id)) byDraw.set(r.draw_id, []);
    byDraw.get(r.draw_id).push({
      play: r.play,
      tier: r.tier,
      pattern: r.pattern,
      numbers: r.numbers,
      note: r.note,
      winners: Number(r.winners || 0),
      value: Number(r.value || 0),
    });
  }
  return byDraw;
}

/**
 * Ghi de toan bo bang giai, ky moi nhat len dau.
 *
 * Ten giai va cau mo ta lay tu HTML cua vietlott.vn - doi dau phay thanh dau cham phay de khong
 * lam vo cau truc CSV (bo doc/ghi o day tach cot bang split(',') don gian, khong ho tro trich dan).
 */
export function writePrizes(product, byDraw) {
  const rows = [];
  const drawIds = [...byDraw.keys()].sort((a, b) => Number(b) - Number(a));

  for (const drawId of drawIds) {
    for (const p of byDraw.get(drawId)) {
      rows.push({
        draw_id: drawId,
        play: p.play,
        tier: String(p.tier).replaceAll(',', ';'),
        pattern: p.pattern,
        numbers: p.numbers,
        note: String(p.note).replaceAll(',', ';'),
        winners: p.winners,
        value: p.value,
      });
    }
  }

  fs.writeFileSync(prizeCsvPath(product.id), serialize(rows, PRIZE_HEADER), 'utf8');
  return { draws: drawIds.length, rows: rows.length };
}

/** Gop du lieu moi vao cu, khu trung theo khoa. */
export function mergeByKey(oldRows, newRows, keyFn) {
  const map = new Map(oldRows.map((r) => [keyFn(r), r]));
  let added = 0;
  for (const row of newRows) {
    const key = keyFn(row);
    if (!map.has(key)) added++;
    map.set(key, row);
  }
  return { rows: [...map.values()], added };
}
