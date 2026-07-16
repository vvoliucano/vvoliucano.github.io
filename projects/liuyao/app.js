(function () {
  "use strict";

  var TRIGRAMS = {
    "111": { name: "乾", symbol: "☰", element: "金", image: "天" },
    "110": { name: "兑", symbol: "☱", element: "金", image: "泽" },
    "101": { name: "离", symbol: "☲", element: "火", image: "火" },
    "100": { name: "震", symbol: "☳", element: "木", image: "雷" },
    "011": { name: "巽", symbol: "☴", element: "木", image: "风" },
    "010": { name: "坎", symbol: "☵", element: "水", image: "水" },
    "001": { name: "艮", symbol: "☶", element: "土", image: "山" },
    "000": { name: "坤", symbol: "☷", element: "土", image: "地" }
  };
  var TRIGRAM_BITS = { 乾: "111", 兑: "110", 离: "101", 震: "100", 巽: "011", 坎: "010", 艮: "001", 坤: "000" };
  var KING_WEN = {
    乾: { 乾: 1, 震: 34, 坎: 5, 艮: 26, 坤: 11, 巽: 9, 离: 14, 兑: 43 },
    震: { 乾: 25, 震: 51, 坎: 3, 艮: 27, 坤: 24, 巽: 42, 离: 21, 兑: 17 },
    坎: { 乾: 6, 震: 40, 坎: 29, 艮: 4, 坤: 7, 巽: 59, 离: 64, 兑: 47 },
    艮: { 乾: 33, 震: 62, 坎: 39, 艮: 52, 坤: 15, 巽: 53, 离: 56, 兑: 31 },
    坤: { 乾: 12, 震: 16, 坎: 8, 艮: 23, 坤: 2, 巽: 20, 离: 35, 兑: 45 },
    巽: { 乾: 44, 震: 32, 坎: 48, 艮: 18, 坤: 46, 巽: 57, 离: 50, 兑: 28 },
    离: { 乾: 13, 震: 55, 坎: 63, 艮: 22, 坤: 36, 巽: 37, 离: 30, 兑: 49 },
    兑: { 乾: 10, 震: 54, 坎: 60, 艮: 41, 坤: 19, 巽: 61, 离: 38, 兑: 58 }
  };
  var HEXAGRAM_NAMES = ["", "乾为天", "坤为地", "水雷屯", "山水蒙", "水天需", "天水讼", "地水师", "水地比", "风天小畜", "天泽履", "地天泰", "天地否", "天火同人", "火天大有", "地山谦", "雷地豫", "泽雷随", "山风蛊", "地泽临", "风地观", "火雷噬嗑", "山火贲", "山地剥", "地雷复", "天雷无妄", "山天大畜", "山雷颐", "泽风大过", "坎为水", "离为火", "泽山咸", "雷风恒", "天山遁", "雷天大壮", "火地晋", "地火明夷", "风火家人", "火泽睽", "水山蹇", "雷水解", "山泽损", "风雷益", "泽天夬", "天风姤", "泽地萃", "地风升", "泽水困", "水风井", "泽火革", "火风鼎", "震为雷", "艮为山", "风山渐", "雷泽归妹", "雷火丰", "火山旅", "巽为风", "兑为泽", "风水涣", "水泽节", "风泽中孚", "雷山小过", "水火既济", "火水未济"];
  var SHORT_NAMES = ["", "乾", "坤", "屯", "蒙", "需", "讼", "师", "比", "小畜", "履", "泰", "否", "同人", "大有", "谦", "豫", "随", "蛊", "临", "观", "噬嗑", "贲", "剥", "复", "无妄", "大畜", "颐", "大过", "坎", "离", "咸", "恒", "遁", "大壮", "晋", "明夷", "家人", "睽", "蹇", "解", "损", "益", "夬", "姤", "萃", "升", "困", "井", "革", "鼎", "震", "艮", "渐", "归妹", "丰", "旅", "巽", "兑", "涣", "节", "中孚", "小过", "既济", "未济"];
  var WIKI_NAMES = { 兑: "兌", 蛊: "蠱", 剥: "剝", 颐: "頤", 大过: "大過", 坎: "坎", 离: "離", 恒: "恒", 遁: "遯", 大壮: "大壯", 晋: "晉", 贲: "賁", 无妄: "无妄", 复: "復", 随: "隨", 观: "觀", 临: "臨", 噬嗑: "噬嗑", 大有: "大有", 小畜: "小畜", 同人: "同人", 明夷: "明夷", 家人: "家人", 睽: "睽", 蹇: "蹇", 解: "解", 损: "損", 益: "益", 夬: "夬", 姤: "姤", 萃: "萃", 升: "升", 困: "困", 井: "井", 革: "革", 鼎: "鼎", 震: "震", 艮: "艮", 渐: "漸", 归妹: "歸妹", 丰: "豐", 旅: "旅", 巽: "巽", 涣: "渙", 节: "節", 中孚: "中孚", 小过: "小過", 既济: "既濟", 未济: "未濟", 谦: "謙", 豫: "豫", 师: "師", 讼: "訟" };
  var PALACES = {
    乾: { element: "金", nums: [1, 44, 33, 12, 20, 23, 35, 14] },
    坤: { element: "土", nums: [2, 24, 19, 11, 34, 43, 5, 8] },
    震: { element: "木", nums: [51, 16, 40, 32, 46, 48, 28, 17] },
    巽: { element: "木", nums: [57, 9, 37, 42, 25, 21, 27, 18] },
    坎: { element: "水", nums: [29, 60, 3, 63, 49, 55, 36, 7] },
    离: { element: "火", nums: [30, 56, 50, 64, 4, 59, 6, 13] },
    艮: { element: "土", nums: [52, 22, 26, 41, 38, 10, 61, 53] },
    兑: { element: "金", nums: [58, 47, 45, 31, 39, 15, 62, 54] }
  };
  var PALACE_STAGES = ["本宫六世", "一世", "二世", "三世", "四世", "五世", "游魂", "归魂"];
  var SHI_POSITIONS = [6, 1, 2, 3, 4, 5, 4, 3];
  var NAJIA = {
    乾: { inner: { stem: "甲", branches: ["子", "寅", "辰"] }, outer: { stem: "壬", branches: ["午", "申", "戌"] } },
    坤: { inner: { stem: "乙", branches: ["未", "巳", "卯"] }, outer: { stem: "癸", branches: ["丑", "亥", "酉"] } },
    震: { inner: { stem: "庚", branches: ["子", "寅", "辰"] }, outer: { stem: "庚", branches: ["午", "申", "戌"] } },
    巽: { inner: { stem: "辛", branches: ["丑", "亥", "酉"] }, outer: { stem: "辛", branches: ["未", "巳", "卯"] } },
    坎: { inner: { stem: "戊", branches: ["寅", "辰", "午"] }, outer: { stem: "戊", branches: ["申", "戌", "子"] } },
    离: { inner: { stem: "己", branches: ["卯", "丑", "亥"] }, outer: { stem: "己", branches: ["酉", "未", "巳"] } },
    艮: { inner: { stem: "丙", branches: ["辰", "午", "申"] }, outer: { stem: "丙", branches: ["戌", "子", "寅"] } },
    兑: { inner: { stem: "丁", branches: ["巳", "卯", "丑"] }, outer: { stem: "丁", branches: ["亥", "酉", "未"] } }
  };
  var BRANCH_ELEMENT = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
  var GENERATES = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  var CONTROLS = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
  var CLASH = { 子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅", 卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳" };
  var COMBINE = { 子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯", 辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午" };
  var HARM = { 子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅", 卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉" };
  var ELEMENT_TOMB = { 木: "未", 火: "戌", 土: "辰", 金: "丑", 水: "辰" };
  var SIX_SPIRITS = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"];
  var SPIRIT_START = { 甲: 0, 乙: 0, 丙: 1, 丁: 1, 戊: 2, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 };
  var LINE_POS_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
  var CHINESE_NUMERALS = ["零", "一", "二", "三", "四", "五", "六"];
  var DEFAULT_QUESTIONS = [
    "今年我可以结婚吗？",
    "我和对方的关系在今年能否稳定发展？",
    "这次求职能否获得理想的结果？",
    "今年转换工作方向是否合适？",
    "这次考试能否顺利通过？",
    "未来三个月，这项合作能否达成？",
    "今年的收入能否得到明显改善？",
    "我现在推进的计划能否在今年顺利落地？"
  ];
  var FALLBACK_LINE_HINTS = ["事情刚刚萌芽，先辨明动机与条件。", "由内向外建立关系，宜守中而应。", "临近转折，行动与风险都开始显现。", "进入外卦，环境与他人的影响增强。", "居于中位，是统筹资源与承担结果之时。", "事情走到极处，须防过犹不及并准备转化。"];

  var $ = function (selector) { return document.querySelector(selector); };
  var state = { question: "", identity: "unspecified", castAt: null, lines: [], calendar: null, timer: null, ritualTimer: null, casting: false, repeated: false };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]; });
  }

  function getTrigrams(binaryLines) {
    return { lower: TRIGRAMS[binaryLines.slice(0, 3).join("")], upper: TRIGRAMS[binaryLines.slice(3, 6).join("")] };
  }

  function getHexagram(binaryLines) {
    var t = getTrigrams(binaryLines);
    var number = KING_WEN[t.lower.name][t.upper.name];
    return { number: number, name: HEXAGRAM_NAMES[number], short: SHORT_NAMES[number], lower: t.lower, upper: t.upper, lines: binaryLines.slice() };
  }

  function palaceFor(number) {
    var names = Object.keys(PALACES);
    for (var i = 0; i < names.length; i++) {
      var index = PALACES[names[i]].nums.indexOf(number);
      if (index >= 0) return { name: names[i], element: PALACES[names[i]].element, stage: index, shi: SHI_POSITIONS[index], ying: ((SHI_POSITIONS[index] + 2) % 6) + 1 };
    }
    return null;
  }

  function sixRelation(palaceElement, lineElement) {
    if (palaceElement === lineElement) return "兄弟";
    if (GENERATES[palaceElement] === lineElement) return "子孙";
    if (CONTROLS[palaceElement] === lineElement) return "妻财";
    if (CONTROLS[lineElement] === palaceElement) return "官鬼";
    return "父母";
  }

  function lineAssignments(hex, palace, dayStem) {
    var lower = NAJIA[hex.lower.name].inner;
    var upper = NAJIA[hex.upper.name].outer;
    return hex.lines.map(function (yang, i) {
      var set = i < 3 ? lower : upper;
      var idx = i < 3 ? i : i - 3;
      var branch = set.branches[idx];
      return { position: i + 1, yang: !!yang, stem: set.stem, branch: branch, element: BRANCH_ELEMENT[branch], relation: sixRelation(palace.element, BRANCH_ELEMENT[branch]), spirit: SIX_SPIRITS[(SPIRIT_START[dayStem] + i) % 6], shiYing: i + 1 === palace.shi ? "世" : (i + 1 === palace.ying ? "应" : "") };
    });
  }

  function buildCalendar(date) {
    try {
      var solar = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
      var lunar = solar.getLunar();
      var ec = lunar.getEightChar();
      ec.setSect(2);
      return { solar: solar.toYmdHms(), lunar: lunar.toString(), monthGanZhi: ec.getMonth(), dayGanZhi: ec.getDay(), monthBranch: ec.getMonth().slice(1), dayStem: ec.getDay().slice(0, 1), dayBranch: ec.getDay().slice(1), xunKong: ec.getDayXunKong() };
    } catch (error) {
      return { solar: date.toLocaleString("zh-CN"), lunar: "历法信息不可用", monthGanZhi: "—寅", dayGanZhi: "甲子", monthBranch: "寅", dayStem: "甲", dayBranch: "子", xunKong: "戌亥" };
    }
  }

  function randomCoin() {
    if (window.crypto && window.crypto.getRandomValues) { var a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0] % 2; }
    return Math.random() < .5 ? 0 : 1;
  }

  function startCooldown(seconds) {
    clearInterval(state.timer);
    var remaining = seconds;
    var button = $("#cast-button");
    button.disabled = true;
    button.querySelector("span").textContent = "静候 " + remaining;
    $("#cast-instruction").textContent = state.lines.length ? "让上一爻落定，再请下一爻" : "默念问题，待心绪安定";
    state.timer = setInterval(function () {
      remaining -= 1;
      if (remaining > 0) button.querySelector("span").textContent = "静候 " + remaining;
      else {
        clearInterval(state.timer);
        button.disabled = false;
        button.querySelector("span").textContent = "请起一爻";
        $("#cast-instruction").textContent = LINE_POS_NAMES[state.lines.length] + " · 请三钱成爻";
      }
    }, 1000);
  }

  function questionKey(question) {
    return String(question || "").toLowerCase().replace(/[\s，。！？、；：,.!?;:]/g, "");
  }

  function askedQuestions() {
    try {
      var history = JSON.parse(localStorage.getItem("liuyao-asked-questions") || "[]");
      return Array.isArray(history) ? history : [];
    }
    catch (error) { return []; }
  }

  function requestCasting(event) {
    event.preventDefault();
    state.question = $("#question-input").value.trim();
    if (!state.question) return;
    state.identity = document.querySelector('input[name="identity"]:checked').value;
    var repeated = askedQuestions().indexOf(questionKey(state.question)) >= 0;
    state.repeated = repeated;
    $("#ritual-question").textContent = "“" + state.question + "”";
    $("#repeat-warning").hidden = !repeated;
    $("#ritual-modal").hidden = false;
    document.body.classList.add("modal-open");
    startRitualCountdown();
    $("#edit-question-button").focus();
  }

  function startRitualCountdown() {
    clearInterval(state.ritualTimer);
    var remaining = 10;
    var confirm = $("#confirm-ritual-button");
    confirm.disabled = true;
    confirm.textContent = "还需静候 10 秒";
    $("#ritual-countdown").querySelector("strong").textContent = remaining;
    state.ritualTimer = setInterval(function () {
      remaining -= 1;
      $("#ritual-countdown").querySelector("strong").textContent = remaining;
      if (remaining > 0) confirm.textContent = "还需静候 " + remaining + " 秒";
      else {
        clearInterval(state.ritualTimer);
        confirm.disabled = false;
        confirm.textContent = $("#repeat-warning").hidden ? "我已明白 · 开始起卦" : "仍要继续 · 结果视为不准";
        confirm.focus();
      }
    }, 1000);
  }

  function closeRitualModal() {
    clearInterval(state.ritualTimer);
    $("#ritual-modal").hidden = true;
    document.body.classList.remove("modal-open");
  }

  function editQuestion() {
    closeRitualModal();
    $("#question-input").focus();
  }

  function beginCasting() {
    closeRitualModal();
    var history = askedQuestions();
    var key = questionKey(state.question);
    if (history.indexOf(key) < 0) {
      history.push(key);
      try { localStorage.setItem("liuyao-asked-questions", JSON.stringify(history.slice(-30))); } catch (error) { /* 本地存储不可用时仅保留当次提醒 */ }
    }
    state.castAt = new Date();
    state.calendar = buildCalendar(state.castAt);
    state.lines = [];
    $("#question-display").textContent = "“" + state.question + "”";
    $("#question-stage").hidden = true;
    $("#casting-stage").hidden = false;
    $("#result-stage").hidden = true;
    renderGrowing();
    window.scrollTo({ top: 0, behavior: "smooth" });
    startCooldown(3);
  }

  function castOnce() {
    if (state.casting || state.lines.length >= 6) return;
    state.casting = true;
    var button = $("#cast-button");
    button.disabled = true;
    button.querySelector("span").textContent = "三钱既起";
    $("#cast-instruction").textContent = "听铜钱落定……";
    var faces = [randomCoin(), randomCoin(), randomCoin()];
    document.querySelectorAll(".coin").forEach(function (coin) {
      coin.classList.remove("back");
      void coin.offsetWidth;
      coin.classList.add("shaking");
    });
    setTimeout(function () {
      document.querySelectorAll(".coin").forEach(function (coin, i) {
        coin.classList.remove("shaking");
        coin.classList.toggle("back", !faces[i]);
      });
      var sum = faces.reduce(function (total, face) { return total + (face ? 3 : 2); }, 0);
      state.lines.push({ value: sum, yang: sum % 2 === 1, moving: sum === 6 || sum === 9, coins: faces.slice() });
      state.casting = false;
      renderGrowing();
      if (state.lines.length === 6) {
        $("#cast-instruction").textContent = "六爻已成，正在装卦";
        button.querySelector("span").textContent = "卦成";
        setTimeout(showResults, 1000);
      } else startCooldown(3);
    }, 1500);
  }

  function renderGrowing() {
    var slots = [];
    for (var visual = 5; visual >= 0; visual--) {
      var line = state.lines[visual];
      if (!line) slots.push('<div class="placeholder-line"></div>');
      else slots.push(lineMarkup(line.yang, line.moving, true, visual === state.lines.length - 1));
    }
    $("#growing-lines").innerHTML = slots.join("");
    $("#cast-count").textContent = CHINESE_NUMERALS[state.lines.length];
    $("#progress-ring").style.setProperty("--progress", (state.lines.length / 6 * 360) + "deg");
    $("#last-cast-label").textContent = state.lines.length ? LINE_POS_NAMES[state.lines.length - 1] + "已定" : "尚未落爻";
    $("#cast-history").innerHTML = state.lines.map(function (line, i) {
      var name = line.value === 6 ? "老阴" : line.value === 7 ? "少阳" : line.value === 8 ? "少阴" : "老阳";
      return "<li>" + (i + 1) + " · " + name + (line.moving ? " <b>动</b>" : "") + "</li>";
    }).join("");
  }

  function lineMarkup(yang, moving, visible, fresh) {
    return '<div class="gua-line ' + (yang ? "yang" : "yin") + (moving ? " moving" : "") + (visible ? " visible" : "") + (fresh ? " fresh" : "") + '">' + (yang ? '<i class="bar"></i>' : '<i class="bar"></i><i class="bar"></i>') + (moving ? '<b class="line-mark">' + (yang ? "○" : "×") + "</b>" : "") + "</div>";
  }

  function strengthTags(branch) {
    var tags = [];
    var c = state.calendar;
    var el = BRANCH_ELEMENT[branch];
    var monthEl = BRANCH_ELEMENT[c.monthBranch];
    var dayEl = BRANCH_ELEMENT[c.dayBranch];
    if (branch === c.monthBranch) tags.push("临月建");
    else if (CLASH[branch] === c.monthBranch) tags.push("月破");
    else if (COMBINE[branch] === c.monthBranch) tags.push("月合");
    else if (HARM[branch] === c.monthBranch) tags.push("月害");
    else if (isPunishment(branch, c.monthBranch)) tags.push("月刑");
    else if (GENERATES[monthEl] === el) tags.push("月生");
    else if (CONTROLS[monthEl] === el) tags.push("月克");
    else if (GENERATES[el] === monthEl) tags.push("泄于月");
    if (branch === c.dayBranch) tags.push("临日辰");
    else if (CLASH[branch] === c.dayBranch) tags.push("日冲");
    else if (COMBINE[branch] === c.dayBranch) tags.push("日合");
    else if (HARM[branch] === c.dayBranch) tags.push("日害");
    else if (isPunishment(branch, c.dayBranch)) tags.push("日刑");
    else if (GENERATES[dayEl] === el) tags.push("日生");
    else if (CONTROLS[dayEl] === el) tags.push("日克");
    if (ELEMENT_TOMB[el] === c.monthBranch) tags.push("入月墓");
    if (ELEMENT_TOMB[el] === c.dayBranch) tags.push("入日墓");
    if (c.xunKong.indexOf(branch) >= 0) tags.push("空亡");
    return tags.length ? tags : ["平"];
  }

  function isPunishment(a, b) {
    if (a === b && "辰午酉亥".indexOf(a) >= 0) return true;
    return ["寅巳申", "丑戌未"].some(function (group) { return group.indexOf(a) >= 0 && group.indexOf(b) >= 0; }) || ("子卯".indexOf(a) >= 0 && "子卯".indexOf(b) >= 0 && a !== b);
  }

  function movementRelation(fromBranch, toBranch) {
    var fromEl = BRANCH_ELEMENT[fromBranch], toEl = BRANCH_ELEMENT[toBranch];
    var advance = { 亥: "子", 寅: "卯", 巳: "午", 申: "酉", 丑: "辰", 辰: "未", 未: "戌", 戌: "丑" };
    if (advance[fromBranch] === toBranch) return "化进神";
    if (advance[toBranch] === fromBranch) return "化退神";
    if (ELEMENT_TOMB[fromEl] === toBranch) {
      if (GENERATES[toEl] === fromEl) return "化墓、回头生";
      if (CONTROLS[toEl] === fromEl) return "化墓、回头克";
      return "化墓";
    }
    if (GENERATES[toEl] === fromEl) return "化回头生";
    if (CONTROLS[toEl] === fromEl) return "化回头克";
    if (state.calendar.xunKong.indexOf(toBranch) >= 0) return "化空";
    if (fromEl === toEl) return "化比和";
    return "发动化" + toBranch + toEl;
  }

  function inferUseGod() {
    var q = state.question;
    if (/钱|财|收入|投资|生意|买卖|盈利/.test(q)) return { god: "妻财", reason: "所问属求财，以妻财爻为用神。" };
    if (/工作|职位|升职|事业|求职|录用|官司|诉讼/.test(q)) return { god: "官鬼", reason: "所问属工作、职位或规则压力，以官鬼爻为用神。" };
    if (/考试|考研|考公|录取|论文|合同|文书|证书|学校/.test(q)) return { god: "父母", reason: "所问属考试、文书或凭证，以父母爻为用神。" };
    if (/病|健康|身体|手术|康复|症状/.test(q)) return { god: "世爻、官鬼、子孙", reason: "健康之问以世爻为身，官鬼看病因压力，子孙看制化与恢复，需综合观察。" };
    if (/孩子|怀孕|生育|子女|宠物/.test(q)) return { god: "子孙", reason: "所问属子女、生育或所养之物，以子孙爻为用神。" };
    if (/结婚|婚姻|对象|恋爱|感情|姻缘|复合/.test(q)) {
      if (state.identity === "male") return { god: "妻财", reason: "男问婚恋，传统六爻以妻财爻为用神，并参看世应。" };
      if (state.identity === "female") return { god: "官鬼", reason: "女问婚恋，传统六爻以官鬼爻为用神，并参看世应。" };
      return { god: "妻财、官鬼与世应", reason: "未指定问卦身份，婚恋同时列出妻财、官鬼，并以世应关系为主线。" };
    }
    return { god: "世爻", reason: "问题类别未明确对应单一六亲，先以世爻代表问卦者，再结合问题语义取用。" };
  }

  function showResults() {
    var primaryBits = state.lines.map(function (line) { return line.yang ? 1 : 0; });
    var changedBits = state.lines.map(function (line) { return line.moving ? (line.yang ? 0 : 1) : (line.yang ? 1 : 0); });
    var primary = getHexagram(primaryBits);
    var changed = getHexagram(changedBits);
    var palace = palaceFor(primary.number);
    var assignments = lineAssignments(primary, palace, state.calendar.dayStem);
    // 变爻的六亲仍以本卦所属卦宫五行为“我”，不能改随变卦之宫。
    var changedAssignments = lineAssignments(changed, palace, state.calendar.dayStem);
    state.chart = { primary: primary, changed: changed, palace: palace, assignments: assignments, changedAssignments: changedAssignments };
    $("#casting-stage").hidden = true;
    $("#result-stage").hidden = false;
    renderResult();
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadClassics(primary).then(function (data) { renderClassic(primary, data, false); });
    loadClassics(changed).then(function (data) { renderClassic(changed, data, true); });
  }

  function renderResult() {
    var chart = state.chart, c = state.calendar;
    $("#primary-name").textContent = chart.primary.name;
    $("#changed-name").textContent = chart.primary.number === chart.changed.number ? "无变卦" : chart.changed.name;
    $("#result-meta").textContent = (state.repeated ? "重复占问 · 本次不作准 · " : "") + "第 " + chart.primary.number + " 卦 · " + chart.primary.upper.image + "上" + chart.primary.lower.image + "下 · " + state.lines.filter(function (l) { return l.moving; }).length + " 个动爻";
    $("#judgement-name").textContent = chart.primary.name;
    $("#changed-judgement-name").textContent = chart.changed.name;
    $("#calendar-strip").innerHTML = calendarCell("起卦", c.solar) + calendarCell("农历", c.lunar) + calendarCell("月建", c.monthGanZhi) + calendarCell("日辰 / 空亡", c.dayGanZhi + " · " + c.xunKong + "空");
    $("#palace-name").textContent = chart.palace.name + "宫 " + chart.palace.element;
    $("#palace-detail").textContent = PALACE_STAGES[chart.palace.stage] + " · 世在" + chinesePosition(chart.palace.shi) + "，应在" + chinesePosition(chart.palace.ying) + "。六亲以" + chart.palace.element + "为我而定。";
    renderNajia();
    renderAnalysis();
  }

  function calendarCell(label, value) { return "<div><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong></div>"; }
  function chinesePosition(pos) { return ["", "初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][pos]; }

  function renderNajia() {
    var chart = state.chart;
    var html = '<div class="najia-row header" role="row"><span>爻位</span><span>六神</span><span>六亲</span><span>世应</span><span>本卦爻象</span><span>纳甲</span><span>变爻</span></div>';
    for (var i = 5; i >= 0; i--) {
      var a = chart.assignments[i], ca = chart.changedAssignments[i], line = state.lines[i];
      html += '<div class="najia-row' + (line.moving ? " moving" : "") + '" role="row">' +
        "<span>" + LINE_POS_NAMES[i] + "</span><span>" + a.spirit + "</span><span>" + a.relation + "</span><span>" + (a.shiYing ? '<b class="' + (a.shiYing === "世" ? "shi" : "ying") + '">' + a.shiYing + "</b>" : "—") + "</span>" +
        '<span class="line-cell"><i class="mini-line ' + (a.yang ? "yang" : "yin") + '"><i></i>' + (a.yang ? "" : "<i></i>") + '</i><em class="change-arrow">' + (line.moving ? "动 →" : "静") + "</em></span>" +
        "<span>" + a.stem + a.branch + a.element + "</span><span>" + (line.moving ? ca.branch + ca.element : "—") + "</span></div>";
    }
    $("#najia-table").innerHTML = html;
  }

  function renderAnalysis() {
    var chart = state.chart;
    var use = inferUseGod();
    var targetGods = use.god.split(/、|与/);
    var useLines = chart.assignments.filter(function (a) { return targetGods.indexOf(a.relation) >= 0 || (use.god.indexOf("世爻") >= 0 && a.shiYing === "世"); });
    $("#use-god").textContent = use.god;
    $("#use-god-reason").textContent = use.reason + (useLines.length ? " 盘中对应：" + useLines.map(function (a) { return chinesePosition(a.position) + a.relation + a.branch + a.element; }).join("；") + "。" : " 盘中此六亲不现，须进一步查伏神。当前版本会在 Prompt 中提示 AI 补查。 ");
    $("#strength-title").textContent = "月建 " + state.calendar.monthBranch + " · 日辰 " + state.calendar.dayBranch;
    $("#strength-list").innerHTML = chart.assignments.map(function (a) {
      if (!a.shiYing && targetGods.indexOf(a.relation) < 0) return "";
      return '<span class="analysis-chip">' + (a.shiYing || a.relation) + " " + a.branch + "：" + strengthTags(a.branch).join("、") + "</span>";
    }).join("") || "<p>以月建、日辰对各爻逐项观察，完整条目已写入 Prompt。</p>";
    var moving = state.lines.map(function (l, i) { return l.moving ? i : -1; }).filter(function (i) { return i >= 0; });
    $("#moving-title").textContent = moving.length ? moving.length + " 爻发动" : "六爻安静";
    $("#moving-list").innerHTML = moving.length ? moving.map(function (i) {
      var a = chart.assignments[i], ca = chart.changedAssignments[i];
      return '<span class="analysis-chip">' + LINE_POS_NAMES[i] + " " + a.relation + a.branch + " → " + ca.relation + ca.branch + " · " + movementRelation(a.branch, ca.branch) + "</span>";
    }).join("") : "<p>无动爻，以本卦、世用与月日旺衰为主，变化趋势较缓。</p>";
    var shi = chart.assignments[chart.palace.shi - 1], ying = chart.assignments[chart.palace.ying - 1];
    var relation = shi.branch === ying.branch ? "世应同支" : COMBINE[shi.branch] === ying.branch ? "世应相合" : CLASH[shi.branch] === ying.branch ? "世应相冲" : "世应无直接六合六冲";
    $("#synthesis-title").textContent = chart.primary.name + (chart.primary.number === chart.changed.number ? " · 静卦" : " → " + chart.changed.name);
    $("#synthesis-text").textContent = "本卦属" + chart.palace.name + "宫" + chart.palace.element + "，" + PALACE_STAGES[chart.palace.stage] + "；世爻为" + shi.relation + shi.branch + shi.element + "，应爻为" + ying.relation + ying.branch + ying.element + "，" + relation + "。用神取" + use.god + "。此处给出的是结构化判断线索，最后结论需把用神旺衰、动爻生克、变卦、空破墓绝与具体问题放在一起分析。";
    $("#prompt-output").value = buildPrompt(use);
  }

  function buildPrompt(use) {
    var chart = state.chart, c = state.calendar;
    var rows = chart.assignments.map(function (a, i) {
      var line = state.lines[i], ca = chart.changedAssignments[i];
      return (i + 1) + ". " + LINE_POS_NAMES[i] + "｜" + a.spirit + "｜" + a.relation + "｜" + a.stem + a.branch + a.element + "｜" + (a.shiYing || "—") + "｜" + (a.yang ? "阳" : "阴") + (line.moving ? "动，变" + ca.relation + ca.stem + ca.branch + ca.element + "（" + movementRelation(a.branch, ca.branch) + "）" : "静") + "｜旺衰：" + strengthTags(a.branch).join("、");
    }).reverse().join("\n");
    return (state.repeated ? "【重要提示】这是同一问题的重复占问，依本页面规则本次结果不作准，请优先建议用户停止解读。\n\n" : "") + "你是一位严谨、克制的传统六爻研究者。请依据以下完整排盘，逐层分析，不要只凭卦名下结论，也不要使用宿命化或恐吓性语言。若信息不足，请明确指出。\n\n【用户问题】\n" + state.question + "\n\n【起卦信息】\n起卦时间：" + c.solar + "\n农历：" + c.lunar + "\n月建：" + c.monthGanZhi + "\n日辰：" + c.dayGanZhi + "\n旬空：" + c.xunKong + "\n\n【卦象】\n本卦：第" + chart.primary.number + "卦 " + chart.primary.name + "（" + chart.primary.upper.image + "上" + chart.primary.lower.image + "下）\n变卦：第" + chart.changed.number + "卦 " + chart.changed.name + "\n卦宫：" + chart.palace.name + "宫" + chart.palace.element + "，" + PALACE_STAGES[chart.palace.stage] + "\n世爻：" + chinesePosition(chart.palace.shi) + "；应爻：" + chinesePosition(chart.palace.ying) + "\n\n【纳甲排盘（自上而下）】\n" + rows + "\n\n【取用】\n建议用神：" + use.god + "。理由：" + use.reason + "\n\n【请按以下顺序分析】\n1. 先说明本卦与变卦对问题的总体语境；\n2. 核对用神选择，必要时说明伏神；\n3. 分析世应关系，以及用神与世爻的生克合冲；\n4. 结合月建、日辰判断旺衰，检查生克合冲刑害、月破、旬空与入墓；\n5. 逐个分析动爻：动而生世/克世、回头生/克、进神/退神、化空/化墓；\n6. 综合六神，但只作辅助，不可单凭六神断吉凶；\n7. 给出支持与阻碍因素、可能的发展节奏、可验证的现实信号；\n8. 最后以“倾向判断 / 关键条件 / 行动建议 / 不确定性”四段作答。\n\n请把传统术语翻译成现代白话，并提醒此解读仅供文化研究与自我反思。";
  }

  function wikiTitle(shortName) { return WIKI_NAMES[shortName] || shortName; }

  function loadClassics(hex) {
    var title = "周易/" + wikiTitle(hex.short);
    var url = "https://zh.wikisource.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&formatversion=2&origin=*&titles=" + encodeURIComponent(title);
    return fetch(url).then(function (response) { if (!response.ok) throw new Error("network"); return response.json(); }).then(function (json) {
      var text = json.query.pages[0].extract || "";
      var section = text.split("易經：")[1];
      if (!section) throw new Error("parse");
      section = section.split(/彖曰：|彖曰:/)[0].trim();
      var lines = section.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      var judgement = lines.shift() || "";
      judgement = judgement.replace(new RegExp("^" + wikiTitle(hex.short) + "[：:]"), "");
      var yao = lines.filter(function (line) { return /^(初[六九]|[六九][二三四五]|上[六九])：/.test(line); }).slice(0, 6);
      return { judgement: judgement, lines: yao };
    }).catch(function () { return { judgement: "经文暂未载入。可先据卦象、卦宫、世应、月日与动爻结构分析。", lines: FALLBACK_LINE_HINTS.slice() }; });
  }

  function renderClassic(hex, data, changed) {
    if (changed) {
      $("#changed-judgement-text").textContent = data.judgement;
      state.changedClassic = data;
      return;
    }
    $("#judgement-text").textContent = data.judgement;
    state.primaryClassic = data;
    $("#line-texts").innerHTML = state.lines.map(function (line, i) {
      var text = data.lines[i] || FALLBACK_LINE_HINTS[i];
      return '<div class="line-text' + (line.moving ? " moving" : "") + '"><strong>' + LINE_POS_NAMES[i] + "</strong><p>" + escapeHtml(text) + "</p>" + (line.moving ? "<i>动爻 · 重点参看</i>" : "<i>静爻</i>") + "</div>";
    }).join("");
  }

  function quickComplete() {
    clearInterval(state.timer);
    if (!state.castAt) { state.castAt = new Date(); state.calendar = buildCalendar(state.castAt); }
    while (state.lines.length < 6) {
      var faces = [randomCoin(), randomCoin(), randomCoin()];
      var sum = faces.reduce(function (total, face) { return total + (face ? 3 : 2); }, 0);
      state.lines.push({ value: sum, yang: sum % 2 === 1, moving: sum === 6 || sum === 9, coins: faces });
    }
    renderGrowing();
    setTimeout(showResults, 350);
  }

  function restart() {
    clearInterval(state.timer);
    state.lines = [];
    state.chart = null;
    $("#result-stage").hidden = true;
    $("#casting-stage").hidden = true;
    $("#question-stage").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyPrompt() {
    var text = $("#prompt-output").value;
    var button = $("#copy-button");
    function done() { button.textContent = "已复制"; setTimeout(function () { button.textContent = "复制完整 Prompt"; }, 1800); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done);
    else { $("#prompt-output").select(); document.execCommand("copy"); done(); }
  }

  $("#question-form").addEventListener("submit", requestCasting);
  $("#edit-question-button").addEventListener("click", editQuestion);
  $("#confirm-ritual-button").addEventListener("click", beginCasting);
  $("#cast-button").addEventListener("click", castOnce);
  $("#restart-button").addEventListener("click", restart);
  $("#copy-button").addEventListener("click", copyPrompt);
  $("#quick-test").addEventListener("click", quickComplete);
  $("#question-input").value = DEFAULT_QUESTIONS[Math.floor(Math.random() * DEFAULT_QUESTIONS.length)];
  if (new URLSearchParams(window.location.search).get("test") === "1") $("#quick-test").hidden = false;
})();
