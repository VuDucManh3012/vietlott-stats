#!/usr/bin/env node
/**
 * CLI vietlott-stats.
 *
 *   node src/cli.js fetch  --product 645 [--all] [--max-pages 400]
 *   node src/cli.js stats  --product 645
 *   node src/cli.js report --product 645
 *   node src/cli.js all    [--all]            # fetch + report cho moi san pham
 */

import fs from 'node:fs';
import path from 'node:path';
import { PRODUCT_IDS, getProduct } from './products.js';
import { crawlProduct } from './crawler.js';
import {
  ensureDirs, readLottoDraws, readMax3dRows, writeLottoDraws, writeMax3dRows,
  readPrizes, writePrizes, mergeByKey, csvPath, prizeCsvPath, REPORT_DIR,
} from './csv-store.js';
import { crawlPrizes } from './crawl-prizes.js';
import { computeLottoStats } from './stats-lotto.js';
import { computeMax3dStats } from './stats-max3d.js';
import { lottoDuplicates, max3dTopPrizeDuplicates } from './stats-duplicates.js';
import { pickLotto, pickMax3dPlay, max3dDraws, max3dPools, max3dUsed6 } from './random-picker.js';
import { packDraws, packMax3d } from './report-picker.js';
import { renderCombinedReport } from './report-html.js';
import { printLottoStats, printMax3dStats } from './print-stats.js';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

/** Doc du lieu da luu, tra ve { rows, keyFn } dung cho ca 2 ho san pham. */
function loadStored(product) {
  return product.kind === 'lotto'
    ? { rows: readLottoDraws(product), keyFn: (r) => r.drawId }
    : { rows: readMax3dRows(product), keyFn: (r) => `${r.drawId}|${r.prize}|${r.slot}` };
}

async function cmdFetch(product, args) {
  ensureDirs();
  const { rows: stored, keyFn } = loadStored(product);
  const knownDrawIds = new Set(stored.map((r) => r.drawId));
  const full = Boolean(args.all) || stored.length === 0;

  console.log(`\n[${product.label}] da co ${knownDrawIds.size} ky. Che do: ${full ? 'tai toan bo' : 'bo sung ky moi'}`);

  const fresh = await crawlProduct(product, {
    knownDrawIds,
    full,
    maxPages: Number(args['max-pages'] ?? 400),
    onProgress: ({ pageIndex, draws }) => {
      process.stdout.write(`\r  trang ${pageIndex + 1} ... ${draws} ky moi   `);
    },
  });
  process.stdout.write('\n');

  const { rows: merged, added } = mergeByKey(stored, fresh, keyFn);
  const count = product.kind === 'lotto'
    ? writeLottoDraws(product, merged)
    : writeMax3dRows(product, merged);

  console.log(`  them ${added} dong moi -> tong ${count} dong tai ${csvPath(product.id)}`);
  return added;
}

/** Cac ky da luu, moi -> cu. Dung chung cho ca 2 ho: max3d co nhieu dong moi ky nen phai khu trung. */
function storedDraws(product) {
  const seen = new Map();
  const rows = product.kind === 'lotto' ? readLottoDraws(product) : readMax3dRows(product);
  for (const r of rows) if (!seen.has(r.drawId)) seen.set(r.drawId, r.date);
  return [...seen].sort((a, b) => Number(b[0]) - Number(a[0])).map(([drawId, date]) => ({ drawId, date }));
}

