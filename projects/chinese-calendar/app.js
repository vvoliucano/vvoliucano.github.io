(() => {
  "use strict";

  const SYNODIC_MONTH = 29.5306;
  const TROPICAL_YEAR = 365.2422;
  const LUNAR_YEAR = SYNODIC_MONTH * 12;
  const YEAR_GAP = TROPICAL_YEAR - LUNAR_YEAR;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const phases = [
    { at: 0, emoji: "🌑", date: "初一", name: "朔 · 月亮几乎不可见" },
    { at: 3.7, emoji: "🌒", date: "初四", name: "娥眉月 · 亮面渐增" },
    { at: 7.4, emoji: "🌓", date: "初七", name: "上弦 · 看见半个月面" },
    { at: 11.1, emoji: "🌔", date: "十一", name: "盈凸月 · 接近满月" },
    { at: 14.8, emoji: "🌕", date: "十五", name: "望 · 月面几乎全亮" },
    { at: 18.5, emoji: "🌖", date: "十九", name: "亏凸月 · 亮面渐减" },
    { at: 22.1, emoji: "🌗", date: "二十三", name: "下弦 · 再次看见半面" },
    { at: 25.8, emoji: "🌘", date: "二十七", name: "残月 · 回到朔前" }
  ];

  const solarTerms = [
    ["立春", 315, "春季开始，万物渐苏", "🌱"], ["雨水", 330, "降水渐增，草木萌动", "🌧️"],
    ["惊蛰", 345, "春雷渐起，蛰虫苏醒", "🌱"], ["春分", 0, "昼夜近乎等长", "🌸"],
    ["清明", 15, "气清景明，适宜春耕", "🌿"], ["谷雨", 30, "雨生百谷，作物生长", "🌾"],
    ["立夏", 45, "夏季开始，草木繁茂", "🌳"], ["小满", 60, "夏熟作物籽粒渐满", "🌾"],
    ["芒种", 75, "有芒作物进入忙种", "🌾"], ["夏至", 90, "北半球白昼最长", "☀️"],
    ["小暑", 105, "暑热开始增强", "🌿"], ["大暑", 120, "一年中暑热最盛", "☀️"],
    ["立秋", 135, "秋季开始，暑气未消", "🌾"], ["处暑", 150, "炎热逐渐退场", "🍃"],
    ["白露", 165, "凉意渐生，露水凝结", "💧"], ["秋分", 180, "昼夜再次近乎等长", "🍂"],
    ["寒露", 195, "露寒而凉意加深", "🍂"], ["霜降", 210, "天气渐冷，始见霜", "🍁"],
    ["立冬", 225, "冬季开始，万物收藏", "🌲"], ["小雪", 240, "天气转寒，初雪可见", "🌨️"],
    ["大雪", 255, "寒意更盛，降雪增多", "❄️"], ["冬至", 270, "北半球白昼最短", "❄️"],
    ["小寒", 285, "进入隆冬寒冷时段", "🌲"], ["大寒", 300, "岁末严寒，循环将启", "❄️"]
  ];

  const getPhase = (age) => {
    const normalized = ((age % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
    let result = phases[0];
    phases.forEach((phase) => { if (normalized >= phase.at) result = phase; });
    return { ...result, age: normalized };
  };

  function initDay() {
    const slider = $("#day-slider");
    const sun = $("#day-sun");
    const earth = $("#day-earth");
    const sky = $("#day-sky");
    const update = () => {
      const hours = Number(slider.value);
      const cycle = (hours % 24) / 24;
      const angle = cycle * Math.PI;
      const x = 50 - Math.cos(angle) * 40;
      const y = 84 - Math.sin(angle) * 70;
      const daylight = Math.max(0, Math.sin(angle));
      sun.style.left = `${x}%`;
      sun.style.top = `${y}%`;
      sun.style.opacity = String(clamp(daylight * 1.35, .18, 1));
      earth.style.transform = `rotate(${hours * 15}deg)`;
      sky.style.background = `linear-gradient(rgb(${Math.round(22 + daylight * 30)}, ${Math.round(35 + daylight * 65)}, ${Math.round(51 + daylight * 85)}), rgb(${Math.round(59 + daylight * 104)}, ${Math.round(52 + daylight * 78)}, ${Math.round(54 + daylight * 58)}))`;
      $("#day-count").textContent = `Day ${Math.floor(hours / 24) + 1}`;
      const hour = Math.round(hours % 24);
      $("#day-time").textContent = hour < 5 ? "深夜" : hour < 8 ? "日出" : hour < 12 ? "上午" : hour < 14 ? "正午" : hour < 18 ? "下午" : hour < 21 ? "日落" : "夜晚";
    };
    slider.addEventListener("input", update);
    update();
  }

  function initMoon() {
    const slider = $("#moon-slider");
    const orbit = $("#orbiting-moon");
    const face = $("#orbit-moon-face");
    const discovery = $("#moon-discovery");
    const update = () => {
      const day = Number(slider.value);
      const angle = (day / SYNODIC_MONTH) * 360;
      const phase = getPhase(day);
      orbit.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
      face.style.transform = `translateY(-50%) rotate(${-angle}deg)`;
      face.textContent = phase.emoji;
      $("#lunar-date").textContent = `${phase.emoji}　${phase.date}`;
      $("#moon-day").textContent = `Day ${day.toFixed(day % 1 ? 1 : 0)}`;
      $("#moon-state").textContent = phase.name;
      discovery.classList.toggle("discovery-hidden", day < 29.4);
    };
    slider.addEventListener("input", update);
    update();
  }

  function seasonAt(day) {
    const normalized = ((day % TROPICAL_YEAR) + TROPICAL_YEAR) % TROPICAL_YEAR;
    if (normalized < 91.31) return { name: "春", opposite: "秋", tree: "🌸", caption: "北半球渐暖，南半球渐凉", color: "#dfe4d7" };
    if (normalized < 182.62) return { name: "夏", opposite: "冬", tree: "🌳", caption: "北半球日长，南半球日短", color: "#d8e1c9" };
    if (normalized < 273.93) return { name: "秋", opposite: "春", tree: "🍂", caption: "北半球渐凉，南半球渐暖", color: "#e5d4b4" };
    return { name: "冬", opposite: "夏", tree: "🌲", caption: "北半球日短，南半球日长", color: "#d4dde0" };
  }

  function initYear() {
    const slider = $("#year-slider");
    const seasonalDescriptions = {
      "春": "春分：太阳由南向北穿过天赤道；南北半球昼夜都近乎等长。",
      "夏": "夏至：太阳赤纬约 +23.4°；北半球白昼最长，南半球白昼最短。",
      "秋": "秋分：太阳由北向南再次穿过天赤道；南北半球昼夜都近乎等长。",
      "冬": "冬至：太阳赤纬约 −23.4°；北半球白昼最短，南半球白昼最长。"
    };
    const update = () => {
      const day = Number(slider.value);
      const angle = (day / TROPICAL_YEAR) * 360;
      const radians = angle * Math.PI / 180;
      const season = seasonAt(day);
      $("#year-sun-marker").style.left = `${50 + Math.cos(radians) * 50}%`;
      $("#year-sun-marker").style.top = `${50 - Math.sin(radians) * 50}%`;
      $("#season-tree").textContent = season.tree;
      $("#season-name").textContent = season.name;
      $("#south-season").textContent = season.opposite;
      $("#season-caption").textContent = season.caption;
      $("#celestial-caption").textContent = seasonalDescriptions[season.name];
      $("#solar-month").textContent = `${((Math.round(day / (TROPICAL_YEAR / 12)) + 2) % 12) + 1}月`;
      const activePoint = { "春": "spring", "夏": "summer", "秋": "autumn", "冬": "winter" }[season.name];
      $$(".season-point").forEach((point) => point.classList.toggle("is-active", point.classList.contains(activePoint)));
      $("#year-day").textContent = `一年中的第 ${Math.round(day)} 天`;
      $("#year-stage").style.background = season.color;
      $("#year-discovery").classList.toggle("discovery-hidden", day < 364.5);
    };
    slider.addEventListener("input", update);
    update();
  }

  function initDrift() {
    const slider = $("#drift-slider");
    const update = () => {
      const t = Number(slider.value);
      const lunar = LUNAR_YEAR * t;
      const solar = TROPICAL_YEAR * t;
      const gap = solar - lunar;
      $("#drift-lunar").textContent = String(Math.round(lunar));
      $("#drift-solar").textContent = String(Math.round(solar));
      $("#month-counter").textContent = `第 ${Math.min(12, Math.floor(t * 12) + 1)} 月`;
      $("#season-counter").textContent = ["冬", "春", "夏", "秋"][Math.min(3, Math.floor(t * 4))];
      $("#gap-number").textContent = `相差 ${gap.toFixed(1)} 天`;
      $("#gap-line").style.width = `${gap * 5}px`;
      $("#drift-lunar").style.transform = `translateX(${-gap * .7}px)`;
      $("#drift-solar").style.transform = `translateX(${gap * .7}px)`;
      $("#drift-discovery").classList.toggle("discovery-hidden", t < .985);
    };
    slider.addEventListener("input", update);
    update();
  }

  function initFestival() {
    const slider = $("#years-slider");
    const landscape = $("#festival-landscape");
    const update = () => {
      const year = Number(slider.value);
      const shift = (year - 1) * YEAR_GAP;
      const seasonalDay = (335 - shift + TROPICAL_YEAR) % TROPICAL_YEAR;
      const season = seasonAt(seasonalDay);
      const theme = season.name === "冬" ? ["#cbd8df", "#e9ebde", "❄️", "🌲"] : season.name === "秋" ? ["#d9b889", "#a88855", "🍂", "🍁"] : season.name === "夏" ? ["#9fc6ce", "#69935a", "🌻", "🌳"] : ["#b7d7d0", "#8eb47e", "🌸", "🌸"];
      landscape.style.background = `linear-gradient(${theme[0]} 0 65%, ${theme[1]} 65%)`;
      $("#festival-weather").textContent = theme[2];
      $("#festival-tree").textContent = theme[3];
      $("#festival-year").textContent = `第 ${year} 年`;
      $("#festival-shift").textContent = `相对季节提前约 ${shift.toFixed(0)} 天`;
      $("#festival-season").textContent = year === 1 ? "仍在冬季" : `正在向${season.name}季漂移`;
    };
    slider.addEventListener("input", update);
    update();
  }

  function initLeap() {
    const add = $("#add-leap");
    add.addEventListener("click", () => {
      $("#leap-stage").classList.add("is-added");
      $("#lunar-measure i").style.width = `${Math.min(100, ((LUNAR_YEAR * 3 + SYNODIC_MONTH) / (TROPICAL_YEAR * 3)) * 100)}%`;
      $("#leap-lunar-total").textContent = "1093";
      $("#leap-result").textContent = "加入约 29.53 天后，只剩约 3.1 天。两只钟重新靠近。";
      add.textContent = "✓ 已放入闰月";
      add.disabled = true;
    });

    const ruleSlider = $("#rule-slider");
    const race = $("#calendar-race");
    const leapButton = $("#name-leap");
    const markers = $$("#principal-track span");
    const lunarMonth = SYNODIC_MONTH;
    const principalGap = TROPICAL_YEAR / 12;
    const windowLength = lunarMonth * 3;
    let hasEmptyMonth = false;
    let named = false;

    const updateRule = () => {
      const progress = Number(ruleSlider.value);
      const firstPrincipalTerm = 15 + 13.8 * progress;
      const termPositions = markers.map((marker, index) => {
        const position = firstPrincipalTerm + principalGap * index;
        marker.style.left = `${clamp(position / windowLength * 100, 0, 100)}%`;
        marker.style.opacity = position <= windowLength ? "1" : "0";
        return position;
      });
      hasEmptyMonth = !termPositions.some((position) => position >= lunarMonth && position < lunarMonth * 2);
      race.classList.toggle("has-empty", hasEmptyMonth);

      if (!hasEmptyMonth) {
        named = false;
        race.classList.remove("is-named");
        $("#candidate-name").textContent = "七月";
        $("#candidate-status").textContent = "有中气";
        $("#following-name").textContent = "八月";
        $("#rule-answer").textContent = progress < .72
          ? "现在三个朔望月各自都有一个中气。"
          : "处暑正在接近下一次朔；继续向右拖。";
        leapButton.textContent = "把无中气月设为闰月";
        leapButton.disabled = true;
      } else if (!named) {
        $("#candidate-name").textContent = "候选月";
        $("#candidate-status").textContent = "没有中气";
        $("#following-name").textContent = "七月";
        $("#rule-answer").textContent = "处暑越过了下一次朔：中间这个完整的朔望月没有任何中气。";
        leapButton.disabled = false;
      }
    };

    leapButton.addEventListener("click", () => {
      if (!hasEmptyMonth) return;
      named = true;
      race.classList.add("is-named");
      $("#candidate-name").textContent = "闰六月";
      $("#candidate-status").textContent = "沿用前月月名";
      $("#rule-answer").textContent = "这就是闰月与中气的关系：需要置闰时，第一个没有中气的月沿用前月名称。";
      leapButton.textContent = "✓ 已定为闰六月";
      leapButton.disabled = true;
    });
    ruleSlider.addEventListener("input", updateRule);
    updateRule();
  }

  function initTerms() {
    const wheel = $("#term-wheel");
    solarTerms.forEach((term, index) => {
      const item = document.createElement("span");
      item.textContent = term[0];
      item.dataset.index = String(index);
      wheel.appendChild(item);
    });
    const slider = $("#terms-slider");
    const update = () => {
      const index = Number(slider.value);
      const [name, degree, meaning, plant] = solarTerms[index];
      $("#term-name").textContent = name;
      $("#term-degree").textContent = `太阳视黄经 ${degree}°`;
      $("#term-meaning").textContent = meaning;
      $("#term-plant").textContent = plant;
      const longitude = degree * Math.PI / 180;
      const earthOrbitAngle = (degree + 180) % 360;
      const earthOrbitRadians = earthOrbitAngle * Math.PI / 180;
      const declination = 23.44 * Math.sin(longitude);
      $("#term-earth-ball").style.left = `${50 + Math.cos(earthOrbitRadians) * 50}%`;
      $("#term-earth-ball").style.top = `${50 + Math.sin(earthOrbitRadians) * 50}%`;
      $("#term-earth-ball").style.transform = "translate(-50%,-50%)";
      $("#term-sun").style.left = `${50 + Math.cos(longitude) * 42}%`;
      $("#term-sun").style.top = `${50 - Math.sin(longitude) * 17}%`;
      $("#term-declination").textContent = Math.abs(declination) < .5
        ? "太阳正在穿过天赤道"
        : `太阳位于天赤道以${declination > 0 ? "北" : "南"}约 ${Math.abs(declination).toFixed(1)}°`;
      $$("#term-wheel span").forEach((item, itemIndex) => item.classList.toggle("active", itemIndex === index));
    };
    slider.addEventListener("input", update);
    update();
  }

  function initSynthesis() {
    const slider = $("#master-slider");
    const button = $("#master-play");
    let animation = 0;
    let previous = 0;
    const year = 2026;
    const yearDays = 365;
    const dayMs = 86400000;
    const yearStart = Date.UTC(year, 0, 1);
    const dayIndex = (month, day) => Math.round((Date.UTC(year, month - 1, day) - yearStart) / dayMs);
    const solarTerms2026 = [
      ["小寒",1,5],["大寒",1,20],["立春",2,4],["雨水",2,18],["惊蛰",3,5],["春分",3,20],
      ["清明",4,5],["谷雨",4,20],["立夏",5,5],["小满",5,21],["芒种",6,5],["夏至",6,21],
      ["小暑",7,7],["大暑",7,23],["立秋",8,7],["处暑",8,23],["白露",9,7],["秋分",9,23],
      ["寒露",10,8],["霜降",10,23],["立冬",11,7],["小雪",11,22],["大雪",12,7],["冬至",12,22]
    ].map(([name, month, day]) => ({ name, month, day, index: dayIndex(month, day) }));
    const lunarMonths2026 = [
      [0,"冬月",13],[dayIndex(1,19),"腊月",1],[dayIndex(2,17),"正月",1],[dayIndex(3,19),"二月",1],
      [dayIndex(4,17),"三月",1],[dayIndex(5,17),"四月",1],[dayIndex(6,15),"五月",1],
      [dayIndex(7,14),"六月",1],[dayIndex(8,13),"七月",1],[dayIndex(9,11),"八月",1],
      [dayIndex(10,10),"九月",1],[dayIndex(11,9),"十月",1],[dayIndex(12,9),"冬月",1]
    ].map(([start, name, firstDay]) => ({ start, name, firstDay }));
    const festivals2026 = [
      ["春节",2,17],["元宵",3,3],["清明",4,5],["端午",6,19],["七夕",8,19],["中秋",9,25],["重阳",10,18]
    ].map(([name, month, day]) => ({ name, index: dayIndex(month, day) }));
    const lunarDayNames = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

    const solarTrack = $("#solar-year-track");
    const lunarTrack = $("#lunar-year-track");
    const monthLengths = [31,28,31,30,31,30,31,31,30,31,30,31];
    let runningStart = 0;
    monthLengths.forEach((length, monthIndex) => {
      const band = document.createElement("span");
      band.className = "solar-month-band";
      band.style.left = `${runningStart / yearDays * 100}%`;
      band.style.width = `${length / yearDays * 100}%`;
      band.textContent = `${monthIndex + 1}月`;
      solarTrack.appendChild(band);
      runningStart += length;
    });
    solarTerms2026.forEach((term, index) => {
      const marker = document.createElement("span");
      marker.className = `solar-term-mark${index % 2 ? " is-major" : ""}`;
      marker.style.left = `${term.index / (yearDays - 1) * 100}%`;
      marker.dataset.day = String(term.index);
      marker.textContent = term.name;
      solarTrack.appendChild(marker);
    });
    lunarMonths2026.forEach((month, index) => {
      const end = lunarMonths2026[index + 1]?.start ?? yearDays;
      const band = document.createElement("span");
      band.className = "lunar-month-band";
      band.style.left = `${month.start / yearDays * 100}%`;
      band.style.width = `${(end - month.start) / yearDays * 100}%`;
      band.textContent = index === 0 ? "冬月·续" : month.name;
      band.dataset.start = String(month.start);
      lunarTrack.appendChild(band);
    });
    festivals2026.forEach((festival) => {
      const marker = document.createElement("span");
      marker.className = "festival-mark";
      marker.style.left = `${festival.index / (yearDays - 1) * 100}%`;
      marker.textContent = festival.name;
      lunarTrack.appendChild(marker);
    });

    const now = new Date();
    if (now.getFullYear() === year) {
      slider.value = String(clamp(Math.floor((Date.UTC(year, now.getMonth(), now.getDate()) - yearStart) / dayMs), 0, yearDays - 1));
    }

    const update = () => {
      const selectedDay = Number(slider.value);
      const date = new Date(yearStart + selectedDay * dayMs);
      let activeLunarIndex = 0;
      lunarMonths2026.forEach((month, index) => { if (month.start <= selectedDay) activeLunarIndex = index; });
      const lunarMonth = lunarMonths2026[activeLunarIndex];
      const lunarDay = lunarMonth.firstDay + selectedDay - lunarMonth.start;
      const lunarAge = lunarDay - 1;
      const phase = getPhase(lunarAge);
      let activeTerm = { name: "冬至", index: -10 };
      solarTerms2026.forEach((term) => { if (term.index <= selectedDay) activeTerm = term; });
      const earthAngle = selectedDay / (yearDays - 1) * 360;
      const moonAngle = (lunarAge / SYNODIC_MONTH) * 360;
      $("#calendar-earth-runner").style.transform = `rotate(${earthAngle}deg)`;
      $(".calendar-earth").style.transform = `translateY(-50%) rotate(${-earthAngle}deg)`;
      $("#calendar-moon-runner").style.transform = `rotate(${moonAngle}deg)`;
      $("#calendar-moon-ball").style.transform = `translateY(-50%) rotate(${-moonAngle}deg)`;
      $("#calendar-moon-ball").textContent = phase.emoji;
      $("#syn-day").textContent = `${year} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
      $("#syn-phase").textContent = phase.name.split(" · ")[0];
      $("#syn-month").textContent = `${lunarMonth.name}${lunarDayNames[clamp(lunarDay - 1, 0, 29)]}`;
      $("#syn-term").textContent = selectedDay === activeTerm.index ? activeTerm.name : `${activeTerm.name}后`;
      $("#master-year").textContent = `${year} 年 · ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
      const cursorPosition = selectedDay / (yearDays - 1) * 100;
      $("#solar-cursor").style.left = `${cursorPosition}%`;
      $("#lunar-cursor").style.left = `${cursorPosition}%`;
      $$(".solar-term-mark").forEach((marker) => marker.classList.toggle("active", Number(marker.dataset.day) === activeTerm.index));
      $$(".lunar-month-band").forEach((band) => band.classList.toggle("active", Number(band.dataset.start) === lunarMonth.start));
    };

    const stop = () => {
      cancelAnimationFrame(animation);
      animation = 0;
      button.setAttribute("aria-pressed", "false");
      button.textContent = "▶ 自动运行";
    };

    const play = (time) => {
      if (!previous) previous = time;
      const delta = time - previous;
      previous = time;
      let value = Number(slider.value) + delta * .006;
      if (value >= Number(slider.max)) value = 0;
      slider.value = String(value);
      update();
      animation = requestAnimationFrame(play);
    };

    button.addEventListener("click", () => {
      if (animation) { stop(); return; }
      button.setAttribute("aria-pressed", "true");
      button.textContent = "Ⅱ 暂停";
      previous = 0;
      animation = requestAnimationFrame(play);
    });
    slider.addEventListener("input", () => { if (animation) stop(); update(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden && animation) stop(); });
    update();
  }

  function initAutoGuides() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const sliders = $$(".timeline").filter((slider) => slider.id !== "master-slider");
    const running = new Map();

    const cancelGuide = (slider) => {
      const frame = running.get(slider);
      if (frame) cancelAnimationFrame(frame);
      running.delete(slider);
      slider.classList.remove("is-guiding");
      slider.dataset.guided = "true";
    };

    const guide = (slider) => {
      if (slider.dataset.guided === "true") return;
      const min = Number(slider.min);
      const max = Number(slider.max);
      const origin = Number(slider.value);
      const guideTarget = slider.dataset.guideTarget ? Number(slider.dataset.guideTarget) : .68;
      const target = min + (max - min) * clamp(guideTarget, 0, 1);
      const shouldReturn = slider.dataset.guideReturn !== "false";
      const started = performance.now();
      const outward = slider.dataset.guideDuration ? Number(slider.dataset.guideDuration) : 5200;
      const hold = shouldReturn ? 900 : 0;
      const returning = shouldReturn ? 2800 : 0;
      slider.classList.add("is-guiding");

      const tick = (now) => {
        const elapsed = now - started;
        let value;
        if (elapsed <= outward) {
          const p = elapsed / outward;
          const eased = .5 - Math.cos(Math.PI * p) / 2;
          value = origin + (target - origin) * eased;
        } else if (shouldReturn && elapsed <= outward + hold) {
          value = target;
        } else if (shouldReturn) {
          const p = clamp((elapsed - outward - hold) / returning, 0, 1);
          const eased = .5 - Math.cos(Math.PI * p) / 2;
          value = target + (origin - target) * eased;
        } else {
          value = target;
        }
        slider.value = String(value);
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        if (elapsed < outward + hold + returning) {
          running.set(slider, requestAnimationFrame(tick));
        } else {
          slider.value = String(shouldReturn ? origin : target);
          slider.dispatchEvent(new Event("input", { bubbles: true }));
          cancelGuide(slider);
        }
      };
      running.set(slider, requestAnimationFrame(tick));
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const slider = entry.target.querySelector(".timeline");
        if (slider && slider.id !== "master-slider" && slider.dataset.guided !== "true") {
          window.setTimeout(() => guide(slider), 900);
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: .38 });

    sliders.forEach((slider) => {
      const chapter = slider.closest(".chapter");
      if (chapter) observer.observe(chapter);
      ["pointerdown", "mousedown", "touchstart", "keydown"].forEach((eventName) => {
        slider.addEventListener(eventName, () => cancelGuide(slider), { passive: true });
      });
      slider.addEventListener("input", (event) => { if (event.isTrusted) cancelGuide(slider); });
    });
  }

  initDay();
  initMoon();
  initYear();
  initDrift();
  initFestival();
  initLeap();
  initTerms();
  initSynthesis();
  initAutoGuides();
})();
