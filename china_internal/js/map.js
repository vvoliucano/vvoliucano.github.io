
pre_dir = "";
let play_button_image = pre_dir + "image/play-button.png";
let stop_button_image = pre_dir + "image/stop-button.png";
// let last_day 
let color_add = [{"color": "#78CE6A", "text": "新增下降"}, {"color": "#FCC265", "text": "新增持平"}, {"color": "#F4806A", "text": "新增上升"}]


let change_mode = "accu"
// change_mode = "add"
let direct_city = ["台湾", "天津", "上海", "香港", "澳门", "重庆"]

let full_province_name;
let legend_index;
let cities;
let for_yangshi = false
let map_file;
let extra_info_pre = ""
let see_number = true
let see_guojia = true
let from_last = true
let last_ncov_value
let ncov_value
let minus_ncov_data
let add_name = ""
let carto
let topology,
    geometries,
    carto_features;
let button_selected_color = "#D75E5E"
let total_array
if (change_mode === "add"){
  add_name = "新增"
  button_selected_color = color_add[0].color
}


if (for_yangshi){
  see_number = false
}


let full_province_name_dict = {"天津": "天津市", "上海": "上海市", "重庆": "重庆市", "河北": "河北省", "山西": "陕西省", "辽宁": "辽宁省", "北京": "北京市", "吉林": "吉林省", "黑龙江": "黑龙江省", "江苏": "江苏省", "浙江": "浙江省", "安徽": "安徽省", "福建": "福建省", "江西": "江西省", "山东": "山东省", "河南": "河南省", "湖北": "湖北省", "湖南": "湖南省", "广东": "广东省", "海南": "海南省", "四川": "四川省", "贵州": "贵州省", "云南": "云南省", "陕西": "陕西省", "甘肃": "甘肃省", "青海": "青海省", "台湾": "台湾省", "内蒙古": "内蒙古自治区", "广西": "广西壮族自治区", "西藏": "西藏自治区", "宁夏": "宁夏回族自治区", "新疆": "新疆维吾尔自治区", "香港": "香港特别行政区", "澳门": "澳门特别行政区"}
// [14,1,18,6,142,428,129,182,17,46,8,114,29,112,10,7]
let cities_area;
// simple_province_name = "内蒙古"
let last_total = 0

let current_province_add 
let small_index = 100000
let color_ncov = ["#FFC1BB", "#F6978E", "#D9736A", "#DF5C50", "#CF4033", '#9F3026', '#881719']
let need_update_states = false
// let method = "log"
let provinces_area 
let is_playing = true
let provinces
let provinces_number
let ncov_data
let ncov_data_new
let ncov_data_accu
let begin_date
let current_step = 0
let defalt_method = "normal"
let method = defalt_method
let map_margin = {left: 0, right: 0, top: 0, bottom: 0}
let map_width = document.getElementById('map').clientWidth - map_margin.left - map_margin.right,
    map_height = document.getElementById('map').clientHeight - map_margin.top - map_margin.bottom;

// console.log(ncov_data)

let title_left = map_width * 0.05
let title_top = map_height * 0.09
let title_font_size = map_height * 0.034

let date_left = map_width * 0.05
let date_top = map_height * 0.12
let date_font_size = map_height * 0.02


let scale_button_right = map_width * 0.95
let scale_button_top = map_height * 0.08
let scale_button_width = map_height * 0.15
let scale_button_height = map_height * 0.05
let scale_button_font = map_height * 0.025

let legend_left = map_width * 0.05
let legend_top = map_height * 0.3
let legend_width = map_height * 0.1
let legend_height = map_height * 0.03
let legend_opacity = 0.8
let legend_skip = 2

let play_left = map_width * 0.9
let play_top = map_height * 0.5
let play_width = map_width * 0.05
let play_opacity = 0.3

let day_left = map_width * 0.05
let day_top = map_height * 0.95 
let day_size = map_height * 0.06

let total_left = map_width * 0.05 
let total_top = map_height * 0.85
let total_font_size = map_height * 0.04

let extra_info_left = map_width * 0.7
let extra_info_top = map_height * 0.85
let extra_info_font_size = map_height * 0.02

// 数据来源
let info_left = map_width * 0.75
let info_top = map_height * 0.94
let info_font_size = map_height * 0.014
let info_top_second = map_height * 0.96

let copyright_left = map_width * 0.5 - map_height * 0.1
let copyright_top = map_height * 0.92
let copyright_height = map_height * 0.05


let nanhai_left = map_width * 0.8
let nanhai_top = map_height * 0.67
let nanhai_width = map_width * 0.1
let nanhai_height = map_width * 0.12


let toggle_switch_left = map_width * 0.05
let toggle_switch_top = map_height * 0.15
let toggle_switch_width = map_height * 0.06
let toggle_switch_height = map_height * 0.025
let toggle_text_size = map_height * 0.025

let province_font_size = map_height * 0.02

let map_svg
let toggle_switch 
let states
let nanhai_svg
let texts
let total_info
let new_add_info
let extra_info
let data_info 
let src_info
let date
let title
let log_button, linear_button, normal_button
let scale_button
let day_info

function carto_map_load(simple_name)
{
  small_index = 100000
  current_step = 1
  d3.select("head").select("title").text(simple_name + "新冠肺炎疫情")
  simple_province_name = simple_name
  initialize_province_set(simple_province_name) // 设置一些基本的函数
  adjust_for_phone(map_height, map_width)
  provinces = cities
  provinces_number = provinces.length
  provinces_area = cities_area
  map_svg = add_svg()
  toggle_switch = add_toggle(map_svg)
  title = add_title(map_svg)
  // add_date(map_svg)
  states = map_svg.append("g")
      .attr("id", "states")
      .selectAll("path");
  nanhai_svg = map_svg.append("g")
    .attr("id", "nanhai")

  texts = map_svg.append("g")
    .attr("id", "text")

  date = map_svg.append("g")
    .attr("transform", "translate(" + date_left  + "," + date_top  + ")")
    
  date.append("text")
    .attr('font-size', date_font_size)
    .attr('text-anchor', "start")
    .style("fill", "#666")

  scale_button = map_svg.append('g')
    .attr('id', "scale_button")
    .attr("transform", function(d){
      return "translate(" + scale_button_right + "," + scale_button_top + ")"
    })
  initialize_method_button()
  load_legend()
  //添加播放按钮
  add_play_image()
  add_copyright()
  load_many_info()
  day_info = add_day_info()
  main_load()
}


