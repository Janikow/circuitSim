// === COMPONENTS.JS — Component definitions, placement, and rendering ===

// Component registry
const COMPONENT_DEFS = {
  vcc: {
    name: 'Power (+)',
    pins: 1,
    color: '#ff4444',
    render: renderVcc,
    simulate: simVcc,
  },
  gnd: {
    name: 'Ground',
    pins: 1,
    color: '#4488ff',
    render: renderGnd,
    simulate: simGnd,
  },
  resistor: {
    name: 'Resistor',
    pins: 2,
    span: 4,   // spans 4 holes
    color: '#e8b84b',
    render: renderResistor,
    simulate: simResistor,
    props: { resistance: 220 },
    propDefs: [{ key: 'resistance', label: 'Ω', type: 'select', options: [100,220,330,470,1000,4700,10000] }]
  },
  capacitor: {
    name: 'Capacitor',
    pins: 2,
    span: 3,
    color: '#e8b84b',
    render: renderCapacitor,
    simulate: simPassthrough,
    props: { capacitance: 100 },
    propDefs: [{ key: 'capacitance', label: 'μF', type: 'select', options: [1,10,47,100,220,470,1000] }]
  },
  led: {
    name: 'LED',
    pins: 2,
    span: 3,
    color: '#ff4444',
    render: renderLED,
    simulate: simLED,
    props: { color: 'red' },
    propDefs: [{ key: 'color', label: 'Color', type: 'select', options: ['red','green','blue','yellow','white'] }]
  },
  switch: {
    name: 'Switch',
    pins: 2,
    span: 3,
    color: '#dddddd',
    render: renderSwitch,
    simulate: simSwitch,
    props: { closed: false },
  },
  npn: {
    name: 'NPN Transistor',
    pins: 3,  // base, collector, emitter
    span: 3,
    color: '#4a9eff',
    render: renderNPN,
    simulate: simNPN,
    props: {},
  },
  buzzer: {
    name: 'Buzzer',
    pins: 2,
    span: 3,
    color: '#cc88ff',
    render: renderBuzzer,
    simulate: simBuzzer,
    props: {},
  },
  motor: {
    name: 'DC Motor',
    pins: 2,
    span: 4,
    color: '#88ccff',
    render: renderMotor,
    simulate: simMotor,
    props: {},
  },
};

// Placed components list
let placedComponents = [];
let nextCompId = 1;

// LED color map
const LED_COLORS = {
  red: '#ff3333',
  green: '#33ff66',
  blue: '#4488ff',
  yellow: '#ffee22',
  white: '#eeeeff',
};

// =================== RENDERERS ===================

function renderVcc(comp, powered) {
  const sz = 28;
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="12" fill="${powered?'rgba(255,68,68,0.3)':'rgba(255,68,68,0.1)'}" stroke="#ff4444" stroke-width="1.5"/>
    <text x="14" y="18" text-anchor="middle" font-family="'Share Tech Mono'" font-size="9" fill="#ff4444" font-weight="bold">VCC</text>
    ${powered?'<circle cx="14" cy="14" r="12" fill="none" stroke="#ff6666" stroke-width="2" opacity="0.5"><animate attributeName="r" values="12;16;12" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite"/></circle>':''}
  </svg>`;
}

function renderGnd(comp, powered) {
  return `<svg width="28" height="32" viewBox="0 0 28 32">
    <line x1="14" y1="0" x2="14" y2="12" stroke="#4488ff" stroke-width="2"/>
    <line x1="4" y1="12" x2="24" y2="12" stroke="#4488ff" stroke-width="2.5"/>
    <line x1="7" y1="17" x2="21" y2="17" stroke="#4488ff" stroke-width="2"/>
    <line x1="11" y1="22" x2="17" y2="22" stroke="#4488ff" stroke-width="1.5"/>
    <text x="14" y="31" text-anchor="middle" font-family="'Share Tech Mono'" font-size="8" fill="#4488ff">GND</text>
  </svg>`;
}

function renderResistor(comp, powered) {
  const W = 72, H = 22;
  const color = powered ? '#ffd06a' : '#e8b84b';
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <line x1="0" y1="11" x2="16" y2="11" stroke="${color}" stroke-width="2"/>
    <rect x="16" y="5" width="40" height="12" fill="${powered?'rgba(232,184,75,0.25)':'rgba(232,184,75,0.1)'}" stroke="${color}" stroke-width="1.5" rx="1"/>
    <line x1="56" y1="11" x2="72" y2="11" stroke="${color}" stroke-width="2"/>
    <text x="36" y="15" text-anchor="middle" font-family="'Share Tech Mono'" font-size="7" fill="${color}">${formatResistance(comp.props.resistance)}</text>
    ${powered?`<rect x="16" y="5" width="40" height="12" fill="none" stroke="#ffd06a" stroke-width="0.5" rx="1" opacity="0.7"/>`:``}
  </svg>`;
}

