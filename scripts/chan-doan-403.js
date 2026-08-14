/**
 * Script chan doan tam thoi: goi vietlott.vn bang 3 kieu request khac nhau va in ra
 * ma trang thai + header, de biet 403 tren runner GitHub la do chan IP hay thieu header.
 *
 * Chay duoc ca o local (thanh cong) lan tren CI (403) de doi chieu. Xoa sau khi co ket luan.
 */

import { RENDER_INFO } from '../src/http-client.js';
import { getProduct } from '../src/products.js';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const product = getProduct('645');

/** In gon phan hoi: status + vai header dac trung cua WAF + dau doan body. */
async function probe(label, run) {
  try {
    const res = await run();
    const h = (k) => res.headers.get(k) ?? '-';
    const body = await res.text();
    console.log(`\n[${label}]`);
    console.log(`  status : ${res.status} ${res.statusText}`);
    console.log(`  server : ${h('server')} | cf-ray: ${h('cf-ray')} | cf-mitigated: ${h('cf-mitigated')}`);
    console.log(`  x-powered / via : ${h('x-powered-by')} / ${h('via')}`);
    console.log(`  body   : ${body.slice(0, 300).replace(/\s+/g, ' ')}`);
  } catch (err) {
    console.log(`\n[${label}]\n  NEM LOI: ${err.message}`);
  }
}

// 1. GET trang thuong: neu cai nay cung 403 -> chan o tang IP, khong phai header
await probe('GET trang ket qua', () =>
  fetch(product.pageUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) }),
);

// 2. POST AjaxPro y het http-client.js hien tai
const payload = {
  ORenderInfo: RENDER_INFO,
  Key: product.webpartKey,
  GameDrawId: '',
  ArrayNumbers: Array.from({ length: product.numberGrid.rows }, () =>
    Array(product.numberGrid.cols).fill(''),
  ),
  CheckMulti: false,
  PageIndex: 0,
};

await probe('POST AjaxPro (header hien tai)', () =>
  fetch(product.endpoint, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'X-AjaxPro-Method': 'ServerSideDrawResult',
      'Content-Type': 'text/plain; charset=UTF-8',
      Referer: product.pageUrl,
      Accept: '*/*',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  }),
);

// 3. POST kem them header ma trinh duyet that luon gui: neu cai nay 200 -> chi thieu header
await probe('POST AjaxPro (them Origin + X-Requested-With + Accept-Language)', () =>
  fetch(product.endpoint, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'X-AjaxPro-Method': 'ServerSideDrawResult',
      'Content-Type': 'text/plain; charset=UTF-8',
      Referer: product.pageUrl,
      Origin: 'https://vietlott.vn',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept: '*/*',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  }),
);