function add_play_image(){
  map_svg.append("image")
    .attr("xlink:href", play_button_image)
    .attr("x", play_left)
    .attr("y", play_top)
    .attr("id", "play")
    .attr("width", play_width)
    .attr("opacity", play_opacity)
    .on("click", function(d, i){
      if (!is_playing){
        console.log("continue play")
        play_button()
      }
      else if (is_playing){
        stop_button()
      }
    })
}

function add_copyright(){
  map_svg.append("image")
      .attr("xlink:href", pre_dir + "image/icon.png")
      .attr("x", copyright_left)
      .attr("y", copyright_top)
      .attr("id", "play")
      .attr("height", copyright_height)
}


function add_day_info(){
  let day_info = map_svg.append("g")
    .attr("transform", "translate(" + day_left + "," + day_top + ")")
    .append("text")
    .attr("id", "day")
    .attr('font-size', day_size)
    .attr('text-anchor', "start")
    .style("fill", "#666")
  return day_info
}

function load_many_info()
{
  total_info = map_svg.append("g")
    .attr("transform", "translate(" + total_left  + "," + total_top + ")")
    .append("text")
    .attr("id", "day")
    .attr('font-size', total_font_size)
    .attr('text-anchor', "start")
    .style("fill", "#666")
    .text("")

  new_add_info = map_svg.append("g")
    .attr("transform", "translate(" + total_left  + "," + (total_top -40) + ")")
    .append("text")
    .attr("id", "day")
    .attr('font-size', total_font_size)
    .attr('text-anchor', "start")
    .style("fill", "#666")
    .text("")

  extra_info = map_svg.append("g")
    .attr("transform", "translate(" + extra_info_left  + "," + (extra_info_top) + ")")
    .append("text")
    .attr("id", "day")
    .attr('font-size', extra_info_font_size)
    .attr('text-anchor', "start")
    .style("fill", "#666")
    .text(extra_info_pre)

  data_info = map_svg.append("g")
    .attr("transform", "translate(" + info_left  + "," +  info_top + ")")
    .append("text")
    .attr("id", "day")
    .attr('font-size', info_font_size)
    .attr('text-anchor', "start")
    .text("数据来源：国家卫生健康委员会")
    .style("fill", "#444")
    .style("text-decoration", "underline")

  src_info = map_svg.append("g")
    .attr("transform", "translate(" + info_left  + "," + info_top_second  + ")")
    .append("text")
    .attr("id", "day")
    .attr('font-size', info_font_size)
    .attr('text-anchor', "start")
    .text("变形地图库：github.com/emeeks")
    .style("fill", "#444")
    .style("text-decoration", "underline")
}
// https://gist.github.com/emeeks/d57083a45e60a64fe976




function update_current_step(){
  last_ncov_value = ncov_value
  // current_step = current_step - 1
  ncov_value = get_value_from_someday(ncov_data, current_step);
  // current_step = current_step + 1
  console.log(current_step)
  console.log(ncov_value);
  update_ncov_data(ncov_value, 500)
}

function play(table_data)
{
  is_playing = true
  d3.select("#play").attr("xlink:href", stop_button_image)
  console.log("???")
  if (for_yangshi || from_last){
    current_step = ncov_data[0].length - 1
    run_on_step(current_step)
  }
  else {
    current_step = 1
    run_on_step(1)
  }


  // for (let i = 0; i < ncov_data[0].length - 1; i ++){
  //       setTimeout(function(){
  //         day = "1月" + (i + 4) + "日";
  //         console.log(day);
  //         let ncov_value = get_value_from_someday(table_data, i + 1);
  //         console.log(ncov_value);
  //         update_ncov_data(ncov_value, 500)
  //         let total_number = 0;
  //         for (j = 0; j < provinces_number; j ++){
  //           total_number = total_number + table_data[j][i + 1]
  //         }
  //         // parseInt(table_data[34][day]) + parseInt(table_data[28][day]) + parseInt(table_data[32][day]) + parseInt(table_data[33][day])
  //         console.log(total_number)
  //         update_total(total_number)
  //         update_day(day)
  //         if (i == ncov_data[0].length - 2){
  //           is_playing = false
  //           d3.select("#play").attr("xlink:href", "./play-button.png")
  //         }
  //       },600 * i)
  // }
}

function run_on_step(i)
{
  if (!is_playing)
    return
  current_step = i
  setTimeout(function(){
    if (!is_playing)
      return
    day = get_day(i);
    // console.log(day);
    console.log("day", day)
    last_ncov_value = ncov_value
    ncov_value = get_value_from_someday(ncov_data, i );
    console.log("ncov_value", ncov_value);
    update_ncov_data(ncov_value, 500)
    total_number = get_total_number(i)
    update_extra_info(ncov_value)
    // total_number_guojia = get_total_number_from_guojia(i)
    // console.log("total number", total_number)
    // console.log("total_number_guojia", total_number_guojia)
    // parseInt(table_data[34][day]) + parseInt(table_data[28][day]) + parseInt(table_data[32][day]) + parseInt(table_data[33][day])
    // console.log(total_number)   
    update_total()
    update_day(day)
    if (i == ncov_data[0].length - 1){
      stop_button()
    }    
    run_on_step(i + 1)
  },600)
}

function update_extra_info(ncov_value){
  let extra_info_string = ""
  if (ncov_value.hasOwnProperty(-1) && ncov_value[-1] > 0){
      extra_info_string = "注：另有" + ncov_value[-1] + "名确诊患者未公布详尽地区"
  }

  extra_info.text( extra_info_string )
}

function get_total_number(date_index){
  // let total_number = 0
  // console.log(get_day(date_index))
  // for (i = 1; i < date_index; i ++ ){
  //   console.log(current_province_add[get_day(date_index)])
  //   total_number += parseInt(current_province_add[get_day(date_index)])
  // }
  // console.log(total_number)
  // return total_number

  let total_number = 0;
  for (j = 0; j < ncov_data.length; j ++){
    // console.log(ncov_data[j])
    // console.log(ncov_data[j][date_index ])
    if (ncov_data[j][0] == "total"){
      if (see_guojia)
        return ncov_data[j][date_index]
      continue
    }
    total_number = total_number + ncov_data[j][date_index]
  }
  console.log("province", total_number)
  // console.log("guojia", get_total_number_from_guojia(date_index))
  return total_number
}

function get_total_number_from_guojia(date_index){
  let tot

  return total_number
}


function update_day(day)
{
  day_info.text(day)
}