function renderCapacitor(comp, powered) {
  const color = powered ? '#ffd06a' : '#e8b84b';
  return `<svg width="54" height="22" viewBox="0 0 54 22">
    <line x1="0" y1="11" x2="23" y2="11" stroke="${color}" stroke-width="2"/>
    <line x1="23" y1="2" x2="23" y2="20" stroke="${color}" stroke-width="3"/>
    <line x1="31" y1="2" x2="31" y2="20" stroke="${color}" stroke-width="3"/>
    <line x1="31" y1="11" x2="54" y2="11" stroke="${color}" stroke-width="2"/>
    <text x="27" y="8" text-anchor="middle" font-family="'Share Tech Mono'" font-size="6" fill="${color}">${comp.props.capacitance}μ</text>
  </svg>`;
}

function renderLED(comp, powered) {
  const c = LED_COLORS[comp.props.color] || '#ff3333';
  const glow = powered ? `filter: drop-shadow(0 0 8px ${c})` : '';
  return `<svg width="54" height="24" viewBox="0 0 54 24" style="${glow}">
    <line x1="0" y1="12" x2="13" y2="12" stroke="${c}" stroke-width="2"/>
    <polygon points="13,4 13,20 33,12" fill="${powered?c:'none'}" stroke="${c}" stroke-width="1.5"/>
    <line x1="33" y1="4" x2="33" y2="20" stroke="${c}" stroke-width="2.5"/>
    <line x1="33" y1="12" x2="54" y2="12" stroke="${c}" stroke-width="2"/>
    ${powered ? `<line x1="35" y1="2" x2="42" y2="-2" stroke="${c}" stroke-width="1.5" opacity="0.8"/>
    <line x1="38" y1="6" x2="45" y2="2" stroke="${c}" stroke-width="1.5" opacity="0.8"/>` : ''}
  </svg>`;
}

function renderSwitch(comp, powered) {
  const color = comp.props.closed ? '#50fa7b' : '#888888';
  const pivotY = comp.props.closed ? 12 : 7;
  return `<svg width="54" height="24" viewBox="0 0 54 24" style="cursor:pointer">
    <line x1="0" y1="12" x2="16" y2="12" stroke="${color}" stroke-width="2"/>
    <circle cx="17" cy="12" r="2.5" fill="${color}"/>
    <line x1="17" y1="12" x2="37" y2="${pivotY}" stroke="${color}" stroke-width="2"/>
    <circle cx="37" cy="12" r="2.5" fill="${color}"/>
    <line x1="37" y1="12" x2="54" y2="12" stroke="${color}" stroke-width="2"/>
    <text x="27" y="22" text-anchor="middle" font-family="'Share Tech Mono'" font-size="7" fill="${color}">${comp.props.closed?'ON':'OFF'}</text>
  </svg>`;
}

