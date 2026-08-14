/** In thong ke ra terminal duoi dang bang gon, dung cho lenh `stats`. */

const pad = (s, w, right = false) => {
  const str = String(s);
  return right ? str.padStart(w) : str.padEnd(w);
};

function printTable(title, headers, widths, rows) {
  console.log(`\n  ${title}`);
  console.log('  ' + headers.map((h, i) => pad(h, widths[i], i > 0)).join('  '));
  console.log('  ' + widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) {
    console.log('  ' + row.map((c, i) => pad(c, widths[i], i > 0)).join('  '));
  }
}

const DISCLAIMER =
  '  Luu y: day la thong ke lich su. Cac ky quay doc lap nhau nen so lieu nay khong du doan duoc ky sau.';

export function printLottoStats(stats) {
  const { product } = stats;
  console.log(`\n=== ${product.label} ===`);
  console.log(`  ${stats.total} ky | ${stats.dateFrom} -> ${stats.dateTo} | ky moi nhat ${stats.latestDrawId}`);
  console.log(`  Ky vong moi so: ${stats.expected.toFixed(1)} lan`);

  printTable(
    'Ra nhieu nhat',
    ['So', 'Lan', 'Ty le %', 'Lech'],
    [4, 6, 8, 7],
    stats.hottest.map((n) => [n.number, n.count, n.pct.toFixed(2), (n.deviation >= 0 ? '+' : '') + n.deviation.toFixed(1)])
  );

  printTable(
    'Ra it nhat',
    ['So', 'Lan', 'Ty le %', 'Lech'],
    [4, 6, 8, 7],
    stats.coldest.map((n) => [n.number, n.count, n.pct.toFixed(2), (n.deviation >= 0 ? '+' : '') + n.deviation.toFixed(1)])
  );

  printTable(
    'Kho han lau nhat (so ky chua ra)',
    ['So', 'So ky', 'Tong lan'],
    [4, 7, 10],
    stats.longestDrought.map((n) => [n.number, n.drought, n.count])
  );

  printTable(
    'Cap so hay di cung',
    ['Cap', 'So ky'],
    [10, 7],
    stats.pairs.slice(0, 10).map((p) => [`${p.a} + ${p.b}`, p.count])
  );

  printDuplicates(stats.duplicates);
  console.log('\n' + DISCLAIMER);
}

/** Ket qua kiem tra gia thuyet "khong the co 2 ky trung giai cao nhat". */
export function printDuplicates(dup) {
  if (!dup) return;
  console.log('\n  Trung giai cao nhat');
  console.log(`    ${dup.total} ky | ${dup.possible.toLocaleString('vi-VN')} ket qua kha di | ${dup.pairs.toLocaleString('vi-VN')} cap ky`);
  console.log(`    Ky vong: ${dup.expectedDup.toFixed(2)} cap | Xac suat co it nhat 1 cap: ${(dup.chance * 100).toFixed(1)}%`);
  console.log(`    THUC TE: ${dup.duplicates.length} cap trung`);
  for (const d of dup.duplicates) {
    console.log(`      ${d.key}  ->  ky ${d.draws[1].drawId} (${d.draws[1].date})  va  ky ${d.draws[0].drawId} (${d.draws[0].date})`);
  }
  if (dup.overlap) console.log(`    Trung nhieu nhat tung thay: ${dup.maxOverlap} so`);
}

export function printMax3dStats(stats) {
  const { product } = stats;
  console.log(`\n=== ${product.label} ===`);
  console.log(`  ${stats.total} ky | ${stats.totalNumbers} bo so | ${stats.dateFrom} -> ${stats.dateTo} | ky moi nhat ${stats.latestDrawId}`);
  console.log(`  Ky vong moi bo so: ${stats.expected.toFixed(2)} lan`);

  printTable(
    'Bo so ra nhieu nhat',
    ['Bo so', 'Lan', 'Ty le %'],
    [7, 6, 8],
    stats.hottest.slice(0, 10).map((n) => [n.number, n.count, n.pct.toFixed(2)])
  );

  stats.digitCounts.forEach((counts, pos) => {
    printTable(
      `Chu so vi tri ${pos + 1}`,
      ['Chu so', 'Lan'],
      [7, 7],
      counts.map((c, d) => [d, c])
    );
  });

  printDuplicates(stats.duplicates);
  console.log('\n' + DISCLAIMER);
}