function update_total()
{
  console.log("current_step", current_step)
  total_number = get_total_number(current_step)
  let pre_name = "累计确诊："
  if (change_mode === "add")
    pre_name = "新增确诊："
  total_info.text(pre_name + total_number)
  // total_info.text("累计确诊：" + total_number)
}


function get_value_from_someday(table_data, day){
  let ncov_value = new Array()
  for (i = 0; i < ncov_data.length; i ++ )
  {

    // console.log(table_data[i])
    // console.log(table_data[i]["1月5日'"])
    // console.log(table_data[i][0])
    if (table_data[i][0] === "total")
      continue
    let index = provinces.indexOf(table_data[i][0])
    if (day <= 0 ){
      ncov_value[index] = 0
    }
    else if (ncov_value.hasOwnProperty(index)){
      ncov_value[index] += parseInt(table_data[i][day])
    }
    else
      ncov_value[index] = parseInt(table_data[i][day])
  }
  // console.log("value", ncov_value)
  // window._ncov_value = ncov_value
  return ncov_value;
}

function update_ncov_data(day_ncov_value, set_time = 3000, initialize = false){
  let value_array = new Array()//[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  for (i = 0; i < provinces_number; i ++){
    if (initialize)
    {
      value_array[i] = provinces_area[provinces[i]]
    }
    else if (method == "log"){
      value_array[i] = Math.log(day_ncov_value[i] + 1 ) + provinces_area[provinces[i]]/(small_index * 2)
      if (provinces[i] == simple_province_name)
        value_array[i] = value_array[i] * 1.5
    }
    else if (method == "normal")
      value_array[i] = provinces_area[provinces[i]]
    else{
      value_array[i] = day_ncov_value[i] + provinces_area[provinces[i]]/small_index
    }
    // 
  }
  // console.log("看看数值", value_array)


  carto.value(function (d, i ) {
    // let ret = Math.floor(Math.random() * 500)
    let this_value = parseFloat(value_array[i])
    // console.log(this_value)
    return this_value 
    // return 1;
  });

  carto_features = carto(topology, geometries).features;

  states.data(carto_features)
    .text(function (d, i ) {
      return provinces[i];
    })

  // console.log(carto.path)

  // states.transition()
  //     .duration(set_time)
  //     .attr("d", carto.path)
  //     .attr("fill", function(d, i){
  //         // let city_index = parseInt(d.properties.id[3]) - 1
  //         let value = day_ncov_value[i];
  //         return get_color(value)

  //         // return "white"
  //       })
  console.log("current step", current_step)
  let current_new_add = get_value_from_someday(ncov_data_new, current_step)
  let last_new_add = get_value_from_someday(ncov_data_new, current_step - 1)
  
  console.log("current new add", current_new_add)
  let current_accu = get_value_from_someday(ncov_data_accu, current_step)
  console.log("last new add", last_new_add)
  console.log("current accumulate", current_accu)
  console.log("current new add", day_ncov_value)

  d3.selectAll(".state")
    .attr("new_d", carto.path)
    // .each(function(d){
    //   console.log(get_centroid(d3.select(this).attr("new_d"))) 
    // })

  let duration_contain = d3.transition()
      .duration(set_time)

  let province_name = duration_contain.selectAll(".name")

  let current_states = duration_contain.selectAll(".state")

  if (for_yangshi && method === "normal"){
  }
  else{
    current_states
      .attr("d", carto.path)
      
    province_name.attr("transform", function(d, i){
        // console.log(bbox)
        center = get_centroid(d3.select('#province_' + i).attr("new_d"))
        // console.log("center", center)
        // console.log(bbox.x + bbox.width/2, bbox.y + bbox.height/2)
        center = adjust_position(center, i)
        return "translate(" + center[0] + "," + center[1] + ")"
      })
  }

  current_states.attr("fill", function(d, i){
      // let city_index = parseInt(d.properties.id[3]) - 1
      if (initialize)
        return get_color(0)
      if (change_mode === "add"){
        // console.log("change_mode add")
        if (current_accu[i] === 0)
        {
          // return get_color(0)
          return color_add[0].color
        }
        else if (current_accu[i] > 0 && current_new_add[i] === 0)
        {
          return color_add[0].color
        }
        
        let this_new_add_single = day_ncov_value[i]
        let last_new_add_single = last_new_add[i]
        console.log(cities[i] + "this value:" + this_new_add_single + "last value:" + last_new_add_single)
        let this_value = (this_new_add_single - last_new_add_single)/parseFloat(last_new_add_single + 0.001)
        // if (Math.abs(this_value) < 0.05 )
        console.log("color value", this_value)
        if (this_value < -0.05)
          return color_add[0].color
        if (this_value > 0.05)
          return color_add[2].color
        return color_add[1].color
      }
      console.log("?????")
      let value = day_ncov_value[i];
      return get_color(value)
      // return "white"
  })



  // console.log(carto.path)
  

  province_name.selectAll(".province_number")
      .text(function(d){
        return day_ncov_value[provinces.indexOf(d)]
      })
      .attr("fill-opacity", function(d,i){
        if (day_ncov_value[provinces.indexOf(d)] == 0 || initialize || !see_number)
          return 0
        return 1
      })
      // .attr("font-size", function(d, i){
      //   if (initialize)
      //     return "1em"
      //   let font_size = value_array[provinces.indexOf(d)]
      //   if (method == "log")
      //     return (font_size/10 + 1) + "em"
      //   // if (method == "normal")
      //   //   return "1em"

      //   return (Math.log(value_array[provinces.indexOf(d)] + 1) / 10 + 1) + "em"
      // })
      .attr("y", province_font_size)

  province_name.selectAll(".province_name")
      .attr("fill-opacity", function(d, i){
        if (initialize)
          return 1
        if (day_ncov_value[provinces.indexOf(d)] == 0)
          return 0
        return 1
      })

}

