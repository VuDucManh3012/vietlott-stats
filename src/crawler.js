/**
 * Vong lap crawl theo trang cho ca 2 ho san pham.
 *
 * Ket qua tra ve theo thu tu ky moi -> ky cu, nen che do "bo sung" chi can dung lai khi
 * gap ky da co trong CSV. Che do "--all" chay toi khi het trang.
 */

import { callAjaxPro, RENDER_INFO } from './http-client.js';
import { parseLottoHtml } from './parse-lotto.js';
import { parseMax3dHtml } from './parse-max3d.js';

/**
 * ArrayNumbers la luoi o do so tren giao dien, gui len dang rong.
 * Kich thuoc khac nhau tung san pham (6/45 la 6x18, 6/55 la 5x18, 5/35 la 5x35);
 * gui sai kich thuoc thi server tra loi "Index was outside the bounds of the array".
 */
function emptyGrid({ rows, cols }) {
  return Array.from({ length: rows }, () => Array(cols).fill(''));
}

function buildPayload(product, pageIndex) {
  if (product.kind === 'lotto') {
    return {
      ORenderInfo: RENDER_INFO,
      Key: product.webpartKey,
      GameDrawId: '', // rong = toan bo cac ky
      ArrayNumbers: emptyGrid(product.numberGrid),
      CheckMulti: false,
      PageIndex: pageIndex,
    };
  }
  const payload = {
    ORenderInfo: RENDER_INFO,
    GameId: product.gameId,
    GameDrawId: '',
    number01: '',
    number02: '',
    PageIndex: pageIndex,
  };
  // Sai so luong tham so -> AjaxPro khong khop duoc method va bao loi
  if (product.hasCheckMulti) payload.CheckMulti = 1;
  return payload;
}

function parseHtml(product, html) {
  return product.kind === 'lotto' ? parseLottoHtml(html, product) : parseMax3dHtml(html);
}

/**
 * @param {object} product cau hinh san pham
 * @param {{knownDrawIds?:Set<string>, maxPages?:number, full?:boolean, onProgress?:Function}} opts
 * @returns {Promise<Array>} cac dong moi thu thap duoc
 */
export async function crawlProduct(product, { knownDrawIds = new Set(), maxPages = 400, full = false, onProgress } = {}) {
  const collected = [];
  const seenDrawIds = new Set();
  let emptyPages = 0;

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
    const value = await callAjaxPro({
      endpoint: product.endpoint,
      referer: product.pageUrl,
      method: 'ServerSideDrawResult',
      payload: buildPayload(product, pageIndex),
    });

    const rows = parseHtml(product, value.HtmlContent ?? '');

    if (rows.length === 0) {
      // Mot trang rong co the do nhieu mang; cho phep 1 lan truot roi moi dung han
      if (++emptyPages >= 2) break;
      continue;
    }
    emptyPages = 0;

    let hitKnown = false;
    for (const row of rows) {
      if (!full && knownDrawIds.has(row.drawId)) {
        hitKnown = true;
        continue;
      }
      collected.push(row);
      seenDrawIds.add(row.drawId);
    }

    onProgress?.({ pageIndex, draws: seenDrawIds.size, rows: collected.length });

    // Da cham toi ky da luu -> phan con lai deu cu hon, khong can tai tiep
    if (hitKnown && !full) break;
  }

  return collected;
}
