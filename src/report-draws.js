/**
 * Khoi "Ket qua cac ky" o cot ben phai bao cao.
 *
 * Moi ky la mot the: dau the la bo so trung, than the la bang giai (so luong giai, gia tri giai).
 * Danh sach xep tu ky gan nhat den ky xa nhat va cuon RIENG - xem lai ket qua cu khong lam mat
 * cho dang doc o phan thong ke ben trai.
 *
 * Chi nhung ky DA co bang giai moi len the: xem `drawList` trong cli.js.
 */

import { escapeHtml, fmt } from './chart-primitives.js';

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** "2026-08-11" -> "Thứ Ba, ngày 11/08/2026". Tach chuoi thay vi new Date(s) de khong lech mui gio. */
function vnDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return escapeHtml(iso);
  return `${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ngày ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/** Cac muc giai cao nhat - duoc len the noi bat thay vi nam trong bang. */
const isTopTier = (tier) => /^(Jackpot|Giải Độc Đắc|Giải Đặc biệt|Giải phụ Đặc biệt)/i.test(tier);

/* ---------- lotto (6/45, 6/55, 5/35) ---------- */

/** O do so ket qua. So dac biet (quyen luc / thu tu) to khac de phan biet voi 6 so chinh. */
function balls(numbers, bonus) {
  const main = numbers.map((n) => `<span class="dball">${String(n).padStart(2, '0')}</span>`).join('');
  const extra = bonus == null ? '' : `<span class="dball is-bonus">${String(bonus).padStart(2, '0')}</span>`;
  return `<div class="draw-balls">${main}${extra}</div>`;
}

/**
 * Cot "ket qua" cua bang giai: "OOOOO|O" -> 5 cham thuong + 1 cham dac biet.
 * Dau '/' ngan cac cach trung khac nhau (giai Khuyen Khich cua 5/35 co 3 cach).
 */
function dots(pattern) {
  const line = (part) => {
    const [main = '', bonusPart = ''] = part.split('|');
    return `<span class="dots">${[...main].map(() => '<i></i>').join('')}${[...bonusPart].map(() => '<i class="is-bonus"></i>').join('')}</span>`;
  };
  return pattern.split('/').map(line).join('');
}

/** Hai o gia tri Jackpot tren dau the - lay tu chinh dong giai tuong ung trong bang. */
function jackpotBoxes(prizes) {
  const tops = prizes.filter((p) => isTopTier(p.tier));
  if (!tops.length) return '';
  const boxes = tops
    .map((p) => `<div><span>Giá trị ${escapeHtml(p.tier)}</span><b>${fmt(p.value)}đ</b></div>`)
    .join('');
  return `<div class="draw-jackpots">${boxes}</div>`;
}

function lottoCard(draw) {
  const rows = draw.prizes
    .map((p) => `<tr><td>${escapeHtml(p.tier)}</td><td>${dots(p.pattern)}</td><td>${fmt(p.winners)}</td><td>${fmt(p.value)}</td></tr>`)
    .join('');

  return `<article class="draw">
  <div class="draw-top">
    <div class="draw-when"><b>Kỳ quay #${escapeHtml(draw.drawId)}</b><span>${vnDate(draw.date)}</span></div>
    ${draw.numbers ? balls(draw.numbers, draw.bonus) : ''}
    ${jackpotBoxes(draw.prizes)}
  </div>
  <table class="draw-prizes">
    <thead><tr><th>Giải thưởng</th><th>Kết quả</th><th>SL giải</th><th>Giá trị (đ)</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</article>`;
}

/* ---------- max3d, max3dpro ---------- */

const tokens = (numbers) => (numbers ? numbers.split(' ').filter(Boolean) : []);

/** O do so to cho giai cao nhat: moi chu so mot o, cac bo ba ngan bang vach doc. */
function digitBalls(nums) {
  const group = (n) => `<span class="d3">${[...n].map((d) => `<span class="dball">${d}</span>`).join('')}</span>`;
  return `<div class="draw-balls">${nums.map(group).join('<i class="d3-sep"></i>')}</div>`;
}

/**
 * Giai thap hon co toi 20 bo ba so. Ve tung chu so mot se thanh hang tram o moi the va lam
 * phinh file HTML, nen cac muc nay dung the gon: ca bo ba nam trong mot vien.
 */
const chips = (nums) => `<div class="chips">${nums.map((n) => `<b>${escapeHtml(n)}</b>`).join('')}</div>`;

function max3dTopBlock(p) {
  return `<div class="d3-top">
  ${p.note ? `<p class="d3-note">${escapeHtml(p.note)}</p>` : ''}
  ${digitBalls(tokens(p.numbers))}
  <div class="d3-top-foot">
    <div><span>${escapeHtml(p.tier)} (VNĐ)</span><b>${fmt(p.value)}</b></div>
    <div class="right"><span>Số lượng giải</span><b>${fmt(p.winners)}</b></div>
  </div>
