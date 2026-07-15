(function () {
  "use strict";

  var STEM_ELEMENT = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
  var BRANCH_ELEMENT = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
  var STEM_POLARITY = { 甲: 1, 乙: 0, 丙: 1, 丁: 0, 戊: 1, 己: 0, 庚: 1, 辛: 0, 壬: 1, 癸: 0 };
  var GENERATES = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  var CONTROLS = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
  var BRANCH_MAIN_STEM = { 子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙", 午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬" };
  var GOD_GROUPS = {
    比肩: "同我", 劫财: "同我",
    食神: "我生", 伤官: "我生",
    偏财: "我克", 正财: "我克",
    七杀: "克我", 正官: "克我",
    偏印: "生我", 正印: "生我"
  };
  var GROUP_ORDER = ["生我", "我生", "克我", "我克", "同我"];
  var TEN_GOD_TRAITS = {
    比肩: ["自我", "独立"], 劫财: ["合作", "竞争"],
    食神: ["输出", "享受"], 伤官: ["表达", "创新"],
    正财: ["稳定", "责任"], 偏财: ["机会", "人脉"],
    正官: ["纪律", "规则"], 七杀: ["挑战", "魄力"],
    正印: ["学习", "保护"], 偏印: ["思考", "灵感"]
  };
  var TEN_GOD_STRENGTHS = {
    比肩: ["有主见", "讲义气", "自立"], 劫财: ["敢拼", "人缘广", "行动力强"],
    食神: ["乐观", "有才艺", "创造力"], 伤官: ["聪明", "敢创新", "挑战权威"],
    正财: ["务实", "会理财", "守信用"], 偏财: ["善社交", "抓机会", "商业头脑"],
    正官: ["责任感强", "自律", "可靠"], 七杀: ["果断", "执行力强", "领导力"],
    正印: ["善良", "爱学习", "有耐心"], 偏印: ["悟性高", "研究力强", "创意多"]
  };
  var TEN_GOD_SYMBOLS = {
    比肩: "自我边界、同辈、伙伴、独立与竞争",
    劫财: "同辈协作、资源争夺、社交动员与风险承担",
    食神: "温和输出、才艺、口福、照料与生活享受",
    伤官: "表达、批判、技术、创意与对规则的挑战",
    正财: "稳定收入、责任、秩序、可管理的现实资源",
    偏财: "流动资源、商业机会、人脉、投资与意外所得",
    正官: "制度、职位、名誉、责任与有边界的约束",
    七杀: "强压力、竞争、危机、权力、小人与强制约束",
    正印: "正统学习、证书、长辈、保护、名誉与支持",
    偏印: "非标准知识、洞察、策略、研究、灵感与独立思考"
  };
  var TEN_GOD_COMBINATIONS = {
    比肩: "身弱时可帮身；若比肩过旺而财弱，合作也可能变成争夺。",
    劫财: "身弱时可增强行动与同伴助力；财弱时要留意合伙失衡和资源流失。",
    食神: "可生财，也常用于制七杀；若偏印过强，传统上称为枭神夺食。",
    伤官: "身强时可生财，配印时才华较易被规范；过旺则容易冲撞正官与制度。",
    正财: "日主有力时较能承接并管理资源；比劫过强时要留意争财与责任失衡。",
    偏财: "适合开拓与连接资源，但仍须看日主能否任财，并控制投机和波动。",
    正官: "财可生官、印可护官；伤官过强时容易与规则、职位或权威发生摩擦。",
    七杀: "食神制杀、印星化杀时可转为魄力与权威；身弱或无制时，容易承受强压、小人、被欺负或被人整。",
    正印: "官印相生时利于学习、资质与承接责任；印过多会依赖，财过旺则可能破印。",
    偏印: "可化杀生身并强化研究洞察；与食神冲突时，要留意封闭、反复与枭神夺食。"
  };
  var TEN_GOD_SOURCES = "《三命通会》《子平真诠评注》、己维八字知识库、DestinyAxis 十神基础";
  var TEN_GOD_EXCESS = {
    比肩: ["固执己见", "把合作变成较劲", "输不起"], 劫财: ["冲动争夺", "守不住钱", "容易翻脸"],
    食神: ["贪图舒服", "拖延懒散", "遇事逃避"], 伤官: ["说话伤人", "目中无人", "专挑规则对着干"],
    正财: ["斤斤计较", "过度保守", "只认现实利益"], 偏财: ["投机贪快", "花钱无度", "热情来得快去得快"],
    正官: ["被规矩绑死", "怕错不敢做", "压力内耗"], 七杀: ["容易被欺负或被人整", "强势压人", "急躁冒进", "冲突不断"],
    正印: ["依赖保护", "想得多做得少", "缺乏独立判断"], 偏印: ["多疑封闭", "钻牛角尖", "与人疏离"]
  };
  var DAY_MASTER_TRAITS = {
    甲: ["生长", "担当"], 乙: ["柔韧", "审美"],
    丙: ["热情", "照耀"], 丁: ["灵敏", "专注"],
    戊: ["稳重", "承载"], 己: ["包容", "培育"],
    庚: ["果断", "革新"], 辛: ["精致", "原则"],
    壬: ["流动", "开拓"], 癸: ["敏锐", "渗透"]
  };
  var SHENSHA_EXPLANATIONS = {
    天乙: "传统上象征贵人助力，以及遇到困难时获得援手的机会。",
    太极: "传统上象征好学钻研、悟性，以及对哲思玄学的兴趣。",
    天德: "传统上象征温厚仁善，并有缓和冲突与凶性的含义。",
    月德: "传统上象征包容仁厚、人缘和解与逢难转圜。",
    德秀: "传统上象征聪慧温和、才德兼具与表达能力。",
    天德合: "天德的合星，传统上偏向和解、人缘与缓冲矛盾。",
    月德合: "月德的合星，传统上偏向协调、宽厚与关系修复。",
    福星: "传统上象征福气、顺遂，以及衣食与生活机缘。",
    文昌: "传统上与学习、考试、文书、表达和创作能力相关。",
    学堂: "传统上与求学、研究、知识吸收和考试表现相关。",
    词馆: "传统上与文章、语言、专业表达和名誉相关。",
    魁罡: "传统上象征刚强果断与威严；失衡时容易强硬孤峭。",
    国印: "传统上与责任、权威、组织管理和制度意识相关。",
    驿马: "传统上象征迁移、出行、奔波、工作或环境变动。",
    华盖: "传统上象征独立、艺术和宗教倾向；失衡时较孤高疏离。",
    将星: "传统上象征领导、统筹、号召力和掌控局面的能力。",
    金舆: "传统上与生活品质、资源享受及伴侣助力相关。",
    金神: "传统上象征刚锐、决断和行动力，通常强调需要制化。",
    五鬼: "传统上用于提示多疑、暗耗、口舌和隐性人际压力。",
    天医: "传统上与医疗、健康、照护意识和疗愈能力相关。",
    禄神: "传统上象征职位、收入、福禄和稳定资源。",
    天赦: "传统上象征宽免、转圜，以及过失或困境得到缓解。",
    红鸾: "传统上与婚恋缘分、感情启动及喜庆事项相关。",
    天喜: "传统上与喜事、人缘、婚庆和愉快事件相关。",
    流霞: "传统上用于提示情感纠葛，以及磕碰或血光风险。",
    红艳: "传统上象征外在吸引力与桃花；过旺时易有感情纠葛。",
    天罗: "传统上用于提示约束、阻滞、压力和难以摆脱的牵制。",
    地网: "传统上用于提示环境羁绊、事务阻塞和行动受限。",
    羊刃: "传统上象征强烈能量、执行与敢拼；失衡时易冲动冲突。",
    飞刃: "传统上用于提示突发碰撞、锋刃伤损和急躁风险。",
    血刃: "传统上用于提醒磕碰、手术或出血类风险，不能单独定论。",
    八专: "传统上象征情感投入强烈；失衡时可能执拗或关系纠葛。",
    九丑: "传统上用于提示情感、名誉与人际是非方面的压力。",
    劫煞: "传统上用于提示突发竞争、争夺、损耗与行动风险。",
    灾煞: "传统上用于提示意外阻碍、外部扰动和计划受挫。",
    元辰: "传统上用于提示情绪阻滞、人际不和与状态低迷。",
    空亡: "传统上象征落空、虚耗或反复，也常与精神性思考相关。",
    童子: "民间常用于提示敏感清高及婚恋健康议题，争议较大。",
    天厨: "传统上与饮食口福、烹饪、享受和生活照料相关。",
    孤辰: "传统上象征独立少合；失衡时可能人际疏离或孤独。",
    寡宿: "传统上象征内向孤静；失衡时可能情感表达不足。",
    亡神: "传统上既与心思谋略相关，也用于提醒失误、丢失与耗神。",
    十恶大败: "传统上用于提醒财务管理、资源损耗与成败反复。",
    桃花: "传统上与人缘、魅力、社交和感情机会相关。",
    孤鸾: "传统上用于提示亲密关系中的独立、疏离或聚少离多。",
    阴差阳错: "传统上用于提示婚恋人际中的误会、错配和反复。",
    四废: "传统上表示状态受季节制约，行动力或发挥容易受阻。",
    丧门: "传统上用于提示家宅、长辈、哀忧事项与情绪压力。",
    吊客: "传统上用于提示探病、奔波、哀忧及相关人情事务。",
    披麻: "传统上用于提示家庭长辈、孝服或哀忧类事项。",
    十灵: "传统上象征灵感敏锐、直觉、悟性与快速领会能力。"
  };
  var ELEMENT_COLORS = { 木: "var(--wood)", 火: "var(--fire)", 土: "var(--earth)", 金: "var(--metal)", 水: "var(--water)" };
  var PILLAR_NAMES = ["年柱", "月柱", "日柱", "时柱"];
  var currentChart = null;
  var lastNetworkPositions = null;
  var networkAnimationFrame = null;
  var agePlaybackTimer = null;

  var $ = function (selector) { return document.querySelector(selector); };
  var escapeHtml = function (value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  };

  function tenGodMarkup(god, className) {
    var name = String(god || "—");
    if (!TEN_GOD_TRAITS[name]) return escapeHtml(name);
    var label = name + "，" + GOD_GROUPS[name] + "；核心特质：" + TEN_GOD_TRAITS[name].join("、");
    return '<span class="' + escapeHtml(className || "ten-god-term") + '" data-ten-god="' + escapeHtml(name) + '" aria-label="' + escapeHtml(label) + '">' + escapeHtml(name) + '</span>';
  }

  function tenGod(dayStem, otherStem) {
    if (!dayStem || !otherStem) return "";
    var dayElement = STEM_ELEMENT[dayStem];
    var otherElement = STEM_ELEMENT[otherStem];
    var samePolarity = STEM_POLARITY[dayStem] === STEM_POLARITY[otherStem];
    if (dayElement === otherElement) return samePolarity ? "比肩" : "劫财";
    if (GENERATES[dayElement] === otherElement) return samePolarity ? "食神" : "伤官";
    if (CONTROLS[dayElement] === otherElement) return samePolarity ? "偏财" : "正财";
    if (GENERATES[otherElement] === dayElement) return samePolarity ? "偏印" : "正印";
    if (CONTROLS[otherElement] === dayElement) return samePolarity ? "七杀" : "正官";
    return "";
  }

  function elementChar(char, element) {
    return '<span class="char element-' + element + '" data-element="' + element + '">' + escapeHtml(char) + "</span>";
  }

  function getShensha(ganzhi, chart, pillarType) {
    if (!ganzhi || typeof queryShenSha !== "function") return [];
    return queryShenSha(ganzhi, chart.bazi, chart.input.gender === 1, pillarType, chart.eightChar.getYearNaYin()) || [];
  }

  function shenshaMarkup(items, className) {
    if (!items.length) return '<span class="shensha-empty">—</span>';
    return items.map(function (item) {
      var explanation = SHENSHA_EXPLANATIONS[item] || "传统神煞符号，需结合完整命局、旺衰与喜忌综合判断。";
      return '<span class="' + (className || "shensha-tag") + '" data-shensha="' + escapeHtml(item) + '" data-shensha-desc="' + escapeHtml(explanation) + '" aria-label="' + escapeHtml(item + "：" + explanation) + '">' + escapeHtml(item) + "</span>";
    }).join("");
  }

  function seasonalWeights(monthBranch) {
    if ("寅卯".indexOf(monthBranch) >= 0) return { 木: 1.35, 火: 1.15, 土: .85, 金: .7, 水: 1 };
    if ("巳午".indexOf(monthBranch) >= 0) return { 木: 1, 火: 1.35, 土: 1.15, 金: .85, 水: .7 };
    if ("申酉".indexOf(monthBranch) >= 0) return { 木: .7, 火: .85, 土: 1, 金: 1.35, 水: 1.15 };
    if ("亥子".indexOf(monthBranch) >= 0) return { 木: 1.15, 火: .7, 土: .85, 金: 1, 水: 1.35 };
    return { 木: .85, 火: 1, 土: 1.35, 金: 1.15, 水: .7 };
  }

  function relationForChar(dayStem, char, kind) {
    return tenGod(dayStem, kind === "branch" ? BRANCH_MAIN_STEM[char] : char);
  }

  function exactGodForGroup(dayStem, group, polarity) {
    var stems = Object.keys(STEM_ELEMENT);
    for (var index = 0; index < stems.length; index++) {
      var stem = stems[index];
      var stemPolarity = STEM_POLARITY[stem] ? "yang" : "yin";
      var god = tenGod(dayStem, stem);
      if (stemPolarity === polarity && GOD_GROUPS[god] === group) return god;
    }
    return "—";
  }

  function polarPoint(angle, radiusX, radiusY) {
    var radians = angle * Math.PI / 180;
    return { x: 400 + Math.cos(radians) * radiusX, y: 325 + Math.sin(radians) * radiusY };
  }

  function relaxNatalNodes(nodes) {
    var natal = nodes.filter(function (node) { return node.layer === "birth"; });
    for (var step = 0; step < 48; step++) {
      natal.forEach(function (node) {
        var forceX = (node.anchorX - node.x) * .075;
        var forceY = (node.anchorY - node.y) * .075;
        natal.forEach(function (other) {
          if (node === other) return;
          var dx = node.x - other.x;
          var dy = node.y - other.y;
          var distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          if (distance < 128) {
            var push = (128 - distance) * .018;
            forceX += dx / distance * push;
            forceY += dy / distance * push;
          }
        });
        var centerDx = node.x - 400;
        var centerDy = node.y - 325;
        var centerDistance = Math.max(1, Math.sqrt(centerDx * centerDx + centerDy * centerDy));
        if (centerDistance < 145) {
          forceX += centerDx / centerDistance * (145 - centerDistance) * .025;
          forceY += centerDy / centerDistance * (145 - centerDistance) * .025;
        }
        node.x = Math.max(125, Math.min(675, node.x + forceX));
        node.y = Math.max(95, Math.min(555, node.y + forceY));
      });
    }
  }

  function buildNetworkNodes(chart, dayun, annual) {
    var ec = chart.eightChar;
    var monthBranch = ec.getMonthZhi();
    var season = seasonalWeights(monthBranch);
    var dayunAngle = -150 + Math.max(0, dayun.getIndex() - 1) * 31;
    var annualAngle = -180 + ((annual.getAge() - 5) * 13) % 360;
    var dayunStemPoint = polarPoint(dayunAngle - 10, 345, 292);
    var dayunBranchPoint = polarPoint(dayunAngle + 10, 345, 292);
    var annualStemPoint = polarPoint(annualAngle - 11, 292, 252);
    var annualBranchPoint = polarPoint(annualAngle + 11, 292, 252);
    var raw = [
      { id: "year-stem", label: "年·天干", char: ec.getYearGan(), kind: "stem", layer: "birth", x: 330, y: 120, anchorX: 330, anchorY: 120, base: 1 },
      { id: "year-branch", label: "年·地支", char: ec.getYearZhi(), kind: "branch", layer: "birth", x: 470, y: 120, anchorX: 470, anchorY: 120, base: 1.08 },
      { id: "month-stem", label: "月·天干", char: ec.getMonthGan(), kind: "stem", layer: "birth", x: 165, y: 250, anchorX: 165, anchorY: 250, base: 1.2, emphasis: true },
      { id: "month-branch", label: "月·地支", char: ec.getMonthZhi(), kind: "branch", layer: "birth", x: 165, y: 405, anchorX: 165, anchorY: 405, base: 1.45, emphasis: true },
      { id: "day-branch", label: "日·地支", char: ec.getDayZhi(), kind: "branch", layer: "birth", x: 400, y: 525, anchorX: 400, anchorY: 525, base: 1.16 },
      { id: "time-stem", label: "时·天干", char: ec.getTimeGan(), kind: "stem", layer: "birth", x: 620, y: 250, anchorX: 620, anchorY: 250, base: 1 },
      { id: "time-branch", label: "时·地支", char: ec.getTimeZhi(), kind: "branch", layer: "birth", x: 620, y: 405, anchorX: 620, anchorY: 405, base: 1.08 },
      { id: "dayun-stem", label: "大运·天干", char: dayun.getGanZhi().charAt(0), kind: "stem", layer: "dayun", x: dayunStemPoint.x, y: dayunStemPoint.y, base: .78 },
      { id: "dayun-branch", label: "大运·地支", char: dayun.getGanZhi().charAt(1), kind: "branch", layer: "dayun", x: dayunBranchPoint.x, y: dayunBranchPoint.y, base: .82 },
      { id: "annual-stem", label: "流年·天干", char: annual.getGanZhi().charAt(0), kind: "stem", layer: "annual", x: annualStemPoint.x, y: annualStemPoint.y, base: .62 },
      { id: "annual-branch", label: "流年·地支", char: annual.getGanZhi().charAt(1), kind: "branch", layer: "annual", x: annualBranchPoint.x, y: annualBranchPoint.y, base: .68 }
    ];
    var nodes = raw.filter(function (node) { return node.char; }).map(function (node) {
      node.element = node.kind === "stem" ? STEM_ELEMENT[node.char] : BRANCH_ELEMENT[node.char];
      node.relation = relationForChar(ec.getDayGan(), node.char, node.kind);
      node.strength = node.base * season[node.element];
      node.polarity = STEM_POLARITY[node.kind === "branch" ? BRANCH_MAIN_STEM[node.char] : node.char] ? "yang" : "yin";
      return node;
    });
    relaxNatalNodes(nodes);
    return nodes;
  }

  function summarizeForces(nodes) {
    var baseGroups = { 生我: 0, 我生: 0, 克我: 0, 我克: 0, 同我: 0 };
    var currentGroups = { 生我: 0, 我生: 0, 克我: 0, 我克: 0, 同我: 0 };
    var baseSplit = {};
    var currentSplit = {};
    GROUP_ORDER.forEach(function (group) {
      baseSplit[group] = { yin: 0, yang: 0 };
      currentSplit[group] = { yin: 0, yang: 0 };
    });
    var exactBase = {};
    var exactCurrent = {};
    var elements = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    nodes.forEach(function (node) {
      var group = GOD_GROUPS[node.relation];
      if (!group) return;
      currentGroups[group] += node.strength;
      exactCurrent[node.relation] = (exactCurrent[node.relation] || 0) + node.strength;
      currentSplit[group][node.polarity] += node.strength;
      elements[node.element] += node.strength;
      if (node.layer === "birth") {
        baseGroups[group] += node.strength;
        baseSplit[group][node.polarity] += node.strength;
        exactBase[node.relation] = (exactBase[node.relation] || 0) + node.strength;
      }
    });
    var dominantGod = Object.keys(exactBase).sort(function (a, b) { return exactBase[b] - exactBase[a]; })[0] || "—";
    var elementOrder = Object.keys(elements).sort(function (a, b) { return elements[b] - elements[a]; });
    return { base: baseGroups, current: currentGroups, baseSplit: baseSplit, currentSplit: currentSplit, exactCurrent: exactCurrent, dominantGod: dominantGod, strongestElement: elementOrder[0], weakestElement: elementOrder[elementOrder.length - 1] };
  }

  function renderTenGodCloud(force) {
    var values = Object.keys(TEN_GOD_TRAITS).map(function (god) {
      return { god: god, value: force.exactCurrent[god] || 0, traits: TEN_GOD_TRAITS[god] };
    });
    var maxValue = Math.max.apply(null, values.map(function (item) { return item.value; }).concat([1]));
    values.sort(function (a, b) { return b.value - a.value; });
    $("#ten-god-cloud").innerHTML = values.map(function (item, index) {
      var ratio = item.value / maxValue;
      var size = Math.round(11 + ratio * 12);
      var opacity = (.34 + ratio * .66).toFixed(2);
      return '<span class="cloud-term' + (index < 3 ? " is-prominent" : "") + '" data-ten-god="' + item.god + '" style="font-size:' + size + "px;opacity:" + opacity + '" aria-label="' + item.god + "：" + item.traits.join("、") + '"><small>' + item.god + "</small>" + item.traits[0] + " · " + item.traits[1] + "</span>";
    }).join("");
  }

  function setGodTone(selector, god, headline) {
    var excess = TEN_GOD_EXCESS[god] || [];
    var suffix = String(headline).indexOf(god) === 0 ? String(headline).slice(String(god).length) : " · " + String(headline);
    $(selector).innerHTML = '<strong>' + tenGodMarkup(god) + escapeHtml(suffix) + '</strong>' +
      (excess.length ? '<small>过强时：' + escapeHtml(excess.join("、")) + '</small>' : '');
  }

  function trendToneMarkup(periodLabel, names) {
    if (!names.length) return '<strong>' + escapeHtml(periodLabel) + '</strong><small>暂无可计算的干支增势</small>';
    return '<strong>' + escapeHtml(periodLabel + " · ") + names.map(function (god) { return tenGodMarkup(god); }).join("、") + '增势</strong><small>过强时：' +
      names.map(function (god) { return escapeHtml(god + "（" + (TEN_GOD_EXCESS[god] || []).join("、") + "）"); }).join("；") + '</small>';
  }

  function animateNetwork(previous, next) {
    if (!previous || typeof requestAnimationFrame !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (networkAnimationFrame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(networkAnimationFrame);
    var svg = $("#bazi-network");
    var start = typeof performance !== "undefined" ? performance.now() : Date.now();
    function frame(now) {
      var progress = Math.min(1, ((now || Date.now()) - start) / 260);
      var eased = 1 - Math.pow(1 - progress, 3);
      Object.keys(next).forEach(function (id) {
        if (!previous[id]) return;
        var x = previous[id].x + (next[id].x - previous[id].x) * eased;
        var y = previous[id].y + (next[id].y - previous[id].y) * eased;
        var mark = svg.querySelector('[data-node-id="' + id + '"]');
        var edge = svg.querySelector('[data-edge-id="' + id + '"]');
        if (mark) mark.setAttribute("transform", "translate(" + x + " " + y + ")");
        if (edge) {
          var line = edge.querySelector("line");
          var textNode = edge.querySelector("text");
          if (line) { line.setAttribute("x2", x); line.setAttribute("y2", y); }
          if (textNode) { textNode.setAttribute("x", 400 + (x - 400) * .58); textNode.setAttribute("y", 325 + (y - 325) * .58); }
        }
      });
      if (progress < 1) networkAnimationFrame = requestAnimationFrame(frame);
    }
    networkAnimationFrame = requestAnimationFrame(frame);
  }

  function renderNetwork(chart, dayun, annual) {
    var svg = $("#bazi-network");
    var dayStem = chart.eightChar.getDayGan();
    var dayElement = STEM_ELEMENT[dayStem];
    var nodes = buildNetworkNodes(chart, dayun, annual);
    var force = summarizeForces(nodes);
    var layerNames = { birth: "本命", dayun: "大运", annual: "流年" };
    var watermark = '<g class="network-time-watermark" aria-hidden="true"><text x="30" y="70">' + annual.getYear() + '</text><text x="770" y="70" text-anchor="end">' + annual.getAge() + '岁</text></g>';

    var rings = '<g class="network-rings" aria-hidden="true">' +
      '<ellipse class="birth-ring" cx="400" cy="325" rx="255" ry="235"></ellipse>' +
      '<ellipse class="annual-ring" cx="400" cy="325" rx="292" ry="252"></ellipse>' +
      '<ellipse class="dayun-ring" cx="400" cy="325" rx="345" ry="292"></ellipse>' +
      '<text x="400" y="84">本命圈</text><text x="400" y="65">流年圈</text><text x="400" y="25">大运圈</text></g>';
    var edges = nodes.map(function (node) {
      var labelX = 400 + (node.x - 400) * .58;
      var labelY = 325 + (node.y - 325) * .58;
      return '<g class="network-edge ' + node.layer + (node.emphasis ? " month-anchor" : "") + '" data-edge-id="' + node.id + '"><line x1="400" y1="325" x2="' + node.x + '" y2="' + node.y + '"></line>' +
        '<text x="' + labelX + '" y="' + labelY + '" data-ten-god="' + escapeHtml(node.relation) + '" aria-label="' + escapeHtml(node.relation + "，相对日主为" + GOD_GROUPS[node.relation]) + '">' + escapeHtml(node.relation) + "</text></g>";
    }).join("");
    var marks = nodes.map(function (node) {
      var radius = Math.round(21 + node.strength * 7);
      return '<g class="network-node ' + node.layer + (node.emphasis ? " month-anchor" : "") + '" data-node-id="' + node.id + '" transform="translate(' + node.x + " " + node.y + ')" role="group" aria-label="' +
        escapeHtml(node.label + node.char + "，" + node.element + "，相对日主为" + node.relation + "，权重" + node.strength.toFixed(2)) + '">' +
        '<circle r="' + radius + '" fill="' + ELEMENT_COLORS[node.element] + '"></circle>' +
        '<text class="node-char" y="7">' + node.char + '</text><text class="node-label" y="' + (radius + 17) + '">' + node.label + '</text><text class="node-layer" y="' + (radius + 31) + '">' + layerNames[node.layer] + " · " + node.element + "</text></g>";
    }).join("");
    var center = '<g class="network-node center" transform="translate(400 325)" role="group" aria-label="日主' + dayStem + '，五行' + dayElement + '">' +
      '<circle r="58" fill="' + ELEMENT_COLORS[dayElement] + '"></circle><text class="center-kicker" y="-16">日主</text><text class="center-char" y="21">' + dayStem + '</text><text class="center-element" y="43">' + dayElement + "</text></g>";
    svg.innerHTML = '<title id="network-svg-title">八字、大运与流年的十神关系网络</title><desc id="network-svg-desc">日主位于中心，本命七字位于内圈，大运和流年位于外圈；左上角显示年份，右上角显示年龄，连线标注相对日主的十神关系。</desc>' + watermark + rings + edges + marks + center;
    var nextPositions = {};
    nodes.forEach(function (node) { nextPositions[node.id] = { x: node.x, y: node.y }; });
    animateNetwork(lastNetworkPositions, nextPositions);
    lastNetworkPositions = nextPositions;

    var dayunTrendNames = nodes.filter(function (node) { return node.layer === "dayun"; }).sort(function (a, b) { return b.strength - a.strength; }).map(function (node) { return node.relation; }).filter(function (god, index, list) { return list.indexOf(god) === index; }).slice(0, 2);
    var annualTrendNames = nodes.filter(function (node) { return node.layer === "annual"; }).sort(function (a, b) { return b.strength - a.strength; }).map(function (node) { return node.relation; }).filter(function (god, index, list) { return list.indexOf(god) === index; }).slice(0, 2);
    var dayTraits = DAY_MASTER_TRAITS[dayStem];
    var primaryGod = relationForChar(dayStem, chart.eightChar.getMonthGan(), "stem");
    var primaryTraits = TEN_GOD_TRAITS[primaryGod] || ["—", "—"];
    var secondaryGod = relationForChar(dayStem, chart.eightChar.getMonthZhi(), "branch");
    var secondaryTraits = TEN_GOD_TRAITS[secondaryGod] || ["—", "—"];
    $("#daymaster-tone").textContent = dayStem + dayElement + " · " + dayTraits.join("、");
    setGodTone("#primary-star-tone", primaryGod, primaryGod + " · " + primaryTraits.join("、"));
    setGodTone("#secondary-star-tone", secondaryGod, secondaryGod + " · " + secondaryTraits.join("、"));
    setGodTone("#natal-tone", force.dominantGod, force.dominantGod + "较显");
    $("#dayun-trend").innerHTML = trendToneMarkup((dayun.getGanZhi() || "童限") + "运", dayunTrendNames);
    $("#current-trend").innerHTML = trendToneMarkup(annual.getGanZhi() + "年", annualTrendNames);
    $("#element-trend").textContent = force.strongestElement + "较强 · " + force.weakestElement + "较弱";
    renderTenGodCloud(force);

    var splitValues = [];
    GROUP_ORDER.forEach(function (group) { splitValues.push(force.currentSplit[group].yin, force.currentSplit[group].yang); });
    var maxForce = Math.max.apply(null, splitValues.concat([1]));
    $("#strength-bars").innerHTML = GROUP_ORDER.map(function (group) {
      var yinBase = Math.round(force.baseSplit[group].yin / maxForce * 100);
      var yinCurrent = Math.round(force.currentSplit[group].yin / maxForce * 100);
      var yangBase = Math.round(force.baseSplit[group].yang / maxForce * 100);
      var yangCurrent = Math.round(force.currentSplit[group].yang / maxForce * 100);
      var yinGod = exactGodForGroup(dayStem, group, "yin");
      var yangGod = exactGodForGroup(dayStem, group, "yang");
      return '<div class="strength-row" aria-label="' + group + "：阴侧" + yinGod + " " + yinCurrent + "，阳侧" + yangGod + " " + yangCurrent + '">' +
        '<strong class="force-value yin-value">' + tenGodMarkup(yinGod, "force-god") + '<span>' + yinCurrent + '</span></strong><div class="strength-half yin"><i style="width:' + yinCurrent + '%"></i><b style="right:' + yinBase + '%"></b></div><span>' + group + '</span><div class="strength-half yang"><i style="width:' + yangCurrent + '%"></i><b style="left:' + yangBase + '%"></b></div><strong class="force-value yang-value"><span>' + yangCurrent + '</span>' + tenGodMarkup(yangGod, "force-god") + '</strong></div>';
    }).join("");
  }

  function findAnnualByAge(age) {
    for (var dayunIndex = 0; dayunIndex < currentChart.dayun.length; dayunIndex++) {
      var annuals = currentChart.dayun[dayunIndex].getLiuNian();
      for (var annualIndex = 0; annualIndex < annuals.length; annualIndex++) {
        if (annuals[annualIndex].getAge() === age) return { dayunIndex: dayunIndex, annualIndex: annualIndex, annual: annuals[annualIndex] };
      }
    }
    return null;
  }

  function findAnnualByYear(year) {
    if (!currentChart) return null;
    for (var dayunIndex = 0; dayunIndex < currentChart.dayun.length; dayunIndex++) {
      var annuals = currentChart.dayun[dayunIndex].getLiuNian();
      for (var annualIndex = 0; annualIndex < annuals.length; annualIndex++) {
        if (annuals[annualIndex].getYear() === year) return { dayunIndex: dayunIndex, annualIndex: annualIndex, annual: annuals[annualIndex] };
      }
    }
    return null;
  }

  function showFoundAnnual(found) {
    if (!found) return;
    if (currentChart.activeDayunIndex === found.dayunIndex) {
      selectAnnual(found.dayunIndex, found.annualIndex, false);
    } else {
      selectDayun(found.dayunIndex, false, found.annual.getYear());
    }
  }

  function padNumber(value, length) {
    return String(value).padStart(length || 2, "0");
  }

  function setInputParameters(year, month, day, hour, minute, gender, sect) {
    if (!year || month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) return false;
    $("#birth-date").value = padNumber(year, 4) + "-" + padNumber(month) + "-" + padNumber(day);
    $("#birth-time").value = padNumber(hour) + ":" + padNumber(minute);
    if (gender === "0" || gender === "1") document.querySelector('input[name="gender"][value="' + gender + '"]').checked = true;
    if (sect === "1" || sect === "2") $("#sect").value = sect;
    return true;
  }

  function applyUrlParameters() {
    if (typeof URLSearchParams === "undefined") return false;
    var compact = window.location.search.replace(/^\?/, "");
    if (/^\d{14}$/.test(compact)) {
      return setInputParameters(
        Number(compact.slice(0, 4)), Number(compact.slice(4, 6)), Number(compact.slice(6, 8)),
        Number(compact.slice(8, 10)), Number(compact.slice(10, 12)), compact.charAt(12), compact.charAt(13)
      );
    }

    var params = new URLSearchParams(window.location.search);
    var year = Number(params.get("year"));
    var month = Number(params.get("month"));
    var day = Number(params.get("day"));
    var hour = params.has("hour") ? Number(params.get("hour")) : 0;
    var minute = params.has("minute") ? Number(params.get("minute")) : 0;
    return setInputParameters(year, month, day, hour, minute, params.get("gender"), params.get("sect"));
  }

  function buildShareUrl() {
    if (!currentChart || typeof URL === "undefined") return window.location.href;
    var input = currentChart.input;
    var url = new URL(window.location.href);
    url.hash = "";
    url.search = padNumber(input.year, 4) + padNumber(input.month) + padNumber(input.day) + padNumber(input.hour) + padNumber(input.minute) + input.gender + input.sect;
    return url.toString();
  }

  function copyShareUrl(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(url);
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        if (!document.execCommand("copy")) throw new Error("copy failed");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(field);
      }
    });
  }

  function setAgePlaybackState(isPlaying) {
    var button = $("#age-play-button");
    if (!button) return;
    button.setAttribute("aria-pressed", String(isPlaying));
    button.setAttribute("aria-label", isPlaying ? "暂停年龄变化" : "播放年龄变化");
    button.querySelector(".play-icon").textContent = isPlaying ? "Ⅱ" : "▶";
    button.querySelector(".play-label").textContent = isPlaying ? "暂停" : "播放";
  }

  function stopAgePlayback() {
    if (agePlaybackTimer) window.clearInterval(agePlaybackTimer);
    agePlaybackTimer = null;
    setAgePlaybackState(false);
  }

  function startAgePlayback() {
    if (!currentChart || agePlaybackTimer) return;
    var slider = $("#age-slider");
    if (Number(slider.value) >= Number(slider.max)) showFoundAnnual(findAnnualByAge(Number(slider.min)));
    setAgePlaybackState(true);
    agePlaybackTimer = window.setInterval(function () {
      var nextAge = Number(slider.value) + 1;
      if (nextAge > Number(slider.max)) {
        stopAgePlayback();
        return;
      }
      showFoundAnnual(findAnnualByAge(nextAge));
      if (nextAge === Number(slider.max)) stopAgePlayback();
    }, 800);
  }

  function parseInput() {
    var date = $("#birth-date").value.split("-").map(Number);
    var time = $("#birth-time").value.split(":").map(Number);
    if (date.length !== 3 || time.length < 2 || date.some(isNaN) || time.some(isNaN)) {
      throw new Error("请填写完整、有效的出生日期与时间。");
    }
    return {
      year: date[0], month: date[1], day: date[2], hour: time[0], minute: time[1],
      gender: Number(document.querySelector('input[name="gender"]:checked').value),
      sect: Number($("#sect").value)
    };
  }

  function pillarData(eightChar) {
    var prefixes = ["Year", "Month", "Day", "Time"];
    return prefixes.map(function (prefix, index) {
      var ganzhi = eightChar["get" + prefix]();
      return {
        name: PILLAR_NAMES[index],
        gan: ganzhi.charAt(0),
        zhi: ganzhi.charAt(1),
        stemGod: eightChar["get" + prefix + "ShiShenGan"](),
        hidden: eightChar["get" + prefix + "HideGan"](),
        hiddenGods: eightChar["get" + prefix + "ShiShenZhi"](),
        naYin: eightChar["get" + prefix + "NaYin"](),
        diShi: eightChar["get" + prefix + "DiShi"](),
        xunKong: eightChar["get" + prefix + "XunKong"]()
      };
    });
  }

  function renderPillars(chart) {
    var pillars = pillarData(chart.eightChar);
    $("#pillar-grid").innerHTML = pillars.map(function (pillar, pillarIndex) {
      var hidden = pillar.hidden.map(function (stem, index) {
        return "<span><strong>" + stem + "</strong> " + tenGodMarkup(pillar.hiddenGods[index]) + "</span>";
      }).join(" · ");
      var shensha = getShensha(pillar.gan + pillar.zhi, chart, pillarIndex + 1);
      return '<article class="pillar">' +
        '<p class="pillar-label">' + pillar.name + "</p>" +
        '<p class="stem-god">' + tenGodMarkup(pillar.stemGod) + "</p>" +
        '<div class="pillar-characters">' + elementChar(pillar.gan, STEM_ELEMENT[pillar.gan]) + elementChar(pillar.zhi, BRANCH_ELEMENT[pillar.zhi]) + "</div>" +
        '<p class="hidden-stems">' + hidden + "</p>" +
        '<dl class="pillar-details"><div><dt>纳音</dt><dd>' + escapeHtml(pillar.naYin) + '</dd></div><div><dt>长生</dt><dd>' + escapeHtml(pillar.diShi) + '</dd></div><div><dt>旬空</dt><dd>' + escapeHtml(pillar.xunKong) + "</dd></div></dl>" +
        '<div class="pillar-shensha"><span>神煞</span><div>' + shenshaMarkup(shensha) + "</div></div>" +
        "</article>";
    }).join("");
  }

  function renderDayun(chart) {
    var nowYear = new Date().getFullYear();
    var activeIndex = chart.dayun.findIndex(function (item) {
      return nowYear >= item.getStartYear() && nowYear <= item.getEndYear();
    });
    if (activeIndex < 0) activeIndex = 1;

    $("#dayun-list").innerHTML = chart.dayun.map(function (item, index) {
      var ganzhi = item.getGanZhi();
      var isCurrent = nowYear >= item.getStartYear() && nowYear <= item.getEndYear();
      var god = ganzhi ? tenGod(chart.eightChar.getDayGan(), ganzhi.charAt(0)) : "起运前";
      var shensha = ganzhi ? getShensha(ganzhi, chart, 5) : [];
      return '<button class="dayun-card" type="button" role="listitem" data-index="' + index + '" aria-pressed="' + (index === activeIndex) + '">' +
        (isCurrent ? '<span class="current-dot" title="当前大运"></span>' : "") +
        '<span class="dayun-index">' + (index === 0 ? "幼运" : "第" + index + "步") + "</span>" +
        '<strong class="dayun-ganzhi">' + escapeHtml(ganzhi || "童限") + "</strong>" +
        '<span class="dayun-god">' + tenGodMarkup(god) + "</span>" +
        '<span class="dayun-years">' + item.getStartYear() + "—" + item.getEndYear() + "</span>" +
        '<span class="dayun-age">' + item.getStartAge() + "—" + item.getEndAge() + " 岁</span>" +
        (shensha.length ? '<span class="dayun-shensha">' + shenshaMarkup(shensha, "dayun-shensha-tag") + "</span>" : "") +
        "</button>";
    }).join("");

    $("#dayun-list").querySelectorAll(".dayun-card").forEach(function (button) {
      button.addEventListener("click", function () { stopAgePlayback(); selectDayun(Number(button.dataset.index)); });
    });
    selectDayun(activeIndex, false);
  }

  function selectDayun(index, scroll, preferredYear) {
    if (!currentChart) return;
    var buttons = $("#dayun-list").querySelectorAll(".dayun-card");
    buttons.forEach(function (button, buttonIndex) {
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
    var selected = currentChart.dayun[index];
    var ganzhi = selected.getGanZhi() || "童限";
    $("#liunian-kicker").textContent = selected.getStartYear() + "—" + selected.getEndYear() + " · " + ganzhi + "运";
    var nowYear = new Date().getFullYear();
    var chosenYear = preferredYear || (nowYear >= selected.getStartYear() && nowYear <= selected.getEndYear() ? nowYear : selected.getStartYear());
    renderLiunian(selected, currentChart.eightChar.getDayGan(), index, chosenYear);
    if (scroll !== false && window.matchMedia("(max-width: 700px)").matches) {
      $("#liunian-title").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderLiunian(dayun, dayStem, dayunIndex, selectedYear) {
    var nowYear = new Date().getFullYear();
    var annuals = dayun.getLiuNian();
    var selectedIndex = annuals.findIndex(function (item) { return item.getYear() === selectedYear; });
    if (selectedIndex < 0) selectedIndex = 0;
    $("#liunian-list").innerHTML = annuals.map(function (year, annualIndex) {
      var ganzhi = year.getGanZhi();
      var stem = ganzhi.charAt(0);
      var branch = ganzhi.charAt(1);
      var isCurrent = year.getYear() === nowYear;
      var shensha = getShensha(ganzhi, currentChart, 6);
      return '<button type="button" class="annual-card' + (isCurrent ? " current" : "") + '" data-year-index="' + annualIndex + '" aria-pressed="' + (annualIndex === selectedIndex) + '">' +
        (isCurrent ? '<span class="now-tag">今岁</span>' : "") +
        '<p class="annual-year">' + year.getYear() + " · " + year.getAge() + "岁</p>" +
        '<strong class="annual-ganzhi"><span class="element-' + STEM_ELEMENT[stem] + '">' + stem + '</span><span class="element-' + BRANCH_ELEMENT[branch] + '">' + branch + "</span></strong>" +
        '<p class="annual-meta">岁干 ' + tenGodMarkup(tenGod(dayStem, stem)) + "<br>旬空 " + escapeHtml(year.getXunKong()) + "</p>" +
        '<div class="annual-shensha">' + shenshaMarkup(shensha, "annual-shensha-tag") + "</div>" +
        "</button>";
    }).join("");
    $("#liunian-list").querySelectorAll(".annual-card").forEach(function (button) {
      button.addEventListener("click", function () { stopAgePlayback(); selectAnnual(dayunIndex, Number(button.dataset.yearIndex), true); });
    });
    selectAnnual(dayunIndex, selectedIndex, false);
  }

  function selectAnnual(dayunIndex, annualIndex, scroll) {
    var dayun = currentChart.dayun[dayunIndex];
    var annual = dayun.getLiuNian()[annualIndex];
    $("#liunian-list").querySelectorAll(".annual-card").forEach(function (button, index) {
      button.setAttribute("aria-pressed", String(index === annualIndex));
    });
    var sliderAge = Math.max(5, Math.min(100, annual.getAge()));
    $("#age-slider").value = sliderAge;
    $("#age-slider").style.setProperty("--slider-progress", ((sliderAge - 5) / 95 * 100).toFixed(2) + "%");
    $("#age-caption").textContent = annual.getAge() + " 岁 · " + annual.getYear() + " " + annual.getGanZhi() + " · " + (dayun.getGanZhi() || "童限") + "运";
    currentChart.activeDayunIndex = dayunIndex;
    currentChart.activeAnnualIndex = annualIndex;
    renderNetwork(currentChart, dayun, annual);
    if (scroll) $("#network-title").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function calculate(shouldScroll) {
    stopAgePlayback();
    var results = $(".results");
    var error = $("#error-message");
    results.setAttribute("aria-busy", "true");
    error.hidden = true;
    try {
      if (typeof Solar === "undefined") throw new Error("历法库未能载入，请刷新页面后重试。");
      var input = parseInput();
      var solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute, 0);
      if (solar.getYear() !== input.year || solar.getMonth() !== input.month || solar.getDay() !== input.day) {
        throw new Error("这个公历日期不存在，请重新选择。");
      }
      var lunar = solar.getLunar();
      var eightChar = lunar.getEightChar();
      eightChar.setSect(input.sect);
      var yun = eightChar.getYun(input.gender, 2);
      var dayun = yun.getDaYun(12);

      var bazi = [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()].join("").split("");
      currentChart = { input: input, solar: solar, lunar: lunar, eightChar: eightChar, yun: yun, dayun: dayun, bazi: bazi };
      $("#solar-label").textContent = solar.toYmdHms().slice(0, 16);
      $("#lunar-label").textContent = "农历 " + lunar.toString() + " · " + lunar.getTimeZhi() + "时";
      $("#zodiac-label").textContent = lunar.getYearShengXiaoExact() + " · " + eightChar.getYear();
      $("#yun-label").textContent = yun.getStartSolar().toYmdHms().slice(0, 16);
      $("#direction-label").innerHTML = "出生后 <strong>" + yun.getStartYear() + "年" + yun.getStartMonth() + "月" + yun.getStartDay() + "天" + (yun.getStartHour() ? yun.getStartHour() + "小时" : "") + "</strong> 起运 · 大运<strong>" + (yun.isForward() ? "顺排" : "逆排") + "</strong>";

      renderPillars(currentChart);
      $("#auxiliary-grid").innerHTML =
        '<div><span>胎元</span><strong>' + eightChar.getTaiYuan() + " · " + eightChar.getTaiYuanNaYin() + "</strong></div>" +
        '<div><span>命宫</span><strong>' + eightChar.getMingGong() + " · " + eightChar.getMingGongNaYin() + "</strong></div>" +
        '<div><span>身宫</span><strong>' + eightChar.getShenGong() + " · " + eightChar.getShenGongNaYin() + "</strong></div>";
      renderDayun(currentChart);
      $("#result-content").hidden = false;
      if (shouldScroll) {
        var goToNetwork = function () { $(".network-section").scrollIntoView({ behavior: "smooth", block: "start" }); };
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(goToNetwork);
        else setTimeout(goToNetwork, 0);
      }
    } catch (caught) {
      error.textContent = caught && caught.message ? caught.message : "排盘时出现问题，请检查输入。";
      error.hidden = false;
      $("#result-content").hidden = true;
    } finally {
      results.setAttribute("aria-busy", "false");
    }
  }

  $("#bazi-form").addEventListener("submit", function (event) {
    event.preventDefault();
    calculate(true);
  });

  $("#example-button").addEventListener("click", function () {
    $("#birth-date").value = "1994-12-18";
    $("#birth-time").value = "17:20";
    document.querySelector('input[name="gender"][value="1"]').checked = true;
    $("#sect").value = "2";
    calculate(true);
  });

  $("#print-button").addEventListener("click", function () { window.print(); });

  $("#share-button").addEventListener("click", function () {
    var button = this;
    var status = $("#share-status");
    var url = buildShareUrl();
    try { window.history.replaceState(null, "", url); } catch (ignored) {}
    copyShareUrl(url).then(function () {
      button.innerHTML = '<span aria-hidden="true">✓</span>链接已复制';
      status.textContent = "打开后会自动起盘";
    }).catch(function () {
      button.innerHTML = '<span aria-hidden="true">✓</span>链接已生成';
      status.textContent = "请复制浏览器地址栏中的链接";
    });
    window.setTimeout(function () {
      button.innerHTML = '<span aria-hidden="true">↗</span>复制分享链接';
      status.textContent = "";
    }, 2400);
  });

  $("#age-slider").addEventListener("input", function () {
    stopAgePlayback();
    showFoundAnnual(findAnnualByAge(Number(this.value)));
  });

  $("#current-year-button").addEventListener("click", function () {
    stopAgePlayback();
    showFoundAnnual(findAnnualByYear(new Date().getFullYear()));
  });

  $("#age-play-button").addEventListener("click", function () {
    if (agePlaybackTimer) stopAgePlayback();
    else startAgePlayback();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopAgePlayback();
  });

  (function setupMeaningTooltip() {
    if (!document.addEventListener) return;
    var tooltip = $("#shensha-tooltip");
    var activeTarget = null;
    function positionTooltip(event) {
      if (!activeTarget || tooltip.hidden) return;
      var padding = 12;
      var x = event.clientX + 16;
      var y = event.clientY + 18;
      var rect = tooltip.getBoundingClientRect();
      if (x + rect.width > window.innerWidth - padding) x = event.clientX - rect.width - 16;
      if (y + rect.height > window.innerHeight - padding) y = event.clientY - rect.height - 16;
      tooltip.style.left = Math.max(padding, x) + "px";
      tooltip.style.top = Math.max(padding, y) + "px";
    }
    document.addEventListener("pointerover", function (event) {
      var target = event.target.closest && event.target.closest("[data-shensha], [data-ten-god]");
      if (!target) return;
      activeTarget = target;
      if (target.dataset.tenGod) {
        var god = target.dataset.tenGod;
        tooltip.innerHTML = '<strong>' + escapeHtml(god + " · " + GOD_GROUPS[god]) + '</strong>' +
          '<p>核心：' + escapeHtml((TEN_GOD_TRAITS[god] || []).join("、")) + '</p>' +
          '<p>象征：' + escapeHtml(TEN_GOD_SYMBOLS[god] || "—") + '</p>' +
          '<p>优势：' + escapeHtml((TEN_GOD_STRENGTHS[god] || []).join("、")) + '</p>' +
          '<p>组合：' + escapeHtml(TEN_GOD_COMBINATIONS[god] || "—") + '</p>' +
          '<small>失衡时：' + escapeHtml((TEN_GOD_EXCESS[god] || []).join("、")) + '。十神需结合旺衰、组合与岁运综合判断。</small>' +
          '<small class="tooltip-sources">参考：' + escapeHtml(TEN_GOD_SOURCES) + '</small>';
      } else {
        tooltip.innerHTML = '<strong>' + escapeHtml(target.dataset.shensha) + '</strong><p>' + escapeHtml(target.dataset.shenshaDesc) + '</p><small>神煞仅作辅助参考，不能脱离完整命局单独判断。</small>';
      }
      tooltip.hidden = false;
      positionTooltip(event);
    });
    document.addEventListener("pointermove", positionTooltip);
    document.addEventListener("pointerout", function (event) {
      if (!activeTarget || (event.relatedTarget && event.relatedTarget.closest && event.relatedTarget.closest("[data-shensha], [data-ten-god]") === activeTarget)) return;
      activeTarget = null;
      tooltip.hidden = true;
    });
  })();

  applyUrlParameters();
  calculate(false);
})();
