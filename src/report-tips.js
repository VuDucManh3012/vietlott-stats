/**
 * Noi dung chu thich noi (tooltip) cho o KPI va tung dong bang.
 *
 * Nguyen tac soan: tooltip phai NOI THEM dieu gi do, khong lap lai y nguyen con so da hien.
 * Voi bao cao nay, thu dang gia nhat de noi them la: con so do co vuot muc nhieu ngau nhien
 * hay khong - vi do chinh la dieu quyet dinh no co y nghia hay khong.
 */

import { fmt } from './chart-primitives.js';

/**
 * Cau phan quyet: gia tri nay co vuot dai dao dong ngau nhien khong.
 *
 * `comparisons` la so truong hop duoc ra cung luc (45 con so, 990 cap, 1000 bo so...).
 * Bat buoc phai tinh den: khi ra hang tram truong hop, viec MOT vai truong hop vuot 2 do lech
 * chuan la chac chan xay ra ke ca voi du lieu ngau nhien thuan tuy. Neu bo qua yeu to nay,
 * tooltip se bien mot ket qua binh thuong thanh "phat hien dac biet".
 * Muc lech lon nhat thuong gap khi ra n truong hop xap xi can(2*ln(n)).
 */
function verdict(value, expected, sigma, comparisons = 0) {
  const z = sigma > 0 ? Math.abs(value - expected) / sigma : 0;
  if (z <= 2) return `vẫn nằm trong dải nhiễu (lệch ${fmt(z, 1)}σ)`;

  const typicalMax = comparisons > 1 ? Math.sqrt(2 * Math.log(comparisons)) : 0;
  return z < typicalMax
    ? `vượt dải ±2σ (lệch ${fmt(z, 1)}σ), nhưng vẫn dưới mức lệch lớn nhất thường gặp khi rà ${fmt(comparisons)} trường hợp`
    : `vượt dải nhiễu (lệch ${fmt(z, 1)}σ)`;
}

export function lottoKpiTips(stats) {
  const { product, total, expected, sigma, numbers, outliers } = stats;
  const pct = fmt((product.ballsPerDraw / product.maxNumber) * 100, 1);
  const expectedOutliers = fmt((numbers.length * 0.0455), 1);

  return {
    expected: `Nếu quay hoàn toàn ngẫu nhiên, mỗi số sẽ ra khoảng ngần này lần trong ${fmt(total)} kỳ.`,
    sigma: `Khoảng ±2 độ lệch chuẩn. Chênh lệch nằm trong khoảng này là nhiễu bình thường, không phải quy luật.`,
    hottest: `Số ra nhiều nhất trong lịch sử — ${verdict(stats.hottest[0]?.count ?? 0, expected, sigma, numbers.length)}. Không có nghĩa là dễ ra hơn ở kỳ sau.`,
    coldest: `Số ra ít nhất trong lịch sử — ${verdict(stats.coldest[0]?.count ?? 0, expected, sigma, numbers.length)}. Không có nghĩa là "sắp về".`,
    outliers: `Có ${outliers.length}/${numbers.length} số vượt dải. Ngẫu nhiên thuần túy cũng cho khoảng ${expectedOutliers} số vượt dải, nên con số này không bất thường.`,
    drawProb: `Mỗi kỳ, mỗi con số có xác suất ${pct}% được gọi tên, không đổi qua các kỳ.`,
  };
}

/** Dong trong bang "ra nhieu nhat" / "ra it nhat". */
export function lottoNumberTip(stats, n) {
  const sign = n.deviation >= 0 ? '+' : '';
  return {
    v: `${fmt(n.count)} lần`,
    l: `Số ${n.number} · lệch ${sign}${fmt(n.deviation, 1)} so với kỳ vọng ${fmt(stats.expected, 1)} · ${verdict(n.count, stats.expected, stats.sigma, stats.numbers.length)}.`,
  };
}

export function lottoDroughtTip(stats, n) {
  const pct = fmt((stats.product.ballsPerDraw / stats.product.maxNumber) * 100, 1);
  return {
    v: `${fmt(n.drought)} kỳ`,
    l: `Số ${n.number} chưa ra ${fmt(n.drought)} kỳ liên tiếp. Xác suất ra ở kỳ tới vẫn là ${pct}%, đúng bằng mọi số khác.`,
  };
}

export function lottoPairTip(stats, p) {
  return {
    v: `${fmt(p.count)} kỳ`,
    l: `Cặp ${p.a} + ${p.b} · kỳ vọng ${fmt(stats.pairExpected, 1)} kỳ · ${verdict(p.count, stats.pairExpected, stats.pairSigma, stats.pairCount)}.`,
  };
}

export function max3dKpiTips(stats) {
  return {
    expected: `Có 1.000 bộ số từ 000 đến 999, mỗi bộ kỳ vọng ngần này lần trong ${fmt(stats.totalNumbers)} lượt trúng.`,
    digit: `Mỗi vị trí có 10 chữ số khả dĩ, nên mỗi chữ số kỳ vọng 1/10 tổng số lượt.`,
    hottest: `Bộ số ra nhiều nhất — ${verdict(stats.hottest[0]?.count ?? 0, stats.expected, stats.numberSigma, 1000)}. Với 1.000 bộ số, luôn có vài bộ trông nổi bật kể cả khi quay ngẫu nhiên.`,
    prizes: `Số hạng giải trong mỗi kỳ quay (Đặc biệt, Nhất, Nhì, Ba).`,
  };
}

export function max3dNumberTip(stats, n) {
  return {
    v: `${fmt(n.count)} lần`,
    l: `Bộ số ${n.number} · kỳ vọng ${fmt(stats.expected, 1)} lần · ${verdict(n.count, stats.expected, stats.numberSigma, 1000)}.`,
  };
}
