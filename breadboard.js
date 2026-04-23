// === BREADBOARD.JS — Grid generation and hole management ===

const COLS = 30;       // columns per half
const ROWS_TOP = 5;    // rows in top half (a-e)
const ROWS_BOT = 5;    // rows in bottom half (f-j)
const RAIL_HOLES = 25; // holes per power rail

const ROW_LABELS_TOP = ['a', 'b', 'c', 'd', 'e'];
const ROW_LABELS_BOT = ['f', 'g', 'h', 'i', 'j'];

// holeMap: key = "row-col" (e.g. "a-5"), value = hole DOM element
const holeMap = {};
// nodeMap: for simulation — same column = connected
// holeNetMap: key = holeId, value = net name (set during simulation)
const holeNetMap = {};

function buildBreadboard() {
  const bb = document.getElementById('breadboard');
  bb.innerHTML = '';

  const HOLE_SIZE = 18;
  const GAP = 0;

  // Calculate total width
  const totalCols = COLS;
  const boardW = totalCols * (HOLE_SIZE + GAP) + 20 + 24 + 24; // row labels + padding

  // Column labels
  function makeColLabels() {
    const row = document.createElement('div');
    row.className = 'column-labels';
    row.style.paddingLeft = '20px';
    for (let c = 1; c <= COLS; c++) {
      const lbl = document.createElement('div');
      lbl.className = 'col-label';
      lbl.style.width = (HOLE_SIZE + GAP) + 'px';
      if (c % 5 === 0) lbl.textContent = c;
      row.appendChild(lbl);
    }
    return row;
  }

  // Rail row
  function makeRailRow(side, railName, label, colorClass) {
    const row = document.createElement('div');
    row.className = `rail-row ${colorClass}`;

    const rl = document.createElement('div');
    rl.className = 'rail-label';
    rl.textContent = label;
    row.appendChild(rl);

    // Rail line decoration
    const line = document.createElement('div');
    line.className = 'rail-line';
    row.appendChild(line);

    // Holes in groups of 5 with a gap
    for (let g = 0; g < Math.ceil(COLS / 5); g++) {
      for (let h = 0; h < 5; h++) {
        const col = g * 5 + h + 1;
        if (col > COLS) break;
        const hole = makeHole(`${side}-${col}`);
        row.appendChild(hole);
      }
      if (g < Math.ceil(COLS / 5) - 1) {
        const gap = document.createElement('div');
        gap.className = 'rail-gap';
        row.appendChild(gap);
      }
    }

    const line2 = document.createElement('div');
    line2.className = 'rail-line';
    row.appendChild(line2);

    return row;
  }

  // Individual hole
  function makeHole(id) {
    const div = document.createElement('div');
    div.className = 'hole';
    div.dataset.holeId = id;
    div.style.width = HOLE_SIZE + 'px';
    div.style.height = HOLE_SIZE + 'px';
    holeMap[id] = div;

    div.addEventListener('click', () => onHoleClick(id, div));
    div.addEventListener('mouseenter', () => onHoleHover(id, div));
    return div;
  }

  // Row group (top or bottom)
  function makeRowGroup(rowLabels) {
    const group = document.createElement('div');
    group.className = 'row-group';

    for (const r of rowLabels) {
      const row = document.createElement('div');
      row.className = 'board-row';

      const rl = document.createElement('div');
      rl.className = 'row-label';
      rl.textContent = r;
      row.appendChild(rl);

      for (let g = 0; g < Math.ceil(COLS / 5); g++) {
        for (let c = 0; c < 5; c++) {
          const col = g * 5 + c + 1;
          if (col > COLS) break;
          const hole = makeHole(`${r}-${col}`);
          row.appendChild(hole);
        }
        if (g < Math.ceil(COLS / 5) - 1) {
          const gap = document.createElement('div');
          gap.style.width = (HOLE_SIZE + GAP) + 'px';
          gap.style.height = HOLE_SIZE + 'px';
          row.appendChild(gap);
        }
      }
      group.appendChild(row);
    }
    return group;
  }

  // Build top rails
  bb.appendChild(makeRailRow('vcc-top', 'vcc', '+', 'rail-pos'));
  bb.appendChild(makeRailRow('gnd-top', 'gnd', '−', 'rail-neg'));

  // Column labels
  bb.appendChild(makeColLabels());

  // Main board
  const boardMain = document.createElement('div');
  boardMain.className = 'board-main';
  boardMain.appendChild(makeRowGroup(ROW_LABELS_TOP));

  // Center gap
  const center = document.createElement('div');
  center.className = 'center-divider';
  const cdLine = document.createElement('div');
  cdLine.className = 'center-divider-line';
  center.appendChild(cdLine);
  boardMain.appendChild(center);
  boardMain.style.flexDirection = 'column';

  bb.appendChild(boardMain);
  boardMain.appendChild(makeRowGroup(ROW_LABELS_BOT));

  // Bottom labels + rails
  const colLabelsBot = makeColLabels();
  bb.appendChild(colLabelsBot);
  bb.appendChild(makeRailRow('gnd-bot', 'gnd', '−', 'rail-neg'));
  bb.appendChild(makeRailRow('vcc-bot', 'vcc', '+', 'rail-pos'));

  // Sync canvas size to breadboard
  resizeCanvas();
}