function renderNPN(comp, powered) {
  const color = powered ? '#88ccff' : '#4a9eff';
  return `<svg width="48" height="36" viewBox="0 0 48 36">
    <circle cx="24" cy="18" r="16" fill="rgba(74,158,255,0.1)" stroke="${color}" stroke-width="1.5"/>
    <line x1="0" y1="18" x2="17" y2="18" stroke="${color}" stroke-width="2"/>
    <line x1="17" y1="8" x2="17" y2="28" stroke="${color}" stroke-width="2.5"/>
    <line x1="17" y1="12" x2="32" y2="5" stroke="${color}" stroke-width="2"/>
    <line x1="17" y1="24" x2="32" y2="31" stroke="${color}" stroke-width="2"/>
    <polygon points="26,28 32,31 28,24" fill="${color}"/>
    <line x1="32" y1="5" x2="48" y2="5" stroke="${color}" stroke-width="1.5"/>
    <line x1="32" y1="31" x2="48" y2="31" stroke="${color}" stroke-width="1.5"/>
    <text x="4" y="32" font-family="'Share Tech Mono'" font-size="7" fill="${color}">B</text>
    <text x="38" y="10" font-family="'Share Tech Mono'" font-size="7" fill="${color}">C</text>
    <text x="38" y="36" font-family="'Share Tech Mono'" font-size="7" fill="${color}">E</text>
  </svg>`;
}

function renderBuzzer(comp, powered) {
  const color = powered ? '#dd99ff' : '#996699';
  return `<svg width="40" height="36" viewBox="0 0 40 36">
    <rect x="8" y="8" width="24" height="20" rx="3" fill="${powered?'rgba(180,100,255,0.25)':'rgba(100,60,120,0.2)'}" stroke="${color}" stroke-width="1.5"/>
    <line x1="0" y1="24" x2="8" y2="24" stroke="${color}" stroke-width="2"/>
    <line x1="32" y1="12" x2="40" y2="12" stroke="${color}" stroke-width="2"/>
    ${powered ? `
    <path d="M 32 10 Q 38 18 32 26" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.8"/>
    <path d="M 34 7 Q 42 18 34 29" stroke="${color}" stroke-width="1" fill="none" opacity="0.4"/>
    ` : ''}
    <text x="20" y="21" text-anchor="middle" font-family="'Share Tech Mono'" font-size="8" fill="${color}">BZZ</text>
  </svg>`;
}

function renderMotor(comp, powered) {
  const color = powered ? '#88eeff' : '#4488aa';
  return `<svg width="64" height="32" viewBox="0 0 64 32">
    <rect x="8" y="6" width="36" height="20" rx="4" fill="${powered?'rgba(136,200,255,0.2)':'rgba(68,136,170,0.1)'}" stroke="${color}" stroke-width="1.5"/>
    <text x="26" y="20" text-anchor="middle" font-family="'Share Tech Mono'" font-size="8" fill="${color}" font-weight="bold">M</text>
    <line x1="0" y1="11" x2="8" y2="11" stroke="${color}" stroke-width="2"/>
    <line x1="0" y1="21" x2="8" y2="21" stroke="${color}" stroke-width="2"/>
    <line x1="44" y1="16" x2="54" y2="16" stroke="${color}" stroke-width="2"/>
    <g transform="translate(57,16) ${powered ? `rotate(${Date.now()/5 % 360})` : ''}">
      <line x1="0" y1="-7" x2="0" y2="7" stroke="${color}" stroke-width="2.5"/>
      <line x1="-7" y1="0" x2="7" y2="0" stroke="${color}" stroke-width="2.5"/>
    </g>
  </svg>`;
}

// =================== SIMULATION BEHAVIORS ===================

function simVcc(comp, nets) {
  // VCC node is always at supply voltage
  for (const pin of comp.pins) {
    nets[pin] = { voltage: window.supplyVoltage || 5, powered: true };
  }
}

function simGnd(comp, nets) {
  for (const pin of comp.pins) {
    nets[pin] = { voltage: 0, grounded: true };
  }
}

function simResistor(comp, nets) {
  // Passthrough with voltage drop proportional to resistance
  const [p1, p2] = comp.pins;
  const n1 = nets[p1], n2 = nets[p2];
  if (n1 && n1.powered && (!n2 || !n2.grounded)) {
    nets[p2] = { voltage: n1.voltage * 0.9, powered: true };
  } else if (n2 && n2.powered && (!n1 || !n1.grounded)) {
    nets[p1] = { voltage: n2.voltage * 0.9, powered: true };
  }
}