function adjust_position(center, i){
  let position = new Array()
  position[0] = center[0]
  position[1] = center[1]

  if (provinces[i] == "香港"){
    position[0] = center[0] + map_width * 0.030
    position[1] = center[1] + map_width * 0.015
  }
  else if (provinces[i] == "澳门"){
    position[0] = center[0] - map_width * 0.01
    position[1] = center[1] + map_width * 0.024
  }
  else if (provinces[i] == "内蒙古")
  {  
    position[0] = center[0] - map_width * 0.03
    position[1] = center[1] + map_height * 0.055
  }
  else if (provinces[i] == "天津")
  {  
    position[0] = center[0] + map_width * 0.013
    position[1] = center[1] + map_height * 0.01
  }
  else if (provinces[i] == "河北")
  {  
    // position[0] = center[0] + map_width * 0.01
    position[1] = center[1] + map_height * 0.03
  }
  else if (provinces[i] == "甘肃")
  {  
    position[0] = center[0] + map_width * 0.01
    position[1] = center[1] - map_height * 0.01
  }
  else if (provinces[i] == "天津")
  {  
    position[0] = center[0] + map_width * 0.01
    position[1] = center[1] + map_height * 0.01
  }
  else if (provinces[i] == "东城")
  {  
    position[0] = center[0] + map_width * 0.005
    position[1] = center[1] + map_height * 0.00
  }
  else if (provinces[i] == "西城")
  {  
    position[0] = center[0] - map_width * 0.01
    position[1] = center[1] + map_height * 0.00
  }
  else if (provinces[i] == "石景山")
  {  
    position[0] = center[0] - map_width * 0.01
    position[1] = center[1] + map_height * 0.00
  }
  else if (provinces[i] == "丰台")
  {  
    position[0] = center[0] - map_width * 0.01
    position[1] = center[1] + map_height * 0.01
  }
  else if (provinces[i] == "朝阳")
  {  
    position[0] = center[0] + map_width * 0.01
    position[1] = center[1] - map_height * 0.01
  }
  else if (provinces[i] == "安阳")
  {  
    position[0] = center[0] + map_width * 0.03
    position[1] = center[1] - map_height * 0.02
  }
  else if (provinces[i] == "五家渠")
  {  
    position[0] = center[0] + map_width * 0.0
    position[1] = center[1] - map_height * 0.02
  }
  else if (provinces[i] == "塔城")
  {  
    position[0] = center[0] + map_width * 0.0
    position[1] = center[1] - map_height * 0.02
  }
  else if (provinces[i] == "珠海")
  {  
    position[0] = center[0] + map_width * 0.0
    position[1] = center[1] + map_height * 0.01
  }
  else if (provinces[i] == "深圳")
  {  
    position[0] = center[0] + map_width * 0.0
    position[1] = center[1] + map_height * 0.02
  }
  else if (provinces[i] == "广州")
  {  
    position[0] = center[0] + map_width * 0.0
    position[1] = center[1] - map_height * 0.01
  }
  return position
}

function main_load()
{
  let min_edge = map_width 
  if (map_height < map_width * 3/4)
  {
    min_edge = map_height * 4/3
  }
  let projection = d3.geoAlbers()
    .rotate([-center_location[0], 0])
    .center([-0, center_location[1]])
    .scale(min_edge * range_index )
    .translate([map_width / 2, map_height / 2])


  // let hexTooltip = d3.select("body").append("div").attr("class", "hexTooltip")

  // let pop_data = d3.map();

  carto = d3.cartogram()
      .projection(projection)
      .iterations(30)
      .properties(function (d) {
        // this adds the "properties" properties to the geometries
        return d;
      });
  

  let china_data
  d3.json(map_file)
    .then(function(data){
      if (simple_province_name === "全国")
        add_nanhai()
      topology = data;
      console.log(data)
      geometries = topology.objects.collection.geometries;

      console.log(geometries)
      let features = carto.features(topology, geometries),
        path = d3.geoPath()
          .projection(projection);

      console.log(features)

      // add_nanhai()
      
      states = states.data(features)
          .enter()
          .append("path")
          .attr("class", "state")
          .attr("id", function (d, i) { return "province_" + i; })
          .attr("name", function(d, i){
            return provinces[i]
          })
          .attr("fill", function(d, i){
            // let city_index = parseInt(d.properties.id[3]) - 1
            return "#F2F2F2"

            // return "white"
          })
          // .attr("fill-opacity", 1)
          .attr("d", path)
          .attr("stroke", "#fff")
          .attr("stroke-width", "2px")
          .attr("fill-opacity", 0.9)
          .on("click", function(){
            let name = d3.select(this).attr("name")
            console.log(provinces[i])
            jump_to_china(name)
          })
      
      texts = texts.selectAll(".name")
        .data(provinces)
        .enter()
        .append("g")
        .attr('class', "name")
        .attr("transform", function(d, i){
          center = get_centroid(d3.select('#province_' + i).attr("d"))
          // console.log("center", center)
          // console.log(bbox.x + bbox.width/2, bbox.y + bbox.height/2)
          center = adjust_position(center, i)
          return "translate(" + center[0] + "," + center[1] + ")"
        })
        .attr("id", function(d, i){
          return "province_name_" + i
        })
        .attr("font-size", province_font_size)
        .on("click", function(d, i){
          let name = provinces[i]
          // console.log(provinces[i])
            jump_to_china(name)
          })

      texts.append("text")
        .attr("class", "province_name")
        .attr("text-anchor", "middle")
        .attr("font-size", province_font_size)
        .text(function(d){
          return d
        })
      
      texts.append("text")
        .attr("class", "province_number")
        .attr("text-anchor", "middle")

      
        // province_data = table_data
        // window._table_data = table_data
        // console.log(table_data)

      // d3.csv("https://tanshaocong.github.io/2019-nCoV/detail.csv")
      data_url = "https://tanshaocong.github.io/2019-nCoV/data.csv"
      url = "https://tanshaocong.github.io/2019-nCoV/map.csv"
      d3.csv(url)
        .then(function(data){
          // a = data[1000]
          console.log(url)
          window._data  = data
          // accumulate_data()
          // console.log("old", ncov_data)
          let data_contain = convert_data(data)
          console.log("data_contain", data_contain)
          ncov_data = data_contain.table_data
          minus_ncov_data = data_contain.minus_table_data
          console.log("minus_table_data", minus_ncov_data)
          console.log("old ncov", ncov_data)
          ncov_data = accumulate_data(ncov_data, minus_ncov_data) 
          console.log("new ncov", ncov_data)
          d3.csv("https://tanshaocong.github.io/2019-nCoV/time.csv")
          .then(function(update_time){
            console.log(update_time[0]["time"])
            date.select("text").text("数据截止至 " + update_time[0]["time"])

          })
          .catch(function(error){
            date.select("text").text("数据截止至" + get_day(ncov_data[0].length - 2) + "24时")
          })
          // date.select("text").text("数据截止至" + get_day(ncov_data[0].length - 2) + "24时")
          play(ncov_data)
        })
      // read_data()
    })
    // .catch(function(error){
    //   console.log("error")
    //    // handle error
    // })

  // map_svg.on("click", function(){
  //   let m = d3.mouse(this)
  //   console.log(m)
  //   // draw_closest(m)
  // })
  //
}

