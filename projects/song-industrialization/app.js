const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const progress = $('.reading-progress');
addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${total > 0 ? scrollY / total * 100 : 0}%`;
}, { passive: true });

const canvas = $('#hero-forge');
const ctx = canvas.getContext('2d');
let frame = 0;
function resizeHero() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, r.width * dpr);
  canvas.height = Math.max(1, r.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawHero() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const horizon = h * .58;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#14201f'); sky.addColorStop(.65, '#29413b'); sky.addColorStop(1, '#806a4b');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#182320';
  ctx.beginPath(); ctx.moveTo(0, horizon + 20);
  for (let x = 0; x <= w; x += 80) ctx.lineTo(x, horizon - 50 - Math.sin(x * .008) * 70);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  ctx.fillStyle = '#0c1716';
  for (let x = w * .45; x < w; x += 42) {
    const bh = 35 + (x * 13 % 90); ctx.fillRect(x, horizon - bh + 55, 34, bh);
    if ((x / 42) % 3 < 1) { ctx.fillRect(x + 11, horizon - bh + 28, 10, 28); }
  }
  ctx.strokeStyle = 'rgba(188,166,104,.38)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, h * .83); ctx.bezierCurveTo(w * .3, h * .70, w * .55, h * .9, w, h * .69); ctx.stroke();
  for (let i = 0; i < 11; i++) {
    const x = w * .54 + i * 56; const y = horizon + 25 - (i % 3) * 18;
    const glow = .55 + Math.sin(frame * .025 + i) * .25;
    ctx.fillStyle = `rgba(224,101,42,${glow})`; ctx.fillRect(x + 11, y - 18, 11, 18);
    ctx.fillStyle = '#0b1312'; ctx.fillRect(x, y, 34, 54);
  }
  for (let i = 0; i < 22; i++) {
    const t = ((frame * .0018 + i / 22) % 1); const x = t * w;
    const y = h * .83 - Math.sin(t * Math.PI) * h * .09;
    ctx.fillStyle = '#c5a45d'; ctx.beginPath(); ctx.ellipse(x, y, 15, 5, -.15, 0, Math.PI * 2); ctx.fill();
  }
  frame++;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(drawHero);
}
resizeHero(); drawHero(); addEventListener('resize', resizeHero);

const yard = $('#iron-yard');
function renderIron(output) {
  $('#iron-output').textContent = output.toLocaleString('en-US');
  const compareBar = $('#compare-song-bar');
  if (compareBar) {
    compareBar.style.setProperty('--share', `${output / 125000 * 100}%`);
    $('#compare-song-value').textContent = (output / 10000).toFixed(1).replace('.0', '');
    $('#compare-verdict').textContent = `北宋约是 1720 年英国的 ${(output / 22000).toFixed(1)} 倍`;
  }
  yard.replaceChildren();
  const count = Math.round(output / 1000);
  for (let i = 0; i < count; i++) {
    const ingot = document.createElement('i');
    ingot.className = `iron-ingot${i > count - 10 ? ' hot' : ''}`;
    ingot.style.animationDelay = `${Math.min(i * 8, 450)}ms`;
    ingot.setAttribute('aria-hidden', 'true'); yard.append(ingot);
  }
}
renderIron(125000);
$$('.estimate-switch button').forEach(button => button.addEventListener('click', () => {
  $$('.estimate-switch button').forEach(b => b.classList.toggle('active', b === button));
  renderIron(Number(button.dataset.output));
}));

const useNotes = {
  农具: '它不是堆在库房里的数字。大量铁制农具进入市场，把冶铁工场和最广阔的乡村需求连接起来。',
  军器: '宋军大量消耗箭镞、甲具与兵刃。国家军备需求，为冶铁业提供了巨大而集中的订单。',
  工程: '铁钉、桥链与大型铸件进入公共工程。高温冶金开始支撑超出日常器具的建造尺度。',
  钱币: '部分地区铸行铁钱，仅铸币就能吞下可观铁料。货币本身也成为冶铁产品。'
};
$$('.iron-uses button').forEach(button => button.addEventListener('click', () => {
  $$('.iron-uses button').forEach(b => b.classList.toggle('active', b === button));
  $('#use-note').textContent = useNotes[button.dataset.use];
}));

const nodes = $$('.node');
function updateSystem() {
  const active = new Set(nodes.filter(n => n.classList.contains('active')).map(n => n.dataset.node));
  $$('.link').forEach(link => {
    const pair = link.dataset.link.split(' ');
    link.classList.toggle('off', !pair.every(n => active.has(n)));
  });
  const count = active.size;
  $('#system-count').textContent = `${count}／7`;
  const messages = [
    '炉火熄灭，系统尚未建立。', '一个环节无法独自形成工业。', '有资源，还没有完整生产链。',
    '生产能够开始，但很难扩大。', '货物开始流动，系统仍有断点。', '多数要素已经接通，瓶颈决定上限。',
    '工业网络接近闭合，只差最后一环。', '矿石、能源、冶炼、制造、运输、需求与信用彼此连接。'
  ];
  $('#system-status').textContent = messages[count];
  $('#system-map').classList.toggle('stalled', count < 5 || !active.has('forge'));
}
nodes.forEach(node => node.addEventListener('click', () => { node.classList.toggle('active'); updateSystem(); }));
let demoTimer;
$('#system-run').addEventListener('click', () => {
  clearInterval(demoTimer); nodes.forEach(n => n.classList.remove('active')); updateSystem();
  let i = 0; $('#system-run').textContent = '正在接通…';
  demoTimer = setInterval(() => {
    nodes[i].classList.add('active'); updateSystem(); i++;
    if (i === nodes.length) { clearInterval(demoTimer); $('#system-run').textContent = '重新演示'; }
  }, 520);
});

const forest = $('#forest');
for (let i = 0; i < 22; i++) {
  const tree = document.createElement('i'); tree.className = 'tree'; tree.style.height = `${55 + (i * 17 % 80)}px`; forest.append(tree);
}
function updateEnergy() {
  const coal = Number($('#coal-slider').value);
  $('#coal-value').textContent = `${coal}%`;
  const visible = Math.round(4 + coal / 100 * 18);
  $$('.tree', forest).forEach((t, i) => { t.style.opacity = i < visible ? 1 : .08; });
  $('#heat-state').textContent = coal > 65 ? '连续高温' : coal > 30 ? '炉温受限' : '木炭吃紧';
  $('#forest-state').textContent = coal > 70 ? '森林压力较低' : coal > 35 ? '持续消耗林木' : '砍伐压力很高';
  $('.kiln').style.filter = `saturate(${.6 + coal / 80})`;
}
$('#coal-slider').addEventListener('input', updateEnergy); updateEnergy();

function updateMoney() {
  const issue = Number($('#issue-slider').value); $('#issue-value').textContent = issue;
  const trust = issue < 25 ? '紧' : issue < 72 ? '稳' : issue < 88 ? '疑' : '危';
  const flow = issue < 25 ? 25 + issue : issue < 65 ? 50 + (issue - 25) * 1.15 : Math.max(18, 96 - (issue - 65) * 2.2);
  $('#trust-value').textContent = trust;
  $('#trade-flow').style.width = `${flow}%`;
  $('#trade-value').textContent = flow > 78 ? '交易顺畅' : flow > 48 ? '交换受限' : '信用收缩';
  $('#coin-weight').textContent = issue < 25 ? '重' : '轻';
  const notes = $('#note-stack'); notes.replaceChildren();
  const count = Math.round(issue / 10);
  for (let i = 0; i < count; i++) {
    const n = document.createElement('i'); n.className = 'banknote'; n.textContent = '交子';
    n.style.setProperty('--x', `${(i % 5) * 18}px`); n.style.setProperty('--y', `${-Math.floor(i / 5) * 26}px`); n.style.setProperty('--r', `${(i % 3 - 1) * 4}deg`); notes.append(n);
  }
  $('#money-note').textContent = issue < 25
    ? '纸币太少：大额交易仍要搬运沉重铜钱，货币供给成为市场瓶颈。'
    : issue < 72 ? '发行与可兑现能力大致相称：纸币减轻运输负担，信用帮助市场扩张。'
    : '发行开始越过信用边界：纸面数量增加，购买力与接受程度反而下降。';
}
$('#issue-slider').addEventListener('input', updateMoney); updateMoney();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('seen');
  }), { threshold: .15 });
  $$('.stage,.answer-grid article').forEach(el => observer.observe(el));
}
