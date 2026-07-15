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
  var TEN_GOD_CLOUD_WORDS = {
    比肩: ["自我", "独立", "主见", "自立", "边界"],
    劫财: ["合作", "竞争", "敢拼", "人缘", "行动"],
    食神: ["输出", "享受", "乐观", "才艺", "创造"],
    伤官: ["表达", "创新", "聪明", "突破", "批判"],
    正财: ["稳定", "责任", "务实", "理财", "信用"],
    偏财: ["机会", "人脉", "社交", "商业", "开拓"],
    正官: ["纪律", "规则", "自律", "可靠", "名誉"],
    七杀: ["挑战", "魄力", "果断", "执行", "领导"],
    正印: ["学习", "保护", "善良", "耐心", "支持"],
    偏印: ["思考", "灵感", "悟性", "研究", "洞察"]
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
  var SHENSHA_DETAILS = {
    天乙: ["贵人·解厄", "古法把它视为重要贵人星，重点不是凭空得救，而是关键处较容易遇见能提供信息、资源、引荐或转圜的人。", "处于生旺、未受冲破并与禄马、天月二德同见时，传统上认为助力更容易落实为机会。", "落空亡、受冲破或命局无力承接时，可能只是有人示好却难形成实际结果，不能直接断定逢凶必化。", "《三命通会·论天乙贵人》、灵匣网神煞专题"],
    太极: ["悟性·循环", "取五行有始有终、归藏完整之象，常被引申为理解抽象系统、追问根源、接触哲学宗教或复杂知识的倾向。", "与文昌、学堂、印星等配合时，较利研究、归纳、理论学习和长期积累。", "孤星独看不能等同于高学历或玄学天赋；若全局闭塞，也可能只表现为想得深、行动慢。", "《三命通会·论太极贵》、神煞开放指南"],
    天德: ["德星·缓冲", "古法强调以善化凶，象征宽厚、愿意留余地，以及冲突发生时出现缓冲条件。", "与月德、天乙或财官印食同见且不受刑冲时，传统上认为更利于人缘、声誉和问题转圜。", "它只表示缓冲倾向，不会取消现实责任、法律后果或安全风险；遇事仍要正常处理。", "《三命通会·论天月德》、Cantian 神煞资料"],
    月德: ["德星·和解", "取月令三合之气，偏向柔性协调、包容、关系修复和在困难中得到体谅。", "日柱见德、时柱少刑冲，并与天德或贵人星相扶时，传统上认为化解力更明显。", "月德并非无条件的好运；若命局冲克集中，往往只是减轻摩擦，而不是让问题自动消失。", "《三命通会·论天月德》、Cantian 神煞资料"],
    德秀: ["才德·清气", "传统上把德与秀合看：德偏品行与包容，秀偏才华、表达、审美和清雅气质。", "与印星、食神、文昌、学堂同见时，较容易表现为学习能力、文字表达和温和的人际影响力。", "若受刑冲破坏或全局偏枯，可能只有理想与审美，却难转化为稳定成绩。", "《三命通会·论德秀》、灵匣网神煞专题"],
    天德合: ["德星·协商", "是天德的合星，强调通过合作、协商、关系网络和善意互动来减轻冲突。", "落在重要宫位且与吉神相扶时，传统上常解作容易得到谅解、调停或补救机会。", "合不等于问题不存在，也可能表现为拖延正面冲突；仍需看合住的是喜神还是忌神。", "《三命通会·论天月德》、现代神煞资料汇编"],
    月德合: ["德星·关系修复", "是月德的合星，侧重人情往来、柔性沟通与关系中的回旋余地。", "与月德、天乙同见时，传统上认为更利于合作、婚恋沟通和纠纷缓和。", "若原局关系结构失衡，月德合更多是提供缓冲窗口，不能替代边界和实际行动。", "《三命通会·论天月德》、现代神煞资料汇编"],
    福星: ["福气·生活资源", "传统上与衣食、生活便利、被照顾和较容易获得日常资源有关，也常指处境中留有余地。", "与禄神、天厨、财星配合时，较容易体现为生活稳定、有人相助或资源不至断绝。", "福星不是财富保证；若财务结构失衡，仍可能有福气却不善积累。", "《三命通会·福星贵人》、太乙神煞大全"],
    文昌: ["文才·表达", "侧重学习、考试、写作、语言、文书、信息整理和清晰表达，现代也可对应专业资格与知识工作。", "与印星、学堂、词馆或官星配合时，传统上更利科考、证书、写作和专业声誉。", "受冲破或落空亡时，可能表现为聪明但分心、会表达却难沉淀；不能单凭文昌断定成绩。", "《三命通会·论太极贵》、Eastern Fate 神煞详解"],
    学堂: ["学习·基础", "取五行长生之意，象征知识萌发、吸收能力、求学环境和持续学习的潜力。", "兼见官印、禄马、天乙或德秀时，传统上认为较利正规教育、考试和专业训练。", "最忌空亡、冲破和无气；即使有学堂，也需要现实投入、师资与环境才能形成成果。", "《三命通会·论学堂词馆》、灵匣网学堂词馆专题"],
    词馆: ["文章·成熟表达", "取五行临官之意，比学堂更偏才学成熟后的输出，如文章、演讲、策划、出版与专业声名。", "与学堂、文昌、官印同见而清纯时，传统上更利文职、传播、研究与公开表达。", "受克、混杂或落空亡时，容易有表达欲与知识感，却难获得稳定认可。", "《三命通会·论学堂词馆》、灵匣网学堂词馆专题"],
    魁罡: ["刚烈·权威", "只对应特定日柱，传统上强调强硬底盘、决断、原则、承压和不轻易服从。", "配合得当时可表现为执行力、技术攻坚、管理威信和面对复杂局面的胆识。", "失衡时容易过刚、孤峭、冲突升级或难以接受协商；不能把魁罡直接等同于富贵或灾祸。", "《三命通会·魁罡》、神煞开放指南"],
    国印: ["权责·制度", "取掌印用印之象，常对应责任、规章、组织授权、证照、公文和管理意识。", "与正官、正印、将星同见时，较容易表现为制度内发展、承担职务或取得专业资质。", "若全局僵硬，也可能表现为程序主义、过度看重身份或被繁琐规则束缚。", "神煞开放指南、太乙神煞大全"],
    驿马: ["迁移·变化", "代表出行、迁居、调动、跨地区发展、职业变化和信息流动；重点是动，不天然等于吉或凶。", "驿马生旺并与禄、贵、财相配时，传统上认为动中得机会、升迁或资源；适合开拓型路径。", "落空亡、死绝或受破败时，可能奔波无功、计划反复或只动不达；安全与成本仍需现实评估。", "《三命通会·论驿马》、Eastern Fate 神煞详解"],
    华盖: ["艺术·孤高", "取宝盖与库地之象，传统上连接艺术、宗教、哲思、专业技艺、独处和精神世界。", "与印星、文昌、德秀配合时，较利需要长期独立钻研的艺术、研究、技术或修行。", "失衡时会放大孤高、疏离、难被理解或关系淡薄；有华盖不等于必须出家或孤独。", "《三命通会·论将星华盖》、Cantian 神煞资料"],
    将星: ["领导·统筹", "取三合局中位如中军主帅，象征主导、调度、组织、承担结果和把资源集中到目标。", "与官印、国印、天乙等相扶时，较容易体现为领导能力、组织授权和危机统筹。", "若无制化或自身能力不足，可能变成控制欲、好发号施令或承担超出能力的责任。", "《三命通会·论将星华盖》、Cantian 神煞资料"],
    金舆: ["贵气·外部资源", "原意为承载俸禄与身份的车舆，现代常引申为生活品质、交通工具、配偶助力、人脉和可调用资源。", "生日或生时见之、又与禄贵相配时，传统上较重视其亲和、安稳和资源承接的一面。", "它不等于必有豪车或富贵；身弱无气时，也可能只是重品质、依赖外部条件。", "《三命通会·论金舆》、神数AI 金舆释义"],
    金神: ["刚锐·锻炼", "传统上把金神视为刚锐之气，常与决断、纪律、技术、武职或强执行力联系，并强调需有适当制化。", "得火炼或结构配合时，常被解释为把锋芒转成专业、纪律、竞争力与行动成果。", "失衡时可能刚愎、急切、冲撞或把压力导向自己与他人；不可只见金神便论武贵或凶灾。", "《三命通会》相关格局、太乙神煞大全"],
    五鬼: ["暗耗·疑虑", "民间常用来提示看不清的阻力、误会、小人、暗中消耗、疑心和反复确认。", "若命局思考星强，也可转为风险意识、调查能力和对隐患的敏感。", "容易把模糊信息解释成恶意；应以事实核验，不能据此指认某人是小人或判断灵异事件。", "民间神煞法、现代神煞资料汇编"],
    天医: ["照护·疗愈", "传统上与医药、照护、健康知识、身体敏感度及帮助他人恢复有关。", "与印星、食神、德星配合时，可表现为对医学、心理、康复、营养或照护工作的兴趣。", "天医不是健康保证，也不能用于诊断疾病；涉及身体问题必须依据医学检查。", "传统天医查法、Cantian 神煞资料"],
    禄神: ["俸禄·稳定资源", "取十干临官之地，象征职位、收入、专业能力、可持续资源和日主有根。", "生旺且与财官印相配时，较容易体现为稳定职业、收入基础和资源承接能力。", "禄受冲破、空亡或比劫过重时，可能资源不稳、收入波动或守成过度；禄多也不等于必富。", "《三命通会·论十干禄》、神煞开放指南"],
    天赦: ["宽免·重新开始", "取天道赦免之意，传统上象征过失得到修正、困境出现转圜、关系或程序获得重新处理的机会。", "与德星、贵人同见时，更偏向补救、和解、复盘后重新出发。", "它不代表可以逃避法律、合同或责任；所谓赦，是出现补救窗口，不是自动免除后果。", "《三命通会·论天月德》附天赦、太乙神煞大全"],
    红鸾: ["姻缘·喜庆", "传统上与婚恋启动、公开关系、订婚婚礼、家庭喜事和社交氛围转暖有关。", "与天喜、桃花、正官正财等配合且全局稳定时，更容易体现为正向关系进展和庆贺事项。", "红鸾只是时机提示，不保证对象合适或一定结婚；仍需看关系质量、现实条件与个人选择。", "神数AI 红鸾释义、现代红鸾天喜资料"],
    天喜: ["喜事·关系活跃", "与红鸾相对呼应，偏向喜庆、人缘、庆典、添丁或让人心情振奋的消息。", "岁运触发并与吉神相扶时，常被用作关系公开、合作达成或家庭喜事的辅助信号。", "天喜并非所有人都应在婚恋上应验，也可能体现为其他喜事；不可单星定婚期。", "《三命通会·论天月德》附天喜、红鸾天喜资料"],
    流霞: ["情感·风险提示", "民间常把它与情感吸引、酒色情境、磕碰出血或女性生育议题联系，属于争议较大的辅助煞。", "较温和的解读是提醒在情感、社交和高风险活动中保持边界与安全意识。", "不能据此预测手术、血光或生育结果；相关问题必须依据现实安全措施和专业医疗判断。", "民间神煞法、现代神煞资料汇编"],
    红艳: ["魅力·情感磁场", "属于桃花类符号，侧重外在吸引、情绪感染力、审美表达和关系选择增多。", "与礼仪、边界和稳定关系结构配合时，可表现为社交魅力、艺术表现和亲密沟通能力。", "失衡时可能选择困难、暧昧纠葛、过度依赖关注或关系节奏失控；不等于必然私生活混乱。", "观象八字红艳解析、神煞开放指南"],
    天罗: ["约束·难展开", "与地网合称天罗地网，传统上用来描述被制度、关系、环境或心理压力缠住，推进困难。", "若同时有贵人、德星或冲开结构，可转化为谨慎、守法、长期专注和风险控制。", "不能据此直接推断牢狱、重病或灾难；更适合作为受限感和程序风险的提醒。", "《三命通会·论天罗地网》、现代神煞资料"],
    地网: ["羁绊·环境压力", "偏向现实环境、家事、事务、债务或长期责任形成的牵制感，常与天罗合看。", "在需要耐心、流程和守成的工作中，也可表现为能够扎根、处理复杂细节。", "若岁运再逢冲刑，传统上会提高对阻滞的关注，但不能单凭地网断定法律或健康事件。", "《三命通会·论天罗地网》、现代神煞资料"],
    羊刃: ["强度·竞争", "取日干帝旺附近的极强之气，象征胆量、执行、竞争、武断和把事情推到底的力量。", "有七杀驾驭、官星约束或用于需要果断的环境时，可能转成领导力、行动力和危机处理。", "无制或过旺时容易急躁、冲突、冒险和伤损；不能据此预测具体事故，应落实安全管理。", "《三命通会·论羊刃》、Cantian 神煞资料"],
    飞刃: ["突发·锋利风险", "传统上是与羊刃相对的冲位，侧重突发碰撞、尖锐冲突、速度与操作风险。", "适度时可体现为反应快、敢于切断问题、在紧急场景中迅速决策。", "岁运触发时宜重视交通、运动、器械与情绪冲突安全，但不能据此断言必有伤灾。", "传统飞刃查法、太乙神煞大全"],
    血刃: ["伤损·医疗提醒", "民间用来提示对磕碰、出血、手术、器械和高风险活动更敏感，属于风险提醒类神煞。", "正向使用是提高安全意识、保险意识、体检意识和操作规范。", "不得将血刃当作疾病或手术预测；是否有医学风险只能由专业检查判断。", "灵匣网血刃专题、现代神煞资料汇编"],
    八专: ["专注·情感强度", "八专日常被解释为某种力量集中在日柱，容易在专业、意志或亲密关系上投入很深。", "结构平衡时可表现为专精、耐力、对目标持续投入和形成个人风格。", "失衡时可能执拗、占有、情感纠缠或很难从单一路径抽离；不能直接断婚姻吉凶。", "《三命通会》八专相关内容、现代神煞资料"],
    九丑: ["名誉·关系压力", "属于特定日柱组合，传统上用于提醒情感、名誉、隐私和人际评价方面的压力。", "若有德星、贵人或良好边界，可转成对声誉、礼仪和关系后果更敏感。", "不应把九丑解释为人格污名；它不能证明不忠、丑闻或婚姻失败。", "传统九丑日法、太乙神煞大全"],
    劫煞: ["外夺·突发竞争", "古法以外力夺取为核心，象征突发竞争、资源被抢、奔波、损耗和局面快速转折。", "得官星制化或自身有序时，也可转成刚直、果断、执法意识和面对竞争的战斗力。", "岁运触发时适合加强合同、财物与安全管理，但不能据此断定破财或灾祸必然发生。", "《三命通会·论劫煞亡神》、现代亡神劫煞资料"],
    灾煞: ["外部扰动·计划风险", "传统上用于提示来自环境的意外阻碍、计划受挫、水火交通等风险意象，通常与其他冲刑同看。", "正向理解是提高应急预案、行程备份、风险分散和对环境变化的敏感度。", "单见灾煞不能预测事故；若涉及现实风险，应依据天气、交通、健康等客观信息判断。", "《三命通会·论灾煞》、太乙神煞大全"],
    元辰: ["逆滞·情绪消耗", "又称大耗，传统上描述状态不顺、误解增加、内心别扭、计划反复和人际难以同频。", "若能主动复盘、放慢节奏并建立清晰沟通，也可成为发现系统漏洞的时期。", "容易把普通低潮宿命化；元辰不能替代对压力、睡眠和心理状态的现实评估。", "《三命通会·论元辰》、现代神煞资料"],
    空亡: ["落空·弱化", "源于一旬十干与十二支配对后剩余两支，传统上表示对应领域难落实、反复、虚化或暂时抓不住。", "吉神逢空可能减力，凶神逢空也可能减凶；用于研究、精神性、跨界或非实体事务时未必全坏。", "空亡不是一无所有，更不能单独断绝亲、失业或失败；必须看宫位、十神和是否被填实冲合。", "《三命通会·论空亡》、神煞开放指南"],
    童子: ["民间说法·争议较大", "多见于民间法脉，不同门派查法和解释差异很大，常牵涉敏感、清高、婚恋或健康叙事。", "较谨慎的现代用法，只把它当作敏感度、与众不同和需要稳定生活节奏的提醒。", "不得据此制造恐惧、收费化解或预测疾病婚灾；它缺乏统一古典标准，可信度应低于五行十神分析。", "民间童子法、现代神煞资料汇编"],
    天厨: ["饮食·照料", "传统上与口福、烹饪、饮食资源、生活审美、照顾他人和享受日常有关。", "与食神、福星、禄神同见时，可表现为餐饮兴趣、生活品位、服务意识和资源分享。", "过度时可能贪享受、饮食失衡或把照顾别人变成过度付出；不代表必然富足。", "传统天厨贵人法、太乙神煞大全"],
    孤辰: ["独立·人际距离", "传统上偏向自主、少依赖、习惯独处和与亲友保持距离，并不等于没有关系。", "在研究、创作、技术和需要独立判断的领域，可转为专注、自持与不随波逐流。", "失衡时可能封闭、难求助或把独立变成隔绝；不能单独断定终身孤独或婚姻失败。", "《三命通会·论孤辰寡宿》、现代神煞资料"],
    寡宿: ["内敛·情感表达", "与孤辰相配，偏向情绪收敛、慢热、重内在空间和亲密关系中的表达不足。", "正向可表现为清静、自律、专注和不轻易被群体情绪带走。", "若关系中缺乏沟通，容易被误解为冷淡；不能据此给人贴上克亲或孤寡标签。", "《三命通会·论孤辰寡宿》、现代神煞资料"],
    亡神: ["内耗·谋略", "古法以内部耗散为核心，既可指精力外泄、丢失、反复，也可指心思深、谋划和对隐藏信息敏感。", "得官印制化时，可转为策略、调查、保密、洞察和复杂局面中的应变能力。", "失衡时容易疑虑、分心、暗耗或因谋划过多而错过行动；不能据此断定失窃或灾难。", "《三命通会·论劫煞亡神》、现代亡神劫煞资料"],
    十恶大败: ["资源·成败反复", "属于特定日柱法，传统上提醒祖业、财物、资源管理和成败起伏，名称很重但不宜按字面理解。", "若有财官印、德贵或良好管理习惯，仍可通过制度、储备和风险控制减少波动。", "绝不能据此断定败家、贫穷或人生失败；它只是资源管理的辅助提醒。", "《三命通会·论十恶大败》、现代神煞资料"],
    桃花: ["魅力·社交", "又称咸池，传统上对应吸引力、人缘、审美、社交曝光、情感机会和对愉悦体验的追求。", "与礼仪、文昌、食神等配合时，可转成艺术表现、公众沟通、客户关系和亲密能力。", "失衡时可能关系复杂、注意力分散或过度追逐认可；桃花不等于不忠，也不保证恋爱发生。", "《三命通会·论咸池》、Eastern Fate 神煞详解"],
    孤鸾: ["婚恋·自我要求", "属于特定日柱法，传统上用来提示亲密关系中独立性强、相处节奏难同步或聚少离多。", "成熟时可表现为不依附、清楚自身需求，并更重视精神质量而非形式关系。", "不能单独断定离婚、不婚或克配偶；现代关系结果更受沟通、价值观和现实选择影响。", "传统孤鸾日法、现代神煞资料"],
    阴差阳错: ["错配·沟通偏差", "属于特定日柱法，传统上描述时机错位、误会、关系期待不一致和事情差一步的感受。", "正向提醒是重要关系与合同需要多确认、慢决定，并把隐含期待说清楚。", "它不等于婚姻必败，也不能用于指责任何一方；应结合实际沟通模式判断。", "传统阴差阳错日法、太乙神煞大全"],
    四废: ["季节失势·发挥受限", "指某些日柱生在五行气势不相应的季节，传统上认为容易感到使不上力、起步费劲或环境不配合。", "若命局另有生扶、通关或后天训练，反可发展出耐力、适应力和绕开正面竞争的路径。", "四废不是能力废除，更不能按名称贬低命主；需看全局是否真正无根无助。", "传统四废日法、太乙神煞大全"],
    丧门: ["哀忧·家事提醒", "传统上多用于岁运，提示家宅、长辈、分离、探病、礼俗事务或情绪低落等主题。", "较健康的使用方式是关心家人、安排体检与陪伴，并为家庭事务预留时间。", "不能据此预测死亡或具体灾祸；看到丧门不应制造恐慌，必须结合现实情况。", "现代丧门资料、《三命通会》神煞体系"],
    吊客: ["探病·情绪与口舌", "常与丧门、披麻同看，传统上关联探病吊丧、人情奔波、悲伤情绪和由此产生的口舌。", "可作为提醒：照顾情绪、注意沟通措辞，并合理安排家事与人情往来。", "并非出现吊客就会有白事；它主要是岁运辅助符号，不能单独应事。", "DeepOracle 吊客释义、现代神煞资料"],
    披麻: ["孝服·家庭责任", "传统名称来自孝服礼俗，常与丧门吊客一起指向长辈、家庭照护、哀忧和责任增加。", "现代可谨慎理解为家庭事务需要投入、照护责任上升或情绪支持需求增多。", "不能按字面预测亲人死亡；应把它转化为主动关心家庭与做好实际准备。", "传统披麻法、现代丧吊神煞资料"],
    十灵: ["灵感·快速领会", "属于特定日柱法，传统上强调直觉、敏感、悟性、记忆和对复杂事物快速抓重点。", "与印星、文昌、华盖等配合时，可表现为研究、艺术、咨询、学习与创造方面的灵感。", "直觉不等于事实，也不代表通灵或预知；重要判断仍应依靠证据、验证和专业方法。", "传统十灵日法、太乙神煞大全"]
  };
  var ELEMENT_COLORS = { 木: "var(--wood)", 火: "var(--fire)", 土: "var(--earth)", 金: "var(--metal)", 水: "var(--water)" };
  var PILLAR_NAMES = ["年柱", "月柱", "日柱", "时柱"];
  var currentChart = null;
  var lastNetworkPositions = null;
  var networkAnimationFrame = null;
  var agePlaybackTimer = null;
  var lastCloudState = {};
  var lastStrengthState = null;

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
    var values = [];
    Object.keys(TEN_GOD_CLOUD_WORDS).forEach(function (god) {
      var godValue = force.exactCurrent[god] || 0;
      TEN_GOD_CLOUD_WORDS[god].forEach(function (word, wordIndex) {
        values.push({ god: god, word: word, key: god + ":" + word, value: godValue * (1 - wordIndex * .065), wordIndex: wordIndex });
      });
    });
    var maxValue = Math.max.apply(null, values.map(function (item) { return item.value; }).concat([1]));
    values.sort(function (a, b) { return b.value - a.value || a.wordIndex - b.wordIndex; });
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nextState = {};
    var cloud = $("#ten-god-cloud");
    cloud.innerHTML = values.map(function (item, index) {
      var ratio = item.value / maxValue;
      var size = Math.round(10 + ratio * 11);
      var opacity = (.26 + ratio * .74).toFixed(2);
      var previous = lastCloudState[item.key] || { size: size, opacity: opacity };
      nextState[item.key] = { size: size, opacity: opacity };
      return '<span class="cloud-term' + (index < 8 && item.value > 0 ? " is-prominent" : "") + (reduceMotion ? " is-settled" : "") + '" data-ten-god="' + item.god + '" data-target-size="' + size + '" data-target-opacity="' + opacity + '" style="font-size:' + (reduceMotion ? size : previous.size) + "px;opacity:" + (reduceMotion ? opacity : previous.opacity) + ";--cloud-delay:" + Math.min(index, 18) * 14 + 'ms" aria-label="' + item.god + "：" + item.word + '">' + item.word + "</span>";
    }).join("");
    lastCloudState = nextState;
    if (!reduceMotion && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          cloud.querySelectorAll(".cloud-term").forEach(function (term) {
            term.style.fontSize = term.dataset.targetSize + "px";
            term.style.opacity = term.dataset.targetOpacity;
            term.classList.add("is-settled");
          });
        });
      });
    }
  }

  function setGodTone(selector, god, headline) {
    var excess = TEN_GOD_EXCESS[god] || [];
    var suffix = String(headline).indexOf(god) === 0 ? String(headline).slice(String(god).length) : " · " + String(headline);
    $(selector).innerHTML = '<strong>' + tenGodMarkup(god) + escapeHtml(suffix) + '</strong>' +
      (excess.length ? '<small>过强时：' + escapeHtml(excess.join("、")) + '</small>' : '');
  }

  function trendToneMarkup(periodLabel, names) {
    if (!names.length) return '<strong>' + escapeHtml(periodLabel) + '</strong><small>暂无可计算的干支增势</small>';
    return '<strong>' + escapeHtml(periodLabel + " · ") + names.map(function (god) { return tenGodMarkup(god); }).join("、") + '增势</strong>' +
      '<small class="trend-positive">发挥时：' + names.map(function (god) { return escapeHtml(god + "（" + (TEN_GOD_STRENGTHS[god] || []).join("、") + "）"); }).join("；") + '</small>' +
      '<small class="trend-excess">过强时：' + names.map(function (god) { return escapeHtml(god + "（" + (TEN_GOD_EXCESS[god] || []).join("、") + "）"); }).join("；") + '</small>';
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
    var reduceStrengthMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nextStrengthState = {};
    var strengthBars = $("#strength-bars");
    strengthBars.innerHTML = GROUP_ORDER.map(function (group, index) {
      var yinBase = Math.round(force.baseSplit[group].yin / maxForce * 100);
      var yinCurrent = Math.round(force.currentSplit[group].yin / maxForce * 100);
      var yangBase = Math.round(force.baseSplit[group].yang / maxForce * 100);
      var yangCurrent = Math.round(force.currentSplit[group].yang / maxForce * 100);
      var yinGod = exactGodForGroup(dayStem, group, "yin");
      var yangGod = exactGodForGroup(dayStem, group, "yang");
      var previous = lastStrengthState && lastStrengthState[group] ? lastStrengthState[group] : { yin: yinCurrent, yang: yangCurrent, yinBase: yinBase, yangBase: yangBase };
      nextStrengthState[group] = { yin: yinCurrent, yang: yangCurrent, yinBase: yinBase, yangBase: yangBase };
      return '<div class="strength-row" style="--bar-delay:' + index * 34 + 'ms" aria-label="' + group + "：阴侧" + yinGod + " " + yinCurrent + "，阳侧" + yangGod + " " + yangCurrent + '">' +
        '<strong class="force-value yin-value">' + tenGodMarkup(yinGod, "force-god") + '<span>' + yinCurrent + '</span></strong><div class="strength-half yin"><i data-target="' + yinCurrent + '" style="width:' + (reduceStrengthMotion ? yinCurrent : previous.yin) + '%"></i><b data-target="' + yinBase + '" style="right:' + (reduceStrengthMotion ? yinBase : previous.yinBase) + '%"></b></div><span>' + group + '</span><div class="strength-half yang"><i data-target="' + yangCurrent + '" style="width:' + (reduceStrengthMotion ? yangCurrent : previous.yang) + '%"></i><b data-target="' + yangBase + '" style="left:' + (reduceStrengthMotion ? yangBase : previous.yangBase) + '%"></b></div><strong class="force-value yang-value"><span>' + yangCurrent + '</span>' + tenGodMarkup(yangGod, "force-god") + '</strong></div>';
    }).join("");
    lastStrengthState = nextStrengthState;
    if (!reduceStrengthMotion && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          strengthBars.querySelectorAll(".strength-row").forEach(function (row) {
            var halves = row.querySelectorAll(".strength-half");
            halves.forEach(function (half) {
              var fill = half.querySelector("i");
              var baseline = half.querySelector("b");
              fill.style.width = fill.dataset.target + "%";
              baseline.style[half.classList.contains("yin") ? "right" : "left"] = baseline.dataset.target + "%";
            });
            row.classList.add("is-settled");
          });
        });
      });
    }
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
    var pinned = false;
    var coarsePointer = window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)");
    function isTapMode() { return coarsePointer && coarsePointer.matches; }
    function closeTooltip() {
      if (activeTarget) activeTarget.setAttribute("aria-expanded", "false");
      activeTarget = null;
      pinned = false;
      tooltip.hidden = true;
      tooltip.classList.remove("is-pinned");
    }
    function positionTooltip(event) {
      if (!activeTarget || tooltip.hidden || pinned) return;
      var padding = 12;
      var x = event.clientX + 16;
      var y = event.clientY + 18;
      var rect = tooltip.getBoundingClientRect();
      if (x + rect.width > window.innerWidth - padding) x = event.clientX - rect.width - 16;
      if (y + rect.height > window.innerHeight - padding) y = event.clientY - rect.height - 16;
      tooltip.style.left = Math.max(padding, x) + "px";
      tooltip.style.top = Math.max(padding, y) + "px";
    }
    function showTooltip(target, event, shouldPin) {
      if (activeTarget && activeTarget !== target) activeTarget.setAttribute("aria-expanded", "false");
      activeTarget = target;
      pinned = Boolean(shouldPin);
      target.setAttribute("aria-expanded", "true");
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
        var shenshaName = target.dataset.shensha;
        var detail = SHENSHA_DETAILS[shenshaName];
        tooltip.innerHTML = '<strong>' + escapeHtml(shenshaName + (detail ? " · " + detail[0] : "")) + '</strong>' +
          '<p>' + escapeHtml(target.dataset.shenshaDesc) + '</p>' +
          (detail ? '<p><b>展开：</b>' + escapeHtml(detail[1]) + '</p><p><b>有利面：</b>' + escapeHtml(detail[2]) + '</p><p><b>需留意：</b>' + escapeHtml(detail[3]) + '</p><small class="tooltip-sources">参考：' + escapeHtml(detail[4]) + '</small>' : "") +
          '<small>神煞仅作传统文化辅助参考，不能脱离五行、十神、旺衰和现实情况单独判断。</small>';
      }
      tooltip.hidden = false;
      tooltip.classList.toggle("is-pinned", pinned);
      positionTooltip(event);
    }
    document.addEventListener("pointerover", function (event) {
      if (isTapMode() || pinned) return;
      var target = event.target.closest && event.target.closest("[data-shensha], [data-ten-god]");
      if (!target) return;
      showTooltip(target, event, false);
    });
    document.addEventListener("pointermove", positionTooltip);
    document.addEventListener("pointerout", function (event) {
      if (pinned || !activeTarget || (event.relatedTarget && event.relatedTarget.closest && event.relatedTarget.closest("[data-shensha], [data-ten-god]") === activeTarget)) return;
      closeTooltip();
    });
    document.addEventListener("click", function (event) {
      if (!isTapMode()) return;
      var target = event.target.closest && event.target.closest("[data-shensha], [data-ten-god]");
      if (target) {
        event.preventDefault();
        event.stopPropagation();
        if (pinned && activeTarget === target) closeTooltip();
        else showTooltip(target, event, true);
        return;
      }
      if (pinned && !event.target.closest("#shensha-tooltip")) closeTooltip();
    }, true);
    window.addEventListener("resize", function () { if (pinned && !isTapMode()) closeTooltip(); });
  })();

  applyUrlParameters();
  calculate(false);
})();
