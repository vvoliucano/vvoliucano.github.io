const seasonData = [
  { name: "孟春", rotation: 0, copy: "斗柄东指，天下皆春。" },
  { name: "仲春", rotation: 28, copy: "北斗与节气一道，把农时推向播种。" },
  { name: "季春", rotation: 55, copy: "春尽之前，历法需要继续锁定太阳尺度。" },
  { name: "孟夏", rotation: 82, copy: "斗柄南指，进入夏季，授时开始服务田间秩序。" },
  { name: "仲夏", rotation: 110, copy: "昼长夜短，观象与农事判断相互印证。" },
  { name: "季夏", rotation: 138, copy: "盛夏之后，节令与月相的协调更显重要。" },
  { name: "孟秋", rotation: 166, copy: "斗柄西指，进入收成时令，天文直接连着人间节律。" },
  { name: "仲秋", rotation: 194, copy: "节气既是天文刻度，也是社会共同时间。" },
  { name: "季秋", rotation: 221, copy: "秋尽将寒，历法精度关系到冬至与来岁安排。" },
  { name: "孟冬", rotation: 248, copy: "斗柄北指，冬令到来，祭祀与岁时制度同样需要授时。" },
  { name: "仲冬", rotation: 277, copy: "围绕冬至的观测，是中国古代天文学的关键任务之一。" },
  { name: "季冬", rotation: 305, copy: "岁末将尽，新的历法循环即将重新开始。" },
];

const cosmosData = {
  gaitian: {
    era: "先秦以来长期流传的直观模型",
    title: "盖天说",
    description: "天像一口覆盖在地上的大盖，地被理解为相对平展的承载面。它直观、容易想象，也较容易描述太阳在天上的出没与回旋。",
    quote: "“天圆如张盖，地方如棋局。”",
    citation: "后世常见概括",
    people: ["《周髀算经》", "天圆地方", "直观解释", "早期优势"],
    conclusion: "优点在于直观；局限在于面对更复杂的周天运转与食现象时，解释力逐渐不足。",
    mode: "gaitian",
  },
  huntian: {
    era: "汉以后影响最深的核心模型",
    title: "浑天说",
    description: "天像球壳包地于中，大地位于球形天空的中央附近。“如壳裹黄”描写的是球形天空包地于中的整体结构。",
    quote: "“天包地外，如壳裹黄。”",
    citation: "杨炯《浑天赋》",
    people: ["落下闳", "张衡", "杨炯", "浑仪"],
    conclusion: "关键意义在于：它第一次较稳定地建立了球形天空模型，从而深刻影响了观测、解释与仪器设计。",
    mode: "huntian",
  },
  xuanye: {
    era: "更开放、更接近无限空间的设想",
    title: "宣夜说",
    description: "宇宙被理解为无边的空间，星体漂浮其中，整体呈现出开放而辽阔的空间想象。这种想法在中国古代宇宙论中极具冲击力。",
    quote: "“天了无质，仰而瞻之，高远无极。”",
    citation: "宣夜传统概括",
    people: ["无限宇宙", "星体漂浮", "无天壳", "思想高潮"],
    conclusion: "它未成为主导观测体系，但在空间观念上非常激进，也因此常被视作古代中国最接近现代空间想象的模型。",
    mode: "xuanye",
  },
};

const earthData = [
  {
    step: "阶段一",
    name: "平展之地",
    description: "早期叙述更强调大地的平铺性、承载性与方向秩序，适合礼制与方位框架，但不足以支持更复杂的天体几何解释。",
    caption: "阶段一：地方如席，关注的是承载与方位。",
    floor: { left: "8%", right: "8%", bottom: "22%", height: "1rem", borderRadius: "999px" },
    horizon: { left: "10%", right: "10%", top: "18%", bottom: "15%", radius: "50%" },
  },
  {
    step: "阶段二",
    name: "有限之地",
    description: "在浑天语境中，大地进入了整体宇宙模型，也进入了关于范围、位置与曲率的讨论之中。这一步非常重要，因为“地”第一次真正被放进了整体结构里。",
    caption: "阶段二：大地被纳入整体宇宙模型。",
    floor: { left: "17%", right: "17%", bottom: "25%", height: "2.2rem", borderRadius: "999px" },
    horizon: { left: "12%", right: "12%", top: "16%", bottom: "14%", radius: "50%" },
  },
  {
    step: "阶段三",
    name: "弧面意识",
    description: "后世不少讨论已经触及地表弧度、地平弯曲以及大地整体形态的认识，相关思考持续进入宇宙观、历法与测量问题之中。",
    caption: "阶段三：地面开始呈现弧度意识，并进入更深入的形态讨论。",
    floor: { left: "18%", right: "18%", bottom: "26%", height: "7rem", borderRadius: "50% 50% 0 0 / 100% 100% 0 0" },
    horizon: { left: "14%", right: "14%", top: "14%", bottom: "12%", radius: "50%" },
  },
];

