/**
 * Dung phan noi dung cho tung san pham.
 *
 * Tra ve MANH HTML, khong phai trang hoan chinh - toan bo 4 san pham duoc ghep vao mot file
 * duy nhat o report-html.js, nen khung trang, CSS va JS chi xuat hien mot lan.
 */

import { barChart, divergingBar } from './chart-bars.js';
import { heatmap } from './chart-heatmap.js';
import { hero, kpiRow, table, tableView, section, fmt } from './report-page.js';
import {
  lottoKpiTips, lottoNumberTip, lottoDroughtTip, lottoPairTip, max3dKpiTips, max3dNumberTip,
} from './report-tips.js';
import { duplicateSection } from './report-duplicates.js';
import { pickerSection } from './report-picker.js';

const range = (stats) => `dữ liệu ${stats.dateFrom ?? '?'} → ${stats.dateTo ?? '?'}`;

/** Noi dung cho Mega 6/45 va Power 6/55. */
export function lottoSection(stats) {
  const { product, numbers, total, expected, sigma, band, outliers } = stats;
  const tips = lottoKpiTips(stats);

  const freq = section(
    'Tần suất từng số',
    `Mỗi cột là số lần con số đó được gọi tên trong ${fmt(total)} kỳ. Đường đứt nét là mức kỳ vọng
     lý thuyết, vùng xám là dải dao động ngẫu nhiên ±2σ. Rê chuột vào từng cột để xem số liệu.`,
    barChart({
      items: numbers.map((n) => ({ label: String(n.number), value: n.count })),
      expected,
      band,
      unit: 'lần',
      labelPrefix: 'Số ',
      summary: `Tần suất ${numbers.length} con số qua ${total} kỳ. Kỳ vọng ${fmt(expected, 1)} lần mỗi số.`,
    }) +
      tableView('Xem số liệu dạng bảng', ['Số', 'Lần ra', 'Tỷ lệ %'],
        numbers.map((n) => [n.number, fmt(n.count), fmt(n.pct, 2)]))
  );

  const deviationNote = outliers.length
    ? `Có ${outliers.length} số nằm ngoài dải: ${outliers.map((o) => o.number).join(', ')}.
       Với ${fmt(numbers.length)} số được kiểm tra, việc vài số vượt dải vẫn là điều bình thường ở mức ngẫu nhiên.`
    : `<b>Không có số nào nằm ngoài dải ±2σ.</b> Toàn bộ chênh lệch quan sát được đều nằm trong
       khoảng mà một bộ số hoàn toàn ngẫu nhiên cũng tạo ra.`;

  const deviation = section(
    'Độ lệch so với kỳ vọng',
    `Cột hướng lên = ra nhiều hơn kỳ vọng, hướng xuống = ít hơn. ${deviationNote}`,
    divergingBar({
      items: numbers.map((n) => ({ label: String(n.number), value: n.deviation })),
      band: { lo: -2 * sigma, hi: 2 * sigma },
      unit: 'lần',
      labelPrefix: 'Số ',
      summary: `Độ lệch của ${numbers.length} con số so với mức kỳ vọng ${fmt(expected, 1)}.`,
    }) +
      tableView('Xem số liệu dạng bảng', ['Số', 'Lệch kỳ vọng', 'Lần ra'],
        numbers.map((n) => [n.number, (n.deviation >= 0 ? '+' : '') + fmt(n.deviation, 1), fmt(n.count)]))
  );

  const drought = section(
    'Số kỳ liên tiếp chưa xuất hiện',
    'Đếm ngược từ kỳ gần nhất. Con số này <b>không</b> làm tăng khả năng ra ở kỳ kế tiếp.',
    barChart({
      items: numbers.map((n) => ({ label: String(n.number), value: n.drought })),
      height: 220,
      unit: 'kỳ',
      labelPrefix: 'Số ',
      summary: 'Số kỳ liên tiếp mỗi con số chưa xuất hiện.',
    }) +
      tableView('Xem số liệu dạng bảng', ['Số', 'Số kỳ chưa ra'],
        numbers.map((n) => [n.number, fmt(n.drought)]))
  );

  const signed = (v) => (v >= 0 ? '+' : '') + fmt(v, 1);
  const numRow = (n) => ({ cells: [n.number, fmt(n.count), signed(n.deviation)], tip: lottoNumberTip(stats, n) });

  const tables = `<div class="cols">
  <div class="panel"><h2>Ra nhiều nhất</h2>${table(['Số', 'Lần', 'Lệch'], stats.hottest.map(numRow))}</div>
  <div class="panel"><h2>Ra ít nhất</h2>${table(['Số', 'Lần', 'Lệch'], stats.coldest.map(numRow))}</div>
  <div class="panel"><h2>Khô hạn lâu nhất</h2>${table(['Số', 'Số kỳ', 'Tổng lần'],
    stats.longestDrought.map((n) => ({ cells: [n.number, fmt(n.drought), fmt(n.count)], tip: lottoDroughtTip(stats, n) })))}</div>
  <div class="panel"><h2>Cặp số hay đi cùng</h2>${table(['Cặp', 'Số kỳ'],
    stats.pairs.map((p) => ({ cells: [`${p.a} + ${p.b}`, fmt(p.count)], tip: lottoPairTip(stats, p) })))}</div>
</div>`;

  const bonus = product.hasBonus
    ? section('Tần suất số quyền lực',
        'Số quyền lực được quay riêng, phân bố độc lập với 6 số chính.',
        barChart({
          items: numbers.map((n) => ({ label: String(n.number), value: n.bonusCount ?? 0 })),
          expected: total / product.maxNumber,
          height: 220,
          unit: 'lần',
          labelPrefix: 'Số quyền lực ',
          summary: 'Tần suất số quyền lực.',
        }))
    : '';

  const pairs = section('Ma trận cặp số',
    `Ô càng đậm là hai số đó càng hay cùng xuất hiện trong một kỳ. Có ${fmt(stats.pairCount)} cặp,
     mỗi cặp kỳ vọng ${fmt(stats.pairExpected, 1)} kỳ với dao động ngẫu nhiên ±${fmt((2 * stats.pairSigma), 1)}.
     <b>Các ô sẫm nhất vẫn nằm trong mức nhiễu</b> — với số lượng cặp lớn như vậy, việc vài cặp
     trông nổi bật là điều chắc chắn xảy ra kể cả khi quay hoàn toàn ngẫu nhiên.`,
    heatmap({
      matrix: stats.pairMatrix,
      size: product.maxNumber,
      summary: `Ma trận ${product.maxNumber}x${product.maxNumber} đếm số kỳ mà hai con số cùng xuất hiện.`,
    }));

  return `${hero(fmt(total), `kỳ quay · ${range(stats)} · kỳ mới nhất ${stats.latestDrawId ?? '—'}`)}
${kpiRow([
    { label: 'Kỳ vọng mỗi số', value: `${fmt(expected, 1)} lần`, tip: tips.expected },
    { label: 'Dao động ngẫu nhiên', value: `±${fmt((2 * sigma), 1)}`, tip: tips.sigma },
    { label: 'Ra nhiều nhất', value: `${stats.hottest[0]?.number ?? '—'} (${fmt(stats.hottest[0]?.count ?? 0)})`, tip: tips.hottest },
    { label: 'Ra ít nhất', value: `${stats.coldest[0]?.number ?? '—'} (${fmt(stats.coldest[0]?.count ?? 0)})`, tip: tips.coldest },
    { label: 'Số vượt dải ±2σ', value: String(outliers.length), tip: tips.outliers },
  ])}
${pickerSection(product, stats.pickerData)}
${freq}${deviation}${drought}${tables}${bonus}${pairs}
${duplicateSection(stats.duplicates, `bộ ${product.ballsPerDraw} số`)}`;
}