</div>`;
}

/**
 * @param {object} p dong giai
 * @param {Set<string>} shown cac bo ba so DA hien o cac muc giai tren; ham nay bo sung vao
 */
function max3dRow(p, shown) {
  const nums = tokens(p.numbers);
  /*
   * Cac muc giai thap chi lay lai chinh nhung bo so cua muc tren (vd "Giai tu: trung 2 bo ba so
   * bat ky trong 20 bo ba so" = hop cua Dac biet + Nhat + Nhi + Ba). Ve lai lan thu ba khong them
   * thong tin gi ma cau mo ta ben canh da noi ro, chi lam roi mat va phinh file.
   */
  const repeated = nums.length > 0 && nums.every((n) => shown.has(n));
  for (const n of nums) shown.add(n);

  return `<div class="d3-row">
  <div class="d3-row-name"><b>${escapeHtml(p.tier)}</b><span>${fmt(p.value)}</span></div>
  <div class="d3-row-nums">${p.note ? `<p class="d3-note">${escapeHtml(p.note)}</p>` : ''}${repeated ? '' : chips(nums)}</div>
  <div class="d3-row-count"><span>SL giải</span><b>${fmt(p.winners)}</b></div>
</div>`;
}

/**
 * Max 3D ban 2 loi choi tren cung mot ve (bo 3 va bo 6 chu so) nen mot ky co 2 bang giai;
 * Max 3D Pro chi co bo 6. Nhom theo loi choi de khong tron 2 co cau giai vao nhau.
 */
function max3dCard(draw, product) {
  const playLabel = (id) => product.plays.find((p) => p.id === id)?.label ?? '';
  const byPlay = new Map();
  for (const p of draw.prizes) {
    if (!byPlay.has(p.play)) byPlay.set(p.play, []);
    byPlay.get(p.play).push(p);
  }

  const blocks = [...byPlay]
    .map(([play, prizes]) => {
      const label = playLabel(play);
      const tops = prizes.filter((p) => isTopTier(p.tier));
      // Bo so cua muc cao nhat tinh la "da hien" - muc thap thuong lap lai chinh chung
      const shown = new Set(tops.flatMap((p) => tokens(p.numbers)));
      const rest = prizes.filter((p) => !isTopTier(p.tier)).map((p) => max3dRow(p, shown)).join('');
      return `${byPlay.size > 1 && label ? `<p class="d3-play">${escapeHtml(label)}</p>` : ''}${tops.map(max3dTopBlock).join('')}${rest}`;
    })
    .join('');

  return `<article class="draw">
  <div class="draw-top">
    <div class="draw-when"><b>Kỳ quay #${escapeHtml(draw.drawId)}</b><span>${vnDate(draw.date)}</span></div>
  </div>
  <div class="draw-body">${blocks}</div>
</article>`;
}

/* ---------- khung ngoai ---------- */

/**
 * @param {object} product cau hinh san pham
 * @param {Array} drawList cac ky kem bang giai, da xep moi -> cu
 */
export function drawsRail(product, drawList) {
  if (!drawList?.length) {
    return `<aside class="draws"><div class="draws-head"><h2>Kết quả các kỳ</h2>
    <p class="caption">Chưa có dữ liệu giải thưởng. Chạy <code>node src/cli.js prizes</code> để tải.</p></div></aside>`;
  }

  const cards = drawList
    .map((d) => (product.kind === 'lotto' ? lottoCard(d) : max3dCard(d, product)))
    .join('');

  return `<aside class="draws" aria-label="Kết quả các kỳ ${escapeHtml(product.label)}">
  <div class="draws-head">
    <h2>Kết quả các kỳ</h2>
    <p class="caption">${fmt(drawList.length)} kỳ gần nhất · #${escapeHtml(drawList[0].drawId)} → #${escapeHtml(drawList[drawList.length - 1].drawId)}</p>
  </div>
  <div class="draws-scroll" tabindex="0">${cards}</div>
</aside>`;
}