function get_centroid(coords){
    coords = coords.replace(/ *[LC] */g,'],[').replace(/ *M */g,'[[[').replace(/ *Z */g,']]]').replace(/ *z */g,']]]').replace(/ /g,'],[');
    if (coords.split("]]][[[").length > 1 ){
      coords = coords.split("]]][[[")[0] + "]]]"
    }
    // console.log(coords)
    return d3.geoPath().centroid({
      "type":"Feature",
      "geometry":{"type":"Polygon","coordinates":JSON.parse(coords)
    }
  });
}

function get_color(value){
  
  if (value == 0)
    return "#F2F2F2"
  if (value <= 2 * legend_index)
    return color_ncov[0]
  if (value <= 4 * legend_index)
    return color_ncov[1]
  if (value <= 8 * legend_index)
    return color_ncov[2]
  if (value <= 16 * legend_index)
    return color_ncov[3]
  if (value <= 32 * legend_index)
    return color_ncov[4]
  if (value <= 64 * legend_index)
    return color_ncov[5]
  // if (value < 640)
  //   return color_ncov[6]
  return color_ncov[6]
}

function add_play(){
  map_svg.append("image")
    .attr("xlink:href", play_button_image)
    .attr("x", map_width * 0.9)
    .attr("y", map_height * 0.5)
    .attr("id", "play")
    .attr("width", map_width * 0.05)
    .attr("opacity", 0.3)
    .on("click", function(d, i){
      if (!is_playing){
        console.log("continue play")
        play_button()
      }
      else if (is_playing){
        stop_button()
      }
    })
    // .attr("height", map_width * 0.12);
}

function stop_button(){
  is_playing = false
  d3.select("#play").attr("xlink:href", play_button_image)
}

function play_button(){
  is_playing = true
  console.log("enter play")
  d3.select("#play").attr("xlink:href", stop_button_image)
  console.log("current_step", current_step)
  console.log("ncov_data[0].length",  ncov_data[0].length)
  if (current_step == ncov_data[0].length - 1 ){
    initialize()
    setTimeout(function(){
      current_step = 1
      run_on_step(1)
    },1000)
  }
  else
    run_on_step(current_step + 1)
}


function initialize(set_time = 500)
{
  last_ncov_value = ncov_value
  ncov_value = get_value_from_someday(ncov_data, current_step - 1);
  console.log(ncov_value);
  update_ncov_data(ncov_value, set_time, true)

}

function get_day(i)
{
  let date = i + begin_date - 1
  if (date > 31)
  {
    return "2月" + (date - 31) + "日"
  }
  return "1月" + date + "日"
}

function get_day_index(day_str)
{
  // console.log(day_str)
  let date_array = day_str.split(/月|日/)
  let month = parseInt(date_array[0])
  let day = parseInt(date_array[1])
  if (month == 1)
    return day
  if (month == 2)
    return day + 31
  if (month == 3)
    return day + 60
  return (month - 1) * 30 + day 


  // let date = i + 10
  // if (date > 31)
  // {
  //   return "2月" + (date - 31) + "日"
  // }
  // return "1月" + date + "日"
  return 0
}

