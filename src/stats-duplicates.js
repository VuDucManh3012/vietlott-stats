/**
 * Kiem tra gia thuyet: "khong the co 2 ky ma giai cao nhat trung nhau".
 *
 * Khong co co che nao ngan viec trung: ky truoc khong loai bo so ra khoi ky sau. Van de chi la
 * xac suat. Day dung la bai toan trung ngay sinh: voi n ky va N kha nang, so CAP ky trung ky vong
 * la C(n,2)/N - lon hon nhieu so voi truc giac, vi so cap tang theo binh phuong so ky.
 */

/** Dem so bit 1 - dung de dem so phan tu chung giua hai bo so. */
function popcount(x) {
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}

function combinations(n, k) {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

/** Xac suat co IT NHAT mot cap trung, xap xi theo bai toan trung ngay sinh. */
function probAtLeastOne(pairs, possible) {
  return 1 - Math.exp(-pairs / possible);
}

/**
 * Mega 6/45 va Power 6/55: "giai cao nhat" la ca bo 6 so (jackpot).
 * @returns thong ke trung lap + phan bo so luong so trung nhau giua moi cap ky
 */
export function lottoDuplicates(draws, product) {
  const { maxNumber, ballsPerDraw } = product;

  // Moi ky ma hoa thanh 2 so nguyen 32 bit (du cho 55 so) de so sanh cap cho nhanh
  const lo = new Int32Array(draws.length);
  const hi = new Int32Array(draws.length);
  const keys = new Map();
  const duplicates = [];

  draws.forEach((draw, i) => {
    for (const n of draw.numbers) {
      if (n <= 32) lo[i] |= 1 << (n - 1);
      else hi[i] |= 1 << (n - 33);
    }
    const key = draw.numbers.join('-');
    if (keys.has(key)) duplicates.push({ key, draws: [keys.get(key), draw] });
    else keys.set(key, draw);
  });

  // Phan bo: moi cap ky trung nhau bao nhieu so
  const overlap = new Array(ballsPerDraw + 1).fill(0);
  for (let i = 0; i < draws.length; i++) {
    for (let j = i + 1; j < draws.length; j++) {
      overlap[popcount(lo[i] & lo[j]) + popcount(hi[i] & hi[j])]++;
    }
  }

  const possible = combinations(maxNumber, ballsPerDraw);
  const pairs = (draws.length * (draws.length - 1)) / 2;

  return {
    label: `bộ ${ballsPerDraw} số`,
    total: draws.length,
    possible,
    pairs,
    duplicates,
    expectedDup: pairs / possible,
    chance: probAtLeastOne(pairs, possible),
    overlap,
    maxOverlap: overlap.reduce((best, c, i) => (c > 0 ? i : best), 0),
  };
}

/**
 * Max 3D / Max 3D Pro: "giai cao nhat" la giai Dac biet - hai bo 3 chu so.
 *
 * Coi la cap KHONG THU TU. Ve cuoc thi thu tu co y nghia (dung thu tu la giai Dac biet, nguoc
 * thu tu la giai Phu Dac biet), nhung ca hai deu la trung hang cao nhat - nen voi cau hoi
 * "hai ky co ra cung ket qua khong" thi 476-882 va 882-476 la mot.
 */
export function max3dTopPrizeDuplicates(rows) {
  const byDraw = new Map();
  for (const r of rows) {
    if (!/đặc biệt/i.test(r.prize)) continue;
    if (!byDraw.has(r.drawId)) byDraw.set(r.drawId, { drawId: r.drawId, date: r.date, numbers: [] });
    byDraw.get(r.drawId).numbers.push(r.number);
  }

  const draws = [...byDraw.values()].filter((d) => d.numbers.length >= 2);
  const keys = new Map();
  const duplicates = [];

  for (const draw of draws) {
    const key = [...draw.numbers].sort().join('-');
    if (keys.has(key)) duplicates.push({ key, draws: [keys.get(key), draw] });
    else keys.set(key, draw);
  }

  // Hai bo so tu 000-999, khong ke thu tu, cho phep trung nhau: C(1000,2) + 1000
  const possible = combinations(1000, 2) + 1000;
  const pairs = (draws.length * (draws.length - 1)) / 2;

  return {
    label: 'giải Đặc biệt',
    total: draws.length,
    possible,
    pairs,
    duplicates,
    expectedDup: pairs / possible,
    chance: probAtLeastOne(pairs, possible),
    overlap: null,
    maxOverlap: null,
  };
}
