/* ============================================================
   SubnetMaster — app.js
   ============================================================ */

// ── Tab navigation ──────────────────────────────────────────
const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.section');

function switchTab(target) {
  tabs.forEach(t => {
    if (t.dataset.tab === target) t.classList.add('active');
    else t.classList.remove('active');
  });
  sections.forEach(s => {
    if (s.id === target) s.classList.add('active');
    else s.classList.remove('active');
  });
  if (target === 'quiz' && !quizStarted) nextQ();
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ── Theme Toggle ────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// ── Keyboard Shortcuts ──────────────────────────────────────
window.addEventListener('keydown', e => {
  // Tabs 1-5
  if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
    const tabMap = ['cheatsheet', 'visual', 'technique', 'calc', 'quiz'];
    switchTab(tabMap[parseInt(e.key) - 1]);
  }

  // Enter key behavior
  if (e.key === 'Enter') {
    const activeSection = document.querySelector('.section.active').id;
    if (activeSection === 'calc') {
      calcSubnet();
    } else if (activeSection === 'quiz') {
      if (answered) nextQ();
      // Quiz options are handled by their own listeners, but we could add focus logic here if needed
    }
  }
});

// ── Copy to Clipboard ───────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.copy;
    const text = document.getElementById(targetId).textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btn.textContent;
      btn.textContent = '✅';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 1500);
    });
  });
});

// ── Bit Visualizer ──────────────────────────────────────────
const pfxSlider = document.getElementById('pfx-slider');
const pfxDisp   = document.getElementById('pfx-disp');

function ipToMaskOctets(prefix) {
  const mask = prefix === 0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0);
  return [(mask >>> 24) & 255, (mask >>> 16) & 255, (mask >>> 8) & 255, mask & 255];
}

function updateBits(prefix) {
  prefix = parseInt(prefix);
  pfxDisp.textContent = prefix;

  const mask = ipToMaskOctets(prefix);
  document.getElementById('vis-mask').textContent = mask.join('.');

  const h = 32 - prefix;
  const hosts = h >= 2 ? (Math.pow(2, h) - 2) : h === 1 ? 0 : 1;
  document.getElementById('vis-hosts').textContent = hosts.toLocaleString();
  document.getElementById('vis-hbits').textContent = h;
  document.getElementById('slider-end') && (document.getElementById('slider-end').textContent = `${hosts.toLocaleString()} hosts`);
  document.querySelector('.slider-end').textContent = `${hosts.toLocaleString()} hosts`;

  // Build bit display
  const container = document.getElementById('bit-display');
  container.innerHTML = '';
  const maskBin = (prefix === 0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0)).toString(2).padStart(32, '0');

  for (let oct = 0; oct < 4; oct++) {
    if (oct > 0) {
      const sep = document.createElement('div');
      sep.className = 'bit-sep';
      sep.textContent = '.';
      sep.style.cssText = 'font-family:var(--font-mono);color:var(--text-dim);display:flex;align-items:center;font-size:18px;';
      container.appendChild(sep);
    }
    const group = document.createElement('div');
    group.className = 'bit-group';
    for (let bit = 0; bit < 8; bit++) {
      const pos = oct * 8 + bit;
      const isNet = pos < prefix;
      const val = maskBin[pos];
      const cell = document.createElement('div');
      cell.className = `bit-cell ${isNet ? 'net' : 'host'}`;
      cell.textContent = val;
      group.appendChild(cell);
    }
    container.appendChild(group);
  }

  document.getElementById('legend-boundary').textContent =
    `Boundary at bit ${prefix} (octet ${Math.ceil(prefix / 8)}, bit ${prefix % 8 || 8})`;
}

pfxSlider.addEventListener('input', e => updateBits(e.target.value));
updateBits(24);

