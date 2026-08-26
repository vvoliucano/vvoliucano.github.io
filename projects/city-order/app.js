(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const progress = $(".progress-bar");
  const updateProgress = () => {
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${distance > 0 ? (scrollY / distance) * 100 : 0}%`;
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Hero: one gesture states the whole essay—order first, then circulation.
  const heroSlider = $("#hero-slider");
  const heroCity = $("#hero-city");
  const heroStates = [
    [22, "理想秩序", "城墙、宫城、轴线与功能分区各居其位。"],
    [48, "人口进入", "点状的人流开始连接原本分开的空间。"],
    [74, "河运生长", "水路与桥梁带来一条不服从中轴的横向中心。"],
    [101, "生活改写城市", "街市、夜行与历史叠加，让蓝图变成真正的城市。"],
  ];
  const crowd = $(".hero-crowd");
  for (let i = 0; i < 46; i += 1) {
    const person = document.createElement("i");
    person.style.left = `${12 + ((i * 37) % 76)}%`;
    person.style.top = `${10 + ((i * 53) % 80)}%`;
    person.style.animationDelay = `${-(i % 9) * 0.31}s`;
    person.style.setProperty("--person-color", i % 5 === 0 ? "#d86d53" : i % 3 === 0 ? "#82b3ae" : "#f0d394");
    crowd.appendChild(person);
  }
  function setHeroLife() {
    const value = Number(heroSlider.value);
    heroCity.dataset.life = value > 42 ? "high" : "low";
    heroCity.style.setProperty("--life", value / 100);
    const state = heroStates.find(([limit]) => value < limit) || heroStates.at(-1);
    $("#hero-state").textContent = state[1];
    $("#hero-note").textContent = state[2];
    crowd.style.opacity = Math.max(0, (value - 22) / 78);
    $(".hero-river").style.opacity = Math.max(0, (value - 35) / 65) * 0.72;
  }
  heroSlider.addEventListener("input", setHeroLife);
  setHeroLife();

  // Ideal capital builder. There is no "wrong" flash: each displacement opens a political reading.
  const pieceNames = { palace: "宫", court: "朝", market: "市", ancestor: "祖", soil: "社" };
  const pieceLabels = { palace: "王宫", court: "朝廷", market: "市场", ancestor: "祖庙", soil: "社稷" };
  const idealCells = { palace: 12, court: 17, market: 7, ancestor: 13, soil: 11 };
  const placements = { ...idealCells };
  let selectedPiece = "palace";
  const plan = $("#ideal-plan");
  for (let index = 0; index < 25; index += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "plan-cell";
    cell.dataset.index = index;
    cell.setAttribute("aria-label", `王城第 ${index + 1} 格`);
    plan.appendChild(cell);
  }
  const planPeople = document.createElement("div");
  planPeople.className = "plan-people";
  planPeople.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 18; index += 1) {
    const person = document.createElement("i");
    person.style.setProperty("--px", `${42 + ((index * 17) % 21)}%`);
    person.style.setProperty("--py", `${30 + ((index * 29) % 58)}%`);
    person.style.animationDelay = `${-(index % 7) * .27}s`;
    planPeople.appendChild(person);
  }
  plan.appendChild(planPeople);
  const placementReading = (piece, index) => {
    if (idealCells[piece] === index) {
      const copies = {
        palace: ["中心已经确立", "王宫居中，使君主在空间上成为全城秩序的原点。"],
        court: ["面朝：仪式在前", "君主面南，朝廷置于宫前；接近宫城的路径也成为接近权力的路径。"],
        market: ["后市：交易在后", "市场位于宫后，政治仪式与经济活动获得不同的位置。"],
        ancestor: ["左祖：祖先得位", "面南而观，左手为东；祖庙被安置在宫城之左。"],
        soil: ["右社：土地得位", "面南而观，右手为西；社稷与宗庙共同夹护政治中心。"],
      };
      return copies[piece];
    }
    const row = Math.floor(index / 5), col = index % 5;
    const direction = row < 2 ? "北部" : row > 2 ? "南部" : col < 2 ? "西侧" : col > 2 ? "东侧" : "中心";
    const questions = {
      palace: `王宫落在${direction}，城市不再围绕几何中心展开：仪式道路与防卫体系会怎样偏转？`,
      court: `朝廷落在${direction}，官员接近君主的仪式路径被改变：权力还会沿同一条轴线被看见吗？`,
      market: `市场落在${direction}，交易与仪式更靠近：喧闹、人流与权力中心会形成怎样的新关系？`,
      ancestor: `祖庙落在${direction}，祖先祭祀离开“左祖”的对位：宗法秩序在城中的可见性随之改变。`,
      soil: `社稷落在${direction}，土地与国家的象征离开“右社”的对位：宫城两侧不再彼此平衡。`,
    };
    return ["蓝图被改写", questions[piece]];
  };
  function renderPlan() {
    $$(".plan-cell", plan).forEach((cell) => {
      cell.innerHTML = "";
      cell.classList.remove("has-ideal-ghost");
      cell.setAttribute("aria-label", `王城第 ${Number(cell.dataset.index) + 1} 格`);
    });
    Object.entries(placements).forEach(([piece, index]) => {
      const mark = document.createElement("span");
      mark.className = "placed-mark";
      mark.dataset.piece = piece;
      const relationLabels = { palace: "王者居中", court: "面朝 · 南", market: "后市 · 北", ancestor: "左祖 · 东", soil: "右社 · 西" };
      mark.innerHTML = `<b>${pieceNames[piece]}</b><small>${relationLabels[piece]}</small>`;
      mark.title = pieceLabels[piece];
      $(`.plan-cell[data-index="${index}"]`, plan).appendChild(mark);
    });
    if (placements[selectedPiece] !== idealCells[selectedPiece]) {
      const targetCell = $(`.plan-cell[data-index="${idealCells[selectedPiece]}"]`, plan);
      const ghost = document.createElement("span");
      const relationLabels = { palace: "居中", court: "宫前 · 南", market: "宫后 · 北", ancestor: "左祖 · 东", soil: "右社 · 西" };
      ghost.className = "ideal-ghost";
      ghost.dataset.ghostPiece = selectedPiece;
      ghost.setAttribute("aria-hidden", "true");
      ghost.innerHTML = `<b>${pieceNames[selectedPiece]}</b><small>理想位置<br>${relationLabels[selectedPiece]}</small>`;
      targetCell.classList.add("has-ideal-ghost");
      targetCell.setAttribute("aria-label", `${targetCell.getAttribute("aria-label")}；${pieceLabels[selectedPiece]}的理想位置`);
      targetCell.appendChild(ghost);
    }
    const score = Object.entries(placements).filter(([piece, index]) => idealCells[piece] === index).length;
    $("#relation-score").textContent = `${score} / 5`;
    if (score === 5) {
      $("#build-kicker").textContent = "理想王城范式完成";
      $("#build-title").textContent = "各得其位，也各受其限";
      $("#build-copy").textContent = "中心、朝向与对称让权力变得清晰；与此同时，它们也规定了谁更接近中心、什么活动应该被放远。";
    }
  }
  $$(".city-piece").forEach((button) => button.addEventListener("click", () => {
    selectedPiece = button.dataset.piece;
    $$(".city-piece").forEach((item) => { item.classList.toggle("is-selected", item === button); item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
    renderPlan();
    $("#build-kicker").textContent = `已选 · ${pieceNames[selectedPiece]}`;
    $("#build-title").textContent = `安放${pieceLabels[selectedPiece]}`;
    $("#build-copy").textContent = "点击城中任意一格。这里不判对错，而是观察位置怎样改变空间中的政治关系。";
  }));
  plan.addEventListener("click", (event) => {
    const cell = event.target.closest(".plan-cell");
    if (!cell) return;
    const index = Number(cell.dataset.index);
    Object.keys(placements).forEach((piece) => { if (placements[piece] === index) delete placements[piece]; });
    placements[selectedPiece] = index;
    const [title, copy] = placementReading(selectedPiece, index);
    $("#build-kicker").textContent = `${pieceLabels[selectedPiece]} · 已落位`;
    $("#build-title").textContent = title;
    $("#build-copy").textContent = copy;
    renderPlan();
  });
  $("#reset-plan").addEventListener("click", () => {
    Object.keys(placements).forEach((piece) => delete placements[piece]);
    $("#build-kicker").textContent = "营城重新开始";
    $("#build-title").textContent = "先决定谁处于中心";
    $("#build-copy").textContent = "选择一枚印，再把它安放到王城之中。";
    renderPlan();
  });
  $("#ideal-plan-demo").addEventListener("click", () => {
    Object.keys(placements).forEach((piece) => delete placements[piece]);
    const order = ["palace", "court", "market", "ancestor", "soil"];
    order.forEach((piece, index) => {
      setTimeout(() => {
        placements[piece] = idealCells[piece];
        renderPlan();
        $("#build-kicker").textContent = `${pieceNames[piece]} · ${piece === "ancestor" ? "面南之左在东" : piece === "soil" ? "面南之右在西" : "依次落位"}`;
        $("#build-title").textContent = index < 3 ? "中心与前后已经建立" : piece === "ancestor" ? "左祖：祖庙落在东侧" : "右社：社稷落在西侧";
        $("#build-copy").textContent = piece === "ancestor" ? "请站到君主的位置、面向南方：你的左手指向地图的东侧，因此祖庙在画面右边。" : piece === "soil" ? "同样面向南方，你的右手指向地图的西侧，因此社稷在画面左边。" : "王宫居中，朝在宫前，市在宫后；空间先把仪式、交易与权力分开。";
      }, index * 260);
    });
  });
  $("#people-plan").addEventListener("click", (event) => {
    const active = !plan.classList.contains("has-people");
    plan.classList.toggle("has-people", active);
    event.currentTarget.setAttribute("aria-pressed", active ? "true" : "false");
    event.currentTarget.textContent = active ? "让人暂时离开" : "让人进入城市";
    $("#build-kicker").textContent = active ? "真实的人进入蓝图" : "人群已经离开";
    $("#build-title").textContent = active ? "同一座城，不同的接近权" : "蓝图再次变得安静";
    $("#build-copy").textContent = active ? "官员趋向朝廷，交易者聚向市场，祭祀者前往祖庙与社稷。功能位置也在分配人的路线。" : "没有人的时候，城图只剩对称与边界；城市秩序要在人移动时才真正显现。";
  });
  renderPlan();

  // Chang'an: access changes with both the clock and the person.
  const map = $("#chang-an-map");
  for (let i = 0; i < 34; i += 1) {
    const ward = document.createElement("div");
    ward.className = "ward";
    ward.dataset.ward = i;
    ward.textContent = `第${i + 1}坊`;
    if (i === 2) { ward.classList.add("palace"); ward.textContent = "皇城"; }
    if (i === 22 || i === 27) { ward.classList.add("market"); ward.textContent = i === 22 ? "西市" : "东市"; }
    map.appendChild(ward);
  }
  const changAnPeople = document.createElement("div");
  changAnPeople.className = "chang-an-people";
  changAnPeople.setAttribute("aria-hidden", "true");
  map.appendChild(changAnPeople);
  const roleData = {
    official: { title: "官员 · 沿朱雀大街趋向皇城", copy: "白日可沿主轴进入官署区；接近宫城的权利依然受身份与礼仪约束。", access: ["主街", "官署", "居坊", "皇城外朝"], wards: [2,3,8,9,14,15] },
    merchant: { title: "商人 · 在市与坊之间搬运货物", copy: "商业被集中于东西两市，但交易需求不断把人、货与信息推向沿街空间。", access: ["东西两市", "主街", "客舍", "居坊"], wards: [20,21,22,26,27,28] },
    monk: { title: "僧侣 · 寺院形成另一种网络", copy: "宗教空间嵌入多个里坊；仪式、旅行与香火让坊与坊之间保持联系。", access: ["寺院", "居坊", "主街", "市集"], wards: [5,10,17,24,31] },
    resident: { title: "居民 · 日常半径受坊门开合影响", copy: "白日可出坊办事；夜禁后，连续城市重新收缩为一个个封闭的生活单元。", access: ["本坊", "邻坊", "市集", "主街"], wards: [16,17,18,23] },
  };
  let currentRole = "official";
  function setRole(role) {
    currentRole = role;
    const data = roleData[role];
    $("#role-title").textContent = data.title;
    $("#role-copy").textContent = data.copy;
    $("#access-list").innerHTML = data.access.map((item, index) => `<span class="${index < 2 ? "yes" : ""}">${item}</span>`).join("");
    $$(".ward", map).forEach((ward) => ward.classList.toggle("is-accessible", data.wards.includes(Number(ward.dataset.ward))));
    $("#role-portrait").dataset.role = role;
    $("#role-portrait b").textContent = { official: "官", merchant: "商", monk: "僧", resident: "民" }[role];
    renderChangAnPeople();
  }
  $$(".role-tabs button").forEach((button) => button.addEventListener("click", () => {
    $$(".role-tabs button").forEach((item) => { item.classList.toggle("is-active", item === button); item.setAttribute("aria-selected", item === button ? "true" : "false"); });
    setRole(button.dataset.role);
    setTime();
  }));
  const timeSlider = $("#time-slider");
  const crowdSlider = $("#crowd-slider");
  const hourNames = ["子","丑","丑","寅","寅","卯","卯","辰","辰","巳","巳","午","午","未","未","申","申","酉","酉","戌","戌","亥","亥","子","子"];
  function setTime() {
    const hour = Number(timeSlider.value);
    const open = hour >= 6 && hour < 20;
    const dusk = hour >= 18 && hour < 20;
    map.classList.toggle("is-closed", !open);
    $("#clock-reading").textContent = `${hourNames[hour]}时 · ${open ? (dusk ? "暮鼓将响" : "坊门开启") : "坊门关闭"}`;
    $("#city-status").textContent = open ? (dusk ? "归坊" : "通行") : "夜禁";
    $("#time-finding").textContent = open ? (dusk ? "鼓声催促行人归坊，连续的城市即将收拢。" : "白日的街道把坊、市与皇城连接起来。") : `夜间，${roleData[currentRole].title.split(" · ")[0]}的活动半径被坊墙重新限定。`;
    renderChangAnPeople();
  }
  function renderChangAnPeople() {
    if (!crowdSlider) return;
    const requested = Number(crowdSlider.value);
    const hour = Number(timeSlider.value);
    const open = hour >= 6 && hour < 20;
    const visible = open ? requested : Math.min(4, requested);
    changAnPeople.innerHTML = "";
    const roles = [currentRole, "merchant", "resident", "monk"];
    for (let index = 0; index < visible; index += 1) {
      const person = document.createElement("i");
      const role = roles[index % roles.length];
      person.dataset.role = role;
      person.classList.toggle("is-focus", index === 0);
      const lane = index % 3;
      const x = open ? 12 + ((index * 23 + lane * 11) % 76) : 17 + ((index * 19) % 58);
      const y = open ? 13 + ((index * 31) % 75) : 68 + ((index * 7) % 12);
      person.style.setProperty("--x", `${x}%`);
      person.style.setProperty("--y", `${y}%`);
      person.style.setProperty("--tx", `${((index % 5) - 2) * 22}px`);
      person.style.setProperty("--ty", `${((index % 4) - 1) * 17}px`);
      person.style.animationDelay = `${-(index % 9) * .34}s`;
      changAnPeople.appendChild(person);
    }
    $("#crowd-value").textContent = `${requested} 人`;
    $("#visible-people").textContent = visible;
    $(".people-count span").textContent = open ? "人正在街道与坊市之间移动" : "人仍可见，但已被收拢在各自坊内";
  }
  timeSlider.addEventListener("input", setTime);
  crowdSlider.addEventListener("input", renderChangAnPeople);
  setRole(currentRole); setTime();

  // Kaifeng: deterministic particles reveal where circulation creates new centres.
  const kCanvas = $("#kaifeng-canvas"), kctx = kCanvas.getContext("2d");
  const controls = ["people", "trade", "canal", "night"];
  const readFlow = () => Object.fromEntries(controls.map((name) => [name, Number($(`#${name}-slider`).value)]));
  const bianSegments = [
    [[20,352],[220,280],[330,410],[510,340]],
    [[510,340],[700,265],[780,415],[950,316]],
  ];
  const cubicValue = (a,b,c,d,t) => {
    const mt = 1 - t;
    return mt ** 3 * a + 3 * mt ** 2 * t * b + 3 * mt * t ** 2 * c + t ** 3 * d;
  };
  const cubicSlope = (a,b,c,d,t) => 3 * (1-t) ** 2 * (b-a) + 6 * (1-t) * t * (c-b) + 3 * t ** 2 * (d-c);
  function bianPoint(progress, offset = 0) {
    const wrapped = ((progress % 1) + 1) % 1;
    const segmentIndex = wrapped < .5 ? 0 : 1;
    const t = segmentIndex === 0 ? wrapped * 2 : (wrapped - .5) * 2;
    const [p0,p1,p2,p3] = bianSegments[segmentIndex];
    const x = cubicValue(p0[0],p1[0],p2[0],p3[0],t);
    const y = cubicValue(p0[1],p1[1],p2[1],p3[1],t);
    const dx = cubicSlope(p0[0],p1[0],p2[0],p3[0],t);
    const dy = cubicSlope(p0[1],p1[1],p2[1],p3[1],t);
    const length = Math.hypot(dx,dy) || 1;
    return { x: x - dy / length * offset, y: y + dx / length * offset, angle: Math.atan2(dy,dx) };
  }
  function traceBianRiver(ctx) {
    ctx.beginPath();
    ctx.moveTo(...bianSegments[0][0]);
    bianSegments.forEach(([,p1,p2,p3]) => ctx.bezierCurveTo(...p1,...p2,...p3));
  }
  function drawKaifeng(phase = 0) {
    const values = readFlow();
    controls.forEach((name) => { $(`#${name}-value`).textContent = values[name]; });
    const ctx = kctx, w = kCanvas.width, h = kCanvas.height;
    ctx.clearRect(0,0,w,h); ctx.fillStyle = "#172a2e"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = "rgba(228,216,190,.12)"; ctx.lineWidth = 1;
    for (let x=80;x<w;x+=90){ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,h-30);ctx.stroke()}
    for (let y=70;y<h;y+=75){ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(w-30,y);ctx.stroke()}
    ctx.strokeStyle = "rgba(167,62,48,.75)"; ctx.lineWidth = 18; ctx.beginPath();ctx.moveTo(472,30);ctx.lineTo(472,570);ctx.stroke();
    ctx.strokeStyle = "rgba(206,160,82,.75)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(472,30);ctx.lineTo(472,570);ctx.stroke();
    ctx.fillStyle="#a33e32";ctx.fillRect(386,52,172,86);ctx.fillStyle="#f0d397";ctx.font="25px Ouyang,serif";ctx.fillText("皇城",445,103);
    ctx.strokeStyle = `rgba(78,145,153,${.48 + values.canal/200})`;ctx.lineWidth = 30 + values.canal*.13;traceBianRiver(ctx);ctx.stroke();
    ctx.strokeStyle="rgba(176,218,214,.55)";ctx.lineWidth=2;traceBianRiver(ctx);ctx.stroke();
    const bridgeProgress = [.24,.5,.76];
    const bridgePoints = bridgeProgress.map((progress) => bianPoint(progress));
    bridgePoints.forEach(({x,y,angle},i)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/2);ctx.fillStyle="#c69a55";ctx.fillRect(-28,-5,56,10);ctx.restore();ctx.fillStyle="#e8d9b5";ctx.font="14px serif";ctx.fillText(`桥${["一","二","三"][i]}`,x-14,y-18)});
    const marketCount=Math.round(values.trade*.42);for(let i=0;i<marketCount;i+=1){const bridge=bridgePoints[i%3];const x=bridge.x+((i*41)%100-50),y=bridge.y+((i*67)%76-38);const radius=2+(values.trade/100)*3.5;ctx.fillStyle=`rgba(199,76,57,${.3+values.trade/180})`;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill()}
    const goods=Math.round(values.canal*.62);for(let i=0;i<goods;i+=1){const point=bianPoint(i/Math.max(1,goods)+phase*.92,((i%3)-1)*3.5);ctx.fillStyle="#79bdb9";ctx.fillRect(point.x-2,point.y-2,5,5)}
    const people=Math.round(values.people*.95);for(let i=0;i<people;i+=1){let x,y;if(i%3===0){x=472+((i*29)%42-21);y=145+((i*43+phase*130)%390)}else{const point=bianPoint(i/Math.max(1,people)+phase*1.08,((i%5)-2)*4.5);x=point.x;y=point.y}ctx.fillStyle=values.night>55?"#f5c879":"#ebdfc1";ctx.strokeStyle=ctx.fillStyle;ctx.globalAlpha=.52+values.night/250;if(i%4===0){ctx.beginPath();ctx.arc(x,y-4,2.7,0,Math.PI*2);ctx.fill();ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x,y-1);ctx.lineTo(x,y+7);ctx.stroke();ctx.beginPath();ctx.moveTo(x-4,y+2);ctx.lineTo(x+4,y+2);ctx.stroke()}else{ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill()}}ctx.globalAlpha=1;
    if(values.night>0){ctx.fillStyle=`rgba(245,183,83,${values.night/550})`;for(let i=0;i<24;i+=1){const x=80+(i*137)%820,y=75+(i*83)%460;ctx.beginPath();ctx.arc(x,y,8+values.night*.06,0,Math.PI*2);ctx.fill()}}
    ctx.fillStyle="rgba(238,225,195,.75)";ctx.font="16px Ouyang,serif";ctx.fillText("御街 · 政治秩序",493,215);ctx.fillText("汴河 · 经济流动",54,287);
    const total=values.people+values.trade+values.canal+values.night;
    $("#flow-state").textContent = total < 110 ? "礼制轴线仍主导城市" : total < 230 ? "桥梁与沿河街市成为新热点" : total < 330 ? "流动正在重写功能边界" : "城市中心已由多股网络共同塑造";
  }
  controls.forEach((name) => $(`#${name}-slider`).addEventListener("input", () => drawKaifeng())); drawKaifeng();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let lastFrame = 0;
    const animateFlow = (time) => {
      if (time - lastFrame > 55) { drawKaifeng((time / 9000) % 1); lastFrame = time; }
      requestAnimationFrame(animateFlow);
    };
    requestAnimationFrame(animateFlow);
  }

  // Suzhou: streets interpolate from straight grids to routes negotiated with water and history.
  const sCanvas=$("#suzhou-canvas"), sctx=sCanvas.getContext("2d"), terrainSlider=$("#terrain-slider");
  const lerp=(a,b,t)=>a+(b-a)*t;
  function drawSuzhou(){
    const value=Number(terrainSlider.value),t=value/100,ctx=sctx,w=sCanvas.width,h=sCanvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#14282b";ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=`rgba(102,177,181,${.12+.68*t})`;ctx.lineWidth=8+8*t;
    const rivers=[[[0,180],[190,130],[345,250],[520,185],[700,300],[900,235]],[[155,0],[210,140],[170,300],[270,430],[235,620]],[[675,0],[615,150],[715,285],[625,430],[690,620]]];
    rivers.forEach(points=>{ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length-1;i+=1){const mx=(points[i][0]+points[i+1][0])/2,my=(points[i][1]+points[i+1][1])/2;ctx.quadraticCurveTo(points[i][0],points[i][1],mx,my)}ctx.lineTo(points.at(-1)[0],points.at(-1)[1]);ctx.stroke()});
    const targetsX=[96,285,430,570,792],targetsY=[85,225,368,505];ctx.lineWidth=2;
    targetsX.forEach((targetX,i)=>{ctx.strokeStyle=`rgba(226,211,176,${.58+.25*(1-t)})`;ctx.beginPath();for(let y=45;y<=575;y+=18){const bend=Math.sin(y/83+i*1.4)*55*t+(i===1?-42*t:i===3?35*t:0);const x=lerp(100+i*170,targetX,t)+bend;if(y===45)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()});
    targetsY.forEach((targetY,i)=>{ctx.strokeStyle=`rgba(226,211,176,${.58+.25*(1-t)})`;ctx.beginPath();for(let x=40;x<=860;x+=18){const bend=Math.sin(x/96+i)*35*t+(i===2?28*t:0);const y=lerp(105+i*130,targetY,t)+bend;if(x===40)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()});
    const walls=[[80,65,805,510],[330,285,190,145]];walls.forEach(([x,y,ww,hh],i)=>{ctx.strokeStyle=`rgba(182,74,58,${i?Math.max(0,(t-.52)*1.8):.7})`;ctx.lineWidth=i?5:3;ctx.setLineDash(i?[7,8]:[]);ctx.strokeRect(x,y,ww,hh)});ctx.setLineDash([]);
    const bridges=[[195,160],[260,405],[644,212],[690,466],[510,200]];bridges.slice(0,Math.round(bridges.length*t)).forEach(([x,y])=>{ctx.fillStyle="#d6a65e";ctx.fillRect(x-15,y-4,30,8)});
    if(t>.65){ctx.fillStyle="rgba(196,78,59,.72)";for(let i=0;i<20;i+=1){const x=130+(i*109)%650,y=120+(i*67)%390;ctx.beginPath();ctx.arc(x,y,3+(i%3),0,Math.PI*2);ctx.fill()}}
    ctx.fillStyle="rgba(236,224,198,.8)";ctx.font="19px Ouyang,serif";ctx.fillText(t<.3?"网格先行":t<.7?"道路开始让水":"水陆双棋盘",55,42);
    $("#terrain-percent").textContent=`${value}% 现实约束`;
    const states=value<22?["理想方格","先画一张不受阻碍的网格","地势被假定为平整，街道可以等距展开，功能围绕中心排布。"]:value<46?["水系进入","河道切开笔直的蓝图","水带来运输，也要求道路寻找桥梁；原本均匀的网格出现弯折。"]:value<68?["工程协商","道路与排水共同找路","最短的直线未必最可行。街、河、桥开始组成新的出行网络。"]:value<86?["历史叠加","新城不得不绕开旧痕","旧城墙、寺院与聚落留下不可轻易抹去的空间记忆。"]:["生活成城","水陆双网共同塑造中心","临水街市与日常路径形成多处活跃节点；秩序来自网络，而不只来自中轴。"];
    $("#terrain-mode").textContent=states[0];$("#terrain-title").textContent=states[1];$("#terrain-copy").textContent=states[2];
    $$(".constraint-list div").forEach(item=>item.classList.toggle("is-active",value>=Number(item.dataset.threshold)));
  }
  terrainSlider.addEventListener("input",drawSuzhou);drawSuzhou();
})();
