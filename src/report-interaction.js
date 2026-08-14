/**
 * JS noi tuyen cho bao cao: chu thich noi (tooltip), trang thai hover, dieu huong ban phim,
 * va nut doi giao dien sang/toi.
 *
 * Nguyen tac: tooltip chi BO SUNG, khong bao gio la duong duy nhat de doc gia tri -
 * moi con so deu co trong bang du lieu ben duoi moi bieu do.
 */

export const REPORT_JS = `
(function () {
  var tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'status');
  var val = document.createElement('b');
  var lab = document.createElement('span');
  tip.appendChild(val);
  tip.appendChild(lab);
  document.body.appendChild(tip);

  var active = null;

  function place(el) {
    var r = el.getBoundingClientRect();
    var t = tip.getBoundingClientRect();
    var x = r.left + r.width / 2 - t.width / 2;
    var y = r.top - t.height - 10;
    if (y < 8) y = r.bottom + 10;
    tip.style.left = Math.max(8, Math.min(x, window.innerWidth - t.width - 8)) + 'px';
    tip.style.top = y + 'px';
  }

  function show(source, markEl) {
    // dataset la du lieu ngoai -> luon chen bang textContent, khong dung innerHTML
    val.textContent = source.dataset.v || '';
    lab.textContent = source.dataset.l || '';
    tip.classList.add('on');
    if (active && active !== markEl) active.classList.remove('is-active');
    active = markEl;
    if (markEl) markEl.classList.add('is-active');
    place(markEl || source);
  }

  function hide() {
    tip.classList.remove('on');
    if (active) active.classList.remove('is-active');
    active = null;
  }

  /** Cot co o bat rieng phu rong hon cot; o nhiet thi chinh no la muc tieu. */
  function resolve(svg, el) {
    if (!el || !el.dataset || !el.dataset.v) return null;
    if (el.classList.contains('mark')) return { source: el, mark: el };
    var marks = svg.querySelectorAll('.mark');
    return { source: el, mark: marks[Number(el.dataset.i)] || null };
  }

  document.querySelectorAll('svg.chart').forEach(function (svg) {
    var targets = svg.querySelectorAll('[data-v]');
    var index = -1;

    svg.addEventListener('pointermove', function (e) {
      var hit = resolve(svg, e.target.closest('[data-v]'));
      if (hit) { show(hit.source, hit.mark); index = Number(hit.source.dataset.i || -1); }
      else hide();
    });
    svg.addEventListener('pointerleave', hide);

    svg.addEventListener('keydown', function (e) {
      var delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!delta || !targets.length) return;
      e.preventDefault();
      index = (index + delta + targets.length) % targets.length;
      var hit = resolve(svg, targets[index]);
      if (hit) show(hit.source, hit.mark);
    });
    svg.addEventListener('blur', hide);
  });

  /**
   * Tooltip cho gia tri NGOAI bieu do: dong bang va o KPI.
   * Dung uy quyen su kien o cap document vi so luong dong bang rat lon (hang tram),
   * gan listener cho tung dong se ton bo nho vo ich.
   */
  function outsideChart(target) {
    if (!target || !target.closest) return null;
    var el = target.closest('[data-v]');
    return el && !el.closest('svg') ? el : null;
  }

  document.addEventListener('pointerover', function (e) {
    var el = outsideChart(e.target);
    if (el) show(el, null);
  });
  document.addEventListener('pointerout', function (e) {
    if (outsideChart(e.target)) hide();
  });
  // Ban phim: focus vao dong/o co tooltip cung hien noi dung nhu khi di chuot
  document.addEventListener('focusin', function (e) {
    var el = outsideChart(e.target);
    if (el) show(el, null);
  });
  document.addEventListener('focusout', function (e) {
    if (outsideChart(e.target)) hide();
  });

  window.addEventListener('scroll', hide, { passive: true });

  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  if (tabs.length) {
    function select(i) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      hide(); // tooltip cua tab cu khong duoc phep treo lai
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = (i + d + tabs.length) % tabs.length;
        select(next);
        tabs[next].focus();
      });
    });
  }

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    /** Trang thai ban dau co the den tu he dieu hanh, khong chi tu thuoc tinh data-theme. */
    function isDark() {
      var stamp = document.documentElement.getAttribute('data-theme');
      if (stamp) return stamp === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    function sync() {
      toggle.textContent = isDark() ? 'Giao diện sáng' : 'Giao diện tối';
    }
    sync();
    toggle.addEventListener('click', function () {
      document.documentElement.setAttribute('data-theme', isDark() ? 'light' : 'dark');
      sync();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  }
})();
`;