function convert_data(data){ 
    console.log(data)
    let item_number = data.length
    let new_data = new Array()
    let date_list = new Array()
    let minus_data = new Array()

    for (i = 0; i < item_number; i ++)
    {
      let current_item = data[i]
      let city_name
      if (simple_province_name === "全国")
      {
        if (current_item["类别"] === "国家级"){
          city_name = "total"
        }
        else if (current_item["类别"] != "省级")
          continue
        else 
          city_name = current_item["省份"].replace("市", "").replace("恩施州", "恩施").replace("林区", "")
      }
      else {
        if (current_item["类别"] === "省级" && current_item["省份"] === simple_province_name){
          city_name = "total"
          if (current_item["新增确诊病例"] === "")
            continue
        }
        else if (current_item["类别"] != "地区级")
          continue
        else if (current_item["省份"] != simple_province_name && current_item["省份"] != full_province_name_dict[simple_province_name])
          continue
        else
          city_name = current_item["城市"].replace("市", "").replace("恩施州", "恩施").replace("林区", "")
      }
      // city_name = correct_simple_name(city_name)
      // console.log(city_name)
      if (!new_data.hasOwnProperty(city_name))
        new_data[city_name] = new Array()

      if (!minus_data.hasOwnProperty(city_name))
        minus_data[city_name] = new Array()

      let new_add = current_item["新增确诊病例"]
      new_add = parse_to_int(new_add)

      let new_minus = current_item["核减"]
      new_minus = parse_to_int(new_minus)
      if (new_minus !== 0)
        console.log(city_name+ current_item["公开时间"] +  " 核减 " + new_minus )

      minus_data[city_name][current_item["公开时间"]] = new_minus

      if (!new_data[city_name].hasOwnProperty(current_item["公开时间"])){
        new_data[city_name][current_item["公开时间"]] = new_add
      }
      else {
        new_data[city_name][current_item["公开时间"]] += new_add
        // if (parseInt(current_item["新增确诊病例"]) > new_data[city_name][current_item["公开时间"]])
        //   new_data[city_name][current_item["公开时间"]] = parseInt(current_item["新增确诊病例"])
      }
      if (date_list.indexOf(current_item["公开时间"]) === -1)
        date_list.push(current_item["公开时间"])
    }
    console.log("new_data ", new_data)
    console.log("minus data", minus_data)
    date_list = date_list.sort()
    console.log(date_list)
    begin_date = get_day_index(date_list[0])
    end_date = get_day_index(date_list[date_list.length - 1])
    console.log("end_date", begin_date)
    console.log("end_date", end_date)
    diff_day = end_date - begin_date
    console.log(diff_day)

    let table_data = new Array()
    let minus_table_data = new Array()
    let city_list = Object.keys(new_data)
    let city_dict = find_pair(city_list)
    console.log("city_dict", city_dict)
    let used_city = new Array()
    for (i = 0; i < city_list.length; i ++ )
    {
      minus_table_data[i] = new Array()
      minus_table_data[i][0] = city_dict[city_list[i]]

      table_data[i] = new Array()
      table_data[i][0] = city_dict[city_list[i]]

      used_city[i] = city_dict[city_list[i]] 

      for (j = 0; j < diff_day + 1; j ++)
      {
        // console.log(city_list)
        // console.log(city_list[i])
        // console.log()
        if (minus_data[city_list[i]].hasOwnProperty(get_day(j + 1))){
          // console.log(minus_data[city_list[i]][get_day(j + 1)])
          minus_table_data[i][j + 1] = minus_data[city_list[i]][get_day(j + 1)]
        }
        else
          minus_table_data[i][j + 1] = 0

        if (new_data[city_list[i]].hasOwnProperty(get_day(j + 1)))
          table_data[i][j + 1] = new_data[city_list[i]][get_day(j + 1)]
        else table_data[i][j + 1] = 0
      }
      // for (j = 1; j < )
    }

    console.log("old table_data"+ table_data)
    // console.log("minus_table_data", minus_table_data)
    console.log("city_list", city_list)
    console.log("used_city", used_city)
    console.log("cities", cities)
    let city_index = city_list.length
    for (i = 0; i < provinces.length; i ++)
    {
      console.log("正在排查", provinces[i])
      if (used_city.indexOf(provinces[i]) === -1)
      {
        // console.log(provinces[i])
        table_data[city_index] = new Array()
        // console.log(table_data[city_index])
        // table_data[city_index][2] = 0
        minus_table_data[city_index] = new Array()

        table_data[city_index][0] = provinces[i]
        minus_table_data[city_index][0] = provinces[i]
        for (j = 0; j < diff_day + 1; j ++)
        {
          // console.log(city_list)
          // console.log(city_list[i])
          // console.log("asdf" + table_data[city_index])
          minus_table_data[city_index][j + 1] = 0
          table_data[city_index][j + 1] = 0
          // console.log(city_index)
        }
        city_index = city_index + 1
      }
    }
    console.log("new table_data" + table_data)
    let table_data_length = table_data.length
    console.log("table_data_length", table_data_length)
    // for (i = 0; i < table_data_length; i ++ )
    // {
    //   table_data[i][0] = correct_simple_name(table_data[i][0])
    // }
    

    console.log(city_list)
    console.log("new table_data", table_data)
    return {table_data: table_data, minus_table_data: minus_table_data}
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
  }
  else if (simple_province_name === "安徽"){
    city_dict["宿松"] = "安庆"
  }
  else if (simple_province_name === "陕西"){
    city_dict["韩城"] = "渭南"
    city_dict["杨凌示范区"] = "咸阳"
    city_dict["杨凌"] = "杨凌"
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

function modify_name(city_name){
  let new_name 
  if (city_name.indexOf("市") > -1)
    new_name = city_name.replace("市", "")
  else if (city_name.indexOf("州") > -1)
    new_name = city_name.replace("州", "")
  else if (city_name.indexOf("林区") > -1)
    new_name = city_name.replace("林区", "")
  return new_name
}

function correct_simple_name(city_name){
  // console.log(city_name)
  let new_city_name = city_name

  for (i = 0; i < provinces_number; i ++){
    // console.log(provinces[i])
    if (city_name.indexOf(provinces[i]) === 0){
      // console.log(provinces[i])
      new_city_name = provinces[i]
    }
  }
  console.log(new_city_name)
  return new_city_name
}

function parse_to_int(input){
  if (input === "")
    return 0
  return parseInt(input)
}


function jump_to_china(name){
  console.log(name)
  if (simple_province_name == "全国"){
    if (direct_city.indexOf(name) !== -1)
      alert("部分直辖市、港澳台暂不提供分省视图")
    else
      carto_map_load(name)
  }
  else
    carto_map_load("全国")
}

function accumulate_data(ncov_data_input, ncov_data_minus)
{
  let ncov_data_tmp = new Array()

  for (let i = 0; i < ncov_data_input.length; i ++ )
  {
    ncov_data_tmp[i] = new Array()
    ncov_data_tmp[i][0] = ncov_data_input[i][0]
    ncov_data_tmp[i][1] = ncov_data_input[i][1] + ncov_data_minus[i][1]
    
    // ncov_data[i][0] = modify_name(ncov_data[i][0])
    for (let j = 2; j < ncov_data_input[i].length; j ++ )
      ncov_data_tmp[i][j] = ncov_data_tmp[i][j - 1] + ncov_data_input[i][j] + ncov_data_minus[i][j]
  }
  ncov_data_new = ncov_data_input
  ncov_data_accu = ncov_data_tmp
  if (change_mode === "accu")
    return ncov_data_accu
  else 
    return ncov_data_new

  // return ncov_data_tmp
}


function reload_legend_title(){
  map_svg.select("#legend_g").remove()
  load_legend()
  if (change_mode === "add"){
    add_name = "新增"
    button_selected_color = color_add[0].color
  }
  else {
    add_name = ""
    button_selected_color = "#D75E5E"
  }
  update_total()
  load_button_color()
  title.select("text")
    .style("fill", function(d){
      return button_selected_color
    })
    .text("新冠肺炎疫情: " + simple_province_name + add_name + "态势")
}

function add_svg()
{
  d3.selectAll("#carto_map").remove()
  let map_svg = d3.select("#map").append("svg")
    .attr("id", "carto_map")
    .attr("font-family", "Arial")
    .attr("width", map_width - map_margin.left - map_margin.right)
    .attr("height", map_height - map_margin.top - map_margin.bottom);
  return map_svg
}

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
  else if (simple_province_name == "全国") {
    cities = ["新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "云南", "广西", "湖南", "陕西", "广东", "吉林", "河北", "湖北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏", "海南", "台湾", "北京", "天津", "上海", "香港", "澳门"]
    center_location = [104, 35.6]
    legend_index = 20
    range_index = 1
    small_index = 50
    map_file = "china-topojson/china.json"
    cities_area = {"新疆": 166.49, "西藏": 122.84, "内蒙古": 118.3, "青海": 72, "四川": 48.5, "黑龙江": 47.3, "甘肃": 45.5, "云南": 39.4, "广西": 23.63, "湖南": 21.18, "陕西": 20.58, "河北": 19, "吉林": 18.74, "湖北": 18.59, "广东": 17.98, "贵州": 17.62, "河南": 16.7, "江西": 16.69, "山东": 15.7, "山西": 15.6, "辽宁": 14.57, "安徽": 13.96, "福建": 12.14, "江苏": 10.26, "浙江": 10.18, "重庆": 8.3, "宁夏": 6.64, "台湾": 3.62, "海南": 3.392, "北京": 1.6807, "天津": 1.13, "上海": 0.634, "香港": 0.1098, "澳门": 0.0254}
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
    cities = ['巴州', '铁门关', '和田', '昆玉', '哈密', '阿克苏', '阿勒泰', '北屯', '喀什', '塔城', '昌吉州', '克孜勒苏柯尔克孜自治州', '吐鲁番', '伊犁', '可克达拉', '博尔塔拉州', '双河', '乌鲁木齐', '克拉玛依', '阿拉尔', '图木舒克', '五家渠', '石河子'];
    center_location = [85,41];
    legend_index = 1;
    range_index = 2.5;
    map_file = "china-topojson/65.json";
    cities_area = {'巴州': 471500, '铁门关': 590.27, '和田': 247800, '昆玉': 687.13, '哈密': 138919, '阿克苏': 14450, '阿勒泰': 117989.21, '北屯': 911, '喀什': 162000, '塔城': 105400, '昌吉州': 73900, '克孜勒苏柯尔克孜自治州': 72500, '吐鲁番': 69713, '伊犁': 268593, '可克达拉': 979.71, '博尔塔拉州': 27000, '双河': 742.18, '乌鲁木齐': 14216.3, '克拉玛依': 7733, '阿拉尔': 6256.68, '图木舒克': 2003, '五家渠': 742, '石河子': 460};
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
    cities_area = {"杭州": 16850.03, "宁波": 9714.65, "温州": 12064.77, "嘉兴": 4222.87, "湖州": 5820.26, "绍兴": 8279.08, "金华": 10941.75, "衢州": 8844.55, "舟山": 1454.70, "台州": 10037.91, "丽水": 17275.20};
    // 各个地级市的面积，请务必使用简称（不带市或者州之类的内容）
  }

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
    cities_area = {'延边': 43300, '吉林': 187400, '白城': 25685, '松原': 22000, '长春': 20593.5, '白山': 17485, '通化': 15698, '四平': 14323, '辽源': 5140.45}
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
    cities = ['六安', '安庆', '滁州', '宣城', '宿州', '阜阳', '黄山', '亳州', '池州', '合肥', '蚌埠', '芜湖', '淮北', '淮南', '马鞍山', '铜陵']
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

function add_toggle(svg)
{
  toggle_switch = svg.append("g")
    .attr("class", "toggle")
    .attr("transform", "translate(" + (toggle_switch_left ) + "," + toggle_switch_top + ")")

  toggle_kernal = toggle_switch.append("g")
    .attr("transform", "translate(" + (toggle_text_size * 2.2 ) + ", 0)")


  toggle_kernal.append("rect")
    .attr("width", toggle_switch_width)
    .attr("height", toggle_switch_height)
    .attr("rx", toggle_switch_height / 2)
    .attr("fill", "red")

  toggle_kernal.append("circle")
    .attr("cx", toggle_switch_height / 2)
    .attr("cy", toggle_switch_height / 2)
    .attr("r", toggle_switch_height * 0.55)
    .attr("fill", "blue")

  toggle_switch.append('g')
    .attr("transform", "translate(0, " + toggle_text_size * 0.8 + ")")
    .append("text")
    .attr("font-size", toggle_text_size)
    .text("累计")

  toggle_switch.append('g')
    .attr("transform", "translate(" + (toggle_switch_width + toggle_text_size * 2.4) + ", " + toggle_text_size * 0.8 + ")")
    .append("text")
    .attr("font-size", toggle_text_size)
    .text("新增")

  toggle_kernal
    .on("click", function(d){
      if (change_mode == "accu")
      {
        change_mode = "add"
        ncov_data = ncov_data_new
        toggle_kernal
          .select("circle")
          .transition()
          .duration(100)
          .attr("transform", "translate(" + (toggle_switch_width - toggle_switch_height) + ",0)")
      }
      else {
        change_mode = "accu"
        ncov_data = ncov_data_accu
        toggle_kernal
          .select("circle")
          .transition()
          .duration(100)
          .attr("transform", "translate(0,0)")
      }
      reload_legend_title()
      update_current_step()

    })
  return toggle_switch
}


// 适配手机
function adjust_for_phone(map_height, map_width){
  if (map_height > map_width)
  {

    // d3.select(".titleText").style("font-size", "2em")
    title_left = map_width * 0.05
    title_top = map_height * 0.07
    title_font_size = map_width / 20

    date_left = map_width * 0.05
    date_top = map_height * 0.10
    date_font_size = map_width / 40
    province_font_size = map_width * 0.02
    if (simple_province_name === "全国")
      province_font_size = map_width * 0.015

    scale_button_right = map_width * 0.95
    scale_button_top = map_height * 0.12
    scale_button_width = map_width / 5
    scale_button_height = map_width / 15
    scale_button_font = scale_button_height / 2

    legend_left = title_left
    legend_top = map_height * 0.15
    legend_width = map_width * 0.13
    legend_height = date_font_size * 1.2
    legend_opacity = 0.8
    legend_skip = 2

    play_left = map_width * 0.8
    play_top = map_height * 0.8
    play_width = map_width * 0.1
    play_opacity = 0.3

    // if (simple_province_name === "全国"){
    //   play_left = map_width * 0.8
    //   play_top = map_height * 0.8
    //   play_width = map_width * 0.1
    //   play_opacity = 0.3
    // }
    // else{
    //   play_left = map_width * 0.8
    //   play_top = map_height * 0.7
    //   play_width = map_width * 0.1
    //   play_opacity = 0.3
    // }
    

    day_left = title_left
    day_top = map_height * 0.83
    day_size = map_width * 0.1 //"5em" //

    total_left = title_left
    total_top = map_height * 0.75
    total_font_size = map_width * 0.04 

    // 数据来源
    info_left = map_width * 0.05
    info_top = map_height * 0.9
    info_font_size = date_font_size
    info_top_second = info_top + map_height * 0.02

    copyright_left = map_width * 0.5 - map_height * 0.1
    copyright_top = map_height * 0.95
    copyright_height = map_height * 0.04

    nanhai_left = map_width * 0.8
    nanhai_top = map_height * 0.68
    nanhai_width = map_width * 0.12
    nanhai_height = map_width * 0.14

    toggle_switch_left = map_width * 0.05
    toggle_switch_top = map_height * 0.11
    toggle_switch_width = map_width * 0.075
    toggle_switch_height = map_width * 0.03
    toggle_text_size = map_width * 0.03

    extra_info_left = map_width * 0.05
    extra_info_top = map_height * 0.87
    extra_info_font_size = map_width * 0.03

  }
}
function add_title(this_svg)
{
  shadow_per = 0.2
  let title = this_svg.append("g")
    .attr("transform", "translate(" + title_left + "," + title_top  + ")")
    // change
  title.append("text")
    .text("新冠肺炎疫情: " + simple_province_name + add_name + "态势")
    .attr('font-size', title_font_size)
    .attr('text-anchor', "start")
    .style("fill", function(d){
      if (change_mode === "add")
        return color_add[0].color
      else 
        return button_selected_color
    })
    .style("text-decoration", "underline")
    .style("text-shadow", "-" + province_font_size * shadow_per + "px -" + province_font_size * shadow_per + "px white, " + province_font_size * shadow_per + "px " + province_font_size * shadow_per + "px #ddd")
    // .style("text-shadow", "-2px -2px white, 2px 2px #ddd")
  return title
}


function load_legend(){
  let legend = map_svg.append("g")
      .attr("id", "legend_g")
      .attr("transform", "translate(" + legend_left  + "," + legend_top  + ")")

  if (change_mode === "accu"){
    let single_legend_contain = legend.selectAll(".single_legend")
      .data(color_ncov)
      .enter()
      .append("g")
      .attr("class", "single_legend")
      .attr("transform", function(d, i){
        return "translate(0," + i * (legend_height + legend_skip) + ")"
      })

    single_legend_contain.append("rect")
      .attr("fill", function(d){
        return d
      })
      .attr("width", legend_width )
      .attr("height", legend_height )
      .attr("opacity", legend_opacity)

    single_legend_contain.append("text")
      .attr("transform", "translate(" + legend_width * 0.1 + "," + legend_height * 0.9 + ")")
      .text(function(d, i){
        let small = Math.pow(2, i) * legend_index + 1
        let big  = Math.pow(2, i + 1) * legend_index
        if (i === 0)
        {
          small = 1
        }
        if (i === 6)
        {
          big = ""
          return "> " + (small - 1)
        }
        return small + "-" + big
      })
      .style("fill", "#fff")
      .attr("font-size", legend_height * 0.9)
  }
  else{
    let single_legend_contain = legend.selectAll(".single_legend")
      .data(color_add)
      .enter()
      .append("g")
      .attr("class", "single_legend")
      .attr("transform", function(d, i){
        return "translate(0," + i * (legend_height * 1.5 + legend_skip) + ")"
      })

    single_legend_contain.append("rect")
      .attr("fill", function(d){
        return d.color
      })
      .attr("width", legend_width )
      .attr("height", legend_height * 1.5)
      .attr("opacity", legend_opacity)

    single_legend_contain.append("text")
      .attr("transform", "translate(" + legend_width * 0.1 + "," + legend_height * 1.2 + ")")
      .text(function(d, i){
        return d.text
      })
      .style("fill", "#fff")
      .attr("font-size", legend_height * 0.8)
  }
}
function initialize_method_button()
{
  log_button = scale_button.append("g")
    .attr("transform", "translate(" + (-scale_button_width) +", 0)")

  linear_button = scale_button.append("g")
    .attr("transform", "translate(" + (-scale_button_width) +", " + (scale_button_height + scale_button_height * 0.25) + ")")

  normal_button = scale_button.append("g")
    .attr("transform", "translate(" + (-scale_button_width) +", " + (scale_button_height + scale_button_height * 0.25) * 2 + ")")

  log_button_rx = scale_button_height * 0.2

  log_button.append("rect")
    .attr("width", scale_button_width ) 
    .attr("height", scale_button_height)
    .attr("fill", "#98999A")
    .attr("rx", log_button_rx)

  log_button.append("text")
    .text("对数比例")
    .attr("text-anchor", "middle")
    .attr("y", (scale_button_height + scale_button_font ) / 2  - scale_button_font * 0.1  )
    .attr("x", scale_button_width / 2 )
    .style("fill", "white")
    .attr("font-size", scale_button_font)


  linear_button.append("rect")
    .attr("width",scale_button_width ) 
    .attr("height", scale_button_height)
    .attr("fill", "#98999A")
    .attr("rx", log_button_rx)

  linear_button.append("text")
    .text("线性比例")
    .attr("text-anchor", "middle")
    .attr("y", (scale_button_height + scale_button_font ) / 2 - 2)
    .attr("x", scale_button_width / 2 )
    .style("fill", "white")
    .attr("font-size", scale_button_font)

  normal_button.append("rect")
    .attr("width",scale_button_width ) 
    .attr("height", scale_button_height)
    .attr("fill", "#98999A")
    .attr("rx", log_button_rx)

  normal_button.append("text")
    .text("面积固定")
    .attr("text-anchor", "middle")
    .attr("y", (scale_button_height + scale_button_font ) / 2 - 2)
    .attr("x", scale_button_width / 2 )
    .style("fill", "white")
    .attr("font-size", scale_button_font)

  load_button_color()
  load_button_click()
}

function load_button_color(){
  if (method === "log"){
    log_button.select("rect")
      .attr("fill", button_selected_color)
  }
  else if (method === "linear"){
    linear_button.select("rect")
      .attr("fill", button_selected_color)
  }
  else {
    normal_button.select("rect")
      .attr("fill", button_selected_color)
  }
}

function load_button_click(){
  log_button.on("click", function(d){
    method = "log"
    log_button.select("rect")
      .attr("fill", button_selected_color)
    linear_button.select("rect")
      .attr("fill", "#98999A")
    normal_button.select("rect")
      .attr("fill", "#98999A")
    if (!is_playing){
        update_current_step()
    }
  })

  linear_button.on("click", function(d){
    method = "linear"
    log_button.select("rect")
      .attr("fill", "#98999A")
    linear_button.select("rect")
      .attr("fill", button_selected_color)
    normal_button.select("rect")
      .attr("fill", "#98999A")
    if (!is_playing){
        update_current_step()
    }
  })

  normal_button.on("click", function(d){
    method = "normal"
    log_button.select("rect")
      .attr("fill", "#98999A")
    linear_button.select("rect")
      .attr("fill", "#98999A")
    normal_button.select("rect")
      .attr("fill", button_selected_color)
    if (!is_playing){
        update_current_step()
    }
  })
}

function add_nanhai(){
  d3.select("#nanhai").append("image")
    .attr("xlink:href", "image/nanhai.png")
    .attr("x", nanhai_left)
    .attr("y", nanhai_top)
    .attr("width", nanhai_width)
    .attr("height", nanhai_height);
}

carto_map_load(simple_province_name)