function simPassthrough(comp, nets) {
  const [p1, p2] = comp.pins;
  const n1 = nets[p1], n2 = nets[p2];
  if (n1 && n1.powered) nets[p2] = { ...n1 };
  else if (n2 && n2.powered) nets[p1] = { ...n2 };
}

function simLED(comp, nets) {
  const [anode, cathode] = comp.pins;
  const na = nets[anode], nc = nets[cathode];
  const hasForward = na && na.powered && nc && nc.grounded;
  const hasPower = na && na.powered && !nc;
  comp.lit = hasForward || hasPower;
  return comp.lit;
}

function simSwitch(comp, nets) {
  if (!comp.props.closed) return;
  const [p1, p2] = comp.pins;
  const n1 = nets[p1], n2 = nets[p2];
  if (n1 && n1.powered) nets[p2] = { ...n1 };
  else if (n2 && n2.powered) nets[p1] = { ...n2 };
}

function simNPN(comp, nets) {
  // pins: [base, collector, emitter]
  const [base, collector, emitter] = comp.pins;
  const nb = nets[base], nc = nets[collector];
  if (nb && nb.powered && nc && nc.powered) {
    nets[emitter] = { voltage: nb.voltage - 0.7, powered: true };
  }
}

function simBuzzer(comp, nets) {
  const [p, n] = comp.pins;
  const np = nets[p], nn = nets[n];
  comp.buzzing = np && np.powered && nn && nn.grounded;
  return comp.buzzing;
}

function simMotor(comp, nets) {
  const [p, n] = comp.pins;
  const np = nets[p], nn = nets[n];
  comp.spinning = np && np.powered && nn && nn.grounded;
  return comp.spinning;
}

// =================== FORMATTING ===================

function formatResistance(v) {
  if (v >= 1000) return (v / 1000) + 'kΩ';
  return v + 'Ω';
}

// =================== COMPONENT PLACEMENT ===================

function placeComponent(type, holeId) {
  const def = COMPONENT_DEFS[type];
  if (!def) return null;

  const comp = {
    id: nextCompId++,
    type,
    holeId,       // primary pin hole
    pins: [],     // resolved hole IDs for each pin
    props: def.props ? { ...def.props } : {},
    lit: false,
    buzzing: false,
    spinning: false,
  };

  // Assign pins based on type
  const p = parseHoleId(holeId);
  if (!p) return null;

  if (def.pins === 1) {
    comp.pins = [holeId];
  } else if (def.pins === 2) {
    const span = def.span || 2;
    const row = p.row;
    const col1 = p.col;
    const col2 = p.col + span - 1;

    // Check col2 is valid
    const hole2Id = `${row}-${col2}`;
    if (!holeMap[hole2Id] && !hole2Id.startsWith('vcc') && !hole2Id.startsWith('gnd')) {
      return null; // out of bounds
    }
    comp.pins = [holeId, hole2Id];
    comp.holeId2 = hole2Id;
  } else if (def.pins === 3 && type === 'npn') {
    // Base on selected hole, collector above, emitter below
    comp.pins = [holeId]; // simplified for now
  }

  placedComponents.push(comp);
  renderPlacedComponent(comp);
  markOccupied(comp);

  return comp;
}

function renderPlacedComponent(comp) {
  const def = COMPONENT_DEFS[comp.type];
  const layer = document.getElementById('componentsLayer');

  // Remove old element if any
  const old = document.getElementById(`comp-${comp.id}`);
  if (old) old.remove();

  const pos = getHolePos(comp.holeId);
  if (!pos) return;

  let pos2 = null;
  if (comp.holeId2) pos2 = getHolePos(comp.holeId2);

  const el = document.createElement('div');
  el.id = `comp-${comp.id}`;
  el.className = 'placed-component';
  el.dataset.compId = comp.id;

  // Position: center of component between its pins
  let cx = pos.x, cy = pos.y;
  if (pos2) {
    cx = (pos.x + pos2.x) / 2;
    cy = (pos.y + pos2.y) / 2;
  }

  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  el.style.zIndex = 20;

  // Render SVG
  const html = def.render(comp, false);
  el.innerHTML = `<div class="comp-body">${html}</div>`;

  // Special: switch click
  if (comp.type === 'switch') {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSwitch(comp.id);
    });
  }

  el.addEventListener('click', (e) => {
    if (window.currentTool === 'delete') {
      e.stopPropagation();
      deleteComponent(comp.id);
    } else if (window.currentTool === 'select') {
      e.stopPropagation();
      selectComponent(comp.id);
    }
  });

  layer.appendChild(el);
}

