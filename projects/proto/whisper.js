// Whisper Field: the two halves of the installation, each reduced to its one rule.
// Catenary, "Mind in Bloom": flower lights open slowly over the people standing beneath, and wider as more gather.
// Cube floor: the grass answers a touch late (120 ms) and softly (15 cm of glow). Guiding, never dominating.
(function () {
  var P = window.P, PINK = '#FF8EB1', NIGHT = '#141414';

  P.mount('proto', function (root) {
    root.style.background = NIGHT; root.style.cursor = 'pointer'; root.style.touchAction = 'pan-y';
    var svg = P.s('svg', { width: '100%', height: '100%', role: 'img', 'aria-label': 'A canopy of flower lights above a ground line' }, root);
    var gStr = P.s('g', {}, svg), gFl = P.s('g', {}, svg), gPp = P.s('g', {}, svg), W = 0, H = 0, fl = [], people = [], ghost = null, touched = false;
    function petals(g, fill) { for (var i = 0; i < 6; i++) P.s('ellipse', { cx: 0, cy: -9, rx: 4.6, ry: 9.5, fill: fill, transform: 'rotate(' + (i * 60) + ')' }, g); }
    function build() {
      W = root.clientWidth; H = root.clientHeight; gStr.textContent = ''; gFl.textContent = ''; fl = [];
      var rows = 4, per = Math.max(5, Math.round(W / 62));
      for (var r = 0; r < rows; r++) {
        var y0 = 34 + r * 46, sag = 44 + r * 10, d = '', n = per - (r % 2);
        for (var x = 0; x <= W; x += 8) { var u = (x - W / 2) / (W / 2); d += (x ? 'L' : 'M') + x + ' ' + (y0 + sag * (1 - u * u)).toFixed(1); }
        P.s('path', { d: d, fill: 'none', stroke: '#474642', 'stroke-width': 1 }, gStr);
        for (var i = 0; i < n; i++) {
          var fx = (i + 0.5 + (r % 2) * 0.5) * (W / per), fu = (fx - W / 2) / (W / 2), fy = y0 + sag * (1 - fu * fu) + 14;
          P.s('line', { x1: fx, x2: fx, y1: fy - 14, y2: fy, stroke: '#474642', 'stroke-width': 1 }, gStr);
          var g = P.s('g', {}, gFl), dim = P.s('g', {}, g), lit = P.s('g', {}, g);
          petals(dim, '#3A3936'); petals(lit, PINK); P.s('circle', { r: 3.4, fill: P.yellow }, lit);
          fl.push({ x: fx, y: fy, g: g, lit: lit, o: 0, ph: Math.random() * 6.28 });
        }
      }
      drawPeople();
    }
    function person(x, a) { var g = P.s('g', { opacity: a }, gPp); P.s('circle', { cx: x, cy: H - 74, r: 9, fill: '#F7F5F0' }, g); P.s('rect', { x: x - 9, y: H - 62, width: 18, height: 40, rx: 9, fill: '#F7F5F0' }, g); }
    function drawPeople() {
      gPp.textContent = '';
      P.s('line', { x1: 0, x2: W, y1: H - 22, y2: H - 22, stroke: '#474642', 'stroke-width': 1 }, gPp);
      people.forEach(function (x) { person(x, 1); });
      if (ghost !== null) person(ghost, 0.45);
    }
    function px(e) { return e.clientX - root.getBoundingClientRect().left; }
    root.addEventListener('pointermove', function (e) { touched = true; ghost = px(e); drawPeople(); });
    root.addEventListener('pointerleave', function () { ghost = null; drawPeople(); });
    root.addEventListener('click', function (e) {
      touched = true; var x = px(e), k = -1;
      people.forEach(function (p, i) { if (Math.abs(p - x) < 16) k = i; });
      if (k >= 0) people.splice(k, 1); else { if (people.length >= 7) people.shift(); people.push(x); }
      drawPeople();
    });
    new ResizeObserver(build).observe(root); build();
    P.loop(root, function (dt, t) {
      if (!touched && !P.reduce) { ghost = W * (0.5 + 0.34 * Math.sin(t / 2600)); drawPeople(); }
      var all = people.concat(ghost !== null ? [ghost] : []), R = 90 + 16 * all.length, k = 1 - Math.exp(-dt / 900);
      fl.forEach(function (f) {
        var tg = 0; all.forEach(function (p) { var d = (f.x - p) / R; tg += Math.exp(-d * d); }); tg = Math.min(1, tg);
        f.o += (tg - f.o) * k;
        var sc = 0.5 + 0.8 * f.o, sway = P.reduce ? 0 : Math.sin(t / 1400 + f.ph) * 4;
        f.g.setAttribute('transform', 'translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ') rotate(' + sway.toFixed(1) + ' 0 -14) scale(' + sc.toFixed(3) + ')');
        f.lit.setAttribute('opacity', f.o.toFixed(3));
      });
    });
  });

  P.mount('proto2', function (root) {
    root.style.background = NIGHT; root.style.touchAction = 'pan-y';
    var cv = P.h('canvas', { style: 'position:absolute;inset:0;width:100%;height:100%', 'aria-label': 'A field of grass that lights up a moment after it is touched', role: 'img' }, root), cx = cv.getContext('2d');
    P.h('div', { style: 'position:absolute;left:16px;bottom:12px;font-size:12px;color:#8B8880;pointer-events:none', text: '120 ms · 15 cm' }, root);
    var W = 0, H = 0, dpr = 1, blades = [], trail = [], ptr = null, touched = false, DELAY = 120, RAD = 78;
    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = root.clientWidth; H = root.clientHeight; cv.width = W * dpr; cv.height = H * dpr; blades = [];
      var gap = 17;
      for (var y = gap; y < H - 4; y += gap) for (var x = gap / 2 + ((y / gap) % 2) * gap / 2; x < W; x += gap) blades.push({ x: x + (Math.random() - .5) * 6, y: y + (Math.random() - .5) * 6, g: 0, a: (Math.random() - .5) * 0.5, h: 9 + Math.random() * 5 });
    }
    function at(e) { var r = root.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    root.addEventListener('pointermove', function (e) { touched = true; ptr = at(e); });
    root.addEventListener('pointerdown', function (e) { touched = true; ptr = at(e); });
    root.addEventListener('pointerleave', function () { ptr = null; });
    new ResizeObserver(build).observe(root); build();
    P.loop(root, function (dt, t) {
      if (!touched && !P.reduce) ptr = { x: W * (0.5 + 0.32 * Math.sin(t / 1900)), y: H * (0.5 + 0.28 * Math.sin(t / 1300 + 1)) };
      if (ptr) trail.push({ x: ptr.x, y: ptr.y, t: t });
      while (trail.length > 2 && trail[1].t <= t - DELAY) trail.shift();
      var late = trail.length && trail[0].t <= t - DELAY ? trail[0] : null;
      if (!ptr && trail.length && t - trail[trail.length - 1].t > DELAY) { trail.length = 0; late = null; }
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); cx.lineCap = 'round';
      var up = 1 - Math.exp(-dt / 90), down = 1 - Math.exp(-dt / 1100);
      for (var i = 0; i < blades.length; i++) {
        var b = blades[i], tg = 0, lean = 0;
        if (late) { var dx = b.x - late.x, dy = b.y - late.y, d2 = (dx * dx + dy * dy) / (RAD * RAD); tg = Math.exp(-d2); lean = (dx / RAD) * tg; }
        b.g += (tg - b.g) * (tg > b.g ? up : down);
        b.l = (b.l || 0) + (lean - (b.l || 0)) * up;
        var ang = b.a + b.l * 0.9 + (P.reduce ? 0 : Math.sin(t / 1700 + b.x * 0.02) * 0.08), h = b.h * (1 + 0.5 * b.g), g = b.g;
        cx.strokeStyle = 'rgb(' + Math.round(58 + 150 * g) + ',' + Math.round(72 + 168 * g) + ',' + Math.round(62 + 140 * g) + ')';
        cx.lineWidth = 1.4 + 1.4 * g;
        cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + Math.sin(ang) * h, b.y - Math.cos(ang) * h); cx.stroke();
      }
      if (ptr) { cx.strokeStyle = 'rgba(247,245,240,.7)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(ptr.x, ptr.y, 9, 0, 6.2832); cx.stroke(); }
    });
  });
})();