/** Tai bang giai thuong cho cac ky gan nhat (moi ky = 1 request nen phai gioi han cua so). */
async function cmdPrizes(product, args) {
  ensureDirs();
  const draws = storedDraws(product);
  if (!draws.length) return console.error(`[${product.label}] chua co ky nao. Chay lenh fetch truoc.`);

  const limit = Number(args['prize-limit'] ?? 100);
  const have = readPrizes(product);

  console.log(`\n[${product.label}] bang giai: da co ${have.size} ky, dang xet ${Math.min(limit, draws.length)} ky gan nhat`);

  const { fetched, failed } = await crawlPrizes(product, draws.map((d) => d.drawId), {
    have,
    limit,
    refresh: Boolean(args.refresh),
    onProgress: ({ done, total }) => process.stdout.write(`\r  ${done}/${total} ky ...   `),
  });
  if (fetched || failed.length) process.stdout.write('\n');

  if (!fetched) {
    console.log(failed.length ? `  khong lay duoc ky nao (${failed.length} loi)` : '  da du du lieu, khong can tai them');
    return;
  }

  const { draws: drawCount, rows } = writePrizes(product, have);
  console.log(`  them ${fetched} ky -> tong ${drawCount} ky / ${rows} dong giai tai ${prizeCsvPath(product.id)}`);
  if (failed.length) console.log(`  bo qua ${failed.length} ky khong doc duoc: ${failed.slice(0, 5).join(', ')}${failed.length > 5 ? ' ...' : ''}`);
}

function buildStats(product) {
  if (product.kind === 'lotto') {
    const draws = readLottoDraws(product);
    if (!draws.length) return null;
    draws.sort((a, b) => Number(b.drawId) - Number(a.drawId));
    const stats = computeLottoStats(draws, product);
    stats.duplicates = lottoDuplicates(draws, product);
    // Du lieu cho khoi sinh day so trong bao cao HTML
    stats.pickerData = {
      kind: 'lotto',
      maxNumber: product.maxNumber,
      balls: product.ballsPerDraw,
      minMatch: product.minPrizeMatch,
      total: draws.length,
      draws: packDraws(draws),
    };
    return stats;
  }
  const rows = readMax3dRows(product);
  if (!rows.length) return null;
  const stats = computeMax3dStats(rows, product);
  stats.duplicates = max3dTopPrizeDuplicates(rows);

  const draws = max3dDraws(rows);
  const hasD3 = product.plays.some((p) => p.id === 'd3');
  const pools = hasD3 ? max3dPools(draws) : null;
  // Nhung ky quay da nen; pool tinh trong trinh duyet (loi choi 6 chu so co 1 trieu kha nang)
  stats.pickerData = {
    kind: 'max3d',
    plays: product.plays,
    total: draws.length,
    draws: packMax3d(draws),
    counts: {
      d3: pools ? { top: pools.top.length, all: pools.all.length } : null,
      d6: { top: max3dUsed6(draws, 'top').size, all: max3dUsed6(draws, 'all').size },
    },
  };
  return stats;
}

function cmdStats(product) {
  const stats = buildStats(product);
  if (!stats) return console.error(`[${product.label}] chua co du lieu. Chay lenh fetch truoc.`);
  if (product.kind === 'lotto') printLottoStats(stats);
  else printMax3dStats(stats);
}

/**
 * Danh sach ky kem bang giai cho khoi ket qua ben phai bao cao.
 *
 * Chi giu ky DA co bang giai: mot the thieu so lieu giai chi con lai bo so, khong dang mot the
 * rieng - va dung mo hinh nay thi so the trong trang bang dung cua so da crawl (--prize-limit).
 */
function drawList(product) {
  const prizes = readPrizes(product);
  if (!prizes.size) return [];

  const lotto = new Map();
  if (product.kind === 'lotto') for (const d of readLottoDraws(product)) lotto.set(d.drawId, d);

  return storedDraws(product)
    .filter((d) => prizes.has(d.drawId))
    .map((d) => ({
      drawId: d.drawId,
      date: d.date,
      numbers: lotto.get(d.drawId)?.numbers ?? null,
      bonus: lotto.get(d.drawId)?.bonus ?? null,
      prizes: prizes.get(d.drawId),
    }));
}

