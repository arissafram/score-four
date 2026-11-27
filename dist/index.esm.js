import { useRef as It, useEffect as Ct, createElement as St } from "react";
import * as u from "three";
import { OrbitControls as Dt } from "three/addons/controls/OrbitControls.js";
function Tt(e, l, d) {
  return e + 4 * l + 16 * d;
}
const q = (e) => e >= 0 && e < 4, Pt = (() => {
  const e = [];
  for (let l = -1; l <= 1; l++) for (let d = -1; d <= 1; d++) for (let c = -1; c <= 1; c++)
    if (!((l || d || c) <= 0))
      for (let r = 0; r < 4; r++) for (let s = 0; s < 4; s++) for (let g = 0; g < 4; g++)
        !q(r + 3 * l) || !q(s + 3 * d) || !q(g + 3 * c) || e.push([0, 1, 2, 3].map((h) => Tt(r + h * l, s + h * d, g + h * c)));
  return e;
})(), dt = Array.from({ length: 64 }, () => []);
for (const e of Pt) for (const l of e) dt[l].push(e);
function at() {
  return { cells: Array(64).fill(0), heights: Array(16).fill(0), turn: 1, winner: 0, winLine: null, draw: !1, moves: [] };
}
function mt(e, l) {
  return !e.winner && !e.draw && l >= 0 && l < 16 && e.heights[l] < 4;
}
function Rt(e, l) {
  if (!mt(e, l)) return -1;
  const d = e.turn, c = l + 16 * e.heights[l];
  e.cells[c] = d, e.heights[l]++, e.moves.push(l);
  for (const a of dt[c])
    if (a.every((r) => e.cells[r] === d)) {
      e.winner = d, e.winLine = a.slice();
      break;
    }
  return !e.winner && e.moves.length === 64 && (e.draw = !0), e.turn = d === 1 ? 2 : 1, c;
}
const G = 1, ht = 0.5, pt = 0.3, N = pt + 4 * ht + 0.1, lt = new u.Vector3(5.5, 6.5, 8), Bt = new u.Vector3(0, 1, 0), Z = (e) => [(e % 4 - 1.5) * G, (Math.floor(e / 4) - 1.5) * G], K = (e) => pt + e * ht;
function zt(e, { onPegClick: l = () => {
}, onPegHover: d = () => {
} } = {}) {
  const c = new u.WebGLRenderer({ antialias: !0, alpha: !0 });
  c.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), e.appendChild(c.domElement);
  const a = new u.Scene(), r = new u.PerspectiveCamera(40, 1, 0.1, 100);
  r.position.copy(lt), a.add(new u.HemisphereLight(16777215, 10066329, 1.9));
  const s = new u.DirectionalLight(16777215, 1.1);
  s.position.set(-4, 10, 6), a.add(s);
  const g = 16765952, h = (t, o = {}) => new u.MeshLambertMaterial({ color: t, flatShading: !1, ...o }), n = {
    board: h(16777215),
    peg: h(0),
    pegHi: h(g, { emissive: g, emissiveIntensity: 0.4 }),
    1: h(1118481),
    2: h(16777215),
    red: h(g, { emissive: g, emissiveIntensity: 0.4 }),
    pale: h(16774048, { emissive: 16774048, emissiveIntensity: 0.4 }),
    ghost1: h(0, { transparent: !0, opacity: 0.35, depthWrite: !1 }),
    ghost2: h(16777215, { transparent: !0, opacity: 0.55, depthWrite: !1 })
  }, i = new u.Mesh(new u.BoxGeometry(4.4 * G, 0.24, 4.4 * G), n.board);
  i.position.y = -0.12, a.add(i);
  const x = new u.Mesh(new u.BoxGeometry(4.4 * G, 0.1, 4.4 * G), h(0));
  x.position.y = -0.29, a.add(x);
  const T = new u.CylinderGeometry(0.05, 0.05, N, 24), k = new u.CylinderGeometry(0.45, 0.45, N + 0.3, 8), A = new u.MeshBasicMaterial({ visible: !1 }), P = [], O = [];
  for (let t = 0; t < 16; t++) {
    const [o, f] = Z(t), p = new u.Mesh(T, n.peg);
    p.position.set(o, N / 2, f), a.add(p), P.push(p);
    const v = new u.Mesh(k, A);
    v.position.copy(p.position), v.userData.peg = t, a.add(v), O.push(v);
  }
  const E = [], L = 0.38, Y = 0.075, I = 0.23, C = 0.15;
  E.push(new u.Vector2(Y, -I + 0.03));
  for (let t = 0; t <= 12; t++) {
    const o = -Math.PI / 2 + Math.min(t, 6) / 6 * (Math.PI / 2) + Math.max(t - 6, 0) / 6 * (Math.PI / 2), f = t <= 6 ? -I + C : I - C;
    E.push(new u.Vector2(L - C + C * Math.cos(o), f + C * Math.sin(o))), t === 6 && E.push(new u.Vector2(L, I - C));
  }
  E.push(new u.Vector2(Y, I - 0.03)), E.push(new u.Vector2(Y, -I + 0.03));
  const z = new u.LatheGeometry(E, 48);
  z.computeVertexNormals();
  const S = /* @__PURE__ */ new Map(), y = [], b = new u.Mesh(z, n.ghost1);
  b.visible = !1, a.add(b);
  let D = null;
  const w = new Dt(r, c.domElement);
  w.target.copy(Bt), w.enableDamping = !0, w.enablePan = !1, w.minDistance = 5, w.maxDistance = 20, w.maxPolarAngle = Math.PI / 2 - 0.08, w.update();
  let M = null;
  function V(t) {
    M = { from: r.position.clone(), to: t, t: 0 };
  }
  function tt() {
    const t = e.clientWidth || 1, o = e.clientHeight || 1;
    c.setSize(t, o, !1), r.aspect = t / o, r.updateProjectionMatrix();
  }
  const et = new ResizeObserver(tt);
  et.observe(e), tt();
  const nt = new u.Raycaster(), ot = new u.Vector2();
  function rt(t) {
    const o = c.domElement.getBoundingClientRect();
    ot.set((t.clientX - o.left) / o.width * 2 - 1, -((t.clientY - o.top) / o.height) * 2 + 1), nt.setFromCamera(ot, r);
    const f = nt.intersectObjects(O)[0];
    return f ? f.object.userData.peg : null;
  }
  let R = null, _ = null;
  const U = c.domElement;
  U.addEventListener("pointerdown", (t) => {
    R = { x: t.clientX, y: t.clientY, moved: !1 }, t.pointerType === "touch" && kt(t);
  }), U.addEventListener("pointermove", (t) => {
    if (t.pointerType === "touch" && Lt(t), R && Math.hypot(t.clientX - R.x, t.clientY - R.y) > 5 && (R.moved = !0), R) return;
    const o = rt(t);
    o !== _ && (_ = o, d(o));
  }), U.addEventListener("pointerup", (t) => {
    t.pointerType === "touch" && st(t);
    const o = R;
    if (R = null, o && !o.moved) {
      const f = rt(t);
      f !== null && l(f);
    }
  }), U.addEventListener("pointercancel", (t) => {
    t.pointerType === "touch" && st(t), R = null;
  }), U.addEventListener("pointerleave", () => {
    _ !== null && (_ = null, d(null));
  });
  const gt = 2, yt = 90, bt = 0.5, vt = 30, Mt = 30, H = /* @__PURE__ */ new Set();
  let m = null, $ = !1, j = 0;
  function xt() {
    for (let t = e.parentElement; t && t !== document.body; t = t.parentElement) {
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
      camera: M ? M.to.clone() : r.position.clone(),
      target: xt()
    } : m && !m.mode && (m.mode = "rotate");
  }
  function Lt(t) {
    if (!m || !H.has(t.pointerId)) return;
    const o = Math.max(1, t.timeStamp - m.t), f = t.clientY - m.lastY;
    if (m.vy = 0.7 * (f / o) + 0.3 * m.vy, m.lastY = t.clientY, m.t = t.timeStamp, m.mode === "scroll") {
      m.target.scrollTop -= f;
      return;
    }
    if (m.mode) return;
    const p = Math.abs(t.clientX - m.x), v = Math.abs(t.clientY - m.y);
    if (p > Mt) {
      m.mode = "rotate";
      return;
    }
    v < gt * p || (v > yt || v > vt && Math.abs(m.vy) > bt) && (m.mode = "scroll", $ = !0, w.enabled = !1, V(m.camera), m.target.scrollTop -= t.clientY - m.y);
  }
  function st(t) {
    H.delete(t.pointerId), !(H.size || !m) && (m.mode === "scroll" && At(m.target, m.vy), m = null, $ = !1);
  }
  function At(t, o) {
    let f = performance.now();
    const p = (v) => {
      const F = v - f;
      f = v, t.scrollTop -= o * F, o *= Math.pow(0.95, F / 16), Math.abs(o) > 0.02 && (j = requestAnimationFrame(p));
    };
    j = requestAnimationFrame(p);
  }
  let X = [];
  const it = new u.Clock();
  return c.setAnimationLoop(() => {
    const t = Math.min(it.getDelta(), 0.1);
    if (M) {
      M.t = Math.min(1, M.t + t / 0.6);
      const f = 1 - Math.pow(1 - M.t, 3);
      r.position.lerpVectors(M.from, M.to, f), r.lookAt(w.target), M.t >= 1 && (M = null);
    }
    w.enabled = !M && !$, M || w.update();
    for (let f = y.length - 1; f >= 0; f--) {
      const p = y[f];
      p.t = Math.min(1, p.t + t / 0.35), p.mesh.position.y = p.from + (p.to - p.from) * p.t * p.t, p.t >= 1 && y.splice(f, 1);
    }
    const o = Math.floor(it.elapsedTime * 3) % 2 === 0;
    for (const f of X) f.material = o ? f.userData.mat === n[2] ? n.pale : n.red : f.userData.mat;
    c.render(a, r);
  }), {
    setBead(t, o, f = !0) {
      const p = t % 16, v = Math.floor(t / 16), [F, Et] = Z(p);
      S.has(t) && a.remove(S.get(t));
      const W = new u.Mesh(z, n[o]);
      W.userData.mat = n[o], W.position.set(F, K(v), Et), a.add(W), S.set(t, W), f && (W.position.y = N + 1, y.push({ mesh: W, from: N + 1, to: K(v), t: 0 }));
    },
    clearBeads() {
      for (const t of S.values()) a.remove(t);
      S.clear(), y.length = 0, X = [];
    },
    setGhost(t, o, f) {
      if (D !== null && (P[D].material = n.peg), D = t, t == null || o > 3) {
        b.visible = !1, D = null;
        return;
      }
      P[t].material = n.pegHi;
      const [p, v] = Z(t);
      b.material = f === 2 ? n.ghost2 : n.ghost1, b.position.set(p, K(o), v), b.visible = !0;
    },
    flash(t) {
      X = t.map((o) => S.get(o)).filter(Boolean);
    },
    topView() {
      const t = r.position.distanceTo(w.target);
      V(w.target.clone().add(new u.Vector3(0, t, 0.01)));
    },
    resetCamera() {
      V(lt.clone());
    },
    // smooth zoom step: factor < 1 moves closer; clamped to the controls' distance limits
    zoomBy(t) {
      const o = (M ? M.to : r.position).clone().sub(w.target);
      o.setLength(u.MathUtils.clamp(o.length() * t, w.minDistance, w.maxDistance)), V(w.target.clone().add(o));
    },
    getDistance() {
      return r.position.distanceTo(w.target);
    },
    // stop rendering and free everything (GPU resources, observers, canvas)
    destroy() {
      c.setAnimationLoop(null), cancelAnimationFrame(j), et.disconnect(), w.dispose(), a.traverse((t) => {
        t.geometry && t.geometry.dispose();
      });
      for (const t of [...Object.values(n), A, x.material]) t.dispose();
      c.dispose(), c.forceContextLoss(), U.remove();
    }
  };
}
const B = 24, J = Math.max(2, Math.min(window.devicePixelRatio || 1, 3)), ct = "#000", Ut = "#fff", ft = "#ffd400";
function Wt(e, { onPegClick: l = () => {
} } = {}) {
  const d = [];
  e.innerHTML = "";
  for (let a = 0; a < 4; a++) {
    const r = document.createElement("div");
    r.className = "layer", r.textContent = `Layer ${a + 1}`;
    const s = document.createElement("canvas");
    s.width = s.height = B * 4 * J, s.style.display = "block", s.style.cursor = "pointer", s.addEventListener("click", (g) => {
      const h = s.getBoundingClientRect(), n = Math.floor((g.clientX - h.left) / h.width * 4), i = Math.floor((g.clientY - h.top) / h.height * 4);
      n >= 0 && n < 4 && i >= 0 && i < 4 && l(n + 4 * i);
    }), r.appendChild(s), e.appendChild(r), d[a] = s;
  }
  function c(a, r = null) {
    const s = new Set(a.winLine || []);
    let g = -1;
    r !== null && !a.winner && !a.draw && a.heights[r] < 4 && (g = r + 16 * a.heights[r]);
    const h = getComputedStyle(e).color;
    for (let n = 0; n < 4; n++) {
      const i = d[n].getContext("2d");
      i.setTransform(J, 0, 0, J, 0, 0), i.clearRect(0, 0, B * 4, B * 4);
      for (let x = 0; x < 16; x++) {
        const T = x + 16 * n, k = (x % 4 + 0.5) * B, A = (Math.floor(x / 4) + 0.5) * B, P = a.cells[T];
        i.setLineDash([]), i.beginPath(), i.arc(k, A, B * 0.36, 0, Math.PI * 2), P ? (i.fillStyle = P === 1 ? ct : Ut, i.fill(), i.strokeStyle = ct, i.lineWidth = 1, i.stroke()) : (i.fillStyle = h, i.globalAlpha = 0.55, i.beginPath(), i.arc(k, A, 1.5, 0, Math.PI * 2), i.fill(), i.globalAlpha = 1), T === g && (i.beginPath(), i.arc(k, A, B * 0.36, 0, Math.PI * 2), i.setLineDash([3, 3]), i.strokeStyle = ft, i.lineWidth = 1.5, i.stroke()), s.has(T) && (i.setLineDash([]), i.beginPath(), i.arc(k, A, B * 0.44, 0, Math.PI * 2), i.strokeStyle = ft, i.lineWidth = 2, i.stroke());
      }
    }
  }
  return { render: c };
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
function Gt(e) {
  let l;
  try {
    if (l = ut && (self.URL || self.webkitURL).createObjectURL(ut), !l) throw "";
    const d = new Worker(l, {
      type: "module",
      name: e?.name
    });
    return d.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(l);
    }), d;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(wt),
      {
        type: "module",
        name: e?.name
      }
    );
  }
}
function Ot() {
  return new Gt();
}
const Q = { 1: "Black", 2: "White" };
let Yt = 0;
const Ht = `
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
function Nt(e, l) {
  try {
    return zt(e, l);
  } catch (d) {
    console.warn("Score Four: 3D view unavailable, falling back to the mini-map.", d);
    const c = e.closest(".score-four");
    c.classList.add("sf-no-3d");
    const a = document.createElement("p");
    a.className = "sf-fallback", a.textContent = "The 3D view can't load because WebGL is turned off in this browser. You can still play on the layer grids.", e.appendChild(a), c.querySelector(".sf-panel-toggle").setAttribute("aria-expanded", "true");
    const r = () => {
    };
    return { setBead: r, clearBeads: r, setGhost: r, flash: r, topView: r, resetCamera: r, zoomBy: r, getDistance: () => 0, destroy: r };
  }
}
function Vt(e, l = {}) {
  const { opponent: d = "2p", first: c = "human", showTitle: a = !0, createWorker: r = Ot } = l;
  e.classList.add("score-four"), e.innerHTML = Ht;
  const s = (y) => e.querySelector(`.sf-${y}`);
  a || s("wordmark").remove();
  const g = `sf-panel-body-${++Yt}`;
  s("panel-body").id = g, s("panel-toggle").setAttribute("aria-controls", g), s("mode").value = d, s("first").value = c;
  const h = { 1: 0, 2: 0 };
  let n = at(), i = null, x = !1, T = 0, k = !1;
  const A = r();
  A.onmessage = (y) => {
    k || y.data.id !== T || (x = !1, C(y.data.peg, !0));
  };
  const P = () => s("mode").value === "cpu", O = () => s("first").value === "cpu" ? 1 : 2, E = () => P() && !n.winner && !n.draw && n.turn === O(), L = Nt(s("view"), {
    onPegClick: C,
    onPegHover(y) {
      i = y, I();
    }
  }), Y = Wt(s("minimap"), { onPegClick: C });
  function I() {
    const y = n.winner || n.draw, b = i !== null && !y && !E() && n.heights[i] < 4;
    L.setGhost(b ? i : null, b ? n.heights[i] : 0, n.turn), Y.render(n, i);
    const D = P();
    s("first").disabled = !D, s("status").textContent = n.winner ? D ? n.winner === O() ? "Computer wins!" : "You win!" : `${Q[n.winner]} wins!` : n.draw ? "Draw" : E() ? "Computer is thinking…" : D ? `Your turn (${Q[n.turn].toLowerCase()})` : `${Q[n.turn]}'s turn`, s("score").textContent = `Black ${h[1]} · White ${h[2]}`;
  }
  function C(y, b = !1) {
    if (k || !b && (x || E()) || !mt(n, y)) return !1;
    const D = n.turn, w = Rt(n, y);
    return w < 0 ? !1 : (L.setBead(w, D), n.winner && (h[n.winner]++, L.flash(n.winLine)), I(), z(), !0);
  }
  function z() {
    if (!E()) return;
    x = !0;
    const y = ++T, b = JSON.parse(JSON.stringify(n));
    A.postMessage({ id: y, state: b, level: "hard" });
  }
  function S() {
    k || (T++, x = !1, n = at(), L.clearBeads(), I(), z());
  }
  return s("btn-top").onclick = () => L.topView(), s("btn-reset").onclick = () => L.resetCamera(), s("btn-new").onclick = S, s("btn-zoom-in").onclick = () => L.zoomBy(0.8), s("btn-zoom-out").onclick = () => L.zoomBy(1.25), s("panel-toggle").onclick = (y) => {
    const b = y.currentTarget;
    b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"));
  }, s("mode").onchange = S, s("first").onchange = S, I(), z(), {
    get game() {
      return n;
    },
    play: C,
    newGame: S,
    destroy() {
      k || (k = !0, A.terminate(), L.destroy(), e.innerHTML = "", e.classList.remove("score-four", "sf-no-3d"));
    }
  };
}
function Ft({ className: e, style: l, opponent: d, first: c, showTitle: a, onReady: r }) {
  const s = It(null);
  return Ct(() => {
    const g = Vt(s.current, { opponent: d, first: c, showTitle: a });
    return r?.(g), () => g.destroy();
  }, [d, c, a]), St("div", { className: e, style: l, ref: s });
}
export {
  Ft as ScoreFour,
  Ft as default,
  Vt as mount
};
