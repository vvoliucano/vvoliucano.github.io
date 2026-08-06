(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const progress = $(".progress");
  addEventListener("scroll", () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${range ? scrollY / range * 100 : 0}%`;
  }, { passive: true });

  const zones = {
    glabella: {
      mark: "眉", title: "眉间 · 川字纹", action: "皱眉，松开；再皱眉。", slider: "反复皱眉的累积",
      lead: "一次皱眉，皮肤只是暂时折叠。许多年里反复收缩，动态纹才可能渐渐停留。",
      chain: [["表情","长期反复皱眉"],["肌肉","皱眉肌反复收缩"],["皮肤","同一处反复折叠"],["刻痕","动态纹可能逐渐固定"]],
      quote: "它更可能记录长期表情习惯，而不是决定一个人的性格或命运。"
    },
    crow: {
      mark: "笑", title: "眼角 · 鱼尾纹", action: "笑起来，眼睛也会笑。", slider: "笑与眯眼的累积",
      lead: "笑或眯眼时，眼轮匝肌收缩，眼角皮肤向外折叠。反复多年，放松时也可能看见细纹。",
      chain: [["表情","微笑、眯眼"],["肌肉","眼轮匝肌收缩"],["皮肤","眼角形成放射折叠"],["刻痕","鱼尾纹逐渐可见"]],
      quote: "有时候皱纹不只是衰老，也是人生留下的快乐。"
    },
    forehead: {
      mark: "额", title: "额头 · 抬头纹", action: "抬起眉毛，再放下来。", slider: "反复抬眉的累积",
      lead: "抬眉时，额肌把眉毛向上牵引，额头皮肤出现横向折叠。重复动作会让折痕越来越容易出现。",
      chain: [["表情","反复抬起眉毛"],["肌肉","额肌向上牵拉"],["皮肤","额头横向折叠"],["刻痕","抬头纹逐渐停留"]],
      quote: "一道横纹说明皮肤怎样被牵动，不说明一个人是否聪明或忧虑。"
    },
    underEye: {
      mark: "眼", title: "眼下 · 暗影", action: "少睡一晚，眼下先知道。", slider: "疲劳与其他因素的叠加",
      lead: "眼下暗影没有单一成因。睡眠、遗传、过敏、色素、血管、年龄与泪沟阴影，都可能参与。",
      chain: [["睡眠","疲劳使外观更明显"],["结构","薄皮肤、血管与泪沟"],["环境","过敏、揉眼与日晒"],["外观","暗影或浮肿显现"]],
      quote: "同一种外观，可以来自不同原因；一张脸不是一份诊断书。"
    },
    mouth: {
      mark: "口", title: "嘴角 · 表情纹", action: "笑、抿嘴、说话。", slider: "口周动作与时间的累积",
      lead: "嘴角每天参与说话、进食与表情。口周纹路也受年龄、日晒、吸烟和面部组织变化共同影响。",
      chain: [["动作","笑、抿嘴与说话"],["肌肉","口周肌肉反复牵拉"],["皮肤","折叠与支撑共同变化"],["刻痕","口周纹路变得明显"]],
      quote: "动作会留下痕迹，但痕迹无法还原一个人的全部生活。"
    }
  };

  const face = $("#main-face");
  const depth = $("#depth");
  let activeZone = "glabella";
  let userTouched = false;
  let demoTimer;

  function setExpression(zone, amount) {
    const left = $(".brow-left", face), right = $(".brow-right", face), mouth = $(".mouth", face);
    left.style.transform = right.style.transform = "";
    mouth.setAttribute("d", "M230 455Q300 489 370 455");
    if (zone === "glabella") {
      left.style.transform = `translate(${amount * 11}px,${amount * 5}px) rotate(${amount * 10}deg)`;
      right.style.transform = `translate(${-amount * 11}px,${amount * 5}px) rotate(${-amount * 10}deg)`;
    } else if (zone === "forehead") {
      left.style.transform = right.style.transform = `translateY(${-amount * 18}px)`;
    } else if (zone === "crow" || zone === "mouth") {
      mouth.setAttribute("d", `M230 455Q300 ${482 + amount * 34} 370 455`);
    }
  }

  function renderDepth() {
    const value = Number(depth.value);
    const intensity = Math.pow(value / 100, 1.25);
    ["forehead","glabella","crow","under-eye","mouth-lines"].forEach(key => face.style.setProperty(`--${key}`, "0"));
    const property = activeZone === "underEye" ? "under-eye" : activeZone === "mouth" ? "mouth-lines" : activeZone;
    face.style.setProperty(`--${property}`, intensity.toFixed(2));
    face.style.setProperty("--line-width", (0.8 + value / 100 * 2.7).toFixed(2));
    face.style.setProperty("--shadow-depth", (Math.pow(value / 100, 1.8) * .48).toFixed(2));
    $("#depth-output").textContent = `${value}%`;
    setExpression(activeZone, value / 100);
    $$(".age-line button").forEach(button => button.classList.toggle("active", Number(button.dataset.depth) === value));
  }

  function selectZone(zone, fromUser = false) {
    activeZone = zone;
    if (fromUser) {
      userTouched = true;
      clearInterval(demoTimer);
      $(".face-stage").classList.add("touched");
    }
    const data = zones[zone];
    $("#zone-mark").textContent = data.mark;
    $("#zone-title").textContent = data.title;
    $("#stage-action").textContent = data.action;
    $("#zone-lead").textContent = data.lead;
    $("#depth-label").textContent = data.slider;
    $("#zone-quote").textContent = data.quote;
    $("#cause-chain").innerHTML = data.chain.map(([a,b]) => `<li><b>${a}</b><span>${b}</span></li>`).join("");
    $$("[data-zone]").forEach(el => {
      const active = el.dataset.zone === zone;
      el.classList.toggle("active", active);
      if (el.tagName === "BUTTON") el.setAttribute("aria-pressed", String(active));
    });
    renderDepth();
  }

  $$("[data-zone]").forEach(el => {
    el.addEventListener("click", () => selectZone(el.dataset.zone, true));
    el.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectZone(el.dataset.zone, true); }
    });
  });
  depth.addEventListener("input", () => { userTouched = true; clearInterval(demoTimer); $(".face-stage").classList.add("touched"); renderDepth(); });
  $$(".age-line button").forEach(button => button.addEventListener("click", () => {
    depth.value = button.dataset.depth; userTouched = true; clearInterval(demoTimer); renderDepth();
  }));
  selectZone("glabella");
  let demoIndex = 0;
  const demoZones = ["glabella","crow","forehead"];
  demoTimer = setInterval(() => { if (!userTouched) selectZone(demoZones[++demoIndex % demoZones.length]); }, 3500);

  const habitInputs = ["sleep","stress","sun","smoke","smile"].map(id => $("#" + id));
  const habitFace = $("#habit-face");
  const setBar = (id, value) => $(id).style.width = `${clamp(value,0,100)}%`;
  function renderHabits() {
    const sleep = Number($("#sleep").value), stress = Number($("#stress").value), sun = Number($("#sun").value), smoke = Number($("#smoke").value), smile = Number($("#smile").value);
    $("#sleep-out").textContent = `${sleep.toFixed(1)} 小时`;
    [["stress",stress],["sun",sun],["smoke",smoke],["smile",smile]].forEach(([id,value]) => $("#"+id+"-out").textContent = `${value}%`);
    const recovery = clamp((8 - sleep) / 4 * 100 + stress * .18, 0, 100);
    const expression = clamp(stress * .48 + smile * .52,0,100);
    const exposure = clamp(sun * .67 + smoke * .55,0,100);
    const under = clamp(recovery / 100 * .78 + .08);
    const glabella = clamp(stress / 100 * .82 + .08);
    const crow = clamp(smile / 100 * .6 + sun / 100 * .32 + .08);
    const forehead = clamp(stress / 100 * .32 + sun / 100 * .38 + .08);
    const mouth = clamp(smoke / 100 * .65 + .08);
    habitFace.style.setProperty("--under-eye", under.toFixed(2));
    habitFace.style.setProperty("--glabella", glabella.toFixed(2));
    habitFace.style.setProperty("--crow", crow.toFixed(2));
    habitFace.style.setProperty("--forehead", forehead.toFixed(2));
    habitFace.style.setProperty("--mouth-lines", mouth.toFixed(2));
    habitFace.style.setProperty("--line-width", (1.2 + Math.max(recovery,expression,exposure) / 100 * 2.2).toFixed(2));
    habitFace.style.setProperty("--exposure", (exposure / 100 * .18).toFixed(2));
    habitFace.style.setProperty("--shadow-depth", (Math.max(recovery,expression,exposure) / 100 * .32).toFixed(2));
    setBar("#expression-bar",expression);setBar("#exposure-bar",exposure);setBar("#recovery-bar",recovery);
    const candidates = [
      {v:under,t:"眼下先记录了恢复不足",c:"睡眠不足可能让眼下暗影与浮肿更明显；遗传、过敏、年龄和面部结构也常常参与。"},
      {v:glabella,t:"眉间留下紧绷的折叠",c:"压力本身不会刻出一种固定的脸，但持续皱眉与眯眼，会让同一处皮肤反复折叠。"},
      {v:crow,t:"眼角留下笑过的痕迹",c:"微笑与眯眼会牵动眼轮匝肌。鱼尾纹也可以是表情留下的历史，不只是年龄数字。"},
      {v:exposure/100,t:"皮肤记录了环境暴露",c:"日晒会加速光老化；吸烟也与更早出现的皱纹和肤色变化有关。"}
    ].sort((a,b) => b.v-a.v)[0];
    $("#habit-title").textContent = candidates.t;$("#habit-copy").textContent = candidates.c;
  }
  habitInputs.forEach(input => input.addEventListener("input", renderHabits));
  $("#reset-habits").addEventListener("click", () => {
    const values = {sleep:7.5,stress:30,sun:35,smoke:0,smile:65};
    habitInputs.forEach(input => input.value = values[input.id]); renderHabits();
  });
  renderHabits();
})();
