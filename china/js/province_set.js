function initialize_province_set(simple_province_name){
  if (simple_province_name === "湖北")
  {
    simple_province_name = "湖北";
    cities = ["恩施", "十堰", "宜昌", "襄阳", "黄冈", "荆州", "荆门", "咸宁", "随州", "孝感", "武汉", "黄石", "神农架", "天门", "仙桃", "潜江", "鄂州"];
    center_location = [112.38, 31]; // 省份中心
    legend_index = 40;
    range_index = 7;
    map_file = "china-topojson/hubei_city_topo.json";
    cities_area = {"武汉": 8569.15, "黄石": 4564.56, "十堰": 23666.16, "宜昌": 21230.14, "襄阳": 19727.68, "鄂州": 1596.46, "荆门": 12339.43, "孝感": 8904.41, "荆州": 14099.21, "黄冈": 17457.20, "咸宁": 9751.50, "随州": 9613.86, "恩施": 24060.26, "仙桃": 2519.06, "潜江": 1993.14, "天门": 2612.42, "神农架": 3232.77};
  }
  else if (simple_province_name == "上海") {
    cities = ['崇明', '奉贤', '浦东', '金山', '青浦', '松江', '嘉定', '宝山', '闵行', '杨浦', '普陀', '徐汇', '长宁', '虹口', '黄浦', '静安']
    center_location = [121.3,31.2]
    legend_index = 2
    range_index = 30
    map_file = "china-topojson/31.json"
    cities_area = new Array()
  }
  else if (simple_province_name == "重庆") {
    cities = ['酉阳', '奉节', '巫溪', '开州', '彭水', '云阳', '万州', '城口', '江津', '石柱', '巫山', '涪陵', '丰都', '武隆', '南川', '秀山', '黔江', '合川', '忠县', '梁平', '巴南', '潼南', '永川', '垫江', '渝北', '长寿', '铜梁', '荣昌', '璧山', '北碚', '九龙坡', '沙坪坝', '南岸', '江北', '大渡口', '渝中', '綦江','两江新区', '大足']
    center_location = [107.8,30.1]
    legend_index = 2
    range_index = 10
    map_file = "china-topojson/50.json"
    cities_area = {'酉阳': 5173, '奉节': 4087, '巫溪': 4030, '开州': 3959, '彭水': 3903, '云阳': 3649, '万州': 3457, '城口': 3289.1, '江津': 3200.44, '石柱': 3014, '巫山': 2958, '涪陵': 2942.34, '丰都': 2901, '武隆': 2901.3, '南川': 2602, '秀山': 2462, '黔江': 2402, '合川': 2356, '忠县': 2187, '梁平': 1892.13, '巴南': 1834.23, '潼南': 1583, '永川': 1576, '垫江': 1518, '渝北': 1452.03, '长寿': 1423.62, '铜梁': 1343, '荣昌': 1077, '璧山': 915, '北碚': 754.19, '九龙坡': 431.86, '沙坪坝': 396.2, '南岸': 263.09, '江北': 220.77, '大渡口': 102.83, '渝中': 23.71, '綦江': 2747, '两江新区':220.77,'大足': 1436}
  }
  else if (simple_province_name == "全国") {
    cities = ["新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "云南", "广西", "湖南", "陕西", "广东", "吉林", "河北", "湖北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏", "海南", "台湾", "北京", "天津", "上海", "香港", "澳门"]
    center_location = [104, 35.6]
    legend_index = 20
    range_index = 1
    // small_index = 50
    map_file = "china-topojson/china.json"
    cities_area = new Array()
    // cities_area = {"新疆": 166.49, "西藏": 122.84, "内蒙古": 118.3, "青海": 72, "四川": 48.5, "黑龙江": 47.3, "甘肃": 45.5, "云南": 39.4, "广西": 23.63, "湖南": 21.18, "陕西": 20.58, "河北": 19, "吉林": 18.74, "湖北": 18.59, "广东": 17.98, "贵州": 17.62, "河南": 16.7, "江西": 16.69, "山东": 15.7, "山西": 15.6, "辽宁": 14.57, "安徽": 13.96, "福建": 12.14, "江苏": 10.26, "浙江": 10.18, "重庆": 8.3, "宁夏": 6.64, "台湾": 3.62, "海南": 3.392, "北京": 1.6807, "天津": 1.13, "上海": 0.634, "香港": 0.1098, "澳门": 0.0254}
  }
  else if (simple_province_name == "天津") {
    cities = ['蓟州', '武清', '宝坻', '静海', '宁河', '西青', '北辰', '东丽', '津南', '河西', '河东', '南开', '河北', '红桥', '和平', '滨海']
    center_location = [117.2, 39.3]
    legend_index = 2
    range_index = 20
    map_file = "china-topojson/12.json"
    cities_area = {'蓟州': 1593, '武清': 1574, '宝坻': 1509, '静海': 1476, '宁河': 1414, '西青': 570.8, '北辰': 478, '东丽': 477.34, '津南': 420.72, '河西': 94, '河东': 39.63, '南开': 39, '河北': 29.62, '红桥': 21.3, '和平': 9.98, '滨海': 2270}
  }
  else if (simple_province_name == "北京") {
    cities = ['密云', '怀柔', '房山', '延庆', '门头沟', '昌平', '大兴', '顺义', '平谷', '通州', '朝阳', '海淀', '丰台', '石景山', '西城', '东城']
    center_location = [116.2,40.2]
    legend_index = 2
    range_index = 20
    map_file = "china-topojson/11.json"
    cities_area = {'密云': 2229.45, '怀柔': 2123, '房山': 2019, '延庆': 1993.75, '门头沟': 1455, '昌平': 1352, '大兴': 1031, '顺义': 1021, '平谷': 948.24, '通州': 906, '朝阳': 470.8, '海淀': 431, '丰台': 306, '石景山': 84, '西城': 50.70, '东城': 41.84}
  }
  else if (simple_province_name == "新疆") {
    cities = ['巴州', '铁门关', '和田', '昆玉', '哈密', '阿克苏', '阿勒泰', '北屯', '喀什', '塔城', '昌吉州', '克孜勒苏', '吐鲁番', '伊犁', '可克达拉', '博尔塔拉州', '双河', '乌鲁木齐', '克拉玛依', '阿拉尔', '图木舒克', '五家渠', '石河子'];
    center_location = [85,41];
    legend_index = 1;
    range_index = 2.5;
    map_file = "china-topojson/65.json";
    cities_area = {'巴州': 471500, '铁门关': 590.27, '和田': 247800, '昆玉': 687.13, '哈密': 138919, '阿克苏': 127144, '阿勒泰': 117989.21, '北屯': 911, '喀什': 137578, '塔城': 105400, '昌吉州': 73900, '克孜勒苏': 72500, '吐鲁番': 69713, '伊犁': 56381, '可克达拉': 979.71, '博尔塔拉州': 27000, '双河': 742.18, '乌鲁木齐': 14216.3, '克拉玛依': 7733, '阿拉尔': 6256.68, '图木舒克': 2003, '五家渠': 742, '石河子': 460};
  }
  // 这边设置
  else if (simple_province_name === "福建")
  {
    simple_province_name = "福建";
    cities = ['南平', "三明", "龙岩", "宁德", "福州", "漳州", "泉州", "莆田", "厦门"];
    center_location = [118.3008, 25.9277];
    legend_index = 1;
    small_index = 10000;
    range_index = 8;
    map_file = "china-topojson/35.json";
    cities_area = {"福州": 12250.72, "厦门": 1699.39 ,"莆田": 4130.78 ,"三明": 22964.77, "泉州": 11286.59, "漳州": 12879.62, "南平": 26279.67, "龙岩": 19027.62, "宁德": 13431.98};
  }

  // 
  else if (simple_province_name === "浙江"){
    simple_province_name = "浙江"; // 省份简称
    // 地级市简称，顺序务必按照geojson的顺序
    cities = ['丽水', "杭州", "温州", "宁波", "舟山", "台州", "金华", "衢州", "绍兴", "嘉兴", "湖州"];
    center_location = [120.498,29.0918];
    legend_index = 5; // 最大值是 legend_index * 64
    range_index = 8;
    map_file = "china-topojson/33.json"; // topojson 的位置，先使用网站将geojson 转化为 topojson， https://jeffpaine.github.io/geojson-topojson/ 
    cities_area = {"杭州": 16850.03, "宁波": 9714.65, "温州": 12064.77, "嘉兴": 4222.87, "湖州": 5820.26, "绍兴": 8279.08, "金华": 10941.75, "衢州": 8844.55, "舟山": 22200, "台州": 10037.91, "丽水": 17275.20}
    // 各个地级市的面积，请务必使用简称（不带市或者州之类的内容）
  }
//   else if (simple_province_name === "浙江"){
//   simple_province_name = "浙江" // 省份简称
//   // 地级市简称，顺序务必按照geojson的顺序
//   cities = ['丽水', "杭州", "温州", "宁波", "舟山", "台州", "金华", "衢州", "绍兴", "嘉兴", "湖州"]
//   center_location = [120.498,29.0918]
//   legend_index = 5 // 最大值是 legend_index * 64
//   range_index = 8
//   map_file = "../china-topojson/33.json" // topojson 的位置，先使用网站将geojson 转化为 topojson， https://jeffpaine.github.io/geojson-topojson/ 
//   cities_area = {"杭州": 16850.03, "宁波": 9714.65, "温州": 12064.77, "嘉兴": 4222.87, "湖州": 5820.26, "绍兴": 8279.08, "金华": 10941.75, "衢州": 8844.55, "舟山": 22200, "台州": 10037.91, "丽水": 17275.20}
//   // 各个地级市的面积，请务必使用简称（不带市或者州之类的内容）
// }

  else if (simple_province_name === "河北"){
    simple_province_name = "河北";
    cities = ['承德', '张家口', '保定', '唐山', '沧州', '石家庄', '邢台', '邯郸', '秦皇岛', '衡水', '廊坊'];
    center_location = [115.4004,39.4688];
    legend_index = 3;
    range_index = 5 ;
    map_file = "china-topojson/13.json";
    cities_area = {'承德': 39519 , '张家口': 36800, '保定': 22190, '唐山': 13472, '沧州': 14000, '石家庄': 14464, '邢台': 12400, '邯郸': 12073.8, '秦皇岛': 7813, '衡水': 8815, '廊坊': 6429};
  }

  else if (simple_province_name === "江苏"){
    simple_province_name = "江苏"
    cities = ['盐城', '徐州', '南通', '淮安', '苏州', '宿迁', '连云港', '扬州', '南京', '泰州', '无锡', '常州', '镇江']
    center_location = [118.8586, 32.915]
    legend_index = 2
    range_index = 7
    map_file = "china-topojson/32.json"
    cities_area = {'盐城': 16931, '徐州': 11258, '南通': 8544, '淮安': 10072, '苏州': 8488.42, '宿迁': 8555, '连云港': 7615, '扬州': 6634, '南京': 6587, '泰州': 5787, '无锡': 4627.47, '常州': 4375, '镇江': 3847}
  }

  else if (simple_province_name === "吉林"){
    simple_province_name = "吉林"
    cities = ['延边', '吉林', '白城', '松原', '长春', '白山', '通化', '四平', '辽源']
    center_location = [125.7746,43.5938]
    legend_index = 1
    range_index = 6
    map_file = "china-topojson/22.json"
    cities_area = {'延边': 43300, '吉林': 27120, '白城': 25685, '松原': 22000, '长春': 20593.5, '白山': 17485, '通化': 15698, '四平': 14323, '辽源': 5140.45}
  }


  else if (simple_province_name === "内蒙古"){
    simple_province_name = "内蒙古"
    cities = ['呼伦贝尔', '阿拉善', '锡林郭勒', '鄂尔多斯', '赤峰', '巴彦淖尔', '通辽', '乌兰察布', '兴安', '包头', '呼和浩特', '乌海']
    center_location = [112.5977,45.3408]
    legend_index = 1
    range_index = 2
    small_index = 100000
    map_file = "china-topojson/15.json"
    cities_area = {'呼伦贝尔': 252777, '阿拉善': 270000, '锡林郭勒': 203000, '鄂尔多斯': 86752, '赤峰': 90021, '巴彦淖尔': 64000, '通辽': 59835, '乌兰察布': 54500, '兴安': 59806, '包头': 27768, '呼和浩特': 17224, '乌海': 1745}
  }

  else if (simple_province_name === "辽宁"){
    simple_province_name = "辽宁"
    cities = ['大连', '朝阳', '丹东', '铁岭', '沈阳', '抚顺', '葫芦岛', '阜新', '锦州', '鞍山', '本溪', '营口', '辽阳', '盘锦']
    center_location = [122.0438,41.0889]
    legend_index = 1
    range_index = 6
    map_file = "china-topojson/21.json"
    cities_area = {'大连': 12573.85, '朝阳': 19736, '丹东': 15222, '铁岭': 13000, '沈阳': 13000, '抚顺': 11271.03, '葫芦岛': 10400, '阜新': 10445, '锦州': 10301, '鞍山': 9252.35, '本溪': 8414, '营口': 5402, '辽阳': 4744, '盘锦': 4102.9}
  }

  else if (simple_province_name === "山东"){
    simple_province_name = "山东"
    cities = ['烟台', '临沂', '潍坊', '青岛', '菏泽', '济宁', '德州', '滨州', '聊城', '东营', '济南', '泰安', '威海', '日照', '淄博', '枣庄', '莱芜']
    center_location = [118.7402,36.4307]
    legend_index = 4
    range_index = 7
    map_file = "china-topojson/37.json"
    cities_area = {'烟台': 13745.95, '临沂': 17191.2, '潍坊': 15859, '青岛': 11282, '菏泽': 12238.62, '济宁': 11187, '德州': 10356, '滨州': 9453, '聊城': 8715, '东营': 8243, '济南': 10244, '泰安': 7761, '威海': 5797, '日照': 5359, '淄博': 5965, '枣庄': 4563, '莱芜': 1739.61}
  }

  else if (simple_province_name === "贵州"){
    simple_province_name = "贵州"
    cities = ['遵义', '黔东南', '毕节', '黔南', '铜仁', '黔西南', '六盘水', '安顺', '贵阳']
    center_location = [106.6113, 26.9385]
    legend_index = 1
    range_index = 6
    map_file = "china-topojson/52.json"
    cities_area = {'遵义': 30762, '黔东南': 30337.1, '毕节': 26853, '黔南': 26197, '铜仁': 18003, '黔西南': 16805, '六盘水': 9965, '安顺': 9267, '贵阳': 8034}
  }

  else if (simple_province_name === "河南"){
    simple_province_name = "河南"
    cities = ['南阳', '信阳', '洛阳', '驻马店', '周口', '商丘', '三门峡', '新乡', '平顶山', '郑州', '安阳', '开封', '焦作', '济源', '许昌', '濮阳', '漯河', '鹤壁']
    center_location = [113.4011,33.8]
    legend_index = 4
    range_index = 7
    small_index = 100000
    map_file = "china-topojson/41.json"
    cities_area = {'南阳': 26509, '信阳': 18925, '洛阳': 15230, '驻马店': 15083, '周口': 11959, '商丘': 10704, '三门峡': 10496, '新乡': 8249, '平顶山': 7882, '郑州': 7446, '安阳': 7413, '开封': 6266, '焦作': 4071.1, '济源': 1931, '许昌': 4996, '濮阳': 4188, '漯河': 2617, '鹤壁': 2182}
  }

  else if (simple_province_name == "山西") {
    cities = ['忻州', '吕梁', '临汾', '晋中', '运城', '大同', '长治', '朔州', '晋城', '太原', '阳泉']
    center_location = [113,37.5]
    legend_index = 1
    range_index = 6
    map_file = "china-topojson/14.json"
    cities_area = {'忻州': 25150, '吕梁': 21140, '临汾': 20275, '晋中': 16391, '运城': 14233, '大同': 14056, '长治': 13955, '朔州': 10700, '晋城': 9490, '太原': 6909, '阳泉': 4559}
  }
  else if (simple_province_name == "安徽") {
    // 疫情数据中包含宿松，它是直辖县，不在下面的列表中
    cities = ['六安', '安庆', '滁州', '宣城', '阜阳', '宿州', '黄山', '亳州', '池州', '合肥', '蚌埠', '芜湖', '淮北', '淮南', '马鞍山', '铜陵']
    center_location = [116.3123,31.8329]
    legend_index = 4
    range_index = 7
    small_index = 100000
    map_file = "china-topojson/34.json"
    cities_area = {'六安': 15451, '安庆': 13590, '滁州': 13398, '宣城': 12340, '宿州': 9787, '阜阳': 10118.17, '黄山': 9807, '亳州': 8374, '池州': 8271.7, '合肥': 11445.1, '蚌埠': 5952, '芜湖': 6026, '淮北': 2732, '淮南': 5571, '马鞍山': 4049, '铜陵': 3008}
  }
  else if (simple_province_name == "江西") {
    cities = ['赣州', '吉安', '上饶', '九江', '抚州', '宜春', '南昌', '景德镇', '萍乡', '鹰潭', '新余']
    center_location = [116.0156,27.1]
    legend_index = 4
    range_index = 7
    map_file = "china-topojson/36.json"
    cities_area = {'赣州': 39379.64, '吉安': 25300, '上饶': 22800, '九江': 18823, '抚州': 18817, '宜春': 18680.42, '南昌': 7402, '景德镇': 5256, '萍乡': 3823.99, '鹰潭': 3556.7, '新余': 3178}
  }
  else if (simple_province_name == "广东") {
    cities = ['清远', '韶关', '湛江', '梅州', '河源', '肇庆', '惠州', '茂名', '江门', '阳江', '云浮', '广州', '汕尾', '揭阳', '珠海', '佛山', '潮州', '汕头', '深圳', '东莞', '中山']
    center_location = [113.4668,22.8076]
    legend_index = 6
    range_index = 5
    map_file = "china-topojson/44.json"
    cities_area = {'清远': 19000, '韶关': 18218.06, '湛江': 13225.44, '梅州': 15864.50, '河源': 15642, '肇庆': 15000, '惠州': 11599, '茂名': 11458, '江门': 9505, '阳江': 7955.9, '云浮': 7785.11, '广州': 7434.4, '汕尾': 5271, '揭阳': 5240.5, '珠海': 1711.24, '佛山': 3875, '潮州': 3679, '汕头': 2198.7, '深圳': 1997.47, '东莞': 2460.1, '中山': 1783.67}
  }
  else if (simple_province_name == "广西") {
    cities = ['百色', '河池', '桂林', '南宁', '柳州', '崇左', '来宾', '玉林', '梧州', '贺州', '钦州', '贵港', '防城港', '北海']
    center_location = [107.7813,23.6426]
    legend_index = 6
    range_index = 6
    map_file = "china-topojson/45.json"
    cities_area = {'百色': 36252, '河池': 33500, '桂林': 27800, '南宁': 22112, '柳州': 18618, '崇左': 17440, '来宾': 13411, '玉林': 12800, '梧州': 12588, '贺州': 11800, '钦州': 10843, '贵港': 10606, '防城港': 6173, '北海': 3337}
  }
  else if (simple_province_name == "湖南") {
    cities = ['怀化', '永州', '邵阳', '郴州', '常德', '湘西', '衡阳', '岳阳', '益阳', '长沙', '株洲', '张家界', '娄底', '湘潭']
    center_location = [111.5332,27.3779]
    legend_index = 6
    range_index = 6
    map_file = "china-topojson/43.json"
    cities_area = {'怀化': 27572.54, '永州': 22441, '邵阳': 20824, '郴州': 19387, '常德': 18189.8, '湘西': 15462, '衡阳': 15310, '岳阳': 15019.2, '益阳': 12144, '长沙': 11819, '株洲': 11262, '张家界': 9653, '娄底': 8117.6, '湘潭': 5005.8}
  }
  else if (simple_province_name == "四川") {
    cities = ['甘孜', '阿坝州', '凉山', '绵阳', '达州', '广元', '雅安', '宜宾', '乐山', '南充', '巴中', '泸州', '成都', '资阳', '攀枝花', '眉山', '广安', '德阳', '内江', '遂宁', '自贡']
    center_location = [101.9199,30.1904]
    legend_index = 7
    range_index = 4
    small_index = 100000
    map_file = "china-topojson/51.json"
    cities_area = {'甘孜': 153002, '阿坝州': 84242, '凉山': 60400, '绵阳': 20248.4, '达州': 16591, '广元': 16314, '雅安': 15046, '宜宾': 13283, '乐山': 12720.03, '南充': 12477, '巴中': 12292, '泸州': 12232.34, '成都': 14335, '资阳': 5757, '攀枝花': 7440.398, '眉山': 7134, '广安': 6339.22, '德阳': 5910, '内江': 5385, '遂宁': 5300, '自贡': 4381}
  }
  else if (simple_province_name == "陕西") {
    cities = ['榆林', '延安', '汉中', '安康', '商洛', '宝鸡', '渭南', '咸阳', '西安', '铜川']
    center_location = [109,35.5]
    legend_index = 1
    range_index = 4.5
    map_file = "china-topojson/61.json"
    cities_area = {'榆林': 43578, '延安': 37037, '汉中': 27246, '安康': 23391, '商洛': 19851, '宝鸡': 18117, '渭南': 13030, '咸阳': 9543.6, '西安': 10752, '铜川': 3882}
  }
  else if (simple_province_name == "甘肃") {
    cities = ['酒泉', '张掖', '甘南州', '武威', '陇南', '庆阳', '白银', '定西', '天水', '兰州', '平凉', '临夏', '金昌', '嘉峪关']
    center_location = [99.7129,37.5]
    legend_index = 1
    range_index = 3
    map_file = "china-topojson/62.json"
    cities_area = {'酒泉': 192000, '张掖': 40874, '甘南州': 38521, '武威': 33238, '陇南': 27923, '庆阳': 27119, '白银': 21158.7, '定西': 20330, '天水': 14325, '兰州': 13100, '平凉': 11325, '临夏': 8169, '金昌': 9593, '嘉峪关': 2935}
  }
  else if (simple_province_name == "青海") {
    cities = ['海西州', '玉树', '果洛', '海南州', '海北州', '黄南州', '海东', '西宁']
    center_location = [95.2402,35.4199]
    legend_index = 1
    range_index = 4
    map_file = "china-topojson/63.json"
    cities_area = {'海西州': 300700, '玉树': 267000, '果洛': 76400, '海南州': 44500, '海北州': 34389.89, '黄南州': 18200, '海东': 13200, '西宁': 7660}
  }
  else if (simple_province_name == "宁夏") {
    cities = ['吴忠', '中卫', '固原', '银川', '石嘴山']
    center_location = [105.9961,37.3096]
    legend_index = 1
    range_index = 8
    map_file = "china-topojson/64.json"
    cities_area = {'吴忠': 21400, '中卫': 17000, '固原': 10540, '银川': 9025.38, '石嘴山': 5310}
  }
  else if (simple_province_name == "新疆") {
    cities = ['巴州', '铁门关', '和田', '昆玉', '哈密', '阿克苏', '阿勒泰', '北屯', '喀什', '塔城', '昌吉州', '克州', '吐鲁番', '伊犁', '可克达拉', '博州', '双河', '乌鲁木齐', '克拉玛依', '阿拉尔', '图木舒克', '五家渠', '石河子']
    center_location = [85,41]
    legend_index = 1
    range_index = 2.5
    map_file = "china-topojson/65.json"
    cities_area = {'巴州': 471500, '铁门关': 590.27, '和田': 247800, '昆玉': 687.13, '哈密': 138919, '阿克苏': 14450, '阿勒泰': 117989.21, '北屯': 911, '喀什': 162000, '塔城': 105400, '昌吉州': 73900, '克州': 72500, '吐鲁番': 69713, '伊犁': 268593, '可克达拉': 979.71, '博州': 27000, '双河': 742.18, '乌鲁木齐': 14216.3, '克拉玛依': 7733, '阿拉尔': 6256.68, '图木舒克': 2003, '五家渠': 742, '石河子': 460}
  }
  else if (simple_province_name == "海南") {
    cities = ['儋州', '文昌', '乐东', '三亚', '琼中', '东方', '海口', '万宁', '澄迈', '白沙', '琼海', '昌江', '临高', '陵水', '屯昌', '定安', '保亭', '五指山']
    center_location = [109.9512,19.2041]
    legend_index = 1
    range_index = 12
    map_file = "china-topojson/46.json"
    cities_area = {'儋州': 3400, '文昌': 2488, '乐东': 2765.5, '三亚': 1919.58, '琼中': 2704.66, '东方': 2266.62, '海口': 3145.93, '万宁': 4433.6, '澄迈': 2076, '白沙': 2117.73, '琼海': 1710, '昌江': 1569, '临高': 1317, '陵水': 1128, '屯昌': 1231.5, '定安': 1197, '保亭': 1166.6, '五指山': 1169}
  }
  else if (simple_province_name == "云南") {
    cities = ['普洱', '红河', '文山', '曲靖', '楚雄', '大理', '临沧', '迪庆', '昭通', '昆明', '丽江', '西双版纳', '保山', '玉溪', '怒江', '德宏']
    center_location = [101.0652,25.1807]
    legend_index = 1
    range_index = 4
    map_file = "china-topojson/53.json"
    cities_area = {'普洱': 45385.34, '红河': 32931, '文山': 32239, '曲靖': 28900, '楚雄': 29000, '大理': 29459, '临沧': 24000, '迪庆': 23870, '昭通': 23021, '昆明': 21473, '丽江': 20600, '西双版纳': 19582.45, '保山': 19600, '玉溪': 15285, '怒江': 14703, '德宏': 11500}
  }
  else if (simple_province_name == "西藏") {
    cities = ['那曲', '阿里', '日喀则', '林芝', '昌都', '山南', '拉萨']
    center_location = [87.8695,31.6846]
    legend_index = 1
    range_index = 3
    map_file = "china-topojson/54.json"
    cities_area = {'那曲': 369674, '阿里': 337174.95, '日喀则': 182000, '林芝': 117000, '昌都': 110000, '山南': 79253.53, '拉萨': 31662}
  }
  else if (simple_province_name == "黑龙江") {
    cities = ['黑河', '大兴安岭', '哈尔滨', '齐齐哈尔', '牡丹江', '绥化', '伊春', '佳木斯', '鸡西', '双鸭山', '大庆', '鹤岗', '七台河']
    center_location = [126.1445,48.7156]
    legend_index = 2
    range_index = 3
    map_file = "china-topojson/23.json"
    cities_area = {'黑河': 68726, '大兴安岭': 83000, '哈尔滨': 53100, '齐齐哈尔': 42500, '牡丹江': 40600, '绥化': 34873.1, '伊春': 32800.29, '佳木斯': 32460, '鸡西': 22500, '双鸭山': 22483, '大庆': 22161, '鹤岗': 14684, '七台河': 6221}
  }
}

function get_pinyin_name(chinese_name){
  let pinyin_str
  if (chinese_name === "陕西")
    pinyin_str = "Shaanxi"
  else if (chinese_name === "全国")
    pinyin_str = "China"
  else if (chinese_name === "香港")
    pinyin_str = "HongKong"
  else if (chinese_name === "澳门")
    pinyin_str = "Macau"
  else if (chinese_name === "内蒙古")
    pinyin_str = "Inner Mongolia"
  else if (chinese_name === "西藏")
    pinyin_str = "Tibet"
  else if (chinese_name === "西安")
    pinyin_str = "Xi'an"
  else if (chinese_name === "湖南")
    pinyin_str = "Hunan"
  else if (chinese_name === "河南")
    pinyin_str = "Henan"
  else if (chinese_name === "宁夏")
    pinyin_str = "Ningxia"
  else if (chinese_name === "台湾")
    pinyin_str = "Taiwan"
  else if (chinese_name === "甘肃")
    pinyin_str = "Gansu"
  else if (chinese_name === "辽宁")
    pinyin_str = "Liaoning"
  else {
    let result = pinyinlite(chinese_name)
    pinyin_str = ""
    for (let i = 0; i < result.length; i ++)
    {
      pinyin_str += result[i][result[i].length - 1]
    }
  }
  return pinyin_str.toUpperCase()
}


function find_pair(city_list){
  console.log("city_list", city_list)
  console.log("cities", cities)
  let city_dict = new Array()
  for (let i = 0; i < city_list.length; i ++)
  {
    city_dict[city_list[i]] = city_list[i]
    for (let j = 0; j < cities.length; j ++)
    {
      if (city_list[i].indexOf(cities[j]) >= 0)
      {
        city_dict[city_list[i]] = cities[j]
      }
    }
  }
  if (simple_province_name === "河南"){
    city_dict["永城"] = "商丘"
    city_dict["长垣"] = "新乡"
    city_dict["滑县"] = "安阳"
    
  }
  else if (simple_province_name === "新疆"){
    city_dict["新疆生产建设兵团"] = "乌鲁木齐"
    city_dict["第一师"] = "阿拉尔"
    city_dict["第二师"] = "铁门关"
    city_dict["第三师"] = "图木舒克"
    city_dict["第四师"] = "可克达拉"
    city_dict["第五师"] = "双河"
    city_dict["第六师"] = "五家渠"
    city_dict["第七师"] = "胡杨河"
    city_dict["第八师"] = "石河子"
    city_dict["第九师"] = "塔城地区"
    city_dict["第十师"] = "北屯"
    city_dict["第十一师"] = "乌鲁木齐"
    city_dict["第十二师"] = "乌鲁木齐"
    city_dict["第十三师"] = "哈密"
    city_dict["第十四师"] = "昆玉"
    city_dict["兵团第一师"] = "阿拉尔"
    city_dict["兵团第二师"] = "铁门关"
    city_dict["兵团第三师"] = "图木舒克"
    city_dict["兵团第四师"] = "可克达拉"
    city_dict["兵团第五师"] = "双河"
    city_dict["兵团第六师"] = "五家渠"
    city_dict["兵团第七师"] = "胡杨河"
    city_dict["兵团第八师"] = "石河子"
    city_dict["兵团第九师"] = "塔城地区"
    city_dict["兵团第十师"] = "北屯"
    city_dict["兵团第十一师"] = "乌鲁木齐"
    city_dict["兵团第十二师"] = "乌鲁木齐"
    city_dict["兵团第十三师"] = "哈密"
    city_dict["兵团第十四师"] = "昆玉"
  }
  else if (simple_province_name === "安徽"){
    city_dict["宿松"] = "安庆"
  }
  else if (simple_province_name === "重庆"){
    city_dict["万盛经开区"] = "綦江"
    // city_dict["高新区"] = "沙坪坝"
    
  }
  else if (simple_province_name === "陕西"){
    city_dict["韩城"] = "渭南"
    city_dict["杨凌示范区"] = "咸阳"
    city_dict["杨凌"] = "咸阳"
  }
  else if (simple_province_name === "吉林"){
    city_dict["公主岭"] = "四平"
  }
  else if (simple_province_name === "宁夏"){
    city_dict["灵武"] = "银川"
  }

  console.log(city_dict)
  return city_dict
}