// ── Calculator ──────────────────────────────────────────────
function toNum(a, b, c, d) {
  return ((a >>> 0) * 16777216 + (b >>> 0) * 65536 + (c >>> 0) * 256 + (d >>> 0)) >>> 0;
}
function fromNum(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

function calcSubnet() {
  const raw = document.getElementById('ip-input').value.trim();
  const errEl = document.getElementById('calc-err');
  const resGrid = document.getElementById('calc-result');
  const resBits = document.getElementById('calc-bits-card');
  errEl.textContent = '';
  resGrid.style.display = 'none';
  resBits.style.display = 'none';

  if (!raw) return;

  const m = raw.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
  if (!m) { errEl.textContent = 'Format: 192.168.1.1/24'; return; }

  const [, a, b, c, d, pfx] = m.map(Number);
  if ([a, b, c, d].some(x => x > 255) || pfx > 32 || pfx < 0) {
    errEl.textContent = 'Invalid IP or prefix (0–32)'; return;
  }

  const ip = toNum(a, b, c, d);
  const maskBits = pfx === 0 ? 0 : ((0xFFFFFFFF << (32 - pfx)) >>> 0);
  const net   = (ip & maskBits) >>> 0;
  const bcast = (net | (~maskBits >>> 0)) >>> 0;
  const first = pfx < 31 ? (net + 1) >>> 0 : net;
  const last  = pfx < 31 ? (bcast - 1) >>> 0 : bcast;
  const h     = 32 - pfx;
  const hosts = h >= 2 ? Math.pow(2, h) - 2 : h === 1 ? 0 : 1;
  const wild  = fromNum(~maskBits >>> 0);
  const maskOctets = fromNum(maskBits);
  const lastMaskOct = maskOctets[3];
  const blockOct = lastMaskOct < 255 ? (256 - lastMaskOct) : null;

  document.getElementById('r-net').textContent   = fromNum(net).join('.');
  document.getElementById('r-bcast').textContent = fromNum(bcast).join('.');
  document.getElementById('r-first').textContent = fromNum(first).join('.');
  document.getElementById('r-last').textContent  = fromNum(last).join('.');
  document.getElementById('r-mask').textContent  = maskOctets.join('.');
  document.getElementById('r-wild').textContent  = wild.join('.');
  document.getElementById('r-hosts').textContent = hosts.toLocaleString();
  document.getElementById('r-block').textContent = blockOct !== null ? blockOct : 'N/A';

  // Bit pattern
  const ipBin   = ip.toString(2).padStart(32, '0');
  let bitsHtml = '';
  for (let i = 0; i < 32; i++) {
    if (i > 0 && i % 8 === 0) bitsHtml += '<span style="color:var(--text-dim);margin:0 3px">.</span>';
    const color = i < pfx ? 'var(--blue)' : 'var(--green)';
    bitsHtml += `<span style="color:${color}">${ipBin[i]}</span>`;
  }
  document.getElementById('r-bits').innerHTML = bitsHtml;

  // Subnet list (first 8)
  const listEl = document.getElementById('r-subnet-list');
  listEl.innerHTML = '';
  const blockSize = Math.pow(2, h);
  const interestingOctIdx = pfx < 8 ? 0 : pfx < 16 ? 1 : pfx < 24 ? 2 : 3;

  // Generate up to 8 subnet starting addresses
  let shown = 0;
  const netOcts = fromNum(net);
  // find the base of the first subnet block
  // iterate in block size steps
  for (let i = 0; i < 8 && shown < 8; i++) {
    const subnetNum = (net + i * blockSize) >>> 0;
    if (blockOct !== null && pfx >= 24) {
      // Simple case: varying last octet
      const subnetOcts = fromNum(subnetNum);
      if (subnetOcts[0] !== netOcts[0] || subnetOcts[1] !== netOcts[1] || subnetOcts[2] !== netOcts[2]) break;
      const row = document.createElement('div');
      const isCurrent = subnetNum === net;
      row.className = 'subnet-row' + (isCurrent ? ' current' : '');
      const subBcast = (subnetNum + blockSize - 1) >>> 0;
      row.innerHTML = `<span class="subnet-row-label">${isCurrent ? '→ Net' : 'Net'}</span>
        <span>${subnetOcts.join('.')}/${pfx}</span>
        <span style="color:var(--text-dim)">BC: ${fromNum(subBcast).join('.')}</span>`;
      listEl.appendChild(row);
      shown++;
    } else if (pfx < 24) {
      const subnetOcts = fromNum(subnetNum);
      const row = document.createElement('div');
      const isCurrent = subnetNum === net;
      row.className = 'subnet-row' + (isCurrent ? ' current' : '');
      row.innerHTML = `<span class="subnet-row-label">${isCurrent ? '→ Net' : 'Net'}</span>
        <span>${subnetOcts.join('.')}/${pfx}</span>`;
      listEl.appendChild(row);
      shown++;
    } else break;
  }
  if (shown === 0) {
    listEl.innerHTML = '<div class="subnet-row"><span style="color:var(--text-dim)">Subnet spans multiple /24 blocks — showing only current subnet above.</span></div>';
  }

  resGrid.style.display = 'grid';
  resBits.style.display = 'block';
}

document.getElementById('ip-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') calcSubnet();
});
document.getElementById('ip-input').addEventListener('input', () => {
  document.getElementById('calc-err').textContent = '';
  if (document.getElementById('ip-input').value.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/)) {
    calcSubnet();
  }
});
document.getElementById('calc-go').addEventListener('click', calcSubnet);

