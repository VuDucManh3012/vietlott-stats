/**
 * Sinh day so ngau nhien tranh trung voi cac ky da quay.
 *
 * QUAN TRONG: viec tranh trung KHONG lam tang co hoi trung thuong. Moi day so deu co xac suat
 * y het nhau o ky sap toi. Tien ich nay chi phuc vu so thich "khong dat lai day da tung ra".
 *
 * Hai che do:
 *   top - chi tranh trung GIAI CAO NHAT (bo so jackpot / bo so giai Dac biet)
 *   all - tranh trung MOI GIAI (voi lotto: trung it hon nguong giai thap nhat voi moi ky)
 *
 * Che do `all` co the BAT KHA THI - ham tra ve co `feasible` de ben goi bao lai cho nguoi dung
 * thay vi quay vong vo han.
 */

function popcount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

function maskOf(numbers) {
  let lo = 0, hi = 0;
  for (const n of numbers) {
    if (n <= 32) lo |= 1 << (n - 1);
    else hi |= 1 << (n - 33);
  }
  return { lo, hi };
}

function randomSet(maxNumber, size) {
  const pick = new Set();
  while (pick.size < size) pick.add(1 + Math.floor(Math.random() * maxNumber));
  return [...pick].sort((a, b) => a - b);
}

/**
 * Mega 6/45, Power 6/55, Lotto 5/35.
 * @param {{mode:'top'|'all', count:number, attempts:number}} opts
 */
export function pickLotto(draws, product, { mode = 'top', count = 5, attempts = 20000 } = {}) {
  const { maxNumber, ballsPerDraw, minPrizeMatch } = product;

  // Muc trung toi da duoc phep voi bat ky ky cu nao
  const limit = mode === 'all' ? minPrizeMatch - 1 : ballsPerDraw - 1;

  const masks = draws.map((d) => maskOf(d.numbers));
  const picks = [];
  let best = null;
  let tried = 0;

  while (picks.length < count && tried < attempts) {
    tried++;
    const numbers = randomSet(maxNumber, ballsPerDraw);
    const m = maskOf(numbers);

    let worst = 0;
    for (const s of masks) {
      const overlap = popcount(m.lo & s.lo) + popcount(m.hi & s.hi);
      if (overlap > worst) worst = overlap;
      if (worst > limit) break; // da hong, khong can do tiep
    }

    if (worst <= limit) picks.push({ numbers, maxOverlap: worst });
    else if (!best || worst < best.maxOverlap) best = { numbers, maxOverlap: worst };
  }

  return {
    mode,
    limit,
    ballsPerDraw,
    picks,
    best,
    tried,
    feasible: picks.length === count,
  };
}

/**
 * Max 3D / Max 3D Pro.
 *
 * Moi ky quay ra 20 bo 3 chu so, chia co dinh thanh 4 giai: DB 2, Nhat 4, Nhi 6, Ba 8.
 * Tren do co HAI loi choi voi khong gian dat cuoc khac han nhau:
 *
 *   d3 - ve cuoc MOT bo 3 chu so (chi Max 3D co).            1.000 kha nang
 *   d6 - ve cuoc HAI bo 3 chu so = mot bo 6 chu so           1.000.000 kha nang
 *        (Max 3D+ tren ve Max 3D, va toan bo Max 3D Pro)
 *
 * Voi d6 thu tu CO y nghia: trung dung thu tu la giai Dac biet, nguoc thu tu la giai Phu
 * Dac biet - deu la trung, nen ca hai chieu cung bi coi la "da tung ra".
 */

/** So bo so cua tung giai, theo dung thu tu hien tren trang ket qua. */
export const MAX3D_TIER_SIZES = [2, 4, 6, 8];

// Do khop theo thu tu, khong dao: 'Giai ba' phai xet sau cung
const MAX3D_TIER_PATTERNS = [/đặc biệt/i, /nhất/i, /nhì/i, /ba/i];

function tierIndex(prize) {
  for (let i = 0; i < MAX3D_TIER_PATTERNS.length; i++) {
    if (MAX3D_TIER_PATTERNS[i].test(prize)) return i;
  }
  return -1;
}

/**
 * Gom cac dong CSV thanh mang ky, moi ky la mang 4 giai xep theo dung thu tu quay (`slot`).
 * Thu tu slot la bat buoc: no quyet dinh bo 6 chu so nao trung giai Dac biet.
 *
 * Ky khong du 2/4/6/8 bo so bi bo qua - du lieu thieu thi khong ghep cap dung duoc.
 */
