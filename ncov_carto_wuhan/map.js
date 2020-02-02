
let need_update_states = false
// let method = "log"
let method = "log"

let is_playing = true


let color_ncov = ["#FFC1BB", "#F6978E", "#D9736A", "#DF5C50", "#CF4033", '#9F3026', '#881719']


let provinces = ["恩施", "十堰", "宜昌", "襄阳", "黄冈", "荆州", "荆门", "咸宁", "随州", "孝感", "武汉", "黄石", "神农架", "天门", "仙桃", "潜江", "鄂州"]
// [14,1,18,6,142,428,129,182,17,46,8,114,29,112,10,7]

let provinces_number = provinces.length

let current_step = 0

let map_margin = {left: 0, right: 0, top: 0, bottom: 0}
let map_width = document.getElementById('map').clientWidth - map_margin.left - map_margin.right,
    map_height = document.getElementById('map').clientHeight - map_margin.top - map_margin.bottom;
let ncov_data = [["武汉",0,0,0,0,0,0,41,0,0,0,0,0,0,4,17,136,60,167,0,70,77,46,80,892,315,356,378,576],
["黄冈",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,52,58,32,59,111,172,77,153],
["宜昌",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,19,11,20,12,54,50,109],
["孝感",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,4,29,45,73,101,125,142,87],
["随州",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,31,16,18,46,27,85,76],
["荆门",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,7,13,17,52,24,28,49,36,64],
["襄阳",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,34,34,61,32,123,61],
["黄石",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,5,17,33,27,55,41],
["咸宁",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,43,21,27,21,18,36,40],
["鄂州",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,19,37,27,39,66,38],
["十堰",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,4,15,20,25,23,31,31,27],
["荆州",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,2,2,23,14,24,30,50,70,26],
["天门",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,8,10,11,10,23,15],
["潜江",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,2,1,2,2,15],
["恩施",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,6,8,13,13,15,9,12],
["仙桃",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,8,1,1,15,5,23,35,7],
["神农架",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,0]]

for (let i = 0; i < ncov_data.length; i ++ )
{
  for (let j = 2; j < ncov_data[i].length; j ++ )
    ncov_data[i][j] = ncov_data[i][j - 1] + ncov_data[i][j]
}

console.log(ncov_data)

let provinces_area = {
  "武汉": 8569.15,
  "黄石": 4564.56,
  "十堰": 23666.16,
  "宜昌": 21230.14,
  "襄阳": 19727.68,
  "鄂州": 1596.46,
  "荆门": 12339.43,
  "孝感": 8904.41,
  "荆州": 14099.21,
  "黄冈": 17457.20,
  "咸宁": 9751.50,
  "随州": 9613.86,
  "恩施": 24060.26,
  "仙桃": 2519.06,
  "潜江": 1993.14,
  "天门": 2612.42,
  "神农架": 3232.77
}

let map_svg = d3.select("#map").append("svg")
  .attr("id", "fujian_map")
  .attr("font-family", "Arial")
  .attr("width", map_width - map_margin.left - map_margin.right)
  .attr("height", map_height - map_margin.top - map_margin.bottom);


let states = map_svg.append("g")
  .attr("id", "states")
  .selectAll("path");

let nanhai_svg = map_svg.append("g")
  .attr("id", "nanhai")

let texts = map_svg.append("g")
  .attr("id", "text")

let title_left = map_width * 0.05
let title_top = map_height * 0.09
let title_font_size = "1.5em"

let date_left = map_width * 0.05
let date_top = map_height * 0.12
let date_font_size = "1em"


let scale_button_right = map_width * 0.95
let scale_button_top = map_height * 0.08
let scale_button_width = 100
let scale_button_height = 35
let scale_button_font = 18

let legend_left = map_width * 0.05
let legend_top = map_height * 0.3
let legend_width = 80
let legend_height = 18
let legend_opacity = 0.8
let legend_skip = 2