/** Noi dung cho Max 3D va Max 3D Pro. */
export function max3dSection(stats) {
  const { product, digitExpected, digitBand } = stats;
  const t = max3dKpiTips(stats);

  const digitCharts = stats.digitCounts
    .map((counts, pos) =>
      section(`Chữ số ở vị trí ${pos + 1}`,
        'Mỗi chữ số 0–9 có xác suất lý thuyết bằng nhau là 1/10.',
        barChart({
          items: counts.map((c, d) => ({ label: String(d), value: c })),
          expected: digitExpected,
          band: digitBand,
          height: 200,
          unit: 'lần',
          labelPrefix: 'Chữ số ',
          summary: `Tần suất chữ số 0-9 ở vị trí ${pos + 1}.`,
        }) +
          tableView('Xem số liệu dạng bảng', ['Chữ số', 'Lần xuất hiện'],
            counts.map((c, d) => [d, fmt(c)])))
    )
    .join('');

  // Voi 1000 bo so, luon co vai bo "noi bat" ke ca khi quay hoan toan ngau nhien
  const rankCaption = `<p class="caption">Trong 1.000 bộ số, mỗi bộ kỳ vọng
    ${fmt(stats.expected, 1)} lần (dao động ngẫu nhiên ±${fmt((2 * stats.numberSigma), 1)}).
    Thứ hạng này <b>không</b> phản ánh khả năng ra ở kỳ sau.</p>`;

  const tables = `<div class="cols">
  <div class="panel"><h2>20 bộ số ra nhiều nhất</h2>${rankCaption}${table(['Bộ số', 'Lần', 'Tỷ lệ %'],
    stats.hottest.map((n) => ({ cells: [n.number, fmt(n.count), fmt(n.pct, 2)], tip: max3dNumberTip(stats, n) })))}</div>
  <div class="panel"><h2>20 bộ số ra ít nhất</h2>${table(['Bộ số', 'Lần'],
    stats.coldest.map((n) => ({ cells: [n.number, fmt(n.count)], tip: max3dNumberTip(stats, n) })))}</div>
  <div class="panel"><h2>Phân bố theo giải</h2>${table(['Giải', 'Số bộ số ghi nhận'],
    stats.prizes.map((p) => [p.prize, fmt(p.count)]))}</div>
</div>`;

  return `${hero(fmt(stats.total), `kỳ quay · ${fmt(stats.totalNumbers)} bộ số trúng · ${range(stats)} · kỳ mới nhất ${stats.latestDrawId ?? '—'}`)}
${kpiRow([
    { label: 'Kỳ vọng mỗi bộ số', value: `${fmt(stats.expected, 1)} lần`, tip: t.expected },
    { label: 'Kỳ vọng mỗi chữ số', value: `${fmt(digitExpected)} lần`, tip: t.digit },
    { label: 'Ra nhiều nhất', value: `${stats.hottest[0]?.number ?? '—'} (${fmt(stats.hottest[0]?.count ?? 0)})`, tip: t.hottest },
    { label: 'Số giải mỗi kỳ', value: String(stats.prizes.length), tip: t.prizes },
  ])}
${pickerSection(product, stats.pickerData)}
${digitCharts}${tables}
${duplicateSection(stats.duplicates, 'giải Đặc biệt')}`;
}
