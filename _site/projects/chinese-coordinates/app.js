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
  // A deterministic, uneven sky: it feels natural but remains stable on redraw.
  let skySeed = 84217;
  const skyRandom = () => {
    skySeed = (skySeed * 1664525 + 1013904223) >>> 0;
    return skySeed / 4294967296;
  };
  const stars = Array.from({ length: 155 }, () => ({
    r: 24 + Math.sqrt(skyRandom()) * 335,
    a: skyRandom() * Math.PI * 2,
    size: .55 + Math.pow(skyRandom(), 3) * 2.8,
    alpha: .28 + skyRandom() * .68
  }));
  // 北斗七星：斗魁四星成斗，斗柄三星向外舒展。
  const dipperPoints = [
    // 春季入夜：北斗在北天极东侧，斗柄指东。
    // 天枢、天璇为斗口两星；由天璇经天枢延伸，指向北天极。
    [105,-60],[155,-88],[198,-35],[148,-9],
    [191,26],[232,43],[270,60]
  ];
  const dipper = dipperPoints.map(([x,y], i) => ({
    r: Math.hypot(x,y),
    a: Math.atan2(y,x),
    size: i === 0 || i === 1 ? 4.1 : 3.5
  }));
  const skySlider = $("#sky-slider");
  const skyPoint = (body, rotation, cx, cy) => ({
    x: cx + Math.cos(body.a + rotation) * body.r,
    y: cy + Math.sin(body.a + rotation) * body.r
  });
  const horizonY = (x, cx) => 470 + Math.pow((x - cx) / 450, 2) * 30;
  const traceArc = (body, rotation, cx, cy, color, width) => {
    if (rotation === 0) return;
    const segments = Math.max(8, Math.ceil(Math.abs(rotation) * 44));
    for (let i = 1; i <= segments; i++) {
      const a0 = body.a + rotation * (i - 1) / segments;
      const a1 = body.a + rotation * i / segments;
      const x0 = cx + Math.cos(a0) * body.r;
      const y0 = cy + Math.sin(a0) * body.r;
      const x1 = cx + Math.cos(a1) * body.r;
      const y1 = cy + Math.sin(a1) * body.r;
      if (y0 > horizonY(x0,cx) || y1 > horizonY(x1,cx)) continue;
      const fade = .04 + .34 * i / segments;
      sctx.strokeStyle = color.replace("ALPHA", fade.toFixed(3));
      sctx.lineWidth = width;
      sctx.beginPath();sctx.moveTo(x0,y0);sctx.lineTo(x1,y1);sctx.stroke();
    }
  };
  const drawSky = () => {
    const t = Number(skySlider.value);
    // 面向北方仰望，星空绕北天极逆时针移动。
    const rotation = -t / 12 * Math.PI;
    const cx = sky.width / 2, cy = 244;
    sctx.clearRect(0,0,sky.width,sky.height);

    // The trail records the part of the night the visitor has already crossed.
    stars.forEach(star => traceArc(star,rotation,cx,cy,"rgba(196,218,220,ALPHA)",Math.max(.45,star.size*.42)));
    dipper.forEach(star => traceArc(star,rotation,cx,cy,"rgba(216,179,86,ALPHA)",1.3));

    stars.forEach(star => {
      const {x,y} = skyPoint(star,rotation,cx,cy);
      if (y > horizonY(x,cx)) return;
      sctx.fillStyle = `rgba(235,231,201,${Math.min(1,star.alpha)})`;
      sctx.beginPath();sctx.arc(x,y,star.size,0,Math.PI*2);sctx.fill();
    });

    const dipperNow = dipper.map(star => skyPoint(star,rotation,cx,cy));
    sctx.strokeStyle="rgba(216,179,86,.58)";sctx.lineWidth=1.5;
    [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]].forEach(([from,to])=>{
      sctx.beginPath();sctx.moveTo(dipperNow[from].x,dipperNow[from].y);
      sctx.lineTo(dipperNow[to].x,dipperNow[to].y);sctx.stroke();
    });
    dipperNow.forEach((point,i)=>{
      sctx.shadowColor="rgba(216,179,86,.9)";sctx.shadowBlur=10;
      sctx.fillStyle="#ead07d";sctx.beginPath();sctx.arc(point.x,point.y,dipper[i].size,0,Math.PI*2);sctx.fill();
    });
    sctx.shadowBlur=0;
    // 斗口的两颗星给出寻找北极的方向，而不是让斗柄直接指向北极。
    const pointerFrom = dipperNow[1], pointerThrough = dipperNow[0];
    const pointerAngle = Math.atan2(pointerThrough.y-pointerFrom.y,pointerThrough.x-pointerFrom.x);
    sctx.setLineDash([5,7]);sctx.strokeStyle="rgba(216,179,86,.3)";sctx.lineWidth=1;
    sctx.beginPath();sctx.moveTo(pointerFrom.x,pointerFrom.y);
    sctx.lineTo(cx-Math.cos(pointerAngle)*12,cy-Math.sin(pointerAngle)*12);sctx.stroke();
    sctx.setLineDash([]);
    const dipperLabel = dipperNow[6];
    sctx.fillStyle="rgba(234,208,125,.9)";sctx.font="18px Ouyang,serif";
    sctx.fillText("北斗七星",dipperLabel.x+14,dipperLabel.y-10);

    // A low, curved horizon keeps the view anchored to an observer on Earth.
    const horizon = new Path2D();
    horizon.moveTo(0,horizonY(0,cx));
    horizon.quadraticCurveTo(cx,440,sky.width,horizonY(sky.width,cx));
    horizon.lineTo(sky.width,sky.height);horizon.lineTo(0,sky.height);horizon.closePath();
    const ground = sctx.createLinearGradient(0,430,0,560);
    ground.addColorStop(0,"rgba(9,25,34,.08)");ground.addColorStop(.45,"rgba(7,19,25,.92)");ground.addColorStop(1,"#06141b");
    sctx.fillStyle=ground;sctx.fill(horizon);
    sctx.strokeStyle="rgba(204,178,111,.45)";sctx.lineWidth=1.5;
    sctx.beginPath();sctx.moveTo(0,horizonY(0,cx));sctx.quadraticCurveTo(cx,440,sky.width,horizonY(sky.width,cx));sctx.stroke();
    sctx.fillStyle="rgba(204,178,111,.68)";sctx.font="16px Ouyang,serif";sctx.fillText("北方地平线",42,526);

    sctx.fillStyle="#d8b356";sctx.beginPath();sctx.arc(cx,cy,6,0,Math.PI*2);sctx.fill();
    sctx.strokeStyle="rgba(216,179,86,.35)";sctx.beginPath();sctx.arc(cx,cy,13,0,Math.PI*2);sctx.stroke();
    sctx.font="22px Ouyang,serif";sctx.fillText("北天极",cx+15,cy-12);
    $("#sky-time").textContent = ["入夜","戌时","亥时","子时","丑时","寅时","卯时","将晓"][Math.min(7,Math.floor(t/1.72))];
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