let play_left = map_width * 0.9
let play_top = map_height * 0.5
let play_width = map_width * 0.05
let play_opacity = 0.3

let day_left = map_width * 0.05
let day_top = map_height * 0.95 
let day_size = "3em"

let total_left = map_width * 0.05 
let total_top = map_height * 0.85
let total_font_size = "2em"

// 数据来源
let info_left = map_width * 0.75
let info_top = map_height * 0.94
let info_font_size = "0.7em"
let info_top_second = map_height * 0.96

let copyright_left = map_width * 0.5 - map_height * 0.1
let copyright_top = map_height * 0.92
let copyright_height = map_height * 0.04



// 适配手机

if (map_height > map_width)
{
  d3.select(".titleText").style("font-size", "2em")
  title_left = map_width * 0.05
  title_top = map_height * 0.07
  title_font_size = map_width / 20

  date_left = map_width * 0.05
  date_top = map_height * 0.10
  date_font_size = map_width / 40



  scale_button_right = map_width * 0.95
  scale_button_top = map_height * 0.12
  scale_button_width = map_width / 5
  scale_button_height = map_width / 15
  scale_button_font = scale_button_height / 2

  legend_left = title_left
  legend_top = map_height * 0.12
  legend_width = map_width * 0.13
  legend_height = date_font_size * 1.2
  legend_opacity = 0.8
  legend_skip = 2

  play_left = map_width * 0.8
  play_top = map_height * 0.7
  play_width = map_width * 0.1
  play_opacity = 0.3

  day_left = title_left
  day_top = map_height * 0.8 
  day_size = "4em"

  total_left = title_left
  total_top = map_height * 0.75
  total_font_size = "2em"

  // 数据来源
 info_left = map_width * 0.05
 info_top = map_height * 0.9
 info_font_size = date_font_size
 info_top_second = info_top + map_height * 0.02

   copyright_left = map_width * 0.5 - map_height * 0.1
   copyright_top = map_height * 0.95
   copyright_height = map_height * 0.04

}



let title = map_svg.append("g")
  .attr("transform", "translate(" + title_left + "," + title_top  + ")")
  // change
title.append("text")
  .text("新型冠状病毒感染肺炎疫情: 湖北省态势")
  .attr('font-size', title_font_size)
  .attr('text-anchor', "start")
  .style("fill", "#D75E5E")
  .style("text-decoration", "underline")
  .style("text-shadow", "-2px -2px white, 2px 2px #F6978E")


let date = map_svg.append("g")
  .attr("transform", "translate(" + date_left  + "," + date_top  + ")")
  
date.append("text")
  .text("数据截止至1月31日24时")
  .attr('font-size', date_font_size)
  .attr('text-anchor', "start")
  .style("fill", "#666")

let scale_button = map_svg.append('g')
  .attr('id', "scale_button")
  .attr("transform", function(d){
    return "translate(" + scale_button_right + "," + scale_button_top + ")"
  })



let log_button = scale_button.append("g")
  .attr("transform", "translate(" + (-scale_button_width) +", 0)")

let linear_button = scale_button.append("g")
  .attr("transform", "translate(" + (-scale_button_width) +", " + (scale_button_height + 7) + ")")

let normal_button = scale_button.append("g")
  .attr("transform", "translate(" + (-scale_button_width) +", " + (scale_button_height + 7) * 2 + ")")


log_button.append("rect")
  .attr("width", scale_button_width ) 
  .attr("height", scale_button_height)
  .attr("fill", "#D75E5E")
  .attr("rx", 8)

log_button.append("text")
  .text("对数比例")
  .attr("text-anchor", "middle")
  .attr("y", (scale_button_height + scale_button_font ) / 2 - 2)
  .attr("x", scale_button_width / 2 )
  .style("fill", "white")
  .attr("font-size", scale_button_font)


linear_button.append("rect")
  .attr("width",scale_button_width ) 
  .attr("height", scale_button_height)
  .attr("fill", "#98999A")
  .attr("rx", 8)

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
  .attr("rx", 8)