// ── Quiz ────────────────────────────────────────────────────
const questions = [
  { q: "What is the block size for a /28 subnet?",
    opts: ["16", "32", "8", "64"], ans: 0,
    exp: "Block size = 256 − 240 = 16. A /28 has a last octet mask of 240." },
  { q: "How many usable hosts does a /26 subnet support?",
    opts: ["62", "64", "30", "126"], ans: 0,
    exp: "2⁶ = 64 total addresses, minus network and broadcast = 62 usable hosts." },
  { q: "IP: 172.16.45.200/27 — what is the network address?",
    opts: ["172.16.45.192", "172.16.45.128", "172.16.45.160", "172.16.45.224"], ans: 0,
    exp: "Block = 32. Multiples: 0, 32, 64, 96, 128, 160, 192, 224. 200 falls in 192–223 → network is 172.16.45.192." },
  { q: "You need 30 subnets from a /24. What prefix should you use?",
    opts: ["/29", "/27", "/28", "/30"], ans: 0,
    exp: "2⁵ = 32 ≥ 30 → borrow 5 bits → /24 + 5 = /29. Gives 32 subnets of 6 hosts each." },
  { q: "What is the subnet mask for /29?",
    opts: ["255.255.255.248", "255.255.255.252", "255.255.255.240", "255.255.255.224"], ans: 0,
    exp: "32 − 29 = 3 host bits. Mask last octet: 11111000 in binary = 248." },
  { q: "IP 10.0.0.130/25 — what is the broadcast address?",
    opts: ["10.0.0.255", "10.0.0.127", "10.0.0.254", "10.0.0.253"], ans: 0,
    exp: "Block = 128. 130 falls in the 128–255 range. Broadcast = 255." },
  { q: "You need to accommodate 100 hosts per subnet. Best prefix?",
    opts: ["/25", "/26", "/27", "/24"], ans: 0,
    exp: "100 + 2 = 102. Smallest 2ʰ ≥ 102 → 2⁷ = 128 → h = 7 → /32 − 7 = /25 → 126 usable hosts." },
  { q: "How many subnets does a /27 create from a /24?",
    opts: ["8", "4", "16", "32"], ans: 0,
    exp: "Borrowed bits = 27 − 24 = 3 → 2³ = 8 subnets, each with 30 hosts." },
  { q: "What is the wildcard mask for /26?",
    opts: ["0.0.0.63", "0.0.0.31", "0.0.0.127", "0.0.0.191"], ans: 0,
    exp: "Wildcard = inverse of subnet mask. /26 mask last octet = 192. Wildcard = 255 − 192 = 63." },
  { q: "IP: 192.168.1.100/28 — first usable host?",
    opts: ["192.168.1.97", "192.168.1.96", "192.168.1.98", "192.168.1.113"], ans: 0,
    exp: "Block = 16. 100 falls in 96–111. Network = 96, first usable host = 97." },
  { q: "What is the CIDR notation for mask 255.255.255.224?",
    opts: ["/27", "/26", "/28", "/25"], ans: 0,
    exp: "224 = 11100000 in binary → 3 host bits → 32 − 3 = /27." },
  { q: "How many usable hosts per subnet in a /30?",
    opts: ["2", "4", "6", "14"], ans: 0,
    exp: "2⁽³²⁻³⁰⁾ = 2² = 4 total − 2 = 2 usable hosts. Common for point-to-point links." },
  { q: "IP: 10.1.1.1/8 — what is the broadcast address?",
    opts: ["10.255.255.255", "10.1.255.255", "10.0.0.255", "10.1.1.255"], ans: 0,
    exp: "A /8 mask = 255.0.0.0. Network = 10.0.0.0. Broadcast = all host bits set = 10.255.255.255." },
  { q: "What does the 'interesting octet' mean in subnetting?",
    opts: ["The octet where subnetting occurs (not 0 or 255)", "The octet with the highest value", "Always the last octet", "The first octet in the IP"], ans: 0,
    exp: "The interesting octet is the one that is neither 0 nor 255 in the subnet mask — that's where you calculate block size." },
  { q: "You have 192.168.5.0/24 and need 4 equal subnets. What mask?",
    opts: ["/26", "/27", "/25", "/28"], ans: 0,
    exp: "2² = 4 subnets → borrow 2 bits → /24 + 2 = /26. Each subnet has 64 addresses, 62 usable." },
];