function resizeCanvas() {
  const wrapper = document.getElementById('breadboardWrapper');
  const canvas = document.getElementById('wiresCanvas');
  canvas.width = wrapper.scrollWidth;
  canvas.height = wrapper.scrollHeight;
  canvas.style.width = wrapper.scrollWidth + 'px';
  canvas.style.height = wrapper.scrollHeight + 'px';
}

// Get pixel position of hole center relative to breadboardWrapper
function getHolePos(holeId) {
  const hole = holeMap[holeId];
  if (!hole) return null;
  const wrapper = document.getElementById('breadboardWrapper');
  const wRect = wrapper.getBoundingClientRect();
  const hRect = hole.getBoundingClientRect();
  return {
    x: hRect.left - wRect.left + wrapper.scrollLeft + hRect.width / 2,
    y: hRect.top - wRect.top + wrapper.scrollTop + hRect.height / 2
  };
}

// Parse hole ID to get row and column info
function parseHoleId(id) {
  const parts = id.split('-');
  if (parts.length === 2) {
    return { row: parts[0], col: parseInt(parts[1]) };
  }
  if (parts.length === 3) {
    return { row: parts[0] + '-' + parts[1], col: parseInt(parts[2]) };
  }
  return null;
}

// Get all holes in the same column group (for simulation connectivity)
// Same column, top half (a-e) are connected vertically
// Same column, bottom half (f-j) are connected vertically
// Rails: all vcc-top are connected together, etc.
function getColumnGroup(holeId) {
  const p = parseHoleId(holeId);
  if (!p) return [holeId];

  const { row, col } = p;

  if (row === 'vcc-top' || row === 'vcc-bot') {
    // All VCC rail holes
    return Object.keys(holeMap).filter(id => id.startsWith('vcc-top-') || id.startsWith('vcc-bot-'));
  }
  if (row === 'gnd-top' || row === 'gnd-bot') {
    return Object.keys(holeMap).filter(id => id.startsWith('gnd-top-') || id.startsWith('gnd-bot-'));
  }

  // Top half rows a-e: same column number connected
  const topRows = ['a', 'b', 'c', 'd', 'e'];
  const botRows = ['f', 'g', 'h', 'i', 'j'];

  if (topRows.includes(row)) {
    return topRows.map(r => `${r}-${col}`).filter(id => holeMap[id]);
  }
  if (botRows.includes(row)) {
    return botRows.map(r => `${r}-${col}`).filter(id => holeMap[id]);
  }

  return [holeId];
}

window.addEventListener('resize', () => {
  resizeCanvas();
  if (typeof redrawWires === 'function') redrawWires();
});
