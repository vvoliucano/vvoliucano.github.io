(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const progress = $(".progress");
  addEventListener("scroll", () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${range ? scrollY / range * 100 : 0}%`;
  }, { passive: true });

  const mountains = ["子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥","壬"];
  const groups = ["北","北","东北","东北","东北","东","东","东","东南","东南","东南","南","南","南","西南","西南","西南","西","西","西","西北","西北","西北","北"];
  const compass = $("#compass");
  mountains.forEach((name, i) => {
    const label = document.createElement("span");
    const angle = i * 15;
    label.className = "mountain-label";
    label.textContent = name;
    label.style.transform = `rotate(${angle}deg) translateY(-205px) rotate(${-angle}deg) translate(-50%,-50%)`;
    compass.appendChild(label);
  });
  const directionSlider = $("#direction-slider");
  const updateDirection = () => {
    const degree = Number(directionSlider.value);
    const index = Math.round(degree / 15) % 24;
    $("#needle").style.transform = `rotate(${degree}deg)`;
    $("#degree").textContent = `${degree}°`;
    $("#mountain").textContent = `${mountains[index]} · ${groups[index]}`;
    const groupStart = Math.floor(index / 3) * 3;
    $("#direction-note").textContent = `${groups[index]}三山：${mountains.slice(groupStart, groupStart + 3).join("、")}`;
  };
  directionSlider.addEventListener("input", updateDirection);
  updateDirection();

  const sky = $("#sky-canvas");
  const sctx = sky.getContext("2d");
  const stars = Array.from({ length: 120 }, (_, i) => {
    const radius = 18 + ((i * 47) % 240);
    return { r: radius, a: (i * 137.5) * Math.PI / 180, size: 1 + (i % 5) * .35, alpha: .35 + (i % 7) / 10 };
  });
  const skySlider = $("#sky-slider");
  const drawSky = () => {
    const t = Number(skySlider.value);
    const cx = sky.width / 2, cy = sky.height / 2;
    sctx.clearRect(0,0,sky.width,sky.height);
    sctx.strokeStyle = "rgba(154,190,202,.13)";
    [80,150,220].forEach(r => { sctx.beginPath();sctx.arc(cx,cy,r,0,Math.PI*2);sctx.stroke(); });
    stars.forEach(star => {
      const a = star.a + t / 12 * Math.PI * 2;
      sctx.fillStyle = `rgba(235,231,201,${Math.min(1,star.alpha)})`;
      sctx.beginPath();sctx.arc(cx + Math.cos(a)*star.r,cy + Math.sin(a)*star.r,star.size,0,Math.PI*2);sctx.fill();
    });
    sctx.fillStyle="#d8b356";sctx.beginPath();sctx.arc(cx,cy,6,0,Math.PI*2);sctx.fill();
    sctx.font="22px Ouyang,serif";sctx.fillText("北天极",cx+15,cy-12);
    $("#sky-time").textContent = ["子时","丑时","寅时","卯时"][Math.min(3,Math.floor(t/3))];
  };
  skySlider.addEventListener("input", drawSky);
  drawSky();

  $$("#loshu button").forEach((button) => button.addEventListener("click", () => {
    $$("#loshu button").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    $("#palace-name").textContent = `${button.dataset.n}宫 · ${button.querySelector("small").textContent}`;
  }));
  $("#loshu button[data-n='5']").classList.add("active");

  const layerData = {
    mountains: { items: mountains, copy: "把周天分成二十四个方向区间。" },
    trigrams: { items: ["坎","艮","震","巽","离","坤","兑","乾"], copy: "八卦给八方附加一套象与关系。" },
    branches: { items: ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"], copy: "十二地支把时间分类带入方位。" },
    mansions: { items: ["角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危","室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳","星","张","翼","轸"], copy: "二十八宿把天区次序叠到盘面。" }
  };
  const renderLayer = (key) => {
    const ring = $("#layer-ring");
    ring.innerHTML = "";
    layerData[key].items.forEach((item,i,all) => {
      const angle = i / all.length * 360;
      const span = document.createElement("span");
      span.textContent = item;
      span.style.transform = `rotate(${angle}deg) translateY(-220px) rotate(${-angle}deg) translate(-50%,-50%)`;
      ring.appendChild(span);
    });
    $("#layer-copy").textContent = layerData[key].copy;
  };
  $$(".layer-controls button").forEach(button => button.addEventListener("click", () => {
    $$(".layer-controls button").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    renderLayer(button.dataset.layer);
  }));
  renderLayer("mountains");

  const baySlider = $("#bay-slider");
  const renderHall = () => {
    const count = Number(baySlider.value);
    $("#hall").innerHTML = Array.from({length:count},()=>'<i class="bay"></i>').join("");
    $("#bay-count").textContent = `${["零","一","二","三","四","五","六","七","八","九"][count]}间`;
  };
  baySlider.addEventListener("input",renderHall);renderHall();

  const map = $("#map-canvas"), mctx = map.getContext("2d");
  let principle = "scale";
  const principleText = {
    scale:"分率：先定比例，才知道图上一寸对应实地多少。",
    bearing:"准望：确定对象之间的方向关系；它不能被简单压缩成一个现代术语。",
    distance:"道里：记录实际通行路程，但路程还不是两点直线距离。",
    relief:"高下：坡面量得的长度，需要考虑地势起伏。",
    diagonal:"方邪：斜向关系要经过校验，不能拿横直格数直接代替。",
    curve:"迂直：道路与河流弯曲，通行路程和两地直距并不相同。"
  };
  const drawMap = () => {
    mctx.clearRect(0,0,map.width,map.height);
    mctx.strokeStyle="rgba(80,94,80,.18)";mctx.lineWidth=1;
    for(let x=60;x<map.width;x+=80){mctx.beginPath();mctx.moveTo(x,0);mctx.lineTo(x,map.height);mctx.stroke()}
    for(let y=40;y<map.height;y+=80){mctx.beginPath();mctx.moveTo(0,y);mctx.lineTo(map.width,y);mctx.stroke()}
    mctx.fillStyle="rgba(94,112,73,.28)";
    [[250,180,130],[570,320,155],[760,170,100]].forEach(([x,y,r])=>{for(let k=1;k<5;k++){mctx.beginPath();mctx.ellipse(x,y,r*k/5,r*k/8,0,0,Math.PI*2);mctx.strokeStyle="rgba(94,112,73,.35)";mctx.stroke()}});
    mctx.strokeStyle="#3f7880";mctx.lineWidth=14;mctx.beginPath();mctx.moveTo(20,420);mctx.bezierCurveTo(240,290,310,520,480,405);mctx.bezierCurveTo(650,290,730,470,900,350);mctx.stroke();
    mctx.strokeStyle="#a74332";mctx.lineWidth=5;mctx.setLineDash(principle==="curve"?[12,9]:[]);mctx.beginPath();mctx.moveTo(130,120);mctx.bezierCurveTo(320,90,250,410,760,440);mctx.stroke();mctx.setLineDash([]);
    if(["distance","relief","diagonal","curve"].includes(principle)){mctx.strokeStyle="#c6933e";mctx.lineWidth=3;mctx.setLineDash([9,7]);mctx.beginPath();mctx.moveTo(130,120);mctx.lineTo(760,440);mctx.stroke();mctx.setLineDash([])}
    mctx.fillStyle="#172a31";mctx.font="22px Ouyang,serif";mctx.fillText("甲地",95,105);mctx.fillText("乙地",770,462);
  };
  $$(".six-principles button").forEach(button=>button.addEventListener("click",()=>{$$(".six-principles button").forEach(b=>b.classList.remove("active"));button.classList.add("active");principle=button.dataset.principle;$("#principle-copy").textContent=principleText[principle];drawMap()}));
  $(".six-principles button").classList.add("active");drawMap();

  const earth=$("#earth-canvas"), ectx=earth.getContext("2d"), stationSlider=$("#station-slider");
  const drawEarth=()=>{
    const t=Number(stationSlider.value),cx=earth.width/2,cy=760,r=570;
    ectx.clearRect(0,0,earth.width,earth.height);ectx.strokeStyle="#3d7780";ectx.lineWidth=4;ectx.beginPath();ectx.arc(cx,cy,r,Math.PI*1.13,Math.PI*1.87);ectx.stroke();
    const a1=Math.PI*1.34,a2=a1+.52*t;
    [a1,a2].forEach((a,i)=>{const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ectx.fillStyle=i?"#c6923f":"#a84332";ectx.beginPath();ectx.arc(x,y,11,0,Math.PI*2);ectx.fill();ectx.strokeStyle="rgba(230,223,195,.65)";ectx.beginPath();ectx.moveTo(x,y);ectx.lineTo(x+Math.cos(a)*130,y+Math.sin(a)*130);ectx.stroke();ectx.fillStyle="#e9e2d3";ectx.font="20px Ouyang,serif";ectx.fillText(i?"南站":"北站",x-25,y-22)});
    ectx.strokeStyle="#d7bd70";ectx.lineWidth=3;ectx.beginPath();ectx.arc(cx,cy,r-35,a1,a2);ectx.stroke();
    const degrees=(t*2.08).toFixed(1),distance=Math.round(t*730);$("#arc-reading").textContent=`${distance} 里 · ${degrees}°`;
  };
  stationSlider.addEventListener("input",drawEarth);drawEarth();
})();
