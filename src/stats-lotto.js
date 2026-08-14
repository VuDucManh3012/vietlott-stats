/**
 * Thong ke cho Mega 6/45 va Power 6/55.
 *
 * LUU Y: cac chi so duoi day mo ta LICH SU. Moi ky quay la doc lap nen tan suat qua khu
 * khong lam thay doi xac suat cua ky sap toi.
 */

/**
 * @param {Array} draws danh sach ky, da sap xep ky moi nhat len dau
 * @param {object} product cau hinh san pham
 */
export function computeLottoStats(draws, product) {
  const total = draws.length;
  const { maxNumber, ballsPerDraw } = product;

  const counts = new Array(maxNumber + 1).fill(0);
  const bonusCounts = new Array(maxNumber + 1).fill(0);
  // drought[n] = so ky da troi qua ke tu lan cuoi n xuat hien (0 = vua ra ky gan nhat)
  const drought = new Array(maxNumber + 1).fill(null);

  draws.forEach((draw, index) => {
    for (const n of draw.numbers) {
      counts[n]++;
      if (drought[n] === null) drought[n] = index;
    }
    if (draw.bonus != null) bonusCounts[draw.bonus]++;
  });

  const expected = total ? (total * ballsPerDraw) / maxNumber : 0;

  // Moi ky, mot so co xac suat p = (so bong)/(dai so) duoc goi ten. So lan xuat hien qua
  // `total` ky theo phan phoi nhi thuc, do lech chuan = can(total * p * (1-p)).
  // Dai +-2 do lech chuan bao phu ~95% ket qua cua mot bo so HOAN TOAN ngau nhien - dung
  // de nguoi doc thay ngay rang cac chenh lech quan sat duoc chi la nhieu, khong phai quy luat.
  const p = ballsPerDraw / maxNumber;
  const sigma = Math.sqrt(total * p * (1 - p));

  // Tuong tu cho CAP so: xac suat mot cap cu the cung ra trong 1 ky = C(k,2) / C(N,2).
  // Can thiet vi ma tran nhiet trong "co quy luat" neu khong biet muc nhieu binh thuong.
  const choose2 = (n) => (n * (n - 1)) / 2;
  const pairP = choose2(ballsPerDraw) / choose2(maxNumber);
  const pairExpected = total * pairP;
  const pairSigma = Math.sqrt(total * pairP * (1 - pairP));

  const numbers = [];
  for (let n = 1; n <= maxNumber; n++) {
    numbers.push({
      number: n,
      count: counts[n],
      pct: total ? (counts[n] / total) * 100 : 0,
      // Lech so voi ky vong: duong = ra nhieu hon trung binh
      deviation: counts[n] - expected,
      drought: drought[n] === null ? total : drought[n],
      bonusCount: product.hasBonus ? bonusCounts[n] : null,
    });
  }

  return {
    product,
    total,
    expected,
    sigma,
    band: { lo: Math.max(0, expected - 2 * sigma), hi: expected + 2 * sigma },
    pairExpected,
    pairSigma,
    pairCount: choose2(maxNumber),
    // So nam ngoai dai nay moi dang chu y; thuc te hau nhu luon bang 0
    outliers: numbersOutside(counts, maxNumber, expected, sigma),
    dateFrom: draws.at(-1)?.date ?? null,
    dateTo: draws[0]?.date ?? null,
    latestDrawId: draws[0]?.drawId ?? null,
    numbers,
    hottest: [...numbers].sort((a, b) => b.count - a.count).slice(0, 10),
    coldest: [...numbers].sort((a, b) => a.count - b.count).slice(0, 10),
    longestDrought: [...numbers].sort((a, b) => b.drought - a.drought).slice(0, 10),
    pairs: computeTopPairs(draws, maxNumber),
    pairMatrix: computePairMatrix(draws, maxNumber),
  };
}

/** Liet ke cac so nam ngoai dai +-2 do lech chuan quanh muc ky vong. */
function numbersOutside(counts, maxNumber, expected, sigma) {
  const out = [];
  if (sigma <= 0) return out;
  for (let n = 1; n <= maxNumber; n++) {
    if (Math.abs(counts[n] - expected) > 2 * sigma) out.push({ number: n, count: counts[n] });
  }
  return out;
}

/** Dem so lan 2 so cung xuat hien trong 1 ky. */
function computePairMatrix(draws, maxNumber) {
  const matrix = Array.from({ length: maxNumber + 1 }, () => new Array(maxNumber + 1).fill(0));
  for (const draw of draws) {
    const ns = draw.numbers;
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        matrix[ns[i]][ns[j]]++;
        matrix[ns[j]][ns[i]]++;
      }
    }
  }
  return matrix;
}

function computeTopPairs(draws, maxNumber) {
  const matrix = computePairMatrix(draws, maxNumber);
  const pairs = [];
  for (let a = 1; a <= maxNumber; a++) {
    for (let b = a + 1; b <= maxNumber; b++) {
      if (matrix[a][b] > 0) pairs.push({ a, b, count: matrix[a][b] });
    }
  }
  return pairs.sort((x, y) => y.count - x.count).slice(0, 15);
}