const measureData = [
  { distance: 351, north: 34.1, south: 33.1, delta: 1.0, shadow: 6, angle: 16, copy: "站距较近时，纬差较小，但已经足以显露“北极高度差对应地表距离”的思路。" },
  { distance: 430, north: 34.4, south: 33.2, delta: 1.2, shadow: 7, angle: 12, copy: "继续拉开站点，地面距离与北极高度差一起变得更可比较。" },
  { distance: 526, north: 34.7, south: 33.2, delta: 1.5, shadow: 8, angle: 8, copy: "把不同地点排成近似南北向的观测链，比较日影与北极高度差，就能估算子午线一度弧长。" },
  { distance: 612, north: 35.0, south: 33.3, delta: 1.7, shadow: 9, angle: 4, copy: "站点更远时，纬差累积更明显，大地测量的意义也更清楚。" },
  { distance: 703, north: 35.3, south: 33.4, delta: 1.9, shadow: 10, angle: -1, copy: "从“地有多大”转向“地可以怎样被分段测量”，是科学史上的关键跨越。" },
  { distance: 790, north: 35.6, south: 33.5, delta: 2.1, shadow: 11, angle: -5, copy: "测量尺度一旦被稳定下来，宇宙论就开始进入可验证的数量关系。" },
];

const instrumentData = {
  huny: {
    type: "测天体坐标",
    title: "浑仪",
    description: "用多重圆环对应赤道、黄道与子午圈，把天球坐标直接做成能转动的测量装置。它体现的是“如何在天空中定位”的问题。",
    points: ["赤道装置", "黄道演化", "观测定位", "张衡传统"],
    conclusion: "浑仪的意义，在于把抽象天球坐标转成可以操作的刻度系统。",
    extra: "坐标环",
    core: "天",
    style: {
      a: "13%",
      b: "24%",
      c: "35%",
      color: "rgba(164,108,59,0.78)",
    },
  },
  hunx: {
    type: "机械天球",
    title: "浑象",
    description: "浑象更强调“把天做出来”：星宿被安放在球体或球面结构上，随着机械装置转动，整个天体模型得以被看见。",
    points: ["星宿布置", "整体转动", "天球模型", "可视模拟"],
    conclusion: "浑象让人“看见宇宙如何转”，是模型可视化的重要一步。",
    extra: "旋转天球",
    core: "象",
    style: {
      a: "9%",
      b: "22%",
      c: "34%",
      color: "rgba(70,106,99,0.76)",
    },
  },
  shuiyun: {
    type: "自动报时机械台",
    title: "水运仪象台",
    description: "苏颂将浑仪、浑象、漏刻与机械报时整合成一座大型装置。宇宙模型、时间制度与机械传动在这里真正合而为一。",
    points: ["苏颂", "漏刻驱动", "自动报时", "综合天文台"],
    conclusion: "它最震撼的地方，在于把“天象 - 时间 - 机械”做成了一整套系统。",
    extra: "报时楼阁",
    core: "台",
    style: {
      a: "18%",
      b: "30%",
      c: "42%",
      color: "rgba(152,55,47,0.74)",
    },
  },
};

const evolutionData = [
  {
    era: "宇宙模型的早期竞争",
    name: "盖天",
    description: "用覆盖式天空解释日行与昼夜，是一种直观而可操作的早期模型，但后来越来越难处理更复杂的天象。",
    tags: ["直观模型", "解释太阳运动", "局限逐渐显现"],
  },
  {
    era: "球形天空的建立",
    name: "浑天",
    description: "浑天说把天空真正做成球体，给后续的观测坐标与仪器设计提供了坚实框架。",
    tags: ["球形天空", "张衡传统", "影响浑仪"],
  },
  {
    era: "空间想象的突破",
    name: "宣夜",
    description: "宣夜说把宇宙理解为无边空间，星体漂浮其中，思想上极具开放性与冲击力。",
    tags: ["无限宇宙", "无天壳", "思想高潮"],
  },
  {
    era: "授时成为国家技术",
    name: "历法",
    description: "从冬至推算到闰月安排，中国古代天文长期围绕“怎样让时间服务社会秩序”展开。",
    tags: ["观象授时", "统一时间", "王朝历法"],
  },
  {
    era: "宇宙进入数量关系",
    name: "测量",
    description: "圭表、漏刻、北极高度与子午线弧长，让天地第一次作为可比较、可估算的对象出现。",
    tags: ["日影", "纬度", "子午线实测"],
  },
  {
    era: "理论进入器物系统",
    name: "仪器",
    description: "浑仪、浑象、水运仪象台把宇宙模型、观测操作和机械结构联成一体。",
    tags: ["浑仪", "浑象", "水运仪象台"],
  },
  {
    era: "现代天问的延续",
    name: "现代",
    description: "北斗导航、FAST、天宫与嫦娥延续着同一个古老问题：我们身处怎样的宇宙？",
    tags: ["北斗导航", "FAST", "天宫", "嫦娥"],
  },
];

