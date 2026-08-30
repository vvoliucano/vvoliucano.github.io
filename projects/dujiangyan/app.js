const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const progress = $('.reading-progress');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
}, { passive: true });

const canvas = $('#hero-water');
const ctx = canvas.getContext('2d');
let heroFrame = 0;
function resizeHero() {
  const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, r.width * dpr); canvas.height = Math.max(1, r.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawHero() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#092a34'); sky.addColorStop(.58, '#376b70'); sky.addColorStop(1, '#9c8b68'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  const ranges = [['#203f3c', .42, 110], ['#31574f', .52, 82], ['#4d6f5f', .61, 58]];
  ranges.forEach(([color, base, amp], row) => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 55) ctx.lineTo(x, h * base - Math.sin(x * .006 + row) * amp - (x * (row + 3) % 47)); ctx.lineTo(w, h); ctx.fill(); });
  ctx.fillStyle = '#3c8997'; ctx.beginPath(); ctx.moveTo(w * .66, h * .45); ctx.bezierCurveTo(w * .62, h * .62, w * .77, h * .70, w * .48, h); ctx.lineTo(w * .88, h); ctx.bezierCurveTo(w * .95, h * .72, w * .74, h * .61, w * .72, h * .45); ctx.fill();
  ctx.strokeStyle = 'rgba(194,238,238,.42)'; ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) { const t = (heroFrame * .004 + i / 12) % 1; const x = w * (.69 - .07 * t + .02 * Math.sin(t * 8)); const y = h * (.46 + .55 * t); ctx.beginPath(); ctx.moveTo(x - 28, y); ctx.quadraticCurveTo(x, y - 8, x + 35, y + 2); ctx.stroke(); }
  heroFrame++;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(drawHero);
}
resizeHero(); drawHero(); addEventListener('resize', resizeHero);

const paths = {
  upstream: $('#upstream'), outer: $('#outer-river'), inner: $('#inner-river'),
  spill: $('#spill-river'), irrigation: $('#irrigation-river')
};
const waterGroup = $('#water-particles'), sandGroup = $('#sand-particles');
const SVG_NS = 'http://www.w3.org/2000/svg';
const particles = [];
function addParticle(type, pathName, delay, speed) {
  const c = document.createElementNS(SVG_NS, 'circle'); c.setAttribute('r', type === 'sand' ? 5 : 4); c.setAttribute('class', type === 'sand' ? 'sand-particle' : 'particle');
  (type === 'sand' ? sandGroup : waterGroup).append(c); particles.push({ el: c, type, pathName, delay, speed });
}
for (let i = 0; i < 18; i++) addParticle('water', 'upstream', i / 18, .00011 + i % 3 * .000012);
for (let i = 0; i < 14; i++) addParticle('water', i % 2 ? 'inner' : 'outer', i / 14, .0001);
for (let i = 0; i < 8; i++) addParticle('sand', i < 6 ? 'outer' : 'spill', i / 8, .00007);
let currentWater = 50, particleFrame = 0;
function animateParticles() {
  particles.forEach((p, i) => {
    let pathName = p.pathName;
    if (p.type === 'water' && p.pathName !== 'upstream') {
      const innerShare = .6 - currentWater * .002;
      pathName = ((i * 37 + particleFrame * .001) % 1) < innerShare ? 'inner' : 'outer';
    }
    if (p.type === 'sand') pathName = currentWater > 62 && i > 4 ? 'spill' : 'outer';
    const path = paths[pathName], length = path.getTotalLength();
    const t = (particleFrame * p.speed * (1 + currentWater / 140) + p.delay) % 1;
    const point = path.getPointAtLength(t * length); p.el.setAttribute('cx', point.x); p.el.setAttribute('cy', point.y);
    p.el.style.opacity = pathName === 'spill' && currentWater < 45 ? .08 : .85;
  });
  particleFrame++;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(animateParticles);
}
animateParticles();

function updateWater(value, sourceButton) {
  currentWater = Number(value); $('#water-slider').value = currentWater; $('#water-value').textContent = currentWater;
  const innerShare = Math.round(60 - currentWater * .2), outerShare = 100 - innerShare;
  const total = 32 + currentWater * .92, innerFlow = total * innerShare / 100;
  const spill = Math.max(0, innerFlow - 39) * .72, bottle = Math.min(41, innerFlow - spill);
  $('#inner-share').textContent = innerShare; $('#outer-share').textContent = outerShare;
  $('#inner-big').textContent = `${innerShare}%`; $('#outer-big').textContent = `${outerShare}%`;
  $('#inner-bar').style.height = `${innerShare}%`; $('#outer-bar').style.height = `${outerShare}%`;
  paths.upstream.style.strokeWidth = 26 + currentWater * .35;
  paths.inner.style.strokeWidth = 12 + innerFlow * .62;
  paths.outer.style.strokeWidth = 12 + (total - innerFlow + spill) * .48;
  paths.spill.style.strokeWidth = 4 + spill * 1.5; paths.spill.style.opacity = .18 + Math.min(1, spill / 12) * .8;
  paths.irrigation.style.strokeWidth = 10 + bottle * .5;
  $('#gate-fill').style.width = `${Math.min(92, 20 + bottle * 1.65)}%`;
  let season, icon, plain, spillState, sandState, bottleState, note;
  if (currentWater < 28) {
    season = '枯水期'; icon = '☀'; plain = '保住灌溉'; spillState = '低堰静水'; sandState = '少量泥沙入外江'; bottleState = '持续引水';
    note = '水少时，较深的内江取得约六成来水；外江分走约四成，宝瓶口仍能为成都平原引水。';
  } else if (currentWater < 68) {
    season = '平水期'; icon = '☁'; plain = '水量安稳'; spillState = '少量调节'; sandState = '泥沙随外江下泄'; bottleState = '平稳入渠';
    note = '水势平稳：鱼嘴均衡分流，飞沙堰只作少量调节，宝瓶口持续向平原供水。';
  } else {
    season = '丰水期'; icon = '☂'; plain = '洪峰受控'; spillState = '溢洪排沙'; sandState = '多余水沙回到外江'; bottleState = '瓶口限流';
    note = '洪水到来：约六成来水转入外江，飞沙堰把内江多余水沙横向排出，宝瓶口守住平原入口。';
  }
  $('#season-name').textContent = season; $('#season-icon').textContent = icon; $('#plain-state').textContent = plain;
  $('#spill-state').textContent = spillState; $('#sand-state').textContent = sandState; $('#bottle-state').textContent = bottleState; $('#lab-note').textContent = note;
  $$('.season-presets button').forEach(b => b.classList.toggle('active', b === sourceButton || Number(b.dataset.water) === currentWater));
}
$('#water-slider').addEventListener('input', e => updateWater(e.target.value));
$$('.season-presets button').forEach(button => button.addEventListener('click', () => updateWater(button.dataset.water, button)));
updateWater(50, $('.season-presets .active'));

const sandDots = $('.sand-dots');
for (let i = 0; i < 42; i++) {
  const dot = document.createElement('i'); dot.className = 'sand-dot'; dot.style.left = `${5 + (i * 37 % 76)}%`; dot.style.top = `${12 + (i * 53 % 72)}%`; dot.style.animationDelay = `${-(i % 9) * .4}s`; dot.style.opacity = .35 + (i % 4) * .15; sandDots.append(dot);
}
