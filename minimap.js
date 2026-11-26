const C = 24; // px per cell

export function createMinimap(container, { onPegClick = () => {} } = {}) {
  const canvases = [];
  container.innerHTML = '';
  for (let z = 0; z < 4; z++) {
    const wrap = document.createElement('div');
    wrap.className = 'layer';
    wrap.textContent = `Layer ${z + 1}${z === 0 ? ' (bottom)' : z === 3 ? ' (top)' : ''}`;
    const cv = document.createElement('canvas');
    cv.width = cv.height = C * 4;
    cv.style.display = 'block';
    cv.style.cursor = 'pointer';
    cv.addEventListener('click', (e) => {
      const r = cv.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * 4);
      const y = Math.floor(((e.clientY - r.top) / r.height) * 4);
      if (x >= 0 && x < 4 && y >= 0 && y < 4) onPegClick(x + 4 * y);
    });
    wrap.appendChild(cv);
    container.prepend(wrap); // top layer listed first
    canvases[z] = cv;
  }

  function render(state, ghostPeg = null) {
    const win = new Set(state.winLine || []);
    let ghostCell = -1;
    if (ghostPeg !== null && !state.winner && !state.draw && state.heights[ghostPeg] < 4) {
      ghostCell = ghostPeg + 16 * state.heights[ghostPeg];
    }
    for (let z = 0; z < 4; z++) {
      const g = canvases[z].getContext('2d');
      g.fillStyle = '#9a6324';
      g.fillRect(0, 0, C * 4, C * 4);
      for (let p = 0; p < 16; p++) {
        const cell = p + 16 * z, cx = (p % 4 + 0.5) * C, cy = (Math.floor(p / 4) + 0.5) * C;
        const v = state.cells[cell];
        g.setLineDash([]);
        g.beginPath();
        g.arc(cx, cy, C * 0.36, 0, Math.PI * 2);
        if (v) {
          g.fillStyle = v === 1 ? '#1a1a1a' : '#f2f2f2';
          g.fill();
        } else {
          g.fillStyle = '#7a4d1a';
          g.beginPath(); g.arc(cx, cy, 2, 0, Math.PI * 2); g.fill();
        }
        if (cell === ghostCell) {
          g.beginPath(); g.arc(cx, cy, C * 0.36, 0, Math.PI * 2);
          g.setLineDash([3, 3]);
          g.strokeStyle = state.turn === 1 ? '#1a1a1a' : '#f2f2f2';
          g.lineWidth = 2; g.stroke();
        }
        if (win.has(cell)) {
          g.setLineDash([]);
          g.beginPath(); g.arc(cx, cy, C * 0.44, 0, Math.PI * 2);
          g.strokeStyle = '#ff2222'; g.lineWidth = 3; g.stroke();
        }
      }
    }
  }
  return { render };
}