/** Tat ca san pham gop vao MOT file, moi san pham mot tab. */
function cmdReport(products) {
  ensureDirs();
  const entries = [];
  for (const product of products) {
    const stats = buildStats(product);
    if (!stats) {
      console.error(`  [${product.label}] chua co du lieu, bo qua. Chay lenh fetch truoc.`);
      continue;
    }
    stats.drawList = drawList(product);
    entries.push({ product, kind: product.kind, stats });
  }
  if (!entries.length) return console.error('Chua co du lieu nao de dung bao cao.');

  const out = path.join(REPORT_DIR, 'vietlott.html');
  fs.writeFileSync(out, renderCombinedReport(entries), 'utf8');
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`  bao cao: ${out} (${entries.length} san pham, ${kb}KB)`);
}

/**
 * Sinh day so ngau nhien tranh trung ky cu.
 * Che do `all` co the bat kha thi - phai bao ro thay vi im lang tra ve it ket qua hon.
 */
/** Loi choi hop le cua san pham; mac dinh la loi choi dau tien khai bao. */
function resolvePlay(product, args) {
  const first = product.plays[0].id;
  if (!args.play || args.play === true) return first;
  const play = product.plays.find((p) => p.id === String(args.play));
  if (play) return play.id;

  // Khong nem loi: lenh random co the chay cho NHIEU san pham cung luc, mot san pham khong
  // co loi choi do (vd Max 3D Pro khong co d3) khong nen lam hong ca loat
  console.log(`  Bo qua --play ${args.play}: ${product.label} chi co ${product.plays.map((p) => p.id).join(', ')}`);
  return first;
}

function cmdRandom(product, args) {
  const mode = args.mode === 'all' ? 'all' : 'top';
  const count = Number(args.count ?? 5);
  const label = mode === 'all' ? 'tránh trùng MỌI giải' : 'tránh trùng GIẢI CAO NHẤT';

  console.log(`\n[${product.label}] ${count} dãy ngẫu nhiên · ${label}`);

  if (product.kind === 'lotto') {
    const draws = readLottoDraws(product);
    if (!draws.length) return console.error('  Chua co du lieu. Chay lenh fetch truoc.');

    const minMatch = Number(args['min-match'] ?? product.minPrizeMatch);
    const res = pickLotto(draws, { ...product, minPrizeMatch: minMatch }, { mode, count });

    console.log(`  Doi chieu voi ${draws.length} ky da quay · dieu kien: trung toi da ${res.limit}/${res.ballsPerDraw} so voi moi ky`);
    if (mode === 'all') console.log(`  (nguong giai thap nhat dang dung: trung ${minMatch} so — doi bang --min-match N)`);

    for (const p of res.picks) {
      console.log(`    ${p.numbers.map((n) => String(n).padStart(2, '0')).join('  ')}   (trung nhieu nhat ${p.maxOverlap} so)`);
    }
    if (!res.feasible) {
      console.log(`\n  KHONG TIM DUOC day thoa man sau ${res.tried.toLocaleString('vi-VN')} lan thu.`);
      if (res.best) {
        console.log(`  Day tot nhat tim duoc: ${res.best.numbers.map((n) => String(n).padStart(2, '0')).join('  ')} (trung nhieu nhat ${res.best.maxOverlap} so)`);
      }
      console.log('  Voi so ky da quay lon nhu vay, gan nhu moi day deu trung du so de trung mot giai nao do voi it nhat mot ky cu.');
    }
  } else {
    const rows = readMax3dRows(product);
    if (!rows.length) return console.error('  Chua co du lieu. Chay lenh fetch truoc.');

    const play = resolvePlay(product, args);
    const draws = max3dDraws(rows);
    const res = pickMax3dPlay(draws, { play, mode, count });
    const playLabel = product.plays.find((p) => p.id === play).label;

    console.log(`  Loi choi: ${playLabel} · doi chieu voi ${draws.length} ky`);
    console.log(`  Da trung giai: ${res.usedSize.toLocaleString('vi-VN')}/${res.space.toLocaleString('vi-VN')} bo so · con lai ${res.poolSize.toLocaleString('vi-VN')}`);
    if (play === 'd6' && mode === 'all') {
      console.log('  (che do all chi phu toi giai Ba - giai Tu/Nam/Sau chi can trung 1 bo 3 chu so nen khong the tranh)');
    }

    if (!res.picks.length) {
      console.log('\n  KHONG CON bo so nao thoa man: toan bo 1000 bo 3 chu so deu da tung ra.');
      console.log('  Thu che do --mode top de chi tranh trung giai Dac biet.');
      return;
    }
    // Bo 6 chu so in tach 2 nhom cho de doi chieu voi ve
    for (const p of res.picks) {
      console.log(`    ${p.number.length === 6 ? `${p.number.slice(0, 3)} ${p.number.slice(3)}` : p.number}`);
    }
    if (!res.feasible) console.log(`\n  Chi sinh duoc ${res.picks.length}/${count} bo so thoa man.`);
  }

  console.log('\n  Luu y: tranh trung ky cu KHONG lam tang co hoi trung thuong.');
  console.log('  Moi day so deu co xac suat y het nhau o ky sap toi.');
}

