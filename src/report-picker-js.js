/**
 * Phan chay tren trinh duyet cho khoi sinh day so.
 *
 * Thuat toan KHONG viet lai o day: ma nguon random-picker.js duoc nhung thang vao trang
 * (xem report-page.js), nen CLI va trang web dung chung mot nguon. File nay chi lo phan
 * doc du lieu nhung, goi ham, va ve ket qua.
 */

export const PICKER_JS = `
(function () {
  /** Chuoi nen -> mang ky { numbers: [...] }. Moi ky chiem (so bong x 2) ky tu. */
  function unpack(packed, balls) {
    var width = balls * 2;
    var draws = [];
    for (var i = 0; i + width <= packed.length; i += width) {
      var nums = [];
      for (var j = 0; j < balls; j++) nums.push(Number(packed.substr(i + j * 2, 2)));
      draws.push({ numbers: nums });
    }
    return draws;
  }

  /** Chuoi nen Max 3D -> mang ky, moi ky la 4 giai xep theo MAX3D_TIER_SIZES. */
  function unpackMax3d(packed) {
    var width = 0;
    MAX3D_TIER_SIZES.forEach(function (n) { width += n * 3; });

    var draws = [];
    for (var i = 0; i + width <= packed.length; i += width) {
      var tiers = [];
      var at = i;
      MAX3D_TIER_SIZES.forEach(function (size) {
        var tier = [];
        for (var k = 0; k < size; k++) { tier.push(packed.substr(at, 3)); at += 3; }
        tiers.push(tier);
      });
      draws.push(tiers);
    }
    return draws;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text; // du lieu luon chen bang textContent
    return n;
  }

  function renderBalls(numbers) {
    var row = el('div', 'pick-row');
    numbers.forEach(function (n) {
      row.appendChild(el('span', 'ball', String(n).padStart(2, '0')));
    });
    return row;
  }

  document.querySelectorAll('.picker').forEach(function (box) {
    var data = JSON.parse(box.querySelector('.pick-data').textContent);
    var out = box.querySelector('.pick-out');
    var btn = box.querySelector('.pick-go');
    var modeSel = box.querySelector('.pick-mode');
    var playSel = box.querySelector('.pick-play');
    var countInput = box.querySelector('.pick-count');

    // Giai nen mot lan roi dung lai cho moi lan bam, khong lam lai moi lan
    var draws = data.kind === 'lotto'
      ? unpack(data.draws, data.balls)
      : unpackMax3d(data.draws);

    function run() {
      var mode = modeSel.value;
      var count = Math.max(1, Math.min(20, Number(countInput.value) || 5));
      out.textContent = '';

      if (data.kind === 'max3d') {
        var play = playSel ? playSel.value : data.plays[0].id;
        var picked = pickMax3dPlay(draws, { play: play, mode: mode, count: count });

        if (!picked.picks.length) {
          out.appendChild(el('p', 'pick-fail',
            'Không còn bộ số nào thỏa mãn: cả 1.000 bộ 3 chữ số đều đã từng ra. Thử chế độ "Tránh trùng giải cao nhất".'));
          return;
        }

        picked.picks.forEach(function (p) {
          // Bo 6 chu so hien thanh 2 bong dung nhu tren ve cuoc
          out.appendChild(renderBalls(
            p.number.length === 6 ? [p.number.slice(0, 3), p.number.slice(3)] : [p.number]));
        });

        out.appendChild(el('p', 'pick-meta',
          'Chọn từ ' + picked.poolSize.toLocaleString('vi-VN') + '/' +
          picked.space.toLocaleString('vi-VN') + ' bộ số chưa từng trúng giải.'));

        if (!picked.feasible) {
          out.appendChild(el('p', 'pick-fail',
            'Chỉ sinh được ' + picked.picks.length + '/' + count + ' bộ số thỏa mãn.'));
        }
        return;
      }

      var res = pickLotto(draws, {
        maxNumber: data.maxNumber,
        ballsPerDraw: data.balls,
        minPrizeMatch: data.minMatch,
      }, { mode: mode, count: count });

      res.picks.forEach(function (p) {
        var row = renderBalls(p.numbers);
        row.appendChild(el('span', 'pick-meta-inline', 'trùng nhiều nhất ' + p.maxOverlap + ' số'));
        out.appendChild(row);
      });

      if (!res.feasible) {
        out.appendChild(el('p', 'pick-fail',
          'Không tìm được dãy thỏa mãn sau ' + res.tried.toLocaleString('vi-VN') + ' lần thử. ' +
          'Với số kỳ đã quay lớn như vậy, gần như mọi dãy đều trùng đủ số để trúng một giải nào đó với ít nhất một kỳ cũ.'));
        if (res.best) {
          out.appendChild(el('p', 'pick-meta', 'Dãy tốt nhất tìm được (trùng nhiều nhất ' + res.best.maxOverlap + ' số):'));
          out.appendChild(renderBalls(res.best.numbers));
        }
      }
    }

    btn.addEventListener('click', run);
  });
})();
`;
