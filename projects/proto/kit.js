// Small helpers shared by the case-study prototypes.
window.P = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  function set(el, a) { for (var k in a) { if (k === 'text') el.textContent = a[k]; else if (k === 'style' && typeof a[k] === 'object') Object.assign(el.style, a[k]); else el.setAttribute(k, a[k]); } return el; }
  return {
    ink: '#141414', paper: '#EFEDE7', card: '#F7F5F0', mute: '#6A6862', hair: '#CFCCC4', blue: '#2247C9', red: '#D9412C', yellow: '#F2C12E', green: '#1F8A70',
    font: "'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    reduce: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
    h: function (tag, a, parent) { var el = set(document.createElement(tag), a || {}); if (parent) parent.appendChild(el); return el; },
    s: function (tag, a, parent) { var el = set(document.createElementNS(NS, tag), a || {}); if (parent) parent.appendChild(el); return el; },
    set: set,
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    // pointer position inside an svg, in viewBox units
    pt: function (svg, e) { var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return { x: (e.clientX - r.left) / r.width * vb.width, y: (e.clientY - r.top) / r.height * vb.height }; },
    // run fn(dt, t) every frame while the prototype is on screen
    loop: function (root, fn) {
      var on = false, last = 0, id;
      function tick(t) { if (!on) return; fn(Math.max(0, Math.min(50, t - last)), t); last = t; id = requestAnimationFrame(tick); }
      new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !on) { on = true; last = performance.now(); id = requestAnimationFrame(tick); } else if (!v) { on = false; cancelAnimationFrame(id); } }).observe(root);
    },
    mount: function (id, fn) { var el = document.getElementById(id); if (el) fn(el); }
  };
})();
// v3 helpers
(function () { var P = window.P;
P.css = function (id, text) { if (document.getElementById(id)) return; var st = document.createElement('style'); st.id = id; st.textContent = text; document.head.appendChild(st); };
P.smooth = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
P.range = function (parent, min, max, val, step, label, on) { var el = P.h('input', { type: 'range', min: min, max: max, value: val, step: step || 1, 'aria-label': label }, parent); el.addEventListener('input', function () { on(+el.value); }); return el; };
// horizontal drag on an element: on(dx since start, event), end(dx)
P.drag = function (el, on, end, start) {
  var x0 = 0, y0 = 0, live = false, dx = 0;
  el.addEventListener('pointerdown', function (e) { if (e.button) return; live = true; x0 = e.clientX; y0 = e.clientY; dx = 0; try { el.setPointerCapture(e.pointerId); } catch (_) {} if (start) start(e); });
  el.addEventListener('pointermove', function (e) { if (!live) return; dx = e.clientX - x0; on(dx, e, e.clientY - y0); });
  function up(e) { if (!live) return; live = false; if (end) end(dx, e); }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
};
})();
