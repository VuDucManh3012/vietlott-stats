/**
 * CSS noi tuyen cho bao cao HTML.
 *
 * Bang mau lay nguyen tu bo tham chieu da qua validator (kiem tra dai do sang, san chroma,
 * tach biet mu mau CVD, va tuong phan voi nen) - khong tu che them mau nao.
 * Mau toi duoc CHON RIENG cho nen toi, khong phai dao nguoc mau sang.
 */

/**
 * Sinh quy tac mau dinh danh cho tung san pham.
 *
 * Mau dat tren tung panel qua bien --accent, nen moi khoi ben trong (tab, o KPI, cot bieu do)
 * chi can tham chieu var(--accent) ma khong biet minh thuoc san pham nao.
 *
 * Phai khai bao o CA BA pham vi: mac dinh (sang), theo he dieu hanh, va theo nut doi giao dien -
 * neu thieu mot pham vi thi mau se ket o gia tri cua che do kia.
 */
export function accentRules(entries) {
  // Tien to phai gan vao TUNG quy tac, khong the boc chung ca chuoi nhieu quy tac
  const block = (prefix, mode) =>
    entries
      .map((e) => `${prefix}[data-accent="${e.product.id}"]{--accent:${e.product.accent[mode]}}`)
      .join('\n');

  return `${block('', 'light')}
@media (prefers-color-scheme: dark){
${block(':root:where(:not([data-theme="light"])) ', 'dark')}
}
${block(':root[data-theme="dark"] ', 'dark')}`;
}