function setSeason(index) {
  const data = seasonData[index];
  const seasonName = document.querySelector("#season-name");
  const seasonCopy = document.querySelector("#season-copy");
  const dipperRing = document.querySelector("#dipper-ring");

  seasonName.textContent = data.name;
  seasonCopy.textContent = data.copy;
  dipperRing.style.transform = `rotate(${data.rotation}deg)`;
}

function setCosmos(mode) {
  const data = cosmosData[mode];
  const visual = document.querySelector("#cosmos-visual");
  const shell = visual.querySelector(".cosmos-shell");
  const earth = visual.querySelector(".cosmos-earth");
  const sun = document.querySelector("#cosmos-sun");
  const top = document.querySelector("#visual-top");
  const bottom = document.querySelector("#visual-bottom");

  document.querySelector("#cosmos-era").textContent = data.era;
  document.querySelector("#cosmos-title").textContent = data.title;
  document.querySelector("#cosmos-description").textContent = data.description;
  document.querySelector("#cosmos-quote").innerHTML = `${data.quote}<cite>${data.citation}</cite>`;
  document.querySelector("#cosmos-conclusion").textContent = data.conclusion;
  document.querySelector("#cosmos-people").innerHTML = data.people.map((item) => `<span>${item}</span>`).join("");
  visual.dataset.mode = data.mode;

  if (mode === "gaitian") {
    shell.style.left = "10%";
    shell.style.right = "10%";
    shell.style.top = "16%";
    shell.style.bottom = "34%";
    shell.style.borderRadius = "50% 50% 0 0 / 100% 100% 0 0";
    shell.style.borderWidth = "2px 2px 0 2px";
    earth.style.left = "18%";
    earth.style.right = "18%";
    earth.style.top = "68%";
    earth.style.bottom = "18%";
    earth.style.borderRadius = "999px";
    sun.style.top = "38%";
    sun.style.left = "72%";
    top.textContent = "天如覆盖";
    bottom.textContent = "地承其下";
  } else if (mode === "huntian") {
    shell.style.left = "10%";
    shell.style.right = "10%";
    shell.style.top = "14%";
    shell.style.bottom = "14%";
    shell.style.borderRadius = "50%";
    shell.style.borderWidth = "2px";
    earth.style.left = "37%";
    earth.style.right = "37%";
    earth.style.top = "37%";
    earth.style.bottom = "37%";
    earth.style.borderRadius = "50%";
    sun.style.top = "46%";
    sun.style.left = "74%";
    top.textContent = "天包地外";
    bottom.textContent = "地居其中";
  } else {
    shell.style.left = "8%";
    shell.style.right = "8%";
    shell.style.top = "8%";
    shell.style.bottom = "8%";
    shell.style.borderRadius = "0";
    shell.style.borderWidth = "1px";
    earth.style.left = "44%";
    earth.style.right = "44%";
    earth.style.top = "48%";
    earth.style.bottom = "48%";
    earth.style.borderRadius = "50%";
    sun.style.top = "24%";
    sun.style.left = "23%";
    top.textContent = "天了无质";
    bottom.textContent = "星浮空中";
  }

  document.querySelectorAll(".mode-tab").forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function setEarthStage(index) {
  const data = earthData[index];
  const floor = document.querySelector("#earth-floor");
  const horizon = document.querySelector("#earth-horizon");

  document.querySelector("#earth-step").textContent = data.step;
  document.querySelector("#earth-name").textContent = data.name;
  document.querySelector("#earth-description").textContent = data.description;
  document.querySelector("#earth-caption").textContent = data.caption;

  Object.assign(floor.style, {
    left: data.floor.left,
    right: data.floor.right,
    bottom: data.floor.bottom,
    height: data.floor.height,
    borderRadius: data.floor.borderRadius,
  });
  Object.assign(horizon.style, {
    left: data.horizon.left,
    right: data.horizon.right,
    top: data.horizon.top,
    bottom: data.horizon.bottom,
    borderRadius: data.horizon.radius,
  });
}

function setMeasure(index) {
  const data = measureData[index];
  const shadow = document.querySelector("#shadow-line");

  document.querySelector("#distance-reading").textContent = `两站相距 ${data.distance} 里`;
  document.querySelector("#north-lat").textContent = `${data.north.toFixed(1)}°`;
  document.querySelector("#south-lat").textContent = `${data.south.toFixed(1)}°`;
  document.querySelector("#arc-note").textContent = `北极高度差 ${data.delta.toFixed(1)}°`;
  document.querySelector("#shadow-reading").textContent = `影长 ${data.shadow} 尺`;
  document.querySelector("#measure-copy").textContent = data.copy;

  shadow.style.width = `${22 + index * 6}%`;
  shadow.style.transform = `rotate(${data.angle}deg)`;
}

function setInstrument(key) {
  const data = instrumentData[key];
  const visual = document.querySelector("#instrument-visual");
  const rings = visual.querySelectorAll(".ring");

  document.querySelector("#instrument-type").textContent = data.type;
  document.querySelector("#instrument-title").textContent = data.title;
  document.querySelector("#instrument-description").textContent = data.description;
  document.querySelector("#instrument-conclusion").textContent = data.conclusion;
  document.querySelector("#instrument-extra").textContent = data.extra;
  visual.querySelector(".instrument-core").textContent = data.core;
  document.querySelector("#instrument-points").innerHTML = data.points.map((item) => `<span>${item}</span>`).join("");

  rings[0].style.inset = data.style.a;
  rings[1].style.inset = data.style.b;
  rings[2].style.inset = data.style.c;
  rings.forEach((ring) => {
    ring.style.borderColor = data.style.color;
  });

  if (key === "shuiyun") {
    rings[1].style.borderRadius = "1.2rem";
    rings[2].style.borderRadius = "0";
  } else if (key === "hunx") {
    rings[1].style.borderRadius = "50%";
    rings[2].style.borderRadius = "50%";
  } else {
    rings[1].style.borderRadius = "50%";
    rings[2].style.borderRadius = "50%";
  }

  document.querySelectorAll(".instrument-tab").forEach((button) => {
    const isActive = button.dataset.instrument === key;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function setEvolution(index) {
  const data = evolutionData[index];
  document.querySelector("#evolution-era").textContent = data.era;
  document.querySelector("#evolution-name").textContent = data.name;
  document.querySelector("#evolution-description").textContent = data.description;
  document.querySelector("#modern-grid").innerHTML = data.tags.map((item) => `<span>${item}</span>`).join("");

  document.querySelectorAll(".evolution-node").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.evolution) === index);
  });
}

