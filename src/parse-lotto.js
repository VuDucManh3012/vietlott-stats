/**
 * Parse HTML ket qua Mega 6/45 va Power 6/55.
 *
 * Moi ky la 1 <tr>:
 *   <td>DD/MM/YYYY</td><td><a ...>01547</a></td><td>... <span class="bong_tron">03</span> ...</td>
 * Rieng 6/55 co them dau phan cach <span class="bong_tron-sperator">|</span> truoc so quyen luc.
 */

const ROW_RE =
  /<td>\s*(\d{2}\/\d{2}\/\d{4})\s*<\/td>\s*<td>\s*<a[^>]*>\s*(\d+)\s*<\/a>\s*<\/td>\s*<td>([\s\S]*?)<\/td>/g;

/** Doi "09/08/2026" -> "2026-08-09" de sort/luu CSV cho chuan. */
function toIsoDate(vnDate) {
  const [d, m, y] = vnDate.split('/');
  return `${y}-${m}-${d}`;
}

/**
 * @param {string} html khoi HTML chua bang ket qua
 * @param {object} product cau hinh san pham (products.js)
 * @returns {Array<{drawId:string, date:string, numbers:number[], bonus:number|null}>}
 */
export function parseLottoHtml(html, product) {
  const draws = [];

  for (const match of html.matchAll(ROW_RE)) {
    const [, vnDate, drawId, cell] = match;

    // Tach phan so chinh va so quyen luc theo dau phan cach (chi 6/55 co)
    const sepIndex = cell.indexOf('bong_tron-sperator');
    const mainPart = sepIndex === -1 ? cell : cell.slice(0, sepIndex);
    const bonusPart = sepIndex === -1 ? '' : cell.slice(sepIndex);

    const readBalls = (chunk) =>
      [...chunk.matchAll(/class="bong_tron[^"]*"\s*>\s*(\d{1,2})\s*</g)].map((m) => Number(m[1]));

    const numbers = readBalls(mainPart);
    const bonusBalls = readBalls(bonusPart);

    // Bo qua ky khong du so (vd ky moi mo ban chua quay)
    if (numbers.length !== product.ballsPerDraw) continue;
    if (numbers.some((n) => n < 1 || n > product.maxNumber)) continue;

    draws.push({
      drawId,
      date: toIsoDate(vnDate),
      numbers: numbers.sort((a, b) => a - b),
      bonus: product.hasBonus && bonusBalls.length ? bonusBalls[0] : null,
    });
  }

  return draws;
}
