(() => {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];

  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    qs('.reading-progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
  }
  addEventListener('scroll', updateProgress, { passive: true });

  const hero = qs('#hero-sea');
  const hctx = hero.getContext('2d');
  let heroShips = [];
  function resizeHero() {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    hero.width = Math.round(rect.width * dpr);
    hero.height = Math.round(rect.height * dpr);
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    heroShips = Array.from({ length: innerWidth < 700 ? 34 : 76 }, (_, i) => ({
      x: rect.width * (.42 + ((i * 37) % 61) / 100),
      y: rect.height * (.33 + ((i * 53) % 48) / 100),
      s: .45 + ((i * 19) % 70) / 100,
      phase: i * .72
    })).sort((a, b) => a.y - b.y);
  }
  function drawJunk(ctx, x, y, s, t) {
    ctx.save();
    ctx.translate(x + Math.sin(t + y) * 2, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#2b1711';
    ctx.beginPath();ctx.moveTo(-25, 0);ctx.lineTo(28, 0);ctx.lineTo(19, 8);ctx.lineTo(-15, 8);ctx.closePath();ctx.fill();
    ctx.strokeStyle = '#3a251a';ctx.lineWidth = 1.5;
    [-12, 2, 15].forEach((mx, idx) => {
      ctx.beginPath();ctx.moveTo(mx, 1);ctx.lineTo(mx, -24 - idx * 4);ctx.stroke();
      ctx.fillStyle = idx === 1 ? '#d9a64c' : '#c9b177';
      ctx.beginPath();ctx.moveTo(mx - 1, -22 - idx * 4);ctx.lineTo(mx + 17, -16 - idx * 3);ctx.lineTo(mx - 1, -4);ctx.closePath();ctx.fill();
    });
    ctx.restore();
  }
  function drawHero(time = 0) {
    const w = hero.clientWidth, h = hero.clientHeight;
    const grad = hctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#071e2a');grad.addColorStop(.58, '#174452');grad.addColorStop(1, '#806c50');
    hctx.fillStyle = grad;hctx.fillRect(0, 0, w, h);
    hctx.fillStyle = 'rgba(224,177,89,.12)';hctx.beginPath();hctx.arc(w * .78, h * .24, 75, 0, Math.PI * 2);hctx.fill();
    for (let i = 0; i < 18; i++) {
      const y = h * .48 + i * h * .033;
      hctx.strokeStyle = `rgba(235,226,198,${.025 + i * .003})`;hctx.lineWidth = 1;
      hctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const yy = y + Math.sin(x * .018 + i + time * .00025) * (2 + i * .12);
        x ? hctx.lineTo(x, yy) : hctx.moveTo(x, yy);
      }
      hctx.stroke();
    }
    heroShips.forEach((ship, i) => drawJunk(hctx, ship.x, ship.y, ship.s * (ship.y / h + .55), time * .00035 + ship.phase + i));
    if (!reducedMotion) requestAnimationFrame(drawHero);
  }
  resizeHero();drawHero();addEventListener('resize', resizeHero);

  const fleetSea = qs('#fleet-sea');
  const fleetSlider = qs('#fleet-slider');
  let fleetMode = 'zheng';
  function fleetClass(i, mode) {
    if (mode === 'carrier') return `fleet-icon modern ${i === 0 ? 'carrier-icon' : i === 4 ? 'sub-icon' : ''}`;
    return `fleet-icon ${i < 62 ? 'big' : i % 4 === 0 ? 'small' : 'mid'}`;
  }
  function renderFleet() {
    const count = Number(fleetSlider.value);
    fleetSea.replaceChildren();
    for (let i = 0; i < count; i++) {
      const ship = document.createElement('i');
      ship.className = fleetClass(i, fleetMode);
      ship.style.animationDelay = `${Math.min(i * .008, .7)}s`;
      ship.setAttribute('aria-hidden', 'true');
      fleetSea.append(ship);
    }
    qs('#visible-ships').textContent = count;
  }
  function setFleet(mode) {
    fleetMode = mode;
    const zheng = mode === 'zheng';
    fleetSlider.max = zheng ? 317 : 6;fleetSlider.value = 1;
    qs('#visible-unit').textContent = zheng ? '／317 艘' : '／6 类主要平台';
    qs('#fleet-end').textContent = zheng ? '317 艘' : '6 类平台';
    qs('#fleet-caption').textContent = zheng
      ? '317 艘船、27,800 人：宝船、马船、粮船、坐船、战船、水船共同组成一套完整的远洋体系。'
      : '典型示意：1 艘航母、1 艘巡洋舰、2 艘驱逐舰、1 艘攻击核潜艇与 1 艘综合补给舰；实际部署会调整。';
    qs('#fleet-key').innerHTML = zheng
      ? '<span><i class="key-big"></i>宝船等大型船</span><span><i class="key-mid"></i>马船、粮船等</span><span><i class="key-small"></i>坐船、战船等</span>'
      : '<span><i class="key-big"></i>航母与舰载机联队</span><span><i class="key-mid"></i>水面护航舰</span><span><i class="key-small"></i>潜艇与补给舰</span>';
    qsa('.fleet-tabs button').forEach(b => b.classList.toggle('active', b.dataset.fleet === mode));
    renderFleet();
  }
  fleetSlider.addEventListener('input', renderFleet);
  qsa('.fleet-tabs button').forEach(b => b.addEventListener('click', () => setFleet(b.dataset.fleet)));
  setFleet('zheng');

  const routeCanvas = qs('#route-map');
  const routeCtx = routeCanvas.getContext('2d');
  const routeSlider = qs('#route-slider');
  const routePlay = qs('#route-play');
  const worldGeoJSON = window.ZHENG_HE_WORLD_GEOJSON;
  const routeGeoJSON = window.ZHENG_HE_ROUTE_GEOJSON;
  const portFeatures = routeGeoJSON.features.filter(f => f.properties.kind === 'port');
  const ports = Object.fromEntries(portFeatures.map(f => [f.properties.id, {
    n: f.properties.name, s: f.properties.sea, coordinates: f.geometry.coordinates
  }]));
  const voyages = routeGeoJSON.features
    .filter(f => f.properties.kind === 'voyage')
    .sort((a, b) => a.properties.index - b.properties.index);
  const mapCountries = new Set([
    'China','Taiwan','Vietnam','Laos','Cambodia','Thailand','Myanmar','Malaysia','Brunei','Philippines','Indonesia',
    'Bangladesh','India','Sri Lanka','Nepal','Bhutan','Pakistan','Afghanistan','Iran','Iraq','Kuwait','Qatar',
    'United Arab Emirates','Oman','Saudi Arabia','Yemen','Djibouti','Eritrea','Ethiopia','Somalia','Kenya',
    'United Republic of Tanzania','Mozambique','Madagascar'
  ]);
  let activeVoyage = 0, routeProgress = 0, routeAnimating = false, routeRaf = 0, routeLast = 0;
  function project(lon, lat, w, h) {
    const padX = w * .055, padY = h * .08;
    return [padX + (lon - 35) / 90 * (w - padX * 2), padY + (40 - lat) / 55 * (h - padY * 2)];
  }
  function routeMetrics(coordinates, w, h) {
    const pts = coordinates.map(([lon, lat]) => project(lon, lat, w, h));
    const lens = [], cumulative = [0];let total = 0;
    for (let i = 1; i < pts.length; i++) {const d = Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);lens.push(d);total += d;cumulative.push(total);}
    return {pts,lens,cumulative,total};
  }
  function findCoordinateIndex(coordinates, target) {
    return coordinates.findIndex(([lon, lat]) => Math.abs(lon - target[0]) < .001 && Math.abs(lat - target[1]) < .001);
  }
  function voyagePortStops(voyage, metrics) {
    return voyage.properties.ports.map(id => {
      const index = findCoordinateIndex(voyage.geometry.coordinates, ports[id].coordinates);
      return {id, index, distance: metrics.cumulative[Math.max(0, index)] || 0, point: metrics.pts[Math.max(0, index)]};
    });
  }
  function pointAt(metrics, progress) {
    const target = metrics.total * progress;
    let seg = metrics.lens.length - 1;
    for (let i = 0; i < metrics.lens.length; i++) if (target <= metrics.cumulative[i+1]) {seg = i;break;}
    const local = metrics.lens[seg] ? (target - metrics.cumulative[seg]) / metrics.lens[seg] : 0;
    const a = metrics.pts[seg], b = metrics.pts[seg+1];
    return {x:a[0]+(b[0]-a[0])*local,y:a[1]+(b[1]-a[1])*local,seg,local};
  }
  function routeCanvasSize() {
    const rect = routeCanvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    routeCanvas.width = Math.max(1, Math.round(rect.width * dpr));routeCanvas.height = Math.max(1, Math.round(rect.width / 1.6923 * dpr));
    routeCtx.setTransform(dpr,0,0,dpr,0,0);drawRoute();
  }
  function drawRoutePath(ctx, points, color, width, dash = []) {
    ctx.save();ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();ctx.restore();
  }
  function traceGeoRing(ctx, ring, w, h) {
    ring.forEach(([lon, lat], i) => {
      const p = project(lon, lat, w, h);
      i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
    });
    ctx.closePath();
  }
  function drawGeoLand(ctx, geojson, w, h) {
    ctx.save();ctx.fillStyle='#c0b28e';ctx.strokeStyle='rgba(237,223,187,.42)';ctx.lineWidth=.75;
    geojson.features.filter(feature => mapCountries.has(feature.properties.name)).forEach(feature => {
      const geometry = feature.geometry;if (!geometry) return;
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
      if (!polygons.length) return;
      ctx.beginPath();polygons.forEach(polygon => polygon.forEach(ring => traceGeoRing(ctx, ring, w, h)));ctx.fill('evenodd');ctx.stroke();
    });
    ctx.restore();
  }
  function drawRoute() {
    const w = routeCanvas.clientWidth, h = routeCanvas.clientWidth / 1.6923;if (!w) return;
    const g = routeCtx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0b3340');g.addColorStop(1,'#0a2530');routeCtx.fillStyle=g;routeCtx.fillRect(0,0,w,h);
    routeCtx.strokeStyle='rgba(203,221,213,.055)';routeCtx.lineWidth=1;
    for(let lon=40;lon<=120;lon+=10){const a=project(lon,-15,w,h),b=project(lon,40,w,h);routeCtx.beginPath();routeCtx.moveTo(...a);routeCtx.lineTo(...b);routeCtx.stroke()}
    for(let lat=-10;lat<=30;lat+=10){const a=project(35,lat,w,h),b=project(125,lat,w,h);routeCtx.beginPath();routeCtx.moveTo(...a);routeCtx.lineTo(...b);routeCtx.stroke()}
    drawGeoLand(routeCtx, worldGeoJSON, w, h);
    routeCtx.fillStyle='rgba(8,34,43,.6)';routeCtx.font=`${Math.max(9,w*.011)}px "Noto Serif SC",serif`;[['南海',111,9],['印度洋',72,-4],['阿拉伯海',58,12],['波斯湾',51,30]].forEach(([t,lon,lat])=>{const p=project(lon,lat,w,h);routeCtx.fillText(t,...p)});
    const voyage = voyages[activeVoyage], metrics = routeMetrics(voyage.geometry.coordinates,w,h), stops = voyagePortStops(voyage, metrics);
    drawRoutePath(routeCtx,metrics.pts,'rgba(230,218,182,.35)',2,[5,7]);
    const current = pointAt(metrics,routeProgress), travelled=[];
    for(let i=0;i<=current.seg;i++) travelled.push(metrics.pts[i]);travelled.push([current.x,current.y]);drawRoutePath(routeCtx,travelled,'#d7aa55',3);
    stops.forEach((stop,i)=>{const reached=stop.distance<=metrics.total*routeProgress+.5,p=stop.point;routeCtx.beginPath();routeCtx.arc(p[0],p[1],reached?4:2.5,0,Math.PI*2);routeCtx.fillStyle=reached?'#f0d58f':'rgba(238,226,192,.5)';routeCtx.fill();if(reached||i===stops.length-1){routeCtx.fillStyle=reached?'#f4ead3':'#9bada9';routeCtx.font=`${Math.max(9,w*.0105)}px "Ouyang Xun","KaiTi",serif`;routeCtx.fillText(ports[stop.id].n,p[0]+7,p[1]-7)}});
    voyage.properties.events.forEach(id=>{const stop=stops.find(s=>s.id===id);if(!stop)return;const p=stop.point;routeCtx.beginPath();routeCtx.arc(p[0],p[1],9,0,Math.PI*2);routeCtx.strokeStyle='#c84433';routeCtx.lineWidth=2;routeCtx.stroke()});
    drawJunk(routeCtx,current.x,current.y,Math.max(.48,w/1200),performance.now()*.0004);
    const passed=stops.filter(stop=>stop.distance<=metrics.total*routeProgress+.5);const currentPort=ports[(passed.at(-1)||stops[0]).id];qs('#route-place').textContent=currentPort.n;qs('#route-sea').textContent=currentPort.s;
  }
  function setVoyage(index) {
    activeVoyage=Number(index);routeProgress=0;routeSlider.value=0;routeAnimating=false;routePlay.classList.remove('playing');routePlay.textContent='▶ 放洋';
    const v=voyages[activeVoyage].properties;qs('#voyage-year').textContent=v.years;qs('#voyage-title').textContent=v.title;qs('#voyage-copy').textContent=v.copy;qs('#voyage-reach').innerHTML=`最远抵达<br><em>${v.reach}</em>`;qs('#route-reading').textContent=`第${['一','二','三','四','五','六','七'][activeVoyage]}次 · ${v.date}`;qs('#route-end').textContent=v.reach;
    qsa('.voyage-tabs button').forEach(b=>b.classList.toggle('active',Number(b.dataset.voyage)===activeVoyage));drawRoute();
  }
  function routeFrame(time) {
    if(!routeAnimating)return;if(!routeLast)routeLast=time;routeProgress=Math.min(1,routeProgress+(time-routeLast)/10500);routeLast=time;routeSlider.value=Math.round(routeProgress*1000);drawRoute();
    if(routeProgress>=1){routeAnimating=false;routePlay.classList.remove('playing');routePlay.textContent='↺ 再看一遍';routeLast=0;return}routeRaf=requestAnimationFrame(routeFrame);
  }
  routeSlider.addEventListener('input',e=>{routeAnimating=false;routePlay.classList.remove('playing');routePlay.textContent='▶ 放洋';routeProgress=Number(e.target.value)/1000;drawRoute()});
  routePlay.addEventListener('click',()=>{if(routeAnimating){routeAnimating=false;cancelAnimationFrame(routeRaf);routePlay.classList.remove('playing');routePlay.textContent='▶ 继续';return}if(routeProgress>=1)routeProgress=0;routeAnimating=true;routeLast=0;routePlay.classList.add('playing');routePlay.textContent='Ⅱ 暂停';routeRaf=requestAnimationFrame(routeFrame)});
  qsa('.voyage-tabs button').forEach(b=>b.addEventListener('click',()=>setVoyage(b.dataset.voyage)));
  addEventListener('resize',routeCanvasSize);routeCanvasSize();setVoyage(0);

  qsa('.people-dots').forEach(group => {
    const amount = Number(group.dataset.dots);
    for (let i = 0; i < amount; i++) {
      const dot = document.createElement('i');dot.style.animationDelay = `${i * .006}s`;group.append(dot);
    }
  });

  const formationData = {
    zheng: {
      center: '宝船', nodes: ['马船', '粮船', '坐船', '战船', '水船'],
      kicker: '多船协同', title: '远航所需的一切，都要装进舰队',
      text: '旗舰与大型宝船之外，还需要运马、载粮、供水、作战与传令的船只。规模首先意味着组织：怎样编队、补给、通信，并让近三万人横越季风海域。'
    },
    modern: {
      center: '航空母舰', nodes: ['舰载机联队', '巡洋舰', '驱逐舰 × 2', '攻击核潜艇', '补给舰'],
      kicker: '能力集中', title: '一座海上机场，由多层力量守护',
      text: '航母提供航空力量，巡洋舰与驱逐舰承担防空、反潜与打击，潜艇在水下警戒，补给舰延长部署时间。平台较少，但传感器、武器与通信高度集中。'
    }
  };
  const nodeNotes = {
    '宝船':'大型宝船承担指挥、使团活动与贵重货物运输，是舰队最壮观的核心。','马船':'用于载运马匹及部分货物，船体需要兼顾通风与稳定。','粮船':'把成千上万人的粮食装进远洋系统。','坐船':'人员乘坐与日常生活所需的船只。','战船':'承担护航与武装行动。','水船':'淡水是远洋人数规模的硬约束。',
    '航空母舰':'333 米长的福特级航母是一座移动机场，也是战斗群核心。','舰载机联队':'把侦察、制空、打击、预警与运输能力带到海上。','巡洋舰':'承担区域防空与指挥等任务；具体编成正随舰艇退役而变化。','驱逐舰 × 2':'为航母提供防空、反潜和水面作战护卫。','攻击核潜艇':'在水下执行侦察、反潜与打击。','补给舰':'把燃油、弹药、食品和备件送到海上。'
  };
  function renderFormation(mode) {
    const data = formationData[mode], map = qs('#formation-map');map.replaceChildren();
    const all = [data.center, ...data.nodes];
    all.forEach((name, i) => {
      const b = document.createElement('button');b.className = `formation-node ${i === 0 ? 'center active' : ''}`;b.textContent = name;
      if (i === 0) { b.style.left = 'calc(50% - 56px)'; b.style.top = 'calc(50% - 56px)'; }
      else { const a = -Math.PI / 2 + (i - 1) * Math.PI * 2 / data.nodes.length;b.style.left = `calc(50% + ${Math.cos(a) * 34}% - 43px)`;b.style.top = `calc(50% + ${Math.sin(a) * 34}% - 43px)`; }
      b.addEventListener('click', () => { qsa('.formation-node', map).forEach(n => n.classList.remove('active'));b.classList.add('active');qs('#formation-title').textContent = name;qs('#formation-text').textContent = nodeNotes[name]; });
      map.append(b);
    });
    qs('#formation-kicker').textContent = data.kicker;qs('#formation-title').textContent = data.title;qs('#formation-text').textContent = data.text;
    qsa('.formation-switch button').forEach(b => b.classList.toggle('active', b.dataset.system === mode));
  }
  qsa('.formation-switch button').forEach(b => b.addEventListener('click', () => renderFormation(b.dataset.system)));
  renderFormation('zheng');
})();