function setProgress() {
  const progressBar = document.querySelector(".progress-bar");
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

document.addEventListener("DOMContentLoaded", () => {
  const seasonSlider = document.querySelector("#season-slider");
  const earthSlider = document.querySelector("#earth-slider");
  const measureSlider = document.querySelector("#measure-slider");

  setSeason(Number(seasonSlider.value));
  setCosmos("huntian");
  setEarthStage(Number(earthSlider.value));
  setMeasure(Number(measureSlider.value));
  setInstrument("huny");
  setEvolution(0);
  setProgress();

  seasonSlider.addEventListener("input", (event) => {
    setSeason(Number(event.target.value));
  });

  earthSlider.addEventListener("input", (event) => {
    setEarthStage(Number(event.target.value));
  });

  measureSlider.addEventListener("input", (event) => {
    setMeasure(Number(event.target.value));
  });

  document.querySelectorAll(".mode-tab").forEach((button) => {
    button.addEventListener("click", () => {
      setCosmos(button.dataset.mode);
    });
  });

  document.querySelectorAll(".instrument-tab").forEach((button) => {
    button.addEventListener("click", () => {
      setInstrument(button.dataset.instrument);
    });
  });

  document.querySelectorAll(".evolution-node").forEach((button) => {
    button.addEventListener("click", () => {
      setEvolution(Number(button.dataset.evolution));
    });
  });

  window.addEventListener("scroll", setProgress, { passive: true });
  window.addEventListener("resize", setProgress);
});
