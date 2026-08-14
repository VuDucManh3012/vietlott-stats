/**
 * Client goi AjaxPro endpoint cua vietlott.vn.
 *
 * Trang dung AjaxPro: POST body JSON kem header X-AjaxPro-Method, tra ve {"value": {...}}.
 * Co throttle + retry vi day la site cong cong, khong nen ban dan request.
 */

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/** RenderInfo la payload co dinh ma trang tu tao ra o client truoc moi lan goi. */
export const RENDER_INFO = {
  SiteId: 'main.frontend.vi',
  SiteAlias: 'main.vi',
  UserSessionId: '',
  SiteLang: 'vi',
  IsPageDesign: false,
  ExtraParam1: '',
  ExtraParam2: '',
  ExtraParam3: '',
  SiteURL: '',
  WebPage: null,
  SiteName: 'Vietlott',
  OrgPageAlias: null,
  PageAlias: null,
  FullPageAlias: null,
  RefKey: null,
  System: 1,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * GET mot trang HTML thuong (khong qua AjaxPro).
 *
 * Dung cho trang chi tiet tung ky - bang giai thuong chi co o do, khong co trong
 * phan hoi cua WebPart danh sach.
 *
 * @param {{url:string, referer:string, delayMs?:number, retries?:number}} opts
 * @returns {Promise<string>} HTML tho
 */
export async function fetchHtml({ url, referer, delayMs = 300, retries = 2 }) {
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1));

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Referer: referer, Accept: 'text/html' },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const html = await res.text();
      await sleep(delayMs); // lich su voi server
      return html;
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(`Tai ${url} that bai sau ${retries + 1} lan: ${lastErr?.message}`);
}

/**
 * Goi 1 method AjaxPro, tra ve object `value`.
 * @param {{endpoint:string, referer:string, method:string, payload:object, delayMs?:number, retries?:number}} opts
 */
export async function callAjaxPro({
  endpoint,
  referer,
  method,
  payload,
  delayMs = 400,
  retries = 3,
}) {
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Backoff tang dan: 1s, 2s, 4s
      await sleep(1000 * 2 ** (attempt - 1));
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'User-Agent': USER_AGENT,
          'X-AjaxPro-Method': method,
          'Content-Type': 'text/plain; charset=UTF-8',
          Referer: referer,
          Accept: '*/*',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const text = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(`Phan hoi khong phai JSON: ${text.slice(0, 160)}`);
      }

      const value = parsed?.value;
      if (!value) throw new Error('Phan hoi thieu truong "value"');
      if (value.Error) throw new Error(`Server bao loi: ${value.InfoMessage ?? 'khong ro'}`);

      await sleep(delayMs); // lich su voi server
      return value;
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(`Goi ${method} that bai sau ${retries + 1} lan: ${lastErr?.message}`);
}
