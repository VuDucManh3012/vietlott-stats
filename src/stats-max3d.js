/**
 * Thong ke cho Max 3D / Max 3D Pro.
 *
 * Du lieu vao dang long: 1 dong = 1 bo 3 chu so trung o 1 giai cua 1 ky.
 * Hai goc nhin huu ich: tan suat bo so 000-999, va tan suat tung chu so theo vi tri.
 */

export function computeMax3dStats(rows, product) {
  const drawIds = new Set(rows.map((r) => r.drawId));
  const dates = [...new Set(rows.map((r) => r.date))].sort();

  // Tan suat tung bo 3 chu so (000..999)
  const numberCounts = new Map();
  // digitCounts[vi tri][chu so]
  const digitCounts = [new Array(10).fill(0), new Array(10).fill(0), new Array(10).fill(0)];
  const prizeCounts = new Map();

  for (const row of rows) {
    numberCounts.set(row.number, (numberCounts.get(row.number) ?? 0) + 1);
    prizeCounts.set(row.prize, (prizeCounts.get(row.prize) ?? 0) + 1);
    for (let pos = 0; pos < 3; pos++) {
      digitCounts[pos][Number(row.number[pos])]++;
    }
  }

  // Liet ke du 1000 bo so de thay ca nhung bo chua bao gio ra
  const allNumbers = [];
  for (let i = 0; i < 1000; i++) {
    const key = String(i).padStart(3, '0');
    const count = numberCounts.get(key) ?? 0;
    allNumbers.push({ number: key, count, pct: rows.length ? (count / rows.length) * 100 : 0 });
  }

  const expectedPerNumber = rows.length / 1000;

  // Moi vi tri, moi chu so 0-9 co xac suat 1/10 -> phan phoi nhi thuc, dung de ve dai nhieu
  const digitExpected = rows.length / 10;
  const digitSigma = Math.sqrt(rows.length * 0.1 * 0.9);
  // Xac suat mot bo so cu the (000-999) trung o mot lan quay = 1/1000
  const numberSigma = Math.sqrt(rows.length * 0.001 * 0.999);

  return {
    product,
    total: drawIds.size,
    totalNumbers: rows.length,
    expected: expectedPerNumber,
    dateFrom: dates[0] ?? null,
    dateTo: dates.at(-1) ?? null,
    latestDrawId: [...drawIds].sort((a, b) => Number(b) - Number(a))[0] ?? null,
    allNumbers,
    hottest: [...allNumbers].sort((a, b) => b.count - a.count).slice(0, 20),
    coldest: [...allNumbers].sort((a, b) => a.count - b.count).slice(0, 20),
    digitCounts,
    digitExpected,
    numberSigma,
    digitBand: { lo: Math.max(0, digitExpected - 2 * digitSigma), hi: digitExpected + 2 * digitSigma },
    prizes: [...prizeCounts.entries()].map(([prize, count]) => ({ prize, count })),
  };
}
