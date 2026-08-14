/**
 * Thu thap bang giai thuong cho cac ky gan nhat.
 *
 * Khac han crawl ket qua: bang giai chi co tren trang chi tiet TUNG ky, nen moi ky la mot request.
 * Vi vay chi tai mot cua so ky gan day (mac dinh 100) thay vi toan bo lich su - 5630 ky se mat
 * gan mot tieng va gan nhu khong ai keo danh sach xuong sau nhu vay.
 *
 * Ky da co du lieu giai thi bo qua: ket qua da quay khong doi nua.
 */

import { fetchHtml } from './http-client.js';
import { parsePrizeHtml } from './parse-prize.js';

const DETAIL_BASE = 'https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong';

function detailUrl(product, drawId) {
  // nocatche=1 la tham so cua chinh vietlott.vn de bo qua cache phia ho
  return `${DETAIL_BASE}/${product.detailSlug}?id=${encodeURIComponent(drawId)}&nocatche=1`;
}

/**
 * @param {object} product cau hinh san pham
 * @param {string[]} drawIds cac ky can lay, da sap xep moi -> cu
 * @param {{have?:Map, limit?:number, refresh?:boolean, onProgress?:Function}} opts
 * @returns {Promise<{fetched:number, failed:string[]}>} ghi thang vao `have`
 */
export async function crawlPrizes(product, drawIds, { have = new Map(), limit = 100, refresh = false, onProgress } = {}) {
  const wanted = drawIds.slice(0, limit);
  const todo = refresh ? wanted : wanted.filter((id) => !have.has(id));

  let fetched = 0;
  const failed = [];

  for (const drawId of todo) {
    try {
      const rows = parsePrizeHtml(await fetchHtml({ url: detailUrl(product, drawId), referer: product.pageUrl }));
      // Trang tra ve rong (ky bi rut, hoac doi cau truc) - dung ghi de du lieu cu bang mang rong
      if (rows.length) {
        have.set(drawId, rows);
        fetched++;
      } else {
        failed.push(drawId);
      }
    } catch {
      failed.push(drawId);
    }
    onProgress?.({ done: fetched + failed.length, total: todo.length });
  }

  return { fetched, failed };
}
