/**
 * Cau hinh tung san pham Vietlott.
 *
 * Moi san pham map toi 1 AjaxPro WebPart tren vietlott.vn. Hai ho khac nhau:
 *  - kind "lotto": Mega 6/45, Power 6/55 -> bang ket qua dang dong (ngay | ky | bo so)
 *  - kind "max3d": Max 3D, Max 3D Pro   -> moi ky la 1 khoi nhieu giai, moi giai nhieu so 3 chu so
 */

const WEBPART_BASE = 'https://vietlott.vn/ajaxpro';
const PAGE_BASE = 'https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong';

export const PRODUCTS = {
  '645': {
    id: '645',
    // Mau dinh danh san pham (o mau 1-5 cua bo tham chieu, da qua validator ca 2 che do)
    accent: { light: '#2a78d6', dark: '#3987e5' },
    label: 'Mega 6/45',
    kind: 'lotto',
    // Bo so chinh: 6 so trong khoang 1..45, khong co so dac biet
    maxNumber: 45,
    ballsPerDraw: 6,
    hasBonus: false,
    bonusLabel: null,
    // Muc trung thap nhat con duoc giai. Dung cho che do random 'tranh trung moi giai';
    // chinh duoc bang co --min-match neu co cau giai thay doi.
    minPrizeMatch: 3,
    pageUrl: `${PAGE_BASE}/winning-number-645`,
    // Slug trang chi tiet tung ky (nguon DUY NHAT co bang giai thuong - trang danh sach khong co)
    detailSlug: '645',
    endpoint: `${WEBPART_BASE}/Vietlott.PlugIn.WebParts.Game645CompareWebPart,Vietlott.PlugIn.WebParts.ashx`,
    webpartKey: 'b5888771',
    // Kich thuoc luoi o do so tren giao dien. Phai khop tung san pham, khong dung chung duoc.
    numberGrid: { rows: 6, cols: 18 },
    drawsPerPage: 8,
  },
  '655': {
    id: '655',
    // Mau dinh danh san pham (o mau 1-5 cua bo tham chieu, da qua validator ca 2 che do)
    accent: { light: '#eb6834', dark: '#d95926' },
    label: 'Power 6/55',
    kind: 'lotto',
    // 6 so chinh 1..55 + 1 so quyen luc (bonus) cung khoang
    maxNumber: 55,
    ballsPerDraw: 6,
    hasBonus: true,
    bonusLabel: 'So quyen luc',
    minPrizeMatch: 3,
    pageUrl: `${PAGE_BASE}/winning-number-655`,
    detailSlug: '655',
    endpoint: `${WEBPART_BASE}/Vietlott.PlugIn.WebParts.Game655CompareWebPart,Vietlott.PlugIn.WebParts.ashx`,
    webpartKey: '3848b60f',
    numberGrid: { rows: 5, cols: 18 },
    drawsPerPage: 8,
  },
  535: {
    id: '535',
    // Mau dinh danh san pham (o mau 1-5 cua bo tham chieu, da qua validator ca 2 che do)
    accent: { light: '#1baf7a', dark: '#199e70' },
    label: 'Lotto 5/35',
    kind: 'lotto',
    // 5 so trong khoang 1..35, khong co so dac biet
    maxNumber: 35,
    ballsPerDraw: 5,
    hasBonus: false,
    bonusLabel: null,
    // GIA DINH: chua xac minh duoc co cau giai 5/35 tu trang the le (trang tra ve 302).
    minPrizeMatch: 3,
    pageUrl: `${PAGE_BASE}/winning-number-535`,
    detailSlug: '535',
    endpoint: `${WEBPART_BASE}/Vietlott.PlugIn.WebParts.Game535CompareWebPart,Vietlott.PlugIn.WebParts.ashx`,
    webpartKey: 'a0c3c966',
    numberGrid: { rows: 5, cols: 35 },
    drawsPerPage: 8,
  },
  max3d: {
    id: 'max3d',
    // Mau dinh danh san pham (o mau 1-5 cua bo tham chieu, da qua validator ca 2 che do)
    accent: { light: '#eda100', dark: '#c98500' },
    label: 'Max 3D',
    kind: 'max3d',
    gameId: '5',
    pageUrl: `${PAGE_BASE}/winning-number-max-3d`,
    // Chu hoa D phai giu nguyen: server phan biet hoa thuong o slug nay
    detailSlug: 'max-3D',
    endpoint: `${WEBPART_BASE}/Vietlott.PlugIn.WebParts.GameMax3DCompareWebPart,Vietlott.PlugIn.WebParts.ashx`,
    // WebPart cua Max 3D co them tham so CheckMulti; ban Pro thi khong
    hasCheckMulti: true,
    // Hai loi choi tren cung mot ve. Phai tach ra vi khong gian dat cuoc khac han nhau.
    plays: [
      { id: 'd3', digits: 3, label: 'Cược cơ bản · bộ 3 chữ số' },
      { id: 'd6', digits: 6, label: 'Max 3D+ · bộ 6 chữ số' },
    ],
    drawsPerPage: 5,
  },
  max3dpro: {
    id: 'max3dpro',
    // Mau dinh danh san pham (o mau 1-5 cua bo tham chieu, da qua validator ca 2 che do)
    accent: { light: '#e87ba4', dark: '#d55181' },
    label: 'Max 3D Pro',
    kind: 'max3d',
    gameId: '7',
    // Max 3D Pro co trang va WebPart rieng - dung chung endpoint voi Max 3D se ra trung du lieu
    pageUrl: `${PAGE_BASE}/winning-number-max-3dpro`,
    detailSlug: 'max-3DPro',
    endpoint: `${WEBPART_BASE}/Vietlott.PlugIn.WebParts.GameMax3DProCompareWebPart,Vietlott.PlugIn.WebParts.ashx`,
    hasCheckMulti: false,
    // Ve Max 3D Pro LUON gom 2 bo 3 chu so - khong co loi choi 3 chu so nhu Max 3D
    plays: [{ id: 'd6', digits: 6, label: 'Bộ 6 chữ số' }],
    drawsPerPage: 5,
  },
};

/**
 * Thu tu hien thi, dat tuong minh.
 * Khong dung Object.keys: JS xep khoa dang so ('535', '645') len truoc khoa chu bat ke thu tu khai bao,
 * nen thu tu tab se khong theo y muon.
 */
export const PRODUCT_IDS = ['645', '655', '535', 'max3d', 'max3dpro'];

export function getProduct(id) {
  const p = PRODUCTS[String(id).toLowerCase()];
  if (!p) {
    throw new Error(`San pham khong hop le: "${id}". Chon mot trong: ${PRODUCT_IDS.join(', ')}`);
  }
  return p;
}