function updateComponentVisual(comp) {
  const el = document.getElementById(`comp-${comp.id}`);
  if (!el) return;
  const def = COMPONENT_DEFS[comp.type];
  const powered = comp.lit || comp.buzzing || comp.spinning || false;
  el.querySelector('.comp-body').innerHTML = def.render(comp, powered);
}

function markOccupied(comp) {
  for (const hid of comp.pins) {
    const hole = holeMap[hid];
    if (hole) hole.classList.add('occupied');
  }
}

function unmarkOccupied(comp) {
  for (const hid of comp.pins) {
    const hole = holeMap[hid];
    if (hole) {
      hole.classList.remove('occupied', 'powered', 'grounded');
    }
  }
}

function deleteComponent(id) {
  const idx = placedComponents.findIndex(c => c.id === id);
  if (idx === -1) return;
  const comp = placedComponents[idx];
  unmarkOccupied(comp);
  const el = document.getElementById(`comp-${id}`);
  if (el) el.remove();
  placedComponents.splice(idx, 1);
  consoleLog(`Removed ${COMPONENT_DEFS[comp.type].name}`, 'warn');
  if (window.simulationRunning) runSimulation();
}

function toggleSwitch(id) {
  const comp = placedComponents.find(c => c.id === id);
  if (!comp) return;
  comp.props.closed = !comp.props.closed;
  updateComponentVisual(comp);
  consoleLog(`Switch ${comp.props.closed ? 'CLOSED' : 'OPEN'}`, 'info');
  if (window.simulationRunning) runSimulation();
}

function selectComponent(id) {
  const comp = placedComponents.find(c => c.id === id);
  if (!comp) return;
  const def = COMPONENT_DEFS[comp.type];

  // Show properties panel
  const panel = document.getElementById('propertiesPanel');
  const content = document.getElementById('propContent');
  panel.style.display = 'block';

  let html = `<div class="prop-row"><label>Type</label><span style="color:var(--text-bright)">${def.name}</span></div>`;

  if (def.propDefs) {
    for (const pd of def.propDefs) {
      html += `<div class="prop-row"><label>${pd.label}</label>`;
      if (pd.type === 'select') {
        html += `<select onchange="updateCompProp(${id},'${pd.key}',this.value)">`;
        for (const opt of pd.options) {
          html += `<option value="${opt}" ${comp.props[pd.key] == opt ? 'selected' : ''}>${opt}</option>`;
        }
        html += `</select>`;
      }
      html += `</div>`;
    }
  }

  html += `<button class="tool-btn" style="margin-top:6px;color:var(--red)" onclick="deleteComponent(${id})">🗑️ Delete</button>`;
  content.innerHTML = html;
}

function updateCompProp(id, key, value) {
  const comp = placedComponents.find(c => c.id === id);
  if (!comp) return;
  const def = COMPONENT_DEFS[comp.type];
  // Find prop type to coerce value
  const pd = def.propDefs?.find(p => p.key === key);
  if (pd && pd.type === 'select' && typeof pd.options[0] === 'number') {
    comp.props[key] = parseFloat(value);
  } else {
    comp.props[key] = value;
  }
  updateComponentVisual(comp);
  if (window.simulationRunning) runSimulation();
}

function clearAllComponents() {
  // Remove all visual elements
  for (const comp of placedComponents) {
    unmarkOccupied(comp);
    const el = document.getElementById(`comp-${comp.id}`);
    if (el) el.remove();
  }
  placedComponents = [];
  document.getElementById('propertiesPanel').style.display = 'none';
}
