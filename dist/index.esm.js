import { useRef as It, useEffect as Ct, createElement as St } from "react";
import * as a from "three";
import { OrbitControls as Tt } from "three/addons/controls/OrbitControls.js";
function Dt(n, l, d) {
  return n + 4 * l + 16 * d;
}
const q = (n) => n >= 0 && n < 4, Pt = (() => {
  const n = [];
  for (let l = -1; l <= 1; l++) for (let d = -1; d <= 1; d++) for (let f = -1; f <= 1; f++)
    if (!((l || d || f) <= 0))
      for (let i = 0; i < 4; i++) for (let r = 0; r < 4; r++) for (let w = 0; w < 4; w++)
        !q(i + 3 * l) || !q(r + 3 * d) || !q(w + 3 * f) || n.push([0, 1, 2, 3].map((u) => Dt(i + u * l, r + u * d, w + u * f)));
  return n;
})(), dt = Array.from({ length: 64 }, () => []);
for (const n of Pt) for (const l of n) dt[l].push(n);
function lt() {
  return { cells: Array(64).fill(0), heights: Array(16).fill(0), turn: 1, winner: 0, winLine: null, draw: !1, moves: [] };
}
function mt(n, l) {
  return !n.winner && !n.draw && l >= 0 && l < 16 && n.heights[l] < 4;
}
function Rt(n, l) {
  if (!mt(n, l)) return -1;
  const d = n.turn, f = l + 16 * n.heights[l];
  n.cells[f] = d, n.heights[l]++, n.moves.push(l);
  for (const s of dt[f])
    if (s.every((i) => n.cells[i] === d)) {
      n.winner = d, n.winLine = s.slice();
      break;
    }
  return !n.winner && n.moves.length === 64 && (n.draw = !0), n.turn = d === 1 ? 2 : 1, f;
}
const O = 1, ht = 0.5, pt = 0.3, N = pt + 4 * ht + 0.1, at = new a.Vector3(5.5, 6.5, 8), Ut = new a.Vector3(0, 1, 0), Z = (n) => [(n % 4 - 1.5) * O, (Math.floor(n / 4) - 1.5) * O], K = (n) => pt + n * ht;
function zt(n, { onPegClick: l = () => {
}, onPegHover: d = () => {
} } = {}) {
  const f = new a.WebGLRenderer({ antialias: !0 });
  f.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), n.appendChild(f.domElement);
  const s = new a.Scene();
  s.background = new a.Color(1916886);
  const i = new a.PerspectiveCamera(40, 1, 0.1, 100);
  i.position.copy(at), s.add(new a.HemisphereLight(16777215, 10066329, 1.9));
  const r = new a.DirectionalLight(16777215, 1.1);
  r.position.set(-4, 10, 6), s.add(r);
  const w = 16765952, u = (t, o = {}) => new a.MeshLambertMaterial({ color: t, flatShading: !1, ...o }), e = {
    board: u(16777215),
    peg: u(0),
    pegHi: u(w, { emissive: w, emissiveIntensity: 0.4 }),
    1: u(1118481),
    2: u(16777215),
    red: u(w, { emissive: w, emissiveIntensity: 0.4 }),
    pale: u(16774048, { emissive: 16774048, emissiveIntensity: 0.4 }),
    ghost1: u(0, { transparent: !0, opacity: 0.35, depthWrite: !1 }),
    ghost2: u(16777215, { transparent: !0, opacity: 0.55, depthWrite: !1 })
  }, y = new a.Mesh(new a.BoxGeometry(4.4 * O, 0.24, 4.4 * O), e.board);
  y.position.y = -0.12, s.add(y);
  const x = new a.Mesh(new a.BoxGeometry(4.4 * O, 0.1, 4.4 * O), u(0));
  x.position.y = -0.29, s.add(x);
  const S = new a.CylinderGeometry(0.05, 0.05, N, 24), k = new a.CylinderGeometry(0.45, 0.45, N + 0.3, 8), D = new a.MeshBasicMaterial({ visible: !1 }), z = [], Y = [];
  for (let t = 0; t < 16; t++) {
    const [o, c] = Z(t), h = new a.Mesh(S, e.peg);
    h.position.set(o, N / 2, c), s.add(h), z.push(h);
    const v = new a.Mesh(k, D);
    v.position.copy(h.position), v.userData.peg = t, s.add(v), Y.push(v);
  }
  const A = [], L = 0.38, G = 0.075, E = 0.23, I = 0.15;
  A.push(new a.Vector2(G, -E + 0.03));
  for (let t = 0; t <= 12; t++) {
    const o = -Math.PI / 2 + Math.min(t, 6) / 6 * (Math.PI / 2) + Math.max(t - 6, 0) / 6 * (Math.PI / 2), c = t <= 6 ? -E + I : E - I;
    A.push(new a.Vector2(L - I + I * Math.cos(o), c + I * Math.sin(o))), t === 6 && A.push(new a.Vector2(L, E - I));
  }
  A.push(new a.Vector2(G, E - 0.03)), A.push(new a.Vector2(G, -E + 0.03));
  const U = new a.LatheGeometry(A, 48);
  U.computeVertexNormals();
  const C = /* @__PURE__ */ new Map(), g = [], b = new a.Mesh(U, e.ghost1);
  b.visible = !1, s.add(b);
  let T = null;
  const p = new Tt(i, f.domElement);
  p.target.copy(Ut), p.enableDamping = !0, p.enablePan = !1, p.minDistance = 5, p.maxDistance = 20, p.maxPolarAngle = Math.PI / 2 - 0.08, p.update();
  let M = null;
  function V(t) {
    M = { from: i.position.clone(), to: t, t: 0 };
  }
  function tt() {
    const t = n.clientWidth || 1, o = n.clientHeight || 1;
    f.setSize(t, o, !1), i.aspect = t / o, i.updateProjectionMatrix();
  }
  const et = new ResizeObserver(tt);
  et.observe(n), tt();
  const nt = new a.Raycaster(), ot = new a.Vector2();
  function rt(t) {
    const o = f.domElement.getBoundingClientRect();
    ot.set((t.clientX - o.left) / o.width * 2 - 1, -((t.clientY - o.top) / o.height) * 2 + 1), nt.setFromCamera(ot, i);
    const c = nt.intersectObjects(Y)[0];
    return c ? c.object.userData.peg : null;
  }
  let P = null, _ = null;
  const B = f.domElement;
  B.addEventListener("pointerdown", (t) => {
    P = { x: t.clientX, y: t.clientY, moved: !1 }, t.pointerType === "touch" && kt(t);
  }), B.addEventListener("pointermove", (t) => {
    if (t.pointerType === "touch" && Lt(t), P && Math.hypot(t.clientX - P.x, t.clientY - P.y) > 5 && (P.moved = !0), P) return;
    const o = rt(t);
    o !== _ && (_ = o, d(o));
  }), B.addEventListener("pointerup", (t) => {
    t.pointerType === "touch" && st(t);
    const o = P;
    if (P = null, o && !o.moved) {
      const c = rt(t);
      c !== null && l(c);
    }
  }), B.addEventListener("pointercancel", (t) => {
    t.pointerType === "touch" && st(t), P = null;
  }), B.addEventListener("pointerleave", () => {
    _ !== null && (_ = null, d(null));
  });
  const gt = 2, yt = 90, bt = 0.5, vt = 30, Mt = 30, H = /* @__PURE__ */ new Set();
  let m = null, $ = !1, j = 0;
  function xt() {
    for (let t = n.parentElement; t && t !== document.body; t = t.parentElement) {
      const o = getComputedStyle(t).overflowY;
      if ((o === "auto" || o === "scroll" || o === "overlay") && t.scrollHeight > t.clientHeight) return t;
    }
    return document.scrollingElement || document.documentElement;
  }
  function kt(t) {
    cancelAnimationFrame(j), H.add(t.pointerId), H.size === 1 ? m = {
      x: t.clientX,
      y: t.clientY,
      lastY: t.clientY,
      t: t.timeStamp,
      vy: 0,
      mode: null,
      camera: M ? M.to.clone() : i.position.clone(),
      target: xt()
    } : m && !m.mode && (m.mode = "rotate");
  }
  function Lt(t) {
    if (!m || !H.has(t.pointerId)) return;
    const o = Math.max(1, t.timeStamp - m.t), c = t.clientY - m.lastY;
    if (m.vy = 0.7 * (c / o) + 0.3 * m.vy, m.lastY = t.clientY, m.t = t.timeStamp, m.mode === "scroll") {
      m.target.scrollTop -= c;
      return;
    }
    if (m.mode) return;
    const h = Math.abs(t.clientX - m.x), v = Math.abs(t.clientY - m.y);
    if (h > Mt) {
      m.mode = "rotate";
      return;
    }
    v < gt * h || (v > yt || v > vt && Math.abs(m.vy) > bt) && (m.mode = "scroll", $ = !0, p.enabled = !1, V(m.camera), m.target.scrollTop -= t.clientY - m.y);
  }
  function st(t) {
    H.delete(t.pointerId), !(H.size || !m) && (m.mode === "scroll" && At(m.target, m.vy), m = null, $ = !1);
  }
  function At(t, o) {
    let c = performance.now();
    const h = (v) => {
      const F = v - c;
      c = v, t.scrollTop -= o * F, o *= Math.pow(0.95, F / 16), Math.abs(o) > 0.02 && (j = requestAnimationFrame(h));
    };
    j = requestAnimationFrame(h);
  }
  let X = [];
  const it = new a.Clock();
  return f.setAnimationLoop(() => {
    const t = Math.min(it.getDelta(), 0.1);
    if (M) {
      M.t = Math.min(1, M.t + t / 0.6);
      const c = 1 - Math.pow(1 - M.t, 3);
      i.position.lerpVectors(M.from, M.to, c), i.lookAt(p.target), M.t >= 1 && (M = null);
    }
    p.enabled = !M && !$, M || p.update();
    for (let c = g.length - 1; c >= 0; c--) {
      const h = g[c];
      h.t = Math.min(1, h.t + t / 0.35), h.mesh.position.y = h.from + (h.to - h.from) * h.t * h.t, h.t >= 1 && g.splice(c, 1);
    }
    const o = Math.floor(it.elapsedTime * 3) % 2 === 0;
    for (const c of X) c.material = o ? c.userData.mat === e[2] ? e.pale : e.red : c.userData.mat;
    f.render(s, i);
  }), {
    setBead(t, o, c = !0) {
      const h = t % 16, v = Math.floor(t / 16), [F, Et] = Z(h);
      C.has(t) && s.remove(C.get(t));
      const W = new a.Mesh(U, e[o]);
      W.userData.mat = e[o], W.position.set(F, K(v), Et), s.add(W), C.set(t, W), c && (W.position.y = N + 1, g.push({ mesh: W, from: N + 1, to: K(v), t: 0 }));
    },
    clearBeads() {
      for (const t of C.values()) s.remove(t);
      C.clear(), g.length = 0, X = [];
    },
    setGhost(t, o, c) {
      if (T !== null && (z[T].material = e.peg), T = t, t == null || o > 3) {
        b.visible = !1, T = null;
        return;
      }
      z[t].material = e.pegHi;
      const [h, v] = Z(t);
      b.material = c === 2 ? e.ghost2 : e.ghost1, b.position.set(h, K(o), v), b.visible = !0;
    },
    flash(t) {
      X = t.map((o) => C.get(o)).filter(Boolean);
    },
    topView() {
      const t = i.position.distanceTo(p.target);
      V(p.target.clone().add(new a.Vector3(0, t, 0.01)));
    },
    resetCamera() {
      V(at.clone());
    },
    // smooth zoom step: factor < 1 moves closer; clamped to the controls' distance limits
    zoomBy(t) {
      const o = (M ? M.to : i.position).clone().sub(p.target);
      o.setLength(a.MathUtils.clamp(o.length() * t, p.minDistance, p.maxDistance)), V(p.target.clone().add(o));
    },
    getDistance() {
      return i.position.distanceTo(p.target);
    },
    // stop rendering and free everything (GPU resources, observers, canvas)
    destroy() {
      f.setAnimationLoop(null), cancelAnimationFrame(j), et.disconnect(), p.dispose(), s.traverse((t) => {
        t.geometry && t.geometry.dispose();
      });
      for (const t of [...Object.values(e), D, x.material]) t.dispose();
      f.dispose(), f.forceContextLoss(), B.remove();
    }
  };
}
const R = 24, J = Math.max(2, Math.min(window.devicePixelRatio || 1, 3)), ct = "#000", Bt = "#fff", ft = "#ffd400", Wt = "#1d3fd6";
function Ot(n, { onPegClick: l = () => {
} } = {}) {
  const d = [];
  n.innerHTML = "";
  for (let s = 0; s < 4; s++) {
    const i = document.createElement("div");
    i.className = "layer", i.textContent = `Layer ${s + 1}`;
    const r = document.createElement("canvas");
    r.width = r.height = R * 4 * J, r.style.display = "block", r.style.cursor = "pointer", r.addEventListener("click", (w) => {
      const u = r.getBoundingClientRect(), e = Math.floor((w.clientX - u.left) / u.width * 4), y = Math.floor((w.clientY - u.top) / u.height * 4);
      e >= 0 && e < 4 && y >= 0 && y < 4 && l(e + 4 * y);
    }), i.appendChild(r), n.appendChild(i), d[s] = r;
  }
  function f(s, i = null) {
    const r = new Set(s.winLine || []);
    let w = -1;
    i !== null && !s.winner && !s.draw && s.heights[i] < 4 && (w = i + 16 * s.heights[i]);
    for (let u = 0; u < 4; u++) {
      const e = d[u].getContext("2d");
      e.setTransform(J, 0, 0, J, 0, 0), e.fillStyle = Wt, e.fillRect(0, 0, R * 4, R * 4);
      for (let y = 0; y < 16; y++) {
        const x = y + 16 * u, S = (y % 4 + 0.5) * R, k = (Math.floor(y / 4) + 0.5) * R, D = s.cells[x];
        e.setLineDash([]), e.beginPath(), e.arc(S, k, R * 0.36, 0, Math.PI * 2), D ? (e.fillStyle = D === 1 ? ct : Bt, e.fill(), e.strokeStyle = ct, e.lineWidth = 1, e.stroke()) : (e.fillStyle = "rgba(255,255,255,0.55)", e.beginPath(), e.arc(S, k, 1.5, 0, Math.PI * 2), e.fill()), x === w && (e.beginPath(), e.arc(S, k, R * 0.36, 0, Math.PI * 2), e.setLineDash([3, 3]), e.strokeStyle = ft, e.lineWidth = 1.5, e.stroke()), r.has(x) && (e.setLineDash([]), e.beginPath(), e.arc(S, k, R * 0.44, 0, Math.PI * 2), e.strokeStyle = ft, e.lineWidth = 2, e.stroke());
      }
    }
  }
  return { render: f };
}
const wt = `function ct(e, t, o) {
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
`, ut = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", wt], { type: "text/javascript;charset=utf-8" });
function Yt(n) {
  let l;
  try {
    if (l = ut && (self.URL || self.webkitURL).createObjectURL(ut), !l) throw "";
    const d = new Worker(l, {
      type: "module",
      name: n?.name
    });
    return d.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(l);
    }), d;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(wt),
      {
        type: "module",
        name: n?.name
      }
    );
  }
}
function Gt() {
  return new Yt();
}
const Q = { 1: "Black", 2: "White" };
let Ht = 0;
const Nt = `
<header class="sf-header">
  <h1 class="sf-wordmark">Score Four</h1>
  <div class="sf-status" role="status" aria-live="polite"></div>
</header>
<div class="sf-main">
  <section class="sf-view-wrap">
    <div class="sf-view">
      <div class="sf-zoom" role="group" aria-label="Zoom">
        <button type="button" class="sf-btn-zoom-in" aria-label="Zoom in">+</button>
        <button type="button" class="sf-btn-zoom-out" aria-label="Zoom out">−</button>
      </div>
    </div>
    <p class="sf-hint">Drag to rotate · scroll or pinch to zoom</p>
  </section>
  <aside class="sf-panel">
    <button type="button" class="sf-panel-toggle" aria-expanded="false">Settings<span class="sf-caret" aria-hidden="true"></span></button>
    <div class="sf-panel-body">
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
    </div>
  </aside>
</div>`;
function Vt(n, l = {}) {
  const { opponent: d = "2p", first: f = "human", showTitle: s = !0, createWorker: i = Gt } = l;
  n.classList.add("score-four"), n.innerHTML = Nt;
  const r = (g) => n.querySelector(`.sf-${g}`);
  s || r("wordmark").remove();
  const w = `sf-panel-body-${++Ht}`;
  r("panel-body").id = w, r("panel-toggle").setAttribute("aria-controls", w), r("mode").value = d, r("first").value = f;
  const u = { 1: 0, 2: 0 };
  let e = lt(), y = null, x = !1, S = 0, k = !1;
  const D = i();
  D.onmessage = (g) => {
    k || g.data.id !== S || (x = !1, I(g.data.peg, !0));
  };
  const z = () => r("mode").value === "cpu", Y = () => r("first").value === "cpu" ? 1 : 2, A = () => z() && !e.winner && !e.draw && e.turn === Y(), L = zt(r("view"), {
    onPegClick: I,
    onPegHover(g) {
      y = g, E();
    }
  }), G = Ot(r("minimap"), { onPegClick: I });
  function E() {
    const g = e.winner || e.draw, b = y !== null && !g && !A() && e.heights[y] < 4;
    L.setGhost(b ? y : null, b ? e.heights[y] : 0, e.turn), G.render(e, y);
    const T = z();
    r("first").disabled = !T, r("status").textContent = e.winner ? T ? e.winner === Y() ? "Computer wins!" : "You win!" : `${Q[e.winner]} wins!` : e.draw ? "Draw" : A() ? "Computer is thinking…" : T ? `Your turn (${Q[e.turn].toLowerCase()})` : `${Q[e.turn]}'s turn`, r("score").textContent = `Black ${u[1]} · White ${u[2]}`;
  }
  function I(g, b = !1) {
    if (k || !b && (x || A()) || !mt(e, g)) return !1;
    const T = e.turn, p = Rt(e, g);
    return p < 0 ? !1 : (L.setBead(p, T), e.winner && (u[e.winner]++, L.flash(e.winLine)), E(), U(), !0);
  }
  function U() {
    if (!A()) return;
    x = !0;
    const g = ++S, b = JSON.parse(JSON.stringify(e));
    D.postMessage({ id: g, state: b, level: "hard" });
  }
  function C() {
    k || (S++, x = !1, e = lt(), L.clearBeads(), E(), U());
  }
  return r("btn-top").onclick = () => L.topView(), r("btn-reset").onclick = () => L.resetCamera(), r("btn-new").onclick = C, r("btn-zoom-in").onclick = () => L.zoomBy(0.8), r("btn-zoom-out").onclick = () => L.zoomBy(1.25), r("panel-toggle").onclick = (g) => {
    const b = g.currentTarget;
    b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"));
  }, r("mode").onchange = C, r("first").onchange = C, E(), U(), {
    get game() {
      return e;
    },
    play: I,
    newGame: C,
    destroy() {
      k || (k = !0, D.terminate(), L.destroy(), n.innerHTML = "", n.classList.remove("score-four"));
    }
  };
}
function Ft({ className: n, style: l, opponent: d, first: f, showTitle: s, onReady: i }) {
  const r = It(null);
  return Ct(() => {
    const w = Vt(r.current, { opponent: d, first: f, showTitle: s });
    return i?.(w), () => w.destroy();
  }, [d, f, s]), St("div", { className: n, style: l, ref: r });
}
export {
  Ft as ScoreFour,
  Ft as default,
  Vt as mount
};