export function max3dDraws(rows) {
  const byDraw = new Map();
  for (const row of rows) {
    const tier = tierIndex(row.prize);
    if (tier === -1) continue;
    if (!byDraw.has(row.drawId)) byDraw.set(row.drawId, MAX3D_TIER_SIZES.map(() => []));
    byDraw.get(row.drawId)[tier][row.slot] = row.number;
  }
  return [...byDraw.values()].filter((tiers) =>
    tiers.every((tier, i) => tier.length === MAX3D_TIER_SIZES[i] && tier.every(Boolean)));
}

/**
 * Loi choi 3 chu so: chi co 1.000 kha nang nen liet ke thang tap con lai,
 * biet ngay che do nao con kha thi ma khong can lay mau ngau nhien.
 */
export function max3dPools(draws) {
  const usedTop = new Set();
  const usedAll = new Set();
  for (const tiers of draws) {
    for (const number of tiers[0]) usedTop.add(number);
    for (const tier of tiers) for (const number of tier) usedAll.add(number);
  }

  const top = [];
  const all = [];
  for (let i = 0; i < 1000; i++) {
    const key = String(i).padStart(3, '0');
    if (!usedTop.has(key)) top.push(key);
    if (!usedAll.has(key)) all.push(key);
  }
  return { top, all, usedTop: usedTop.size, usedAll: usedAll.size };
}

/**
 * Cac bo 6 chu so DA TUNG TRUNG GIAI - tap cam cua loi choi 6 chu so.
 *
 *   top - chi giai Dac biet: dung thu tu (giai DB) va nguoc thu tu (giai Phu DB).
 *   all - them Nhat/Nhi/Ba. Cac giai nay trung khi ve co 2 bo so nam trong 4/6/8 bo da quay,
 *         khong rang buoc thu tu -> liet ke moi cap CO thu tu. Khoang 100 bo moi ky.
 *
 * Khong phu duoc giai Tu/Nam/Sau: cac giai do chi can trung MOT bo 3 chu so, ma ca 1.000
 * bo 3 chu so deu da tung ra - tranh tron moi giai la bat kha thi.
 */
export function max3dUsed6(draws, mode = 'top') {
  const used = new Set();
  for (const tiers of draws) {
    const tierList = mode === 'all' ? tiers : [tiers[0]];
    for (const tier of tierList) {
      for (let i = 0; i < tier.length; i++) {
        for (let j = 0; j < tier.length; j++) {
          if (i !== j) used.add(tier[i] + tier[j]);
        }
      }
    }
  }
  return used;
}

/** Xao tron tai cho (Fisher-Yates) roi lay `count` phan tu dau. */
export function sample(pool, count) {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function pickMax3d(draws, { mode = 'top', count = 5 } = {}) {
  const pools = max3dPools(draws);
  const pool = mode === 'all' ? pools.all : pools.top;

  return {
    play: 'd3',
    mode,
    space: 1000,
    picks: sample(pool, count).map((number) => ({ number })),
    poolSize: pool.length,
    usedSize: mode === 'all' ? pools.usedAll : pools.usedTop,
    feasible: pool.length > 0,
  };
}

/**
 * Loi choi 6 chu so. KHONG liet ke pool: khong gian 1.000.000 ma tap cam chi vai chuc nghin,
 * nen boc ngau nhien roi loai la du - re hon han viec dung mot mang 1 trieu phan tu
 * (chua ke bao cao HTML se phinh them vai MB neu nhung ca mang do vao trang).
 */
export function pickMax3dPair(draws, { mode = 'top', count = 5, attempts = 20000 } = {}) {
  const used = max3dUsed6(draws, mode);
  const picks = [];
  const seen = new Set();
  let tried = 0;

  while (picks.length < count && tried < attempts) {
    tried++;
    const number = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    if (used.has(number) || seen.has(number)) continue;
    seen.add(number);
    picks.push({ number });
  }

  return {
    play: 'd6',
    mode,
    space: 1000000,
    picks,
    poolSize: 1000000 - used.size,
    usedSize: used.size,
    tried,
    feasible: picks.length === count,
  };
}

/** Chon dung ham theo loi choi. Dung chung cho CLI va trang bao cao de khoi lech logic. */
export function pickMax3dPlay(draws, { play = 'd3', mode = 'top', count = 5 } = {}) {
  return play === 'd6'
    ? pickMax3dPair(draws, { mode, count })
    : pickMax3d(draws, { mode, count });
}
