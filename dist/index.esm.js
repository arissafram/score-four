import { useRef as mn, useEffect as pn, createElement as wn } from "react";
import * as c from "three";
import { OrbitControls as gn } from "three/addons/controls/OrbitControls.js";
function yn(e, i, u) {
  return e + 4 * i + 16 * u;
}
const j = (e) => e >= 0 && e < 4, vn = (() => {
  const e = [];
  for (let i = -1; i <= 1; i++) for (let u = -1; u <= 1; u++) for (let f = -1; f <= 1; f++)
    if (!((i || u || f) <= 0))
      for (let l = 0; l < 4; l++) for (let r = 0; r < 4; r++) for (let h = 0; h < 4; h++)
        !j(l + 3 * i) || !j(r + 3 * u) || !j(h + 3 * f) || e.push([0, 1, 2, 3].map((o) => yn(l + o * i, r + o * u, h + o * f)));
  return e;
})(), ln = Array.from({ length: 64 }, () => []);
for (const e of vn) for (const i of e) ln[i].push(e);
function en() {
  return { cells: Array(64).fill(0), heights: Array(16).fill(0), turn: 1, winner: 0, winLine: null, draw: !1, moves: [] };
}
function an(e, i) {
  return !e.winner && !e.draw && i >= 0 && i < 16 && e.heights[i] < 4;
}
function bn(e, i) {
  if (!an(e, i)) return -1;
  const u = e.turn, f = i + 16 * e.heights[i];
  e.cells[f] = u, e.heights[i]++, e.moves.push(i);
  for (const s of ln[f])
    if (s.every((l) => e.cells[l] === u)) {
      e.winner = u, e.winLine = s.slice();
      break;
    }
  return !e.winner && e.moves.length === 64 && (e.draw = !0), e.turn = u === 1 ? 2 : 1, f;
}
const G = 1, cn = 0.5, fn = 0.3, O = fn + 4 * cn + 0.1, tn = new c.Vector3(5.5, 6.5, 8), Mn = new c.Vector3(0, 1, 0), $ = (e) => [(e % 4 - 1.5) * G, (Math.floor(e / 4) - 1.5) * G], Y = (e) => fn + e * cn;
function kn(e, { onPegClick: i = () => {
}, onPegHover: u = () => {
} } = {}) {
  const f = new c.WebGLRenderer({ antialias: !0 });
  f.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), e.appendChild(f.domElement);
  const s = new c.Scene();
  s.background = new c.Color(1916886);
  const l = new c.PerspectiveCamera(40, 1, 0.1, 100);
  l.position.copy(tn), s.add(new c.HemisphereLight(16777215, 10066329, 1.9));
  const r = new c.DirectionalLight(16777215, 1.1);
  r.position.set(-4, 10, 6), s.add(r);
  const h = 16765952, o = (n, a = {}) => new c.MeshLambertMaterial({ color: n, flatShading: !1, ...a }), t = {
    board: o(16777215),
    peg: o(0),
    pegHi: o(h, { emissive: h, emissiveIntensity: 0.4 }),
    1: o(1118481),
    2: o(16777215),
    red: o(h, { emissive: h, emissiveIntensity: 0.4 }),
    pale: o(16774048, { emissive: 16774048, emissiveIntensity: 0.4 }),
    ghost1: o(0, { transparent: !0, opacity: 0.35, depthWrite: !1 }),
    ghost2: o(16777215, { transparent: !0, opacity: 0.55, depthWrite: !1 })
  }, w = new c.Mesh(new c.BoxGeometry(4.4 * G, 0.24, 4.4 * G), t.board);
  w.position.y = -0.12, s.add(w);
  const k = new c.Mesh(new c.BoxGeometry(4.4 * G, 0.1, 4.4 * G), o(0));
  k.position.y = -0.29, s.add(k);
  const v = new c.CylinderGeometry(0.05, 0.05, O, 24), A = new c.CylinderGeometry(0.45, 0.45, O + 0.3, 8), I = new c.MeshBasicMaterial({ visible: !1 }), T = [], U = [];
  for (let n = 0; n < 16; n++) {
    const [a, d] = $(n), p = new c.Mesh(v, t.peg);
    p.position.set(a, O / 2, d), s.add(p), T.push(p);
    const C = new c.Mesh(A, I);
    C.position.copy(p.position), C.userData.peg = n, s.add(C), U.push(C);
  }
  const g = [], V = 0.38, R = 0.075, x = 0.23, E = 0.15;
  g.push(new c.Vector2(R, -x + 0.03));
  for (let n = 0; n <= 12; n++) {
    const a = -Math.PI / 2 + Math.min(n, 6) / 6 * (Math.PI / 2) + Math.max(n - 6, 0) / 6 * (Math.PI / 2), d = n <= 6 ? -x + E : x - E;
    g.push(new c.Vector2(V - E + E * Math.cos(a), d + E * Math.sin(a))), n === 6 && g.push(new c.Vector2(V, x - E));
  }
  g.push(new c.Vector2(R, x - 0.03)), g.push(new c.Vector2(R, -x + 0.03));
  const D = new c.LatheGeometry(g, 48);
  D.computeVertexNormals();
  const m = /* @__PURE__ */ new Map(), b = [], M = new c.Mesh(D, t.ghost1);
  M.visible = !1, s.add(M);
  let B = null;
  const y = new gn(l, f.domElement);
  y.target.copy(Mn), y.enableDamping = !0, y.enablePan = !1, y.minDistance = 5, y.maxDistance = 20, y.maxPolarAngle = Math.PI / 2 - 0.08, y.update();
  let L = null;
  function X(n) {
    L = { from: l.position.clone(), to: n, t: 0 };
  }
  function q() {
    const n = e.clientWidth || 1, a = e.clientHeight || 1;
    f.setSize(n, a, !1), l.aspect = n / a, l.updateProjectionMatrix();
  }
  const J = new ResizeObserver(q);
  J.observe(e), q();
  const K = new c.Raycaster(), Z = new c.Vector2();
  function Q(n) {
    const a = f.domElement.getBoundingClientRect();
    Z.set((n.clientX - a.left) / a.width * 2 - 1, -((n.clientY - a.top) / a.height) * 2 + 1), K.setFromCamera(Z, l);
    const d = K.intersectObjects(U)[0];
    return d ? d.object.userData.peg : null;
  }
  let P = null, z = null;
  const H = f.domElement;
  H.addEventListener("pointerdown", (n) => {
    P = { x: n.clientX, y: n.clientY, moved: !1 };
  }), H.addEventListener("pointermove", (n) => {
    if (P && Math.hypot(n.clientX - P.x, n.clientY - P.y) > 5 && (P.moved = !0), P) return;
    const a = Q(n);
    a !== z && (z = a, u(a));
  }), H.addEventListener("pointerup", (n) => {
    const a = P;
    if (P = null, a && !a.moved) {
      const d = Q(n);
      d !== null && i(d);
    }
  }), H.addEventListener("pointerleave", () => {
    z !== null && (z = null, u(null));
  });
  let N = [];
  const nn = new c.Clock();
  return f.setAnimationLoop(() => {
    const n = Math.min(nn.getDelta(), 0.1);
    if (L) {
      L.t = Math.min(1, L.t + n / 0.6);
      const d = 1 - Math.pow(1 - L.t, 3);
      l.position.lerpVectors(L.from, L.to, d), l.lookAt(y.target), L.t >= 1 && (L = null);
    }
    y.enabled = !L, L || y.update();
    for (let d = b.length - 1; d >= 0; d--) {
      const p = b[d];
      p.t = Math.min(1, p.t + n / 0.35), p.mesh.position.y = p.from + (p.to - p.from) * p.t * p.t, p.t >= 1 && b.splice(d, 1);
    }
    const a = Math.floor(nn.elapsedTime * 3) % 2 === 0;
    for (const d of N) d.material = a ? d.userData.mat === t[2] ? t.pale : t.red : d.userData.mat;
    f.render(s, l);
  }), {
    setBead(n, a, d = !0) {
      const p = n % 16, C = Math.floor(n / 16), [dn, hn] = $(p);
      m.has(n) && s.remove(m.get(n));
      const W = new c.Mesh(D, t[a]);
      W.userData.mat = t[a], W.position.set(dn, Y(C), hn), s.add(W), m.set(n, W), d && (W.position.y = O + 1, b.push({ mesh: W, from: O + 1, to: Y(C), t: 0 }));
    },
    clearBeads() {
      for (const n of m.values()) s.remove(n);
      m.clear(), b.length = 0, N = [];
    },
    setGhost(n, a, d) {
      if (B !== null && (T[B].material = t.peg), B = n, n == null || a > 3) {
        M.visible = !1, B = null;
        return;
      }
      T[n].material = t.pegHi;
      const [p, C] = $(n);
      M.material = d === 2 ? t.ghost2 : t.ghost1, M.position.set(p, Y(a), C), M.visible = !0;
    },
    flash(n) {
      N = n.map((a) => m.get(a)).filter(Boolean);
    },
    topView() {
      const n = l.position.distanceTo(y.target);
      X(y.target.clone().add(new c.Vector3(0, n, 0.01)));
    },
    resetCamera() {
      X(tn.clone());
    },
    // stop rendering and free everything (GPU resources, observers, canvas)
    destroy() {
      f.setAnimationLoop(null), J.disconnect(), y.dispose(), s.traverse((n) => {
        n.geometry && n.geometry.dispose();
      });
      for (const n of [...Object.values(t), I, k.material]) n.dispose();
      f.dispose(), f.forceContextLoss(), H.remove();
    }
  };
}
const S = 24, _ = Math.max(2, Math.min(window.devicePixelRatio || 1, 3)), on = "#000", xn = "#fff", rn = "#ffd400", Ln = "#1d3fd6";
function An(e, { onPegClick: i = () => {
} } = {}) {
  const u = [];
  e.innerHTML = "";
  for (let s = 0; s < 4; s++) {
    const l = document.createElement("div");
    l.className = "layer", l.textContent = `Layer ${s + 1}${s === 0 ? " (bottom)" : s === 3 ? " (top)" : ""}`;
    const r = document.createElement("canvas");
    r.width = r.height = S * 4 * _, r.style.display = "block", r.style.cursor = "pointer", r.addEventListener("click", (h) => {
      const o = r.getBoundingClientRect(), t = Math.floor((h.clientX - o.left) / o.width * 4), w = Math.floor((h.clientY - o.top) / o.height * 4);
      t >= 0 && t < 4 && w >= 0 && w < 4 && i(t + 4 * w);
    }), l.appendChild(r), e.prepend(l), u[s] = r;
  }
  function f(s, l = null) {
    const r = new Set(s.winLine || []);
    let h = -1;
    l !== null && !s.winner && !s.draw && s.heights[l] < 4 && (h = l + 16 * s.heights[l]);
    for (let o = 0; o < 4; o++) {
      const t = u[o].getContext("2d");
      t.setTransform(_, 0, 0, _, 0, 0), t.fillStyle = Ln, t.fillRect(0, 0, S * 4, S * 4);
      for (let w = 0; w < 16; w++) {
        const k = w + 16 * o, v = (w % 4 + 0.5) * S, A = (Math.floor(w / 4) + 0.5) * S, I = s.cells[k];
        t.setLineDash([]), t.beginPath(), t.arc(v, A, S * 0.36, 0, Math.PI * 2), I ? (t.fillStyle = I === 1 ? on : xn, t.fill(), t.strokeStyle = on, t.lineWidth = 1, t.stroke()) : (t.fillStyle = "rgba(255,255,255,0.55)", t.beginPath(), t.arc(v, A, 1.5, 0, Math.PI * 2), t.fill()), k === h && (t.beginPath(), t.arc(v, A, S * 0.36, 0, Math.PI * 2), t.setLineDash([3, 3]), t.strokeStyle = rn, t.lineWidth = 1.5, t.stroke()), r.has(k) && (t.setLineDash([]), t.beginPath(), t.arc(v, A, S * 0.44, 0, Math.PI * 2), t.strokeStyle = rn, t.lineWidth = 2, t.stroke());
      }
    }
  }
  return { render: f };
}
const un = `function ct(e, t, o) {
  return e + 4 * t + 16 * o;
}
const z = (e) => e >= 0 && e < 4, W = (() => {
  const e = [];
  for (let t = -1; t <= 1; t++) for (let o = -1; o <= 1; o++) for (let i = -1; i <= 1; i++)
    if (!((t || o || i) <= 0))
      for (let f = 0; f < 4; f++) for (let m = 0; m < 4; m++) for (let l = 0; l < 4; l++)
        !z(f + 3 * t) || !z(m + 3 * o) || !z(l + 3 * i) || e.push([0, 1, 2, 3].map((y) => ct(f + y * t, m + y * o, l + y * i)));
  return e;
})(), at = Array.from({ length: 64 }, () => []);
for (const e of W) for (const t of e) at[t].push(e);
const Z = {
  easy: { maxDepth: 2, mistake: 0.25 },
  medium: { maxDepth: 4, mistake: 0.05 },
  hard: { timeMs: 1e3 },
  expert: { timeMs: 3e3 }
}, p = W.length, G = 1e6, U = G - 100, q = Int8Array.from(W.flat()), R = Array.from({ length: 64 }, () => []);
W.forEach((e, t) => e.forEach((o) => R[o].push(t)));
const H = R.map((e) => Int8Array.from(e)), st = Array.from({ length: 16 }, (e, t) => R[t].length);
let k = 2654435769;
const it = () => (k ^= k << 13, k ^= k >>> 17, k ^= k << 5, k >>> 0), V = new Uint32Array(192).map(it), X = new Uint32Array(192).map(it), ut = 20, T = 1 << ut, ht = T - 1, J = new Uint32Array(T), Q = new Int32Array(T), $ = new Int8Array(T), N = new Uint8Array(T), tt = new Int8Array(T), nt = 1, et = 2, rt = 3, b = new Uint8Array(64), g = new Uint8Array(16), E = [null, new Uint8Array(p), new Uint8Array(p)], B = [null, new Int32Array(16), new Int32Array(16)];
let u = 1, S = 0, v = 0, x = 0, C = 0, ft = 1 / 0;
const lt = {};
function K(e) {
  const t = e + 16 * g[e]++;
  b[t] = u;
  const o = E[u], i = H[t];
  for (let s = 0; s < i.length; s++) o[i[s]]++;
  v ^= V[t * 3 + u], x ^= X[t * 3 + u], u = 3 - u, S++;
}
function O(e) {
  u = 3 - u, S--;
  const t = e + 16 * --g[e];
  b[t] = 0;
  const o = E[u], i = H[t];
  for (let s = 0; s < i.length; s++) o[i[s]]--;
  v ^= V[t * 3 + u], x ^= X[t * 3 + u];
}
function D(e, t) {
  const o = E[e], i = E[3 - e], s = H[t];
  for (let f = 0; f < s.length; f++) if (o[s[f]] === 3 && i[s[f]] === 0) return !0;
  return !1;
}
const j = (e) => g[e] < 3 && D(3 - u, e + 16 * (g[e] + 1)), ot = [0, 2, 12, 0], _ = new Uint8Array(64);
function mt() {
  const e = u, t = E[e], o = E[3 - e];
  let i = 0;
  _.fill(0);
  for (let s = 0; s < p; s++) {
    const f = t[s], m = o[s];
    if (f && m) continue;
    const l = f || m;
    if (l < 3) {
      i += f ? ot[l] : -ot[l];
      continue;
    }
    let y = 0;
    for (let I = s * 4; I < s * 4 + 4; I++) if (!b[q[I]]) {
      y = q[I];
      break;
    }
    const c = f ? 1 : 2;
    if (_[y] & c) continue;
    _[y] |= c;
    const M = f ? e : 3 - e, r = y >> 4;
    let a;
    g[y & 15] === r ? a = f ? 500 : 120 : a = (r & 1) === (M === 1 ? 0 : 1) ? 250 : 50, i += f ? a : -a;
  }
  for (let s = 0; s < 48; s++) {
    const f = _[s] & _[s + 16];
    f & 1 && (i += 300), f & 2 && (i -= 300);
  }
  return i;
}
function F(e, t, o, i) {
  if ((++C & 2047) === 0 && Date.now() > ft) throw lt;
  const s = u, f = 3 - s;
  let m = 0, l = -1;
  for (let n = 0; n < 16; n++) {
    if (g[n] > 3) continue;
    const d = n + 16 * g[n];
    if (D(s, d)) return G - i - 1;
    D(f, d) && (m++, l = n);
  }
  if (m > 1) return -(G - i - 2);
  if (S === 64) return 0;
  if (m === 1) {
    K(l);
    const n = -F(e, -o, -t, i + 1);
    return O(l), n;
  }
  if (e <= 0) return mt();
  const y = t, c = v & ht;
  let M = -1;
  if (J[c] === x && N[c] && (M = tt[c], $[c] >= e)) {
    let n = Q[c];
    n > U ? n -= i : n < -U && (n += i);
    const d = N[c];
    if (d === nt || (d === et && n > t ? t = n : d === rt && n < o && (o = n), t >= o)) return n;
  }
  const r = [], a = [];
  let I = !1;
  for (let n = 0; n < 16; n++) g[n] < 4 && !j(n) && (I = !0);
  for (let n = 0; n < 16; n++)
    g[n] > 3 || I && j(n) || (r.push(n), a.push(n === M ? 1e9 : B[s][n] + st[n]));
  for (let n = 1; n < r.length; n++) {
    const d = r[n], Y = a[n];
    let A = n - 1;
    for (; A >= 0 && a[A] < Y; )
      r[A + 1] = r[A], a[A + 1] = a[A], A--;
    r[A + 1] = d, a[A + 1] = Y;
  }
  let w = -1 / 0, L = r[0];
  for (let n = 0; n < r.length; n++) {
    K(r[n]);
    const d = -F(e - 1, -o, -t, i + 1);
    if (O(r[n]), d > w && (w = d, L = r[n]), d > t && (t = d), t >= o) {
      B[s][r[n]] += e * e;
      break;
    }
  }
  let h = w;
  return h > U ? h += i : h < -U && (h -= i), J[c] = x, Q[c] = h, $[c] = e, tt[c] = L, N[c] = w <= y ? rt : w >= o ? et : nt, w;
}
function gt(e) {
  b.fill(0), g.fill(0), E[1].fill(0), E[2].fill(0), B[1].fill(0), B[2].fill(0), v = x = 0, S = 0;
  for (let t = 0; t < 64; t++) {
    const o = e.cells[t];
    if (o) {
      b[t] = o, S++;
      for (const i of R[t]) E[o][i]++;
      v ^= V[t * 3 + o], x ^= X[t * 3 + o];
    }
  }
  for (let t = 0; t < 16; t++) g[t] = e.heights[t];
  u = e.turn;
}
let P = { nodes: 0 };
function yt(e, t = Z.hard) {
  if (e.winner || e.draw) return -1;
  gt(e);
  const o = u, i = 3 - o, s = [];
  for (let r = 0; r < 16; r++) g[r] < 4 && s.push(r);
  if (!s.length) return -1;
  P = { depth: 0, score: 0, nodes: 0 };
  for (const r of s) if (D(o, r + 16 * g[r])) return r;
  const f = s.filter((r) => D(i, r + 16 * g[r]));
  if (f.length) return f[0];
  const m = s.filter((r) => !j(r)), l = m.length ? m : s;
  if (l.length === 1) return l[0];
  if (t.mistake && Math.random() < t.mistake)
    return l[Math.floor(Math.random() * l.length)];
  N.fill(0), C = 0;
  const y = Math.min(t.maxDepth ?? 64, 64 - S);
  ft = t.timeMs ? Date.now() + t.timeMs : 1 / 0;
  const c = new Map(l.map((r) => [r, st[r]]));
  let M = l.slice().sort((r, a) => c.get(a) - c.get(r))[0];
  for (let r = 1; r <= y; r++) {
    const a = l.slice().sort((h, n) => c.get(n) - c.get(h));
    let I = -1 / 0, w = a[0], L = -1 / 0;
    try {
      for (const h of a) {
        K(h);
        const n = -F(r - 1, -1 / 0, -I, 1);
        O(h), c.set(h, n), n > L && (L = n, w = h), n > I && (I = n);
      }
    } catch (h) {
      if (h !== lt) throw h;
      L > -1 / 0 && (M = w);
      break;
    }
    if (M = w, P = { depth: r, score: L, nodes: C }, Math.abs(L) > U) break;
  }
  return P.nodes = C, M;
}
self.onmessage = (e) => {
  const { id: t, state: o, level: i } = e.data;
  self.postMessage({ id: t, peg: yt(o, Z[i] || Z.medium) });
};
`, sn = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", un], { type: "text/javascript;charset=utf-8" });
function En(e) {
  let i;
  try {
    if (i = sn && (self.URL || self.webkitURL).createObjectURL(sn), !i) throw "";
    const u = new Worker(i, {
      type: "module",
      name: e?.name
    });
    return u.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(i);
    }), u;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(un),
      {
        type: "module",
        name: e?.name
      }
    );
  }
}
function Cn() {
  return new En();
}
const F = { 1: "Black", 2: "White" }, In = `
<header class="sf-header">
  <h1 class="sf-wordmark">Score Four</h1>
  <div class="sf-status" role="status" aria-live="polite"></div>
</header>
<div class="sf-main">
  <section class="sf-view-wrap">
    <div class="sf-view"></div>
    <p class="sf-hint">Drag to rotate · scroll or pinch to zoom</p>
  </section>
  <aside class="sf-panel">
    <div class="sf-minimap"></div>
    <div class="sf-buttons">
      <button type="button" class="sf-btn-top">Top view</button>
      <button type="button" class="sf-btn-reset">Reset camera</button>
      <button type="button" class="sf-btn-new">New game</button>
    </div>
    <div class="sf-settings">
      <label>Opponent <select class="sf-mode"><option value="2p">Human</option><option value="cpu">Computer</option></select></label>
      <label>First <select class="sf-first"><option value="human">Human</option><option value="cpu">Computer</option></select></label>
    </div>
    <div class="sf-score"></div>
  </aside>
</div>`;
function Rn(e, i = {}) {
  const { opponent: u = "2p", first: f = "human", showTitle: s = !0, createWorker: l = Cn } = i;
  e.classList.add("score-four"), e.innerHTML = In;
  const r = (m) => e.querySelector(`.sf-${m}`);
  s || r("wordmark").remove(), r("mode").value = u, r("first").value = f;
  const h = { 1: 0, 2: 0 };
  let o = en(), t = null, w = !1, k = 0, v = !1;
  const A = l();
  A.onmessage = (m) => {
    v || m.data.id !== k || (w = !1, x(m.data.peg, !0));
  };
  const I = () => r("mode").value === "cpu", T = () => r("first").value === "cpu" ? 1 : 2, U = () => I() && !o.winner && !o.draw && o.turn === T(), g = kn(r("view"), {
    onPegClick: x,
    onPegHover(m) {
      t = m, R();
    }
  }), V = An(r("minimap"), { onPegClick: x });
  function R() {
    const m = o.winner || o.draw, b = t !== null && !m && !U() && o.heights[t] < 4;
    g.setGhost(b ? t : null, b ? o.heights[t] : 0, o.turn), V.render(o, t);
    const M = I();
    r("first").disabled = !M, r("status").textContent = o.winner ? M ? o.winner === T() ? "Computer wins!" : "You win!" : `${F[o.winner]} wins!` : o.draw ? "Draw" : U() ? "Computer is thinking…" : M ? `Your turn (${F[o.turn].toLowerCase()})` : `${F[o.turn]}'s turn`, r("score").textContent = `Black ${h[1]} · White ${h[2]}`;
  }
  function x(m, b = !1) {
    if (v || !b && (w || U()) || !an(o, m)) return !1;
    const M = o.turn, B = bn(o, m);
    return B < 0 ? !1 : (g.setBead(B, M), o.winner && (h[o.winner]++, g.flash(o.winLine)), R(), E(), !0);
  }
  function E() {
    if (!U()) return;
    w = !0;
    const m = ++k, b = JSON.parse(JSON.stringify(o));
    A.postMessage({ id: m, state: b, level: "hard" });
  }
  function D() {
    v || (k++, w = !1, o = en(), g.clearBeads(), R(), E());
  }
  return r("btn-top").onclick = () => g.topView(), r("btn-reset").onclick = () => g.resetCamera(), r("btn-new").onclick = D, r("mode").onchange = D, r("first").onchange = D, R(), E(), {
    get game() {
      return o;
    },
    play: x,
    newGame: D,
    destroy() {
      v || (v = !0, A.terminate(), g.destroy(), e.innerHTML = "", e.classList.remove("score-four"));
    }
  };
}
function Sn({ className: e, style: i, opponent: u, first: f, showTitle: s, onReady: l }) {
  const r = mn(null);
  return pn(() => {
    const h = Rn(r.current, { opponent: u, first: f, showTitle: s });
    return l?.(h), () => h.destroy();
  }, [u, f, s]), wn("div", { className: e, style: i, ref: r });
}
export {
  Sn as ScoreFour,
  Sn as default,
  Rn as mount
};
