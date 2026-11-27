const C = 24; // css px per cell
const DPR = Math.max(2, Math.min(window.devicePixelRatio || 1, 3)); // crisp when scaled up
const INK = '#000', BONE = '#fff', ACCENT = '#ffd400';

export function createMinimap(container, { onPegClick = () => {} } = {}) {
  const canvases = [];
  container.innerHTML = '';
  for (let z = 0; z < 4; z++) {
    const wrap = document.createElement('div');
    wrap.className = 'layer';
    wrap.textContent = `Layer ${z + 1}`;
    const cv = document.createElement('canvas');
    cv.width = cv.height = C * 4 * DPR;
    cv.style.display = 'block';
    cv.style.cursor = 'pointer';
    cv.addEventListener('click', (e) => {
      const r = cv.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * 4);
      const y = Math.floor(((e.clientY - r.top) / r.height) * 4);
      if (x >= 0 && x < 4 && y >= 0 && y < 4) onPegClick(x + 4 * y);
    });
    wrap.appendChild(cv);
    container.appendChild(wrap); // layer 1 (bottom) listed first
    canvases[z] = cv;
  }

  function render(state, ghostPeg = null) {
    const win = new Set(state.winLine || []);
    let ghostCell = -1;
    if (ghostPeg !== null && !state.winner && !state.draw && state.heights[ghostPeg] < 4) {
      ghostCell = ghostPeg + 16 * state.heights[ghostPeg];
    }
    const text = getComputedStyle(container).color; // grids are transparent: dots follow the host's text colour
    for (let z = 0; z < 4; z++) {
      const g = canvases[z].getContext('2d');
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      g.clearRect(0, 0, C * 4, C * 4);
      for (let p = 0; p < 16; p++) {
        const cell = p + 16 * z, cx = (p % 4 + 0.5) * C, cy = (Math.floor(p / 4) + 0.5) * C;
        const v = state.cells[cell];
        g.setLineDash([]);
        g.beginPath();
        g.arc(cx, cy, C * 0.36, 0, Math.PI * 2);
        if (v) {
          g.fillStyle = v === 1 ? INK : BONE;
          g.fill();
          g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
        } else {
          g.fillStyle = text; g.globalAlpha = 0.55;
          g.beginPath(); g.arc(cx, cy, 1.5, 0, Math.PI * 2); g.fill();
          g.globalAlpha = 1;
        }
        if (cell === ghostCell) {
          g.beginPath(); g.arc(cx, cy, C * 0.36, 0, Math.PI * 2);
          g.setLineDash([3, 3]);
          g.strokeStyle = ACCENT;
          g.lineWidth = 1.5; g.stroke();
        }
        if (win.has(cell)) {
          g.setLineDash([]);
          g.beginPath(); g.arc(cx, cy, C * 0.44, 0, Math.PI * 2);
          g.strokeStyle = ACCENT; g.lineWidth = 2; g.stroke();
        }
      }
    }
  }
  return { render };
}
