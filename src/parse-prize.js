/**
 * Parse bang giai thuong tren trang chi tiet MOT ky quay.
 *
 * Bang giai KHONG co trong phan hoi cua WebPart danh sach (chi co ngay/ky/bo so), nen day la
 * nguon duy nhat cho so luong giai va gia tri giai -> phai tai rieng tung ky.
 *
 * Ca 2 ho san pham dung chung mot khung bang `<table class="table table-hover">` voi 4 cot:
 *   ten giai | ket qua | so luong giai | gia tri giai
 * Khac nhau o cot "ket qua":
 *   - lotto (6/45, 6/55, 5/35): o do so dang "O O O O O | O", dau | hoac + danh dau so dac biet
 *   - max3d: cac bo 3 chu so, co the kem mot cau mo ta dieu kien trung
 *
 * Max 3D co HAI bang (2 loi choi) nam trong 2 <div> khac id; cac san pham con lai chi co 1 bang.
 */

/** id cua <div> boc bang -> loi choi. Bang khong nam trong div nao la san pham lotto (1 loi choi). */
const PLAY_BY_DIV = {
  divMax3D: 'd3',
  divMax3DPlus: 'd6',
  divMax3DProPlus: 'd6',
};

const TABLE_RE = /<table[^>]*class="[^"]*table-hover[^"]*"[^>]*>([\s\S]*?)<\/table>/g;
const TBODY_RE = /<tbody>([\s\S]*?)<\/tbody>/;
const ROW_RE = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
const CELL_RE = /<td[^>]*>([\s\S]*?)<\/td>/g;

/** Bo the HTML va gom khoang trang lai, giu nguyen chu tieng Viet. */
function stripTags(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "1.111" -> 1111. Vietlott dung dau cham lam phan cach hang nghin. */
function toNumber(text) {
  const digits = text.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

/**
 * Cot "ket qua" -> { pattern, numbers, note }.
 *
 * `pattern` chi dung cho lotto: "OOOOOO" hoac "OOOOO|O" (sau dau | la so dac biet).
 * `numbers` chi dung cho max3d: cac bo 3 chu so, tach bang khoang trang.
 * `note` la cau mo ta dieu kien trung cua Max 3D Pro ("Trung 2 bo ba so bat ky trong 4 bo ba so").
 */
function parseResultCell(html) {
  const text = stripTags(html);

  // Bo 3 chu so cua max3d. \b khong dung duoc vi so nam sat dau cach do &nbsp; da doi thanh ' '
  const numbers = text.match(/(?<!\d)\d{3}(?!\d)/g) ?? [];
  if (numbers.length) {
    // Cau mo ta chi xuat hien o Max 3D Pro; cac chu le khac ("hoac") khong mang thong tin
    const note = text.includes('Trùng') ? text.replace(/(?<!\d)\d{3}(?!\d)/g, '').replace(/\s+/g, ' ').trim() : '';
    return { pattern: '', numbers: numbers.join(' '), note };
  }

  // Lotto: dau + (5/35) va dau | (6/55) cung mang mot nghia - o do so tiep theo la so dac biet
  const pattern = text.replace(/\s+/g, '').replace(/\+/g, '|');
  return { pattern, numbers: '', note: '' };
}

/**
 * Giai Khuyen Khich cua 5/35 liet ke NHIEU cach trung khac nhau, moi cach mot dong ngan bang <br>.
 * Phai tach truoc khi bo the, neu khong ba dong se dinh lien thanh mot chuoi vo nghia.
 */
function splitLines(html) {
  return html.split(/<br\s*\/?>/i);
}

/** Loi choi cua bang: tim id="divXxx" gan nhat NGAY TRUOC bang trong chuoi HTML. */
function playForTable(html, tableIndex) {
  const before = html.slice(0, tableIndex);
  const ids = [...before.matchAll(/id="(div[^"]*)"/g)];
  const last = ids[ids.length - 1]?.[1];
  return PLAY_BY_DIV[last] ?? '';
}

/**
 * @param {string} html HTML day du cua trang chi tiet mot ky
 * @returns {Array<{play:string, tier:string, pattern:string, numbers:string, note:string,
 *                  winners:number, value:number}>}
 */
export function parsePrizeHtml(html) {
  const rows = [];

  for (const table of html.matchAll(TABLE_RE)) {
    const play = playForTable(html, table.index);

    // Chi lay tbody: thead cua 5/35 co them mot dong "Giai Doc Dac" dang tieu de, khong phai du lieu
    const body = table[1].match(TBODY_RE)?.[1];
    if (!body) continue;

    for (const tr of body.matchAll(ROW_RE)) {
      const cells = [...tr[1].matchAll(CELL_RE)].map((m) => m[1]);
      if (cells.length < 4) continue;

      const tier = stripTags(cells[0]);
      if (!tier) continue;

      // Nhieu cach trung -> noi bang '/'; ben render tach ra thanh tung dong o do so
      const parts = splitLines(cells[1]).map(parseResultCell).filter((p) => p.pattern || p.numbers);
      const pattern = parts.map((p) => p.pattern).filter(Boolean).join('/');
      const numbers = parts.map((p) => p.numbers).filter(Boolean).join(' ');
      const note = parts.find((p) => p.note)?.note ?? '';
      rows.push({
        play,
        tier,
        pattern,
        numbers,
        note,
        winners: toNumber(stripTags(cells[2])),
        value: toNumber(stripTags(cells[3])),
      });
    }
  }

  return rows;
}