let qIdx = 0, score = 0, total = 0, streak = 0, quizStarted = false, answered = false;
let order = shuffle([...Array(questions.length).keys()]);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextQ() {
  quizStarted = true;
  answered = false;
  const qNum = total % order.length;
  if (qNum === 0 && total > 0) order = shuffle([...Array(questions.length).keys()]);

  const q = questions[order[qNum]];
  document.getElementById('q-num').textContent = `Q${total + 1}`;
  document.getElementById('q-text').textContent = q.q;
  document.getElementById('q-feedback').style.display = 'none';
  document.getElementById('q-next').style.display = 'none';

  // Progress fill (out of the full question bank)
  document.getElementById('progress-fill').style.width = `${(qNum / questions.length) * 100}%`;

  // Shuffle options, track correct answer position
  const idxMap = shuffle([0, 1, 2, 3]);
  const optsEl = document.getElementById('q-opts');
  optsEl.innerHTML = '';

  idxMap.forEach(i => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = q.opts[i];
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      total++;

      const isCorrect = i === q.ans;
      if (isCorrect) {
        score++;
        streak++;
        btn.classList.add('correct-opt');
      } else {
        streak = 0;
        btn.classList.add('wrong-opt');
        // Highlight correct answer
        optsEl.querySelectorAll('.quiz-opt')[idxMap.indexOf(q.ans)].classList.add('correct-opt');
      }

      // Disable all buttons
      optsEl.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);

      // Feedback
      const fb = document.getElementById('q-feedback');
      fb.innerHTML = `<span class="${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '✓ Correct!' : '✗ Wrong.'}</span> ${q.exp}`;
      fb.style.display = 'block';

      // Stats
      document.getElementById('score-disp').textContent = `${score} / ${total}`;
      document.getElementById('stat-correct').textContent = score;
      document.getElementById('stat-wrong').textContent = total - score;
      document.getElementById('stat-streak').textContent = streak;

      document.getElementById('q-next').style.display = 'inline-block';
    });
    optsEl.appendChild(btn);
  });
}

function resetQuiz() {
  score = 0; total = 0; streak = 0;
  quizStarted = false; answered = false;
  order = shuffle([...Array(questions.length).keys()]);
  document.getElementById('score-disp').textContent = '0 / 0';
  document.getElementById('stat-correct').textContent = '0';
  document.getElementById('stat-wrong').textContent = '0';
  document.getElementById('stat-streak').textContent = '0';
  document.getElementById('progress-fill').style.width = '0%';
  nextQ();
}

// Auto-start quiz if it's the active section on load
if (document.getElementById('quiz').classList.contains('active')) {
  nextQ();
}