function resolveProducts(args) {
  if (!args.product || args.product === true) return PRODUCT_IDS.map(getProduct);
  return String(args.product).split(',').map((p) => getProduct(p.trim()));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? 'help';
  const products = resolveProducts(args);

  switch (command) {
    case 'fetch':
      for (const p of products) await cmdFetch(p, args);
      break;
    case 'prizes':
      for (const p of products) await cmdPrizes(p, args);
      break;
    case 'stats':
      for (const p of products) cmdStats(p);
      break;
    case 'report':
      cmdReport(products);
      break;
    case 'random':
      for (const p of products) cmdRandom(p, args);
      break;
    case 'all':
      for (const p of products) await cmdFetch(p, args);
      for (const p of products) await cmdPrizes(p, args);
      cmdReport(products);
      break;
    default:
      console.log(`vietlott-stats - thu thap ket qua Vietlott va thong ke tan suat

  node src/cli.js fetch  --product 645        tai ky moi (lan dau tu dong tai toan bo)
  node src/cli.js fetch  --product 645 --all  tai lai toan bo lich su
  node src/cli.js prizes --product 645        tai bang giai thuong cac ky gan nhat
    --prize-limit N        so ky gan nhat can co bang giai (mac dinh 100)
    --refresh              tai lai ca nhung ky da co bang giai
  node src/cli.js stats  --product 645        in thong ke ra terminal
  node src/cli.js report                      xuat bao cao HTML (1 file, moi san pham 1 tab)
  node src/cli.js all                         fetch + prizes + report cho tat ca san pham

  Bang giai chi co tren trang chi tiet tung ky (1 request/ky) nen chi tai cua so ky gan day;
  khoi ket qua ben phai bao cao hien dung nhung ky da co bang giai.

  node src/cli.js random --product 645                    5 day ngau nhien khong trung ky cu
  node src/cli.js random --product 645 --mode all         tranh trung MOI giai (co the bat kha thi)
  node src/cli.js random --product max3d --count 10       10 bo so 3 chu so (cuoc co ban)
  node src/cli.js random --product max3d --play d6        bo 6 chu so (Max 3D+)
    --mode top (mac dinh)  chi tranh trung giai cao nhat
    --mode all             tranh trung moi giai
    --min-match N          nguong giai thap nhat cua lotto (mac dinh 3)
    --play d3|d6           loi choi Max 3D: d3 = 1 bo 3 chu so, d6 = 2 bo (Max 3D+)
                           Max 3D Pro chi co d6 - ve luon gom 2 bo 3 chu so

San pham: ${PRODUCT_IDS.join(', ')} (bo --product de chay tat ca, hoac dung dau phay: --product 645,655)`);
  }
}

main().catch((err) => {
  console.error(`\nLoi: ${err.message}`);
  process.exit(1);
});
