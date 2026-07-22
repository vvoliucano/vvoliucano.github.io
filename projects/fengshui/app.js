(() => {
  const canvas = document.querySelector('#village-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const initial = {
    mountainBack:{x:.50,y:.18,size:.88,label:'靠山',mark:'靠'},
    mountainA:{x:.23,y:.40,size:.66,label:'白虎',mark:'虎'}, mountainB:{x:.77,y:.40,size:.74,label:'青龙',mark:'龙'},
    house:{x:.50,y:.56,size:.52,label:'房子'}, tree:{x:.66,y:.53,size:.58,label:'树'}, pond:{x:.68,y:.80,size:.62,label:'池塘'}
  };
  const objects = structuredClone(initial);
  const labels = {house:'房子',mountainBack:'靠山',mountainA:'白虎',mountainB:'青龙',tree:'树',pond:'池塘'};
  const hints = {house:'默认面南，前方是明堂与环抱河流',mountainBack:'房屋后方的主屏障与庇护',mountainA:'宅右·西方屏障，观察侧风变化',mountainB:'宅左·东方屏障，观察侧风变化',tree:'靠近房屋可遮阴、缓风',pond:'低处蓄水，近处增加湿润感'};
  const state = {layer:'wind',selected:'house',dragging:null,orientation:180,wind:3,rain:1,time:12,started:false,t:0};
  const els = id => document.getElementById(id);
  const palette={ink:'#183039',paper:'#efe8d8',red:'#ae3b2d',blue:'#315f70',green:'#496b55',gold:'#d6a652',water:'#4e8598'};
  const ridgeVectors={
    mountainBack:{main:{x:0,y:-1},branch:{x:-.88,y:.26}},
    mountainA:{main:{x:-.58,y:-.82},branch:{x:-.97,y:.24},southeast:{x:.72,y:.69}},
    mountainB:{main:{x:.62,y:-.78},branch:{x:.96,y:.28}}
  };

  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  function ridgeGaussian(x,y,cx,cy,axis,lengthSq,widthSq){
    const rx=x-cx,ry=y-cy,along=rx*axis.x+ry*axis.y,cross=-rx*axis.y+ry*axis.x;
    return Math.exp(-(along*along/lengthSq+cross*cross/widthSq));
  }
  function mountainElevation(x,y,key){
    const m=objects[key],v=ridgeVectors[key];
    const peak=m.size*.34*Math.exp(-(dist({x,y},m)**2)/.0065);
    const mainCenter={x:m.x+v.main.x*.12,y:m.y+v.main.y*.12};
    const main=m.size*.44*ridgeGaussian(x,y,mainCenter.x,mainCenter.y,v.main,.038,.0038);
    const branchCenter={x:m.x+v.branch.x*.085,y:m.y+v.branch.y*.085};
    const branch=m.size*.20*ridgeGaussian(x,y,branchCenter.x,branchCenter.y,v.branch,.019,.0027);
    let southeast=0;
    if(v.southeast){
      const center={x:m.x+v.southeast.x*.13,y:m.y+v.southeast.y*.13};
      southeast=m.size*.25*ridgeGaussian(x,y,center.x,center.y,v.southeast,.034,.0031);
    }
    return peak+main+branch+southeast;
  }
  function connectorElevation(x,y,keyA,keyB){
    const a=objects[keyA],b=objects[keyB],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
    const axis={x:dx/len,y:dy/len},cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
    return Math.min(a.size,b.size)*.30*ridgeGaussian(x,y,cx,cy,axis,len*len*.34,.0046);
  }
  function elevation(x,y){
    let z=(.78-y)*.22;
    ['mountainBack','mountainA','mountainB'].forEach(k=>{z+=mountainElevation(x,y,k)});
    z+=connectorElevation(x,y,'mountainBack','mountainA');
    z+=connectorElevation(x,y,'mountainBack','mountainB');
    z-=objects.pond.size*.18*Math.exp(-(dist({x,y},objects.pond)**2)/.018);
    return z;
  }
  function pointSegmentDistance(p,a,b){
    const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1;
    const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,0,1);
    return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));
  }
  function terrainAt(p){
    const saddle={x:(objects.mountainA.x+objects.mountainB.x)/2,y:(objects.mountainA.y+objects.mountainB.y)/2+.055};
    const valleyDistance=pointSegmentDistance(p,saddle,objects.pond);
    if(valleyDistance<.035 && p.y>saddle.y-.04)return {key:'valley',label:'山谷汇水线'};
    const r=.036,z=elevation(p.x,p.y);
    const around=[[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]];
    const mean=around.reduce((sum,[dx,dy])=>sum+elevation(p.x+dx,p.y+dy),0)/around.length;
    if(z-mean>.022)return {key:'ridge',label:'山脊高地'};
    return {key:'slope',label:'山前缓坡'};
  }
  function flowAt(p){
    // 西北来风向东南吹。以下是为交互而设的势流近似，不是 CFD 求解。
    const bx=.97,by=.24,nx=-by,ny=bx,U=state.wind/5;
    let along=U,cross=0;
    const obstacles=[];
    for(const key of ['mountainBack','mountainA','mountainB']){
      const m=objects[key],d=ridgeVectors[key].main;
      obstacles.push({o:m,r:.065+m.size*.055,wake:.82});
      obstacles.push({o:{x:m.x+d.x*.105,y:m.y+d.y*.105},r:.05+m.size*.045,wake:.72});
      obstacles.push({o:{x:m.x+d.x*.205,y:m.y+d.y*.205},r:.038+m.size*.035,wake:.58});
      const southeast=ridgeVectors[key].southeast;
      if(southeast){
        obstacles.push({o:{x:m.x+southeast.x*.11,y:m.y+southeast.y*.11},r:.046+m.size*.038,wake:.67});
        obstacles.push({o:{x:m.x+southeast.x*.22,y:m.y+southeast.y*.22},r:.034+m.size*.03,wake:.52});
      }
    }
    for(const [left,right] of [['mountainBack','mountainA'],['mountainBack','mountainB']]){
      const a=objects[left],b=objects[right];
      for(const t of [.28,.52,.76])obstacles.push({o:{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},r:.065,wake:.72});
    }
    obstacles.push({o:objects.tree,r:.032+objects.tree.size*.035,wake:.42},{o:objects.house,r:.042,wake:.34});
    for(const {o,r,wake} of obstacles){
      const rx=p.x-o.x,ry=p.y-o.y;
      const x=rx*bx+ry*by,y=rx*nx+ry*ny;
      const r2=x*x+y*y,rr=Math.max(r2,r*r*1.04);
      const q=Math.min(.92,r*r/rr);
      const theta=Math.atan2(y,x);
      // 圆柱势流近似：迎风处减速，两侧加速，箭头绕过障碍。
      along+=U*(-q*Math.cos(2*theta));
      cross+=U*(-q*Math.sin(2*theta));
      if(x>r){
        const tail=wake*Math.exp(-(x-r)/(r*3.2))*Math.exp(-(y*y)/(r*r*1.25));
        along*=1-tail*.72;
        // 尾流中加入很小的交替偏转，让背风区的方向变化可见。
        cross+=U*tail*.24*Math.sin((x/r)*3.1+o.y*13);
      }
      if(r2<r*r){along*=.08;cross*=.08}
    }
    const vx=along*bx+cross*nx,vy=along*by+cross*ny;
    return {vx,vy,speed:clamp(Math.hypot(vx,vy),.02,1.35)};
  }
  function windAt(p){return flowAt(p).speed}
  function metrics(){
    const h=objects.house;
    const terrain=terrainAt(h);
    const localWind=windAt(h);
    const windScore=clamp(100-Math.abs(localWind-.34)*120,8,98);
    const z=elevation(h.x,h.y),pondD=dist(h,objects.pond);
    const lowRisk=clamp((.22-z)*140,0,55),pondRisk=clamp((.20-pondD)*180,0,30),riverRisk=clamp((h.y-.70)*120,0,28),treeHelp=clamp((.2-dist(h,objects.tree))*80,0,12);
    const landformDrain=terrain.key==='ridge'?6:terrain.key==='valley'?-18:0;
    const drainScore=clamp(92-lowRisk-pondRisk-riverRisk+treeHelp+landformDrain-state.rain*2,5,98);
    const sunAngle=(state.time-6)/12*Math.PI;
    const sunX=.5-.43*Math.cos(sunAngle),sunY=.18+.18*Math.sin(sunAngle);
    const facing=state.orientation*Math.PI/180;
    // 北为 0°、东为 90°、南为 180°；太阳由东经南移向西。
    const sunBearing=(90+(state.time-6)*15)*Math.PI/180;
    const treeBearing=Math.atan2(objects.tree.x-h.x,-(objects.tree.y-h.y));
    const angleDiff=Math.abs(Math.atan2(Math.sin(treeBearing-sunBearing),Math.cos(treeBearing-sunBearing)));
    const treeShade=dist(h,objects.tree)<.22 && angleDiff<Math.PI/4 ? objects.tree.size*.45:0;
    const facingGain=(Math.cos(facing-sunBearing)+1)/2;
    const sunScore=clamp(42+facingGain*48-treeShade*50,8,98);
    const rearAngle=(state.orientation+180)*Math.PI/180;
    const rear={x:h.x+Math.sin(rearAngle)*.16,y:h.y-Math.cos(rearAngle)*.16};
    let rearShelter=0;
    ['mountainBack','mountainA','mountainB','tree'].forEach(k=>{const o=objects[k];const d=dist(rear,o);rearShelter=Math.max(rearShelter,clamp((.35-d)*260*o.size,0,70))});
    const front={x:h.x+Math.sin(facing)*.18,y:h.y-Math.cos(facing)*.18};
    let frontBlock=0;['mountainBack','mountainA','mountainB','tree'].forEach(k=>{frontBlock=Math.max(frontBlock,clamp((.18-dist(front,objects[k]))*220,0,45))});
    const refugeScore=clamp(42+rearShelter-frontBlock,8,98);
    const qi=Math.round(windScore*.27+drainScore*.28+sunScore*.25+refugeScore*.20);
    return {windScore,drainScore,sunScore,refugeScore,qi,localWind,sunX,sunY,terrain};
  }

  function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  function pos(o,w,h){return{x:o.x*w,y:o.y*h}}
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
  function drawTerrain(w,h){
    const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#cbd8d2');grad.addColorStop(.62,'#dde2d4');grad.addColorStop(1,'#ccb98c');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    drawMountainShoulders(w,h);
    drawContours(w,h);
    drawMingTang(w,h);
    drawRiver(w,h);
  }
  function drawMountainShoulders(w,h){
    const back=objects.mountainBack;ctx.save();
    for(const key of ['mountainA','mountainB']){
      const side=objects[key],a=pos(back,w,h),b=pos(side,w,h),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,half=30+Math.min(back.size,side.size)*18;
      const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2-10};
      ctx.fillStyle='rgba(67,91,78,.30)';ctx.strokeStyle='rgba(47,73,66,.42)';ctx.lineWidth=1.2;ctx.beginPath();
      ctx.moveTo(a.x+nx*half,a.y+ny*half);ctx.quadraticCurveTo(mid.x+nx*half*.75,mid.y+ny*half*.75,b.x+nx*half,b.y+ny*half);
      ctx.lineTo(b.x-nx*half,b.y-ny*half);ctx.quadraticCurveTo(mid.x-nx*half*.6,mid.y-ny*half*.6,a.x-nx*half,a.y-ny*half);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(223,214,188,.24)';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mid.x,mid.y,b.x,b.y);ctx.stroke();
    }
    ctx.restore();
  }
  function terrainLabel(text,x,y,color){
    ctx.save();ctx.font='14px "Ouyang Xun"';const width=ctx.measureText(text).width+16;
    ctx.fillStyle='rgba(239,232,216,.82)';ctx.fillRect(x-5,y-15,width,22);ctx.fillStyle=color;ctx.fillText(text,x+3,y+1);ctx.restore();
  }
  function contourPoint(edge,x,y,level,grid,nx,ny){
    const at=(ix,iy)=>grid[iy*(nx+1)+ix],lerp=(a,b)=>Math.abs(b-a)<1e-6?.5:clamp((level-a)/(b-a),0,1);
    if(edge===0){const t=lerp(at(x,y),at(x+1,y));return{x:(x+t)/nx,y:y/ny}}
    if(edge===1){const t=lerp(at(x+1,y),at(x+1,y+1));return{x:(x+1)/nx,y:(y+t)/ny}}
    if(edge===2){const t=lerp(at(x,y+1),at(x+1,y+1));return{x:(x+t)/nx,y:(y+1)/ny}}
    const t=lerp(at(x,y),at(x,y+1));return{x:x/nx,y:(y+t)/ny};
  }
  function drawContours(w,h){
    const nx=54,ny=38,grid=[];let lo=Infinity,hi=-Infinity;
    for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){const z=elevation(x/nx,y/ny);grid.push(z);lo=Math.min(lo,z);hi=Math.max(hi,z)}
    const pairs={1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],5:[[3,0],[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],10:[[0,1],[2,3]],11:[[1,2]],12:[[3,1]],13:[[0,1]],14:[[3,0]]};
    for(let li=0;li<10;li++){
      const level=lo+(hi-lo)*(.12+li*.078);ctx.beginPath();
      for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
        const v0=grid[y*(nx+1)+x],v1=grid[y*(nx+1)+x+1],v2=grid[(y+1)*(nx+1)+x+1],v3=grid[(y+1)*(nx+1)+x];
        const code=(v0>level?1:0)|(v1>level?2:0)|(v2>level?4:0)|(v3>level?8:0);
        for(const pair of pairs[code]||[]){const a=contourPoint(pair[0],x,y,level,grid,nx,ny),b=contourPoint(pair[1],x,y,level,grid,nx,ny);ctx.moveTo(a.x*w,a.y*h);ctx.lineTo(b.x*w,b.y*h)}
      }
      const indexLine=li%3===0;ctx.strokeStyle=indexLine?'rgba(91,79,55,.58)':'rgba(83,99,73,.31)';ctx.lineWidth=indexLine?1.45:.85;ctx.stroke();
    }
  }
  function drawRiver(w,h){
    ctx.save();ctx.fillStyle='rgba(55,119,143,.58)';ctx.beginPath();
    ctx.moveTo(-w*.05,h*.80);ctx.bezierCurveTo(w*.18,h*.81,w*.31,h*.90,w*.50,h*.91);ctx.bezierCurveTo(w*.69,h*.90,w*.82,h*.81,w*1.05,h*.80);
    ctx.lineTo(w*1.05,h*.91);ctx.bezierCurveTo(w*.82,h*.92,w*.69,h*1.01,w*.50,h*1.02);ctx.bezierCurveTo(w*.31,h*1.01,w*.18,h*.92,-w*.05,h*.91);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(39,93,109,.72)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-w*.05,h*.80);ctx.bezierCurveTo(w*.18,h*.81,w*.31,h*.90,w*.50,h*.91);ctx.bezierCurveTo(w*.69,h*.90,w*.82,h*.81,w*1.05,h*.80);ctx.stroke();
    ctx.strokeStyle='rgba(226,235,221,.62)';ctx.lineWidth=1.2;
    for(const [x,y] of [[.12,.86],[.36,.96],[.64,.96],[.87,.86]]){ctx.beginPath();ctx.moveTo(x*w-18,y*h);ctx.lineTo(x*w+18,y*h-2);ctx.stroke();ctx.fillStyle='rgba(226,235,221,.76)';ctx.beginPath();ctx.moveTo(x*w+18,y*h-2);ctx.lineTo(x*w+10,y*h-6);ctx.lineTo(x*w+11,y*h+2);ctx.closePath();ctx.fill()}
    ctx.fillStyle='rgba(238,232,216,.94)';ctx.font='17px "Ouyang Xun"';ctx.fillText('金带缠腰 · 水向东去',w*.68,h*.87);ctx.restore();
  }
  function drawMingTang(w,h){
    const house=objects.house,p=pos(house,w,h),a=state.orientation*Math.PI/180;
    const cx=p.x+Math.sin(a)*h*.12,cy=p.y-Math.cos(a)*h*.12;
    ctx.save();ctx.fillStyle='rgba(220,183,105,.13)';ctx.strokeStyle='rgba(167,122,55,.38)';ctx.lineWidth=1.2;ctx.setLineDash([5,6]);ctx.beginPath();ctx.ellipse(cx,cy,w*.13,h*.075,a,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(111,79,43,.78)';ctx.font='17px "Ouyang Xun"';ctx.textAlign='center';ctx.fillText('明堂',cx,cy+5);ctx.restore();
  }
  function drawCompass(w){
    const x=w-58,y=58,r=25;ctx.save();ctx.fillStyle='rgba(239,232,216,.88)';ctx.strokeStyle='rgba(41,65,66,.42)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r+13,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.stroke();
    ctx.fillStyle='#ad3d30';ctx.beginPath();ctx.moveTo(x,y-r-3);ctx.lineTo(x-5,y-r+8);ctx.lineTo(x+5,y-r+8);ctx.closePath();ctx.fill();
    ctx.font='13px "Ouyang Xun"';ctx.textAlign='center';ctx.fillStyle='#9f382d';ctx.fillText('北',x,y-r-8);ctx.fillStyle='#314f52';ctx.fillText('南',x,y+r+17);ctx.fillText('西',x-r-11,y+4);ctx.fillText('东',x+r+11,y+4);ctx.restore();
  }
  function drawLandformLabels(w,h){
    const a=objects.mountainA,b=objects.mountainB;
    const saddle={x:(a.x+b.x)/2*w,y:((a.y+b.y)/2+.045)*h};ctx.save();
    ctx.strokeStyle='rgba(91,79,55,.7)';ctx.lineWidth=1;
    for(const [key,name] of [['mountainBack','靠山主脊'],['mountainA','白虎山脊'],['mountainB','青龙山脊']]){
      const m=objects[key],d=ridgeVectors[key].main,tail={x:(m.x+d.x*.20)*w,y:(m.y+d.y*.20)*h};
      ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo((m.x+d.x*.12)*w,(m.y+d.y*.12)*h);ctx.stroke();
      terrainLabel(name,clamp(tail.x-28,8,w-92),clamp(tail.y-8,24,h-28),'#66563b');
    }
    const southeast=ridgeVectors.mountainA.southeast,seTail={x:(a.x+southeast.x*.22)*w,y:(a.y+southeast.y*.22)*h};
    ctx.beginPath();ctx.moveTo(seTail.x,seTail.y);ctx.lineTo((a.x+southeast.x*.14)*w,(a.y+southeast.y*.14)*h);ctx.stroke();
    terrainLabel('东南支脉',clamp(seTail.x-8,8,w-102),clamp(seTail.y+24,24,h-28),'#66563b');
    ctx.beginPath();ctx.moveTo(saddle.x+8,saddle.y+12);ctx.lineTo(saddle.x+30,saddle.y+38);ctx.stroke();terrainLabel('鞍部 · 谷口',clamp(saddle.x+28,8,w-118),clamp(saddle.y+50,24,h-28),'#53624d');ctx.restore();
  }
  function windColor(speed,alpha=1){
    const t=clamp(speed/1.05,0,1);
    const stops=[[72,91,176],[56,164,189],[224,173,70],[184,61,49]];
    const scaled=t*(stops.length-1),i=Math.min(stops.length-2,Math.floor(scaled)),f=scaled-i;
    const c=stops[i].map((v,k)=>Math.round(v+(stops[i+1][k]-v)*f));
    return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
  }
  function drawArrow(x,y,v){
    const angle=Math.atan2(v.vy,v.vx),len=7+v.speed*22;
    const x2=x+Math.cos(angle)*len,y2=y+Math.sin(angle)*len,head=3.3+v.speed*2.2;
    ctx.strokeStyle=windColor(v.speed,.9);ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=.85+v.speed*1.15;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-Math.cos(angle-.52)*head,y2-Math.sin(angle-.52)*head);ctx.lineTo(x2-Math.cos(angle+.52)*head,y2-Math.sin(angle+.52)*head);ctx.closePath();ctx.fill();
  }
  function drawWind(w,h){
    const cols=Math.max(18,Math.round(w/42)),rows=Math.max(12,Math.round(h/40)),cw=w/cols,ch=h/rows;
    // 很淡的速度底色负责显示尾流范围，箭头本身承担方向与大小编码。
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const p={x:(x+.5)/cols,y:(y+.5)/rows},v=flowAt(p);
      ctx.fillStyle=windColor(v.speed,.055+v.speed*.025);ctx.fillRect(x*cw,y*ch,cw+1,ch+1);
    }
    const drift=(state.t*.00032)%(.065);
    for(let y=.08;y<.94;y+=.065){
      for(let x=-.02+drift;x<.98;x+=.065){
        const p={x:clamp(x,0,1),y},v=flowAt(p);
        drawArrow(p.x*w,p.y*h,v);
      }
    }
  }
  function drawRain(w,h){
    ctx.fillStyle=`rgba(44,87,103,${.06+state.rain*.025})`;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(42,91,112,.48)';for(let i=0;i<state.rain*35;i++){const x=(i*83+state.t*.08)%w,y=(i*47+state.t*.18)%h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+10);ctx.stroke()}
    const hse=objects.house;const hz=elevation(hse.x,hse.y);if(hz<.22){const p=pos(hse,w,h);ctx.fillStyle='rgba(54,126,151,.28)';ctx.beginPath();ctx.ellipse(p.x,p.y+28,70+state.rain*8,24+state.rain*3,0,0,Math.PI*2);ctx.fill()}
    for(let y=.2;y<.85;y+=.16)for(let x=.1;x<.9;x+=.18){const z=elevation(x,y),zx=elevation(x+.01,y),zy=elevation(x,y+.01),dx=(z-zx)*180,dy=(z-zy)*180;ctx.strokeStyle='rgba(43,95,110,.45)';ctx.beginPath();ctx.moveTo(x*w,y*h);ctx.lineTo(x*w+dx,y*h+dy);ctx.stroke()}
  }
  function drawSun(w,h,m){
    const sx=m.sunX*w,sy=m.sunY*h;ctx.fillStyle='rgba(226,169,70,.16)';ctx.beginPath();ctx.arc(sx,sy,60,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e4ad4e';ctx.beginPath();ctx.arc(sx,sy,25,0,Math.PI*2);ctx.fill();
    ['mountainBack','mountainA','mountainB','tree','house'].forEach(k=>{const o=objects[k],p=pos(o,w,h),dx=p.x-sx,dy=p.y-sy,len=Math.hypot(dx,dy)||1;ctx.fillStyle='rgba(27,43,47,.2)';ctx.beginPath();ctx.moveTo(p.x-12,p.y);ctx.lineTo(p.x+12,p.y);ctx.lineTo(p.x+dx/len*(55+o.size*50),p.y+dy/len*(55+o.size*50));ctx.closePath();ctx.fill()})
  }
  function drawRefuge(w,h){
    const hse=objects.house,p=pos(hse,w,h),a=state.orientation*Math.PI/180,screen=a-Math.PI/2;ctx.fillStyle='rgba(224,174,88,.16)';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.arc(p.x,p.y,190,screen-.48,screen+.48);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(174,59,45,.55)';ctx.setLineDash([7,7]);ctx.beginPath();ctx.arc(p.x,p.y,105,screen+Math.PI-.7,screen+Math.PI+.7);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=palette.red;ctx.font='13px "Ouyang Xun"';ctx.fillText('望',p.x+Math.sin(a)*125,p.y-Math.cos(a)*125);ctx.fillText('靠',p.x-Math.sin(a)*95,p.y+Math.cos(a)*95)
  }
  function drawPond(o,w,h){const p=pos(o,w,h),rx=42+o.size*35,ry=18+o.size*13;ctx.fillStyle='rgba(55,119,143,.62)';ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,-.08,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(225,237,231,.5)';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(p.x+i*17,p.y+i*2,13,0,Math.PI);ctx.stroke()}ctx.fillStyle='#e8e0d0';ctx.font='18px "Ouyang Xun"';ctx.fillText('水',p.x-9,p.y+6)}
  function drawMountain(o,w,h,selected){
    const p=pos(o,w,h),s=55+o.size*65;ctx.save();ctx.translate(p.x,p.y);
    const wash=ctx.createLinearGradient(0,-s*.9,0,s*.48);wash.addColorStop(0,selected?'#7f765c':'#71806d');wash.addColorStop(.55,selected?'#686650':'#52695d');wash.addColorStop(1,'rgba(52,76,69,.82)');
    ctx.fillStyle=wash;ctx.strokeStyle=selected?'#c89a50':'rgba(37,60,57,.72)';ctx.lineWidth=selected?2.8:1.4;
    ctx.beginPath();ctx.moveTo(-s*.84,s*.43);ctx.bezierCurveTo(-s*.69,s*.08,-s*.58,-s*.26,-s*.38,-s*.12);ctx.bezierCurveTo(-s*.22,-s*.51,-s*.03,-s*.92,s*.08,-s*.61);ctx.bezierCurveTo(s*.23,-s*.82,s*.39,-s*.38,s*.47,-s*.20);ctx.bezierCurveTo(s*.67,-s*.31,s*.71,s*.18,s*.86,s*.43);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(220,205,166,.23)';ctx.beginPath();ctx.moveTo(-s*.38,-s*.1);ctx.quadraticCurveTo(-s*.13,-s*.55,s*.07,-s*.61);ctx.quadraticCurveTo(s*.02,-s*.18,-s*.22,s*.20);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(225,216,190,.38)';ctx.lineWidth=1.2;
    for(let i=0;i<4;i++){const y=-s*(.43-i*.17);ctx.beginPath();ctx.moveTo(-s*(.28+i*.09),y);ctx.bezierCurveTo(-s*.05,y-s*.11,s*.23,y+s*.06,s*(.36+i*.06),y+s*.21);ctx.stroke()}
    ctx.strokeStyle='rgba(31,55,51,.65)';ctx.lineWidth=1;
    for(const [x,y,q] of [[-.47,.02,.8],[-.31,-.18,.7],[.35,-.08,.8],[.55,.19,.65]]){ctx.beginPath();ctx.moveTo(x*s,y*s);ctx.lineTo(x*s,(y-.1*q)*s);ctx.stroke();ctx.fillStyle='#334f47';ctx.beginPath();ctx.arc(x*s,(y-.12*q)*s,4+q*3,0,Math.PI*2);ctx.fill()}
    ctx.fillStyle=selected?'#b13f31':'rgba(239,232,216,.88)';ctx.beginPath();ctx.arc(0,-s*.16,15,0,Math.PI*2);ctx.fill();ctx.fillStyle=selected?'#f2dfba':'#304d47';ctx.font='18px "Ouyang Xun"';ctx.textAlign='center';ctx.fillText(o.mark||'山',0,-s*.1);ctx.fillStyle='rgba(33,54,51,.86)';ctx.font='15px "Ouyang Xun"';ctx.fillText(o.label||'山',0,s*.62);ctx.restore();
  }
  function drawTree(o,w,h,selected){const p=pos(o,w,h),r=22+o.size*25;ctx.strokeStyle='#6b4937';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(p.x,p.y+30);ctx.lineTo(p.x,p.y-5);ctx.stroke();ctx.fillStyle=selected?'#6c8154':'#3f6a50';for(const [dx,dy,q] of [[0,-24,1],[-18,-4,.75],[20,-2,.82]]){ctx.beginPath();ctx.arc(p.x+dx,p.y+dy,r*q,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#eee4cf';ctx.font='17px "Ouyang Xun"';ctx.fillText('木',p.x-8,p.y-8)}
  function drawHouse(o,w,h,selected){
    const p=pos(o,w,h),s=38+o.size*26,a=state.orientation*Math.PI/180;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a-Math.PI);
    ctx.shadowColor='rgba(34,45,43,.22)';ctx.shadowBlur=10;ctx.shadowOffsetY=5;ctx.fillStyle='#e7dfcc';ctx.fillRect(-s*.72,-s*.58,s*1.44,s*1.16);ctx.shadowColor='transparent';
    // 白墙围合，中间留出院落。
    ctx.fillStyle='#f3ecda';ctx.fillRect(-s*.62,-s*.47,s*1.24,s*.94);ctx.fillStyle='#cdbf9f';ctx.fillRect(-s*.29,-s*.19,s*.58,s*.48);
    // 四面黛瓦，瓦线与翘角保持缩略图可读性。
    ctx.fillStyle=selected?'#413932':'#283a3b';
    ctx.beginPath();ctx.moveTo(-s*.72,-s*.58);ctx.lineTo(s*.72,-s*.58);ctx.lineTo(s*.5,-s*.24);ctx.lineTo(-s*.5,-s*.24);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-s*.72,s*.58);ctx.lineTo(s*.72,s*.58);ctx.lineTo(s*.5,s*.29);ctx.lineTo(-s*.5,s*.29);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-s*.72,-s*.58);ctx.lineTo(-s*.42,-s*.3);ctx.lineTo(-s*.42,s*.3);ctx.lineTo(-s*.72,s*.58);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(s*.72,-s*.58);ctx.lineTo(s*.42,-s*.3);ctx.lineTo(s*.42,s*.3);ctx.lineTo(s*.72,s*.58);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(222,211,184,.36)';ctx.lineWidth=.8;for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(i*s*.13,-s*.56);ctx.lineTo(i*s*.11,-s*.27);ctx.moveTo(i*s*.13,s*.56);ctx.lineTo(i*s*.11,s*.31);ctx.stroke()}
    ctx.fillStyle='#a83f31';ctx.fillRect(-s*.12,s*.47,s*.24,s*.13);ctx.fillStyle='#efe5cf';ctx.font='17px "Ouyang Xun"';ctx.textAlign='center';ctx.fillText('院',0,s*.08);
    if(selected){ctx.strokeStyle='#d1a050';ctx.lineWidth=2.2;ctx.strokeRect(-s*.78,-s*.64,s*1.56,s*1.28)}
    ctx.strokeStyle='#d5a64f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,s*.66);ctx.lineTo(0,s*.93);ctx.stroke();ctx.beginPath();ctx.moveTo(0,s*.93);ctx.lineTo(-6,s*.82);ctx.moveTo(0,s*.93);ctx.lineTo(6,s*.82);ctx.stroke();ctx.restore();
  }
  function draw(){
    const w=canvas.clientWidth,h=canvas.clientHeight,m=metrics();ctx.clearRect(0,0,w,h);drawTerrain(w,h);
    if(state.layer==='wind'||state.layer==='all')drawWind(w,h);if(state.layer==='rain'||state.layer==='all')drawRain(w,h);if(state.layer==='sun'||state.layer==='all')drawSun(w,h,m);if(state.layer==='refuge'||state.layer==='all')drawRefuge(w,h);
    drawPond(objects.pond,w,h);drawMountain(objects.mountainBack,w,h,state.selected==='mountainBack');drawMountain(objects.mountainA,w,h,state.selected==='mountainA');drawMountain(objects.mountainB,w,h,state.selected==='mountainB');drawTree(objects.tree,w,h,state.selected==='tree');drawHouse(objects.house,w,h,state.selected==='house');drawLandformLabels(w,h);drawCompass(w);
    updateReadout(m);state.t++;requestAnimationFrame(draw)
  }
  function updateReadout(m){
    for(const [k,v] of [['wind',m.windScore],['drain',m.drainScore],['sun',m.sunScore],['refuge',m.refugeScore]]){els(`${k}-score`).textContent=Math.round(v);els(`${k}-bar`).style.width=`${v}%`}
    els('qi-score').textContent=m.qi;
    els('terrain-state').textContent=m.terrain.label;
    let text='这处布局在四个指标之间取得了较平衡的结果。';
    if(m.terrain.key==='valley'&&m.drainScore<65)text='房子落在山谷汇水线上；雨水会沿蓝色虚线向低处集中。';
    else if(m.windScore<45)text=m.localWind>.55?'来风过强：把房子移到山或树的背风侧。':'这里太静：过度遮挡也会形成弱风区。';
    else if(m.drainScore<45)text='房子靠近低洼汇水处；下雨时积水风险上升。';
    else if(m.sunScore<45)text='树影或朝向挡住了此刻的日照。';else if(m.refugeScore<45)text='背后较空或前方被挡，庇护与眺望都不足。';
    els('discovery').textContent=text;
  }
  function setLayer(layer){state.layer=layer;document.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.layer===layer));const info={wind:['风从西北来','箭头指向是风向，长度与颜色表示风速；山与树会让气流绕行。'],rain:['雨落在起伏的地面','水沿坡势汇流；低处、近水处更容易出现积水。'],sun:['太阳从东到西','拖动时刻，看树影与房屋朝向如何改变受光。'],refuge:['站在房前看出去','金色是前方视野，朱色虚线是后方需要遮护的位置。'],all:['把四层叠在一起','环境舒适度把四项相对指标合并，仅用于比较布局。']}[layer];els('layer-title').textContent=info[0];els('layer-caption').textContent=info[1];els('legend').style.display=layer==='wind'||layer==='all'?'flex':'none'}
  function selectObject(k){state.selected=k;document.querySelectorAll('[data-object]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.object===k));els('selected-name').textContent=labels[k];els('selected-hint').textContent=hints[k];els('orientation-control').hidden=k!=='house';els('height-control').hidden=!k.startsWith('mountain');els('size-control').hidden=k!=='tree';if(k.startsWith('mountain')){els('height').value=Math.round(objects[k].size*100);els('height-value').textContent=`${Math.round(objects[k].size*100)}%`}if(k==='tree'){els('size').value=Math.round(objects.tree.size*100);els('size-value').textContent=`${Math.round(objects.tree.size*100)}%`}}
  function pointerPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}
  function hit(p){let best=null,bd=1;for(const k of ['house','tree','pond','mountainB','mountainA','mountainBack']){const d=dist(p,objects[k]);const r=k.startsWith('mountain')?.12:k==='pond'?.1:.075;if(d<r&&d<bd){best=k;bd=d}}return best}
  canvas.addEventListener('pointerdown',e=>{const p=pointerPoint(e),k=hit(p)||state.selected;state.dragging=k;selectObject(k);canvas.setPointerCapture(e.pointerId);state.started=true;els('drag-coach').remove()});
  canvas.addEventListener('pointermove',e=>{if(!state.dragging)return;const p=pointerPoint(e);objects[state.dragging].x=clamp(p.x,.06,.94);objects[state.dragging].y=clamp(p.y,.1,.9)});
  canvas.addEventListener('pointerup',()=>state.dragging=null);canvas.addEventListener('pointercancel',()=>state.dragging=null);
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const o=objects[state.selected],step=e.shiftKey?.03:.012;if(e.key==='ArrowLeft')o.x-=step;if(e.key==='ArrowRight')o.x+=step;if(e.key==='ArrowUp')o.y-=step;if(e.key==='ArrowDown')o.y+=step;o.x=clamp(o.x,.06,.94);o.y=clamp(o.y,.1,.9)});
  document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>setLayer(b.dataset.layer)));
  document.querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>selectObject(b.dataset.object)));
  document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{setLayer(b.dataset.jump);document.querySelector('#village').scrollIntoView({behavior:'smooth'})}));
  els('orientation').addEventListener('input',e=>{state.orientation=+e.target.value;const dirs=['北','东北','东','东南','南','西南','西','西北'];els('orientation-value').textContent=dirs[Math.round(state.orientation/45)%8]});
  els('height').addEventListener('input',e=>{const k=state.selected.startsWith('mountain')?state.selected:'mountainA';objects[k].size=e.target.value/100;els('height-value').textContent=`${e.target.value}%`});
  els('size').addEventListener('input',e=>{objects.tree.size=e.target.value/100;els('size-value').textContent=`${e.target.value}%`});
  els('wind').addEventListener('input',e=>{state.wind=+e.target.value;els('wind-value').textContent=['','微','轻','中','强','疾'][state.wind]});
  els('rain').addEventListener('input',e=>{state.rain=+e.target.value;els('rain-value').textContent=['无雨','小雨','阵雨','大雨','暴雨','特大'][state.rain]});
  els('time').addEventListener('input',e=>{state.time=+e.target.value;const hr=Math.floor(state.time),min=Math.round((state.time-hr)*60);els('time-value').textContent=`${String(hr).padStart(2,'0')}:${String(min).padStart(2,'0')}`});
  els('reset').addEventListener('click',()=>{for(const k in initial)Object.assign(objects[k],initial[k]);state.orientation=180;state.wind=3;state.rain=1;state.time=12;['orientation','wind','rain','time'].forEach(id=>els(id).value={orientation:180,wind:3,rain:1,time:12}[id]);els('orientation-value').textContent='南';els('wind-value').textContent='中';els('rain-value').textContent='小雨';els('time-value').textContent='12:00';selectObject('house');setLayer('wind')});
  window.addEventListener('resize',resize);resize();selectObject('house');setLayer('wind');requestAnimationFrame(draw);
})();