export const REPORT_CSS = `
:root {
  color-scheme: light;

  /* Be mat va muc */
  --page:           #f9f9f7;
  --surface:        #fcfcfb;
  --ink:            #0b0b0b;
  --ink-2:          #52514e;
  --ink-muted:      #898781;
  --grid:           #e1e0d9;
  --axis:           #c3c2b7;
  --border:         rgba(11, 11, 11, 0.10);

  /* Mau du lieu: 1 chuoi duy nhat -> dung o mau so 1 */
  --series-1:       #2a78d6;
  --accent:         #2a78d6;   /* mac dinh; tung panel ghi de theo san pham */

  /* Thang don sac cho ma tran nhiet (nhat -> dam) */
  --seq-100:        #cde2fb;
  --seq-200:        #9ec5f4;
  --seq-300:        #6da7ec;
  --seq-400:        #3987e5;
  --seq-500:        #256abf;
  --seq-600:        #184f95;
  --seq-700:        #0d366b;

  /* Cap phan cuc: tren nguong / duoi nguong */
  --div-pos:        #e34948;
  --div-neg:        #2a78d6;

  /* Khoang cach (thang dac cho dashboard) */
  --s1: 8px;  --s2: 12px; --s3: 16px; --s4: 24px; --s5: 32px;
}

@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) {
    color-scheme: dark;
    --page:       #0d0d0d;
    --surface:    #1a1a19;
    --ink:        #ffffff;
    --ink-2:      #c3c2b7;
    --ink-muted:  #898781;
    --grid:       #2c2c2a;
    --axis:       #383835;
    --border:     rgba(255, 255, 255, 0.10);
    --series-1:   #3987e5;
    --accent:     #3987e5;
    --seq-100:    #0d366b;
    --seq-200:    #184f95;
    --seq-300:    #256abf;
    --seq-400:    #2a78d6;
    --seq-500:    #3987e5;
    --seq-600:    #6da7ec;
    --seq-700:    #9ec5f4;
    --div-pos:    #e66767;
    --div-neg:    #3987e5;
  }
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --page:       #0d0d0d;
  --surface:    #1a1a19;
  --ink:        #ffffff;
  --ink-2:      #c3c2b7;
  --ink-muted:  #898781;
  --grid:       #2c2c2a;
  --axis:       #383835;
  --border:     rgba(255, 255, 255, 0.10);
  --series-1:   #3987e5;
  --accent:     #3987e5;
  --seq-100:    #0d366b;
  --seq-200:    #184f95;
  --seq-300:    #256abf;
  --seq-400:    #2a78d6;
  --seq-500:    #3987e5;
  --seq-600:    #6da7ec;
  --seq-700:    #9ec5f4;
  --div-pos:    #e66767;
  --div-neg:    #3987e5;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  padding: var(--s5) var(--s3) 96px;
  background: var(--page);
  color: var(--ink);
  font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* Rong hon 1180px cu de chua them cot ket qua ben phai; cac khoi chu tu gioi han be rong doc duoc */
.wrap { max-width: 1620px; margin: 0 auto; }

/* --- Dau trang --- */
.masthead { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s3); }
h1 { font-size: 24px; font-weight: 600; margin: 0 0 var(--s1); letter-spacing: -0.01em; }
.sub { color: var(--ink-2); margin: 0; font-size: 14px; }

.theme-toggle {
  flex: none; cursor: pointer; border: 1px solid var(--border); background: var(--surface);
  color: var(--ink-2); border-radius: 8px; padding: var(--s1) var(--s2); font: inherit; font-size: 13px;
  transition: color 160ms ease, border-color 160ms ease;
}
.theme-toggle:hover { color: var(--ink); border-color: var(--axis); }
.theme-toggle:focus-visible { outline: 2px solid var(--series-1); outline-offset: 2px; }

/* --- Thanh tab chon san pham --- */
.tabs {
  display: flex; flex-wrap: wrap; gap: var(--s1); margin: var(--s4) 0 0;
  border-bottom: 1px solid var(--grid);
}
.tab {
  cursor: pointer; border: none; background: none; color: var(--ink-2);
  font: inherit; font-size: 14px; padding: var(--s2) var(--s3);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 160ms ease, border-color 160ms ease;
}
.tab:hover { color: var(--ink); }
.tab[aria-selected="true"] {
  color: var(--ink); border-bottom-color: var(--accent); font-weight: 600;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-radius: 8px 8px 0 0;
}
.tab:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; border-radius: 4px; }
/*
 * Cham chi to mau o tab DANG CHON. Cho ca 5 cham cung mang mau dinh danh thi 5 mau hien
 * dong thoi, va bo mau nay khong dat nguong tach biet khi xet moi cap - te nhat la hong/luc
 * chenh 1.6 dE duoi mu mau deutan, tuc nhin nhu nhau. Cham xam cho tab chua chon vua sach
 * vua khong danh lua nguoi doc rang mau dang phan biet dieu gi.
 */
.tab::before {
  content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: var(--ink-muted); margin-right: 8px; vertical-align: 1px;
  opacity: 0.5; transition: opacity 160ms ease, background-color 160ms ease;
}
.tab[aria-selected="true"]::before { background: var(--accent); opacity: 1; }

/* --- So lieu dan dat --- */
.hero {
  margin: var(--s4) 0; padding: var(--s4) var(--s4) var(--s4) calc(var(--s4) + 6px);
  border-radius: 14px; position: relative; overflow: hidden;
  background:
    linear-gradient(135deg,
      color-mix(in srgb, var(--accent) 14%, var(--surface)) 0%,
      var(--surface) 62%);
  border: 1px solid var(--border);
}
/* Vach mau dinh danh chay doc canh trai khoi so dan dat */
.hero::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--accent);
}
.hero b {
  display: block; font-size: 56px; line-height: 1.05; font-weight: 600; letter-spacing: -0.02em;
}
.hero span { color: var(--ink-2); font-size: 14px; }

.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--s2); margin-bottom: var(--s4); }
.kpi {
  background: var(--surface); border: 1px solid var(--border); border-top: 3px solid var(--accent);
  border-radius: 10px; padding: var(--s2) var(--s3);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.kpi[data-v]:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.10); }
.kpi span { display: block; color: var(--ink-2); font-size: 12px; margin-bottom: 2px; }
.kpi b { font-size: 22px; font-weight: 600; }

/* --- Khoi noi dung --- */
h2 {
  font-size: 15px; font-weight: 600; margin: var(--s5) 0 var(--s2);
  display: flex; align-items: center; gap: var(--s1);
}
/* Vach mau ngan truoc moi tieu de muc, giup quet mat theo doc trang */
h2::before {
  content: ''; width: 3px; height: 14px; border-radius: 2px; background: var(--accent); flex: none;
}
h2 + .caption { margin-top: calc(var(--s2) * -1); }
.caption { color: var(--ink-2); font-size: 13px; margin: 0 0 var(--s2); max-width: 68ch; }

.panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: var(--s3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--s2); }
.cols .panel h2 { margin-top: 0; }

.note {
  border: 1px solid var(--border); border-left: 3px solid var(--div-pos); background: var(--surface);
  border-radius: 0 10px 10px 0; padding: var(--s3); margin: var(--s4) 0; color: var(--ink-2); font-size: 14px;
}
/* Trang rong toi 1620px, nhung dong chu dai qua ~90 ky tu thi mat doc rat kho bat dau dong ke tiep */
.note p { max-width: 90ch; }
.note b { color: var(--ink); }
.note p { margin: 0 0 var(--s1); }
.note p:last-child { margin: 0; }

/* --- Khoi sinh day so --- */
.picker-controls { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--s2); }
.field { display: flex; flex-direction: column; gap: 4px; }
.field span { color: var(--ink-2); font-size: 12px; }
.field select, .field input {
  font: inherit; font-size: 14px; padding: 8px var(--s2); color: var(--ink);
  background: var(--page); border: 1px solid var(--border); border-radius: 8px;
}
.field input { width: 88px; }
.field select:focus-visible, .field input:focus-visible, .pick-go:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.pick-go {
  font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
  padding: 9px var(--s4); border: none; border-radius: 8px;
  background: var(--accent); color: #fff;
  transition: filter 160ms ease, transform 120ms ease;
}
.pick-go:hover { filter: brightness(1.08); }
.pick-go:active { transform: translateY(1px); }

.pick-out { margin-top: var(--s3); }
.pick-out:empty { display: none; }
.pick-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: var(--s1);
  animation: mark-in 300ms ease both;
}
/* Vien mau thay vi nen mau dac: chu so phai giu muc tuong phan cua chu, khong doi theo mau san pham */
.ball {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 38px; height: 38px; padding: 0 8px; border-radius: 50px;
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border: 1.5px solid var(--accent); color: var(--ink);
  font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.pick-meta-inline { color: var(--ink-2); font-size: 12px; margin-left: var(--s1); }
.pick-meta { color: var(--ink-2); font-size: 13px; margin: var(--s1) 0; }
.pick-fail { color: var(--ink); font-size: 13px; margin: var(--s1) 0 0; max-width: 68ch; }
.pick-note { color: var(--ink-2); font-size: 12px; margin: var(--s3) 0 0; }
.pick-note b { color: var(--ink); }

/* --- Bang --- */
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: right; padding: 6px var(--s1); border-bottom: 1px solid var(--grid); }
th:first-child, td:first-child { text-align: left; }
th { color: var(--ink-2); font-weight: 500; font-size: 12px; }
td { font-variant-numeric: tabular-nums; }
tbody tr:last-child td { border-bottom: none; }
/* Dong / o co tooltip: doi con tro de nguoi dung biet co the ro chuot vao */
[data-v] { cursor: help; }
tbody tr[data-v]:focus-visible,
.kpi[data-v]:focus-visible { outline: 2px solid var(--series-1); outline-offset: -2px; }
.pos { color: var(--ink); }
.neg { color: var(--ink-2); }

details.tableview { margin-top: var(--s2); }
details.tableview summary {
  cursor: pointer; color: var(--ink-2); font-size: 13px; padding: var(--s1) 0;
}
details.tableview summary:focus-visible { outline: 2px solid var(--series-1); outline-offset: 2px; }
details.tableview[open] summary { margin-bottom: var(--s1); }

/* --- Bieu do --- */
.chart-scroll { overflow-x: auto; }
.chart { width: 100%; display: block; }
.chart:focus-visible { outline: 2px solid var(--series-1); outline-offset: 2px; border-radius: 4px; }
/* Cot mang mau dinh danh cua san pham dang xem. Van la MOT mau cho ca chuoi -
   khong to theo gia tri, vi chieu cao cot da noi dieu do roi. */
.bar { fill: var(--accent); }
/* Cot phan cuc giu cap mau doi lap: o day mau ma hoa DAU, khong phai danh tinh */
.bar-pos { fill: var(--div-pos); }
.bar-neg { fill: var(--div-neg); }
.hit { fill: transparent; }
.mark { transition: filter 140ms ease; }
.mark.is-active { filter: brightness(1.2) saturate(1.15); }

/* Cot hien dan theo thu tu khi mo tab - hieu ung vao, khong mang thong tin */
@keyframes mark-in { from { opacity: 0; } to { opacity: 1; } }
.tabpanel:not([hidden]) .mark { animation: mark-in 420ms ease both; }
.grid-line { stroke: var(--grid); stroke-width: 1; }
.axis-line { stroke: var(--axis); stroke-width: 1; }
.tick { fill: var(--ink-muted); font-size: 10px; font-variant-numeric: tabular-nums; }
.band { fill: var(--ink-muted); fill-opacity: 0.08; }
.threshold { stroke: var(--ink-muted); stroke-width: 1; stroke-dasharray: 4 4; }
.threshold-label { fill: var(--ink-muted); font-size: 11px; }

/* --- Chu thich noi --- */
.tip {
  position: fixed; z-index: 10; pointer-events: none; opacity: 0;
  background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
  padding: var(--s1) var(--s2); font-size: 13px; color: var(--ink-2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14); transition: opacity 120ms ease;
  max-width: 240px;
}
.tip b { display: block; color: var(--ink); font-size: 16px; font-weight: 600; }
.tip.on { opacity: 1; }

/* --- Cot ket qua cac ky (ben phai) --- */

/*
 * Tabpanel thanh luoi 2 cot. PHAI khai bao lai [hidden] ngay sau: quy tac display cua tac gia
 * de bep display:none cua [hidden] trong bo mac dinh trinh duyet, tab an se hien het cung luc.
 */
.tabpanel { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: var(--s4); align-items: start; }
.tabpanel[hidden] { display: none; }
/* min-width:0 de bieu do rong khong day gian cot ra ngoai luoi */
.tabpanel > .main { min-width: 0; }

/*
 * Cot ket qua dinh theo man hinh va cuon BEN TRONG, khong keo theo trang: doc lai ky cu
 * khong lam mat cho dang xem o phan thong ke.
 */
.draws {
  position: sticky; top: var(--s2); display: flex; flex-direction: column;
  max-height: calc(100vh - var(--s4));
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.draws-head { flex: none; padding: var(--s3) var(--s3) var(--s2); border-bottom: 1px solid var(--grid); }
.draws-head h2 { margin: 0 0 4px; }
.draws-head .caption { margin: 0; font-variant-numeric: tabular-nums; }
.draws-scroll {
  overflow-y: auto; overscroll-behavior: contain;
  padding: var(--s2) var(--s3) var(--s3); display: flex; flex-direction: column; gap: var(--s2);
}
.draws-scroll:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; border-radius: 0 0 12px 12px; }

/*
 * flex:none la BAT BUOC. .draws-scroll la flex column co chieu cao bi chan (max-height cua .draws),
 * ma flex item mac dinh duoc phep co lai - 100 the se bi ep xuong gan bang 0 va overflow:hidden
 * cat sach noi dung, ca cot chi con mot dai trang.
 */
.draw { flex: none; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--page); }
/* Nen pha mau dinh danh thay vi to dac: chu giu nguyen mau ink nen khong phu thuoc do sang cua accent */
.draw-top {
  padding: var(--s2) var(--s3); border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, var(--surface)) 0%, var(--surface) 78%);
}
.draw-when b { display: block; font-size: 14px; font-weight: 600; }
.draw-when span { color: var(--ink-2); font-size: 12px; }
.draw-body { padding: var(--s2) var(--s3) var(--s3); }

.draw-balls { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 5px; margin-top: var(--s2); }
.dball {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 14%, var(--surface));
  border: 1.5px solid var(--accent); color: var(--ink);
  font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
}
/* So dac biet (quyen luc 6/55, so thu tu 5/35) dung cap mau doi lap - day la phan LOAI, khong phai danh tinh */
.dball.is-bonus { border-color: var(--div-pos); background: color-mix(in srgb, var(--div-pos) 14%, var(--surface)); }

.draw-jackpots { display: grid; gap: 2px; margin-top: var(--s2); }
.draw-jackpots div { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s1); }
.draw-jackpots span { color: var(--ink-2); font-size: 12px; }
.draw-jackpots b { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }

.draw-prizes { font-size: 12.5px; }
.draw-prizes th, .draw-prizes td { padding: 5px var(--s1); }
.draw-prizes th:nth-child(2), .draw-prizes td:nth-child(2) { text-align: left; }

/* Cot "ket qua": moi cham la mot so phai trung */
.dots { display: inline-flex; align-items: center; gap: 3px; }
.dots + .dots { margin-left: 8px; }
.dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
.dots i.is-bonus { background: var(--div-pos); }

/* --- Khoi giai cua Max 3D / Max 3D Pro --- */
.d3-play { font-size: 12px; font-weight: 600; color: var(--ink-2); margin: var(--s3) 0 var(--s1); }
.d3-play:first-child { margin-top: 0; }
.d3-top {
  padding: var(--s2); margin-bottom: var(--s2); border-radius: 10px;
  border: 1px solid var(--border); background: color-mix(in srgb, var(--accent) 12%, var(--surface));
}
.d3-note { color: var(--ink-2); font-size: 12px; margin: 0; text-align: center; }
.d3 { display: inline-flex; gap: 4px; }
.d3-sep { width: 1px; height: 22px; background: var(--axis); }
.d3-top-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--s2); margin-top: var(--s2); }
.d3-top-foot span { display: block; color: var(--ink-2); font-size: 11px; }
.d3-top-foot b { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.d3-top-foot .right { text-align: right; }

.d3-row {
  display: grid; grid-template-columns: 88px minmax(0, 1fr) 52px; gap: var(--s1);
  align-items: center; padding: var(--s1) 0; border-top: 1px solid var(--grid);
}
.d3-row-name b { display: block; font-size: 13px; font-weight: 600; }
.d3-row-name span { color: var(--ink-2); font-size: 11px; font-variant-numeric: tabular-nums; }
.d3-row-nums .d3-note { text-align: left; margin-bottom: 4px; }
.d3-row-count { text-align: right; }
.d3-row-count span { display: block; color: var(--ink-2); font-size: 11px; }
.d3-row-count b { font-weight: 600; font-variant-numeric: tabular-nums; }
/*
 * The gon thay cho o do so o cac giai thap: mot so muc co toi 20 bo ba so, ve tung chu so se
 * thanh hang tram o moi the va lam phinh file HTML len nhieu lan.
 */
.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chips b {
  border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--surface));
  border-radius: 20px; padding: 1px 7px; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.chips:empty { display: none; }

/* Duoi 1080px khong con cho cho 2 cot: xep doc, nhung van giu vung cuon rieng cua danh sach */
@media (max-width: 1080px) {
  .tabpanel { grid-template-columns: minmax(0, 1fr); }
  .draws { position: static; max-height: none; }
  .draws-scroll { max-height: 70vh; }
}

footer { color: var(--ink-2); font-size: 13px; margin-top: var(--s5); padding-top: var(--s3); border-top: 1px solid var(--grid); }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
`;
