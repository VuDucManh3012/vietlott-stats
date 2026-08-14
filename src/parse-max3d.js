/**
 * Parse HTML ket qua Max 3D / Max 3D Pro.
 *
 * Khac han 6/45 va 6/55: moi ky la 1 khoi gom nhieu giai, moi giai co nhieu bo 3 chu so.
 *   <div>Ky quay: <a href="...?id=01117&nocatche=1">01117</a> | Ngay: 10/08/2026</div>
 *   <h5>Giai Dac biet</h5>
 *     <div class="day_so_ket_qua_v2"><span class="bong_tron tiny">4</span>...<span>6</span></div>
 *   <h5>Giai Nhat</h5> ...
 *
 * Tra ve dang "long": moi phan tu la 1 so trung, kem ten giai -> de thong ke va de doi cau truc
 * giai thuong ma khong phai sua schema (Max 3D va Max 3D Pro co so luong giai khac nhau).
 *
 * Moi dong co them `slot` = thu tu cua so trong giai. Bat buoc phai co: mot giai hoan toan
 * co the ra 2 lan cung 1 bo so, neu khoa chi gom (ky, giai, so) thi se bi khu trung sai.
 */

// Bat header cua tung ky: lay drawId roi lay ngay dau tien dung sau do
const DRAW_HEAD_RE = /\?id=(\d+)&nocatche=1[^>]*>[\s\S]{0,40}?<\/a>[\s\S]{0,120}?(\d{2}\/\d{2}\/\d{4})/g;

const TIER_SPLIT_RE = /<h5[^>]*>/;
// Class co the kem hau to (vd "day_so_ket_qua_v2 align_left_up_768") hoac khoang trang thua,
// nen phai cho phep phan duoi sau ten class - neu khong se bo sot phan lon cac giai.
const BALL_GROUP_RE = /class="day_so_ket_qua_v2[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
const DIGIT_RE = /class="bong_tron[^"]*"\s*>\s*(\d)\s*</g;

function toIsoDate(vnDate) {
  const [d, m, y] = vnDate.split('/');
  return `${y}-${m}-${d}`;
}

/** Go tag HTML + gom khoang trang de lay ten giai sach se. */
function cleanText(s) {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} html khoi HTML chua cac ky quay
 * @returns {Array<{drawId:string, date:string, prize:string, number:string}>}
 */
export function parseMax3dHtml(html) {
  const heads = [...html.matchAll(DRAW_HEAD_RE)];
  const rows = [];

  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    const drawId = head[1];
    const date = toIsoDate(head[2]);

    // Khoi cua ky nay keo dai toi header cua ky ke tiep
    const start = head.index;
    const end = i + 1 < heads.length ? heads[i + 1].index : html.length;
    const block = html.slice(start, end);

    // Phan doan theo tung <h5>Giai ...</h5>; doan dau tien la header nen bo qua
    const segments = block.split(TIER_SPLIT_RE).slice(1);

    for (const segment of segments) {
      const closeIdx = segment.indexOf('</h5>');
      if (closeIdx === -1) continue;

      const prize = cleanText(segment.slice(0, closeIdx));
      const body = segment.slice(closeIdx);
      if (!prize) continue;

      let slot = 0;
      for (const group of body.matchAll(BALL_GROUP_RE)) {
        const digits = [...group[1].matchAll(DIGIT_RE)].map((m) => m[1]).join('');
        // Chi nhan bo 3 chu so hop le, bo qua khoi trang tri hoac ky chua quay
        if (digits.length === 3) rows.push({ drawId, date, prize, number: digits, slot: slot++ });
      }
    }
  }

  return rows;
}
