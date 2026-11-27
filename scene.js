import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const S = 1;            // peg spacing
const BEAD_H = 0.5;     // vertical step per bead
const BASE_Y = 0.3;     // centre height of bottom bead
const PEG_H = BASE_Y + 4 * BEAD_H + 0.1;
const HOME = new THREE.Vector3(5.5, 6.5, 8);
const TARGET = new THREE.Vector3(0, 1, 0);

const pegPos = (peg) => [((peg % 4) - 1.5) * S, (Math.floor(peg / 4) - 1.5) * S];
const beadY = (z) => BASE_Y + z * BEAD_H;

export function createScene(container, { onPegClick = () => {}, onPegHover = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1d3fd6); // flat colour field
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.copy(HOME);

  // flat, even light: colour does the work, no shadows
  scene.add(new THREE.HemisphereLight(0xffffff, 0x999999, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(-4, 10, 6);
  scene.add(sun);

  const HOT = 0xffd400;
  const flat = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, flatShading: false, ...extra });
  const mats = {
    board: flat(0xffffff), peg: flat(0x000000), pegHi: flat(HOT, { emissive: HOT, emissiveIntensity: 0.4 }),
    1: flat(0x111111), 2: flat(0xffffff), red: flat(HOT, { emissive: HOT, emissiveIntensity: 0.4 }),
    pale: flat(0xfff3a0, { emissive: 0xfff3a0, emissiveIntensity: 0.4 }),
    ghost1: flat(0x000000, { transparent: true, opacity: 0.35, depthWrite: false }),
    ghost2: flat(0xffffff, { transparent: true, opacity: 0.55, depthWrite: false }),
  };

  const board = new THREE.Mesh(new THREE.BoxGeometry(4.4 * S, 0.24, 4.4 * S), mats.board);
  board.position.y = -0.12;
  scene.add(board);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.4 * S, 0.1, 4.4 * S), flat(0x000000));
  plinth.position.y = -0.29;
  scene.add(plinth);

  const pegGeo = new THREE.CylinderGeometry(0.05, 0.05, PEG_H, 24);
  const hitGeo = new THREE.CylinderGeometry(0.45, 0.45, PEG_H + 0.3, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const pegs = [], hits = [];
  for (let p = 0; p < 16; p++) {
    const [x, z] = pegPos(p);
    const peg = new THREE.Mesh(pegGeo, mats.peg);
    peg.position.set(x, PEG_H / 2, z);
    scene.add(peg); pegs.push(peg);
    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.position.copy(peg.position);
    hit.userData.peg = p;
    scene.add(hit); hits.push(hit);
  }

  // rounded wooden/ceramic bead with a hole for the peg
  const prof = [], R = 0.38, r = 0.075, h = 0.23, c = 0.15;
  prof.push(new THREE.Vector2(r, -h + 0.03));
  for (let i = 0; i <= 12; i++) { // rounded outer edge: bottom corner, then top corner
    const a = -Math.PI / 2 + (Math.min(i, 6) / 6) * (Math.PI / 2) + (Math.max(i - 6, 0) / 6) * (Math.PI / 2);
    const cy = i <= 6 ? -h + c : h - c;
    prof.push(new THREE.Vector2(R - c + c * Math.cos(a), cy + c * Math.sin(a)));
    if (i === 6) prof.push(new THREE.Vector2(R, h - c));
  }
  prof.push(new THREE.Vector2(r, h - 0.03));
  prof.push(new THREE.Vector2(r, -h + 0.03));
  const beadGeo = new THREE.LatheGeometry(prof, 48);
  beadGeo.computeVertexNormals();
  const beads = new Map(); // cell -> mesh
  const drops = [];        // {mesh, from, to, t}

  const ghost = new THREE.Mesh(beadGeo, mats.ghost1);
  ghost.visible = false;
  scene.add(ghost);
  let hiPeg = null;

  // --- controls & camera tween
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(TARGET);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 5;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;
  controls.update();
  let tween = null;
  function moveCamera(to) {
    tween = { from: camera.position.clone(), to, t: 0 };
  }

  // --- resize (full resolution)
  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // --- picking
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hits)[0];
    return hit ? hit.object.userData.peg : null;
  }
  let down = null, hover = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, moved: false }; });
  el.addEventListener('pointermove', (e) => {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) down.moved = true;
    if (down) return;
    const p = pick(e);
    if (p !== hover) { hover = p; onPegHover(p); }
  });
  el.addEventListener('pointerup', (e) => {
    const d = down; down = null;
    if (d && !d.moved) { const p = pick(e); if (p !== null) onPegClick(p); }
  });
  el.addEventListener('pointerleave', () => { if (hover !== null) { hover = null; onPegHover(null); } });

  // --- flash
  let flashing = [];

  // --- loop
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / 0.6);
      const k = 1 - Math.pow(1 - tween.t, 3);
      camera.position.lerpVectors(tween.from, tween.to, k);
      camera.lookAt(controls.target);
      if (tween.t >= 1) tween = null;
    }
    controls.enabled = !tween;
    if (!tween) controls.update();
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.t = Math.min(1, d.t + dt / 0.35);
      d.mesh.position.y = d.from + (d.to - d.from) * d.t * d.t;
      if (d.t >= 1) drops.splice(i, 1);
    }
    // winning line blinks: black <-> yellow, white <-> pale yellow
    const on = Math.floor(clock.elapsedTime * 3) % 2 === 0;
    for (const m of flashing) m.material = on ? (m.userData.mat === mats[2] ? mats.pale : mats.red) : m.userData.mat;
    renderer.render(scene, camera);
  });

  return {
    setBead(cell, player, animate = true) {
      const peg = cell % 16, z = Math.floor(cell / 16);
      const [x, wz] = pegPos(peg);
      if (beads.has(cell)) scene.remove(beads.get(cell));
      const m = new THREE.Mesh(beadGeo, mats[player]);
      m.userData.mat = mats[player];
      m.position.set(x, beadY(z), wz);
      scene.add(m); beads.set(cell, m);
      if (animate) { m.position.y = PEG_H + 1; drops.push({ mesh: m, from: PEG_H + 1, to: beadY(z), t: 0 }); }
    },
    clearBeads() {
      for (const m of beads.values()) scene.remove(m);
      beads.clear(); drops.length = 0; flashing = [];
    },
    setGhost(peg, z, player) {
      if (hiPeg !== null) pegs[hiPeg].material = mats.peg;
      hiPeg = peg;
      if (peg === null || peg === undefined || z > 3) { ghost.visible = false; hiPeg = null; return; }
      pegs[peg].material = mats.pegHi;
      const [x, wz] = pegPos(peg);
      ghost.material = player === 2 ? mats.ghost2 : mats.ghost1;
      ghost.position.set(x, beadY(z), wz);
      ghost.visible = true;
    },
    flash(cells) {
      flashing = cells.map((c) => beads.get(c)).filter(Boolean);
    },
    topView() {
      const d = camera.position.distanceTo(controls.target);
      moveCamera(controls.target.clone().add(new THREE.Vector3(0, d, 0.01)));
    },
    resetCamera() { moveCamera(HOME.clone()); },
    // stop rendering and free everything (GPU resources, observers, canvas)
    destroy() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      for (const m of [...Object.values(mats), hitMat, plinth.material]) m.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      el.remove();
    },
  };
}