normal_button.append("text")
  .text("面积固定")
  .attr("text-anchor", "middle")
  .attr("y", (scale_button_height + scale_button_font ) / 2 - 2)
  .attr("x", scale_button_width / 2 )
  .style("fill", "white")
  .attr("font-size", scale_button_font)



log_button.on("click", function(d){
  method = "log"
  log_button.select("rect")
    .attr("fill", "#D75E5E")
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
    .attr("fill", "#D75E5E")
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
    .attr("fill", "#D75E5E")
  if (!is_playing){
      update_current_step()
  }
})





let legend = map_svg.append("g")
  .attr("transform", "translate(" + legend_left  + "," + legend_top  + ")")

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
  .attr("transform", "translate(1, 17)")
  .text(function(d, i){
    let small = Math.pow(2, i) * 10 + 1
    let big  = Math.pow(2, i + 1) * 10
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

//添加播放按钮



map_svg.append("image")
    .attr("xlink:href", "./play-button.png")
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




map_svg.append("image")
    .attr("xlink:href", "./icon.png")
    .attr("x", copyright_left)
    .attr("y", copyright_top)
    .attr("id", "play")
    .attr("height", copyright_height)




// let copyright = map_svg.append("g")
//   .attr("transform", "translate(" + map_width * 0.5  + "," + map_height * 0.96  + ")")
//   .append("text")
//   .text("© PKU Visualization and Visual Analytics Group")
//   .attr('font-size', "1em")
//   .attr('text-anchor', "middle")
//   .style("font-family", "Khand-Regular")
//   .style("fill", "#444")


let day_info = map_svg.append("g")
  .attr("transform", "translate(" + day_left + "," + day_top + ")")
  .append("text")
  .attr("id", "day")
  .attr('font-size', day_size)
  .attr('text-anchor', "start")
  .style("fill", "#666")



let total_info = map_svg.append("g")
  .attr("transform", "translate(" + total_left  + "," + total_top + ")")
  .append("text")
  .attr("id", "day")
  .attr('font-size', total_font_size)
  .attr('text-anchor', "start")
  .style("fill", "#666")
  .text("")

let data_info = map_svg.append("g")
  .attr("transform", "translate(" + info_left  + "," +  info_top + ")")
  .append("text")
  .attr("id", "day")
  .attr('font-size', info_font_size)
  .attr('text-anchor', "start")
  .text("数据来源：国家卫生健康委员会")
  .style("fill", "#444")
  .style("text-decoration", "underline")

let src_info = map_svg.append("g")
  .attr("transform", "translate(" + info_left  + "," + info_top_second  + ")")
  .append("text")
  .attr("id", "day")
  .attr('font-size', info_font_size)
  .attr('text-anchor', "start")
  .text("变形地图库：gist.github.com/emeeks/d57083a45e60a64fe976")
  .style("fill", "#444")
  .style("text-decoration", "underline")

// https://gist.github.com/emeeks/d57083a45e60a64fe976




function update_current_step(){
  let ncov_value = get_value_from_someday(ncov_data, current_step);
  console.log(ncov_value);
  update_ncov_data(ncov_value, 500)
}

let min_edge = map_width 
if (map_height < map_width * 3/4)
{
  min_edge = map_height * 4/3
}



let projection = d3.geoAlbers()
  .rotate([-112.38, 0])
  .center([-0, 31])
  .scale(min_edge * 8)
  .translate([map_width / 2, map_height / 2])

let topology,
  geometries,
  carto_features;

let hexTooltip = d3.select("body").append("div").attr("class", "hexTooltip")

// let pop_data = d3.map();

let carto = d3.cartogram()
    .projection(projection)
    .iterations(30)
    .properties(function (d) {
      // this adds the "properties" properties to the geometries
      return d;
    });

let province_data


let city_polygon = new Array()
let city_pathNode = new Array()
let hex_state = new Array() // 存储各个六边形的状态, 注意它是反过来的
let city_list = ["福州","厦门","莆田","三明","泉州","漳州","南平","龙岩","宁德"]
let all_major_list = ["数理化生", "经济管理", "语言文学", "信息技术","机械能源", "政法城关","考古历史", "元培计划", ""]
let science_major_list = ["信息技术", "数理化生", "机械能源", "经济管理"]
let literature_major_list = ["语言文学","考古历史", "元培计划", "政法城关"]
let student_data

let color_choices =  ['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6','#ffffcc','#e5d8bd','#fddaec','#f2f2f2']



function play(table_data)
{
  is_playing = true
  d3.select("#play").attr("xlink:href", "./stop-button.png")
  console.log("???")
  run_on_step(0)


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
  setTimeout(function(){
    if (!is_playing)
      return
    day = "1月" + (i + 4) + "日";
    console.log(day);
    let ncov_value = get_value_from_someday(ncov_data, i + 1);
    console.log(ncov_value);
    update_ncov_data(ncov_value, 500)
    let total_number = 0;
    for (j = 0; j < provinces_number; j ++){
      total_number = total_number + ncov_data[j][i + 1]
    }
    // parseInt(table_data[34][day]) + parseInt(table_data[28][day]) + parseInt(table_data[32][day]) + parseInt(table_data[33][day])
    console.log(total_number)
    update_total(total_number)
    update_day(day)
    current_step = i
    if (i == ncov_data[0].length - 2){
      stop_button()
    }
    
    run_on_step(i + 1)
  },600)
}

function reload_map()
{
  // update_day("")
  // total_info.text("")

  play(ncov_data)  
}

function update_day(day)
{
  day_info.text(day)
}

function update_total(total_number)
{
  total_info.text("累计确诊：" + total_number)
}

function draw_day(){

}

function get_value_from_someday(table_data, day){
  let ncov_value = new Array()
  for (i = 0; i < 17; i ++ )
  {
    // console.log(table_data[i])
    // console.log(table_data[i]["1月5日'"])
    let index = provinces.indexOf(table_data[i][0])
    ncov_value[index] = parseInt(table_data[i][day])
  }
  console.log(ncov_value)
  return ncov_value;
}
function update_ncov_data(day_ncov_value, set_time = 3000){
  let value_array = new Array()//[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  for (i = 0; i < provinces_number; i ++){
    if (method == "log"){
      value_array[i] = Math.log(day_ncov_value[i] + 1 ) + provinces_area[provinces[i]]/50000
      if (provinces[i] == "湖北")
        value_array[i] = value_array[i] * 1.5
    }
    else if (method == "normal")
      value_array[i] = provinces_area[provinces[i]]
    else{
      value_array[i] = day_ncov_value[i] + provinces_area[provinces[i]]/1000
    }
    // 
  }
  console.log(value_array)


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


  d3.selectAll(".state")
    .attr("new_d", carto.path)
    // .each(function(d){
    //   console.log(get_centroid(d3.select(this).attr("new_d"))) 
    // })

  let duration_contain = d3.transition()
      .duration(set_time)

  duration_contain.selectAll(".state")
      .attr("d", carto.path)
      .attr("fill", function(d, i){
          // let city_index = parseInt(d.properties.id[3]) - 1
          let value = day_ncov_value[i];
          return get_color(value)
          // return "white"
      })

  // console.log(carto.path)

  let province_name = duration_contain.selectAll(".name")
      .attr("transform", function(d, i){
        
        // console.log(bbox)
        center = get_centroid(d3.select('#province_' + i).attr("new_d"))
        console.log("center", center)
        // console.log(bbox.x + bbox.width/2, bbox.y + bbox.height/2)
        center = adjust_position(center, i)
        return "translate(" + center[0] + "," + center[1] + ")"
      })

  province_name.selectAll(".province_number")
      .text(function(d){
        return day_ncov_value[provinces.indexOf(d)]
      })
      .attr("fill-opacity", function(d,i){
        if (day_ncov_value[provinces.indexOf(d)] == 0)
          return 0
        return 1
      })
      .attr("font-size", function(d, i){
        let font_size = value_array[provinces.indexOf(d)]
        if (method == "log")
          return (font_size/10 + 1) + "em"
        // if (method == "normal")
        //   return "1em"

        return (Math.log(value_array[provinces.indexOf(d)] + 1) / 10 + 1) + "em"
      })
      .attr("y", "1em")

  province_name.selectAll(".province_name")
      .attr("fill-opacity", function(d, i){
        if (day_ncov_value[provinces.indexOf(d)] == 0)
          return 0
        return 1
      })
}

function adjust_position(center, i){
  let position = new Array()
  position[0] = center[0]
  position[1] = center[1]

  if (provinces[i] == "香港" || provinces[i] == "澳门")
    position[1] = center[1] + map_height * 0.05
  if (provinces[i] == "内蒙古")
  {  
    position[0] = center[0] - map_width * 0.03
    position[1] = center[1] + map_height * 0.04
  }
  if (provinces[i] == "天津")
  {  
    position[0] = center[0] + map_width * 0.01
    position[1] = center[1] + map_height * 0.01
  }
  return position
}

d3.json("./hubei_city_topo.json")
  .then(function(data){
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
    
    texts = texts.selectAll(".name")
      .data(provinces)
      .enter()
      .append("g")
      .attr('class', "name")
      .attr("transform", function(d, i){
        center = get_centroid(d3.select('#province_' + i).attr("d"))
        console.log("center", center)
        // console.log(bbox.x + bbox.width/2, bbox.y + bbox.height/2)
        center = adjust_position(center, i)
        return "translate(" + center[0] + "," + center[1] + ")"
      })
      .attr("id", function(d, i){
        return "province_name_" + i
      })

    texts.append("text")
      .attr("class", "province_name")
      .attr("text-anchor", "middle")
      .text(function(d){
        return d
      })
    
    texts.append("text")
      .attr("class", "province_number")
      .attr("text-anchor", "middle")

    
      // province_data = table_data
      // window._table_data = table_data
      // console.log(table_data)
      play(ncov_data)


    // read_data()
  })
  .catch(function(error){
    console.log("error")
     // handle error
  })

// map_svg.on("click", function(){
//   let m = d3.mouse(this)
//   console.log(m)
//   // draw_closest(m)
// })
//

function get_centroid(coords){
    coords = coords.replace(/ *[LC] */g,'],[').replace(/ *M */g,'[[[').replace(/ *Z */g,']]]').replace(/ *z */g,']]]').replace(/ /g,'],[');
    if (coords.split("]]][[[").length > 1 ){
      coords = coords.split("]]][[[")[0] + "]]]"
    }
    // console.log(coords)
    return d3.geoPath().centroid({
      "type":"Feature",
      "geometry":{"type":"Polygon","coordinates":JSON.parse(coords)}
  });
}


function get_color(value){
  
  if (value == 0)
    return "#F2F2F2"
  if (value <= 20)
    return color_ncov[0]
  if (value <= 40)
    return color_ncov[1]
  if (value <= 80)
    return color_ncov[2]
  if (value <= 160)
    return color_ncov[3]
  if (value <= 320)
    return color_ncov[4]
  if (value <= 640)
    return color_ncov[5]
  // if (value < 640)
  //   return color_ncov[6]
  return color_ncov[6]

}


function add_play(){
  map_svg.append("image")
    .attr("xlink:href", "./play-button.png")
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
  d3.select("#play").attr("xlink:href", "./play-button.png")
}

function play_button(){
  is_playing = true
  console.log("enter play")
  d3.select("#play").attr("xlink:href", "./stop-button.png")
  if (current_step == ncov_data[0].length - 2)
    run_on_step(0)
  else
    run_on_step(current_step + 1)
}


function sleep(delay) {
        let start = new Date().getTime();
        while (new Date().getTime() < start + delay);
      }

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};
