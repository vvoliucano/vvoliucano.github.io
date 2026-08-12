const points = [
  {id:'bt',name:'BUKIT TIMAH',sub:'SUMMIT · 163 M',lat:1.3541,lng:103.7764,accent:'#d8ff3e'},
  {id:'nie',name:'NTU · NIE',sub:'NATIONAL INSTITUTE OF EDUCATION',lat:1.3486,lng:103.6784,accent:'#70f6ff'},
  {id:'cck',name:'CHOA CHU KANG',sub:'MRT · NS4 / JS1',lat:1.3854,lng:103.7443,accent:'#ffb86c'}
];
let position={lat:1.3621,lng:103.7492,accuracy:14}, heading=302, filtered=302, liveSensors=false, cameraLive=false;
const $=id=>document.getElementById(id), rad=v=>v*Math.PI/180, deg=v=>v*180/Math.PI, norm=v=>(v%360+360)%360;
const delta=(a,b)=>((a-b+540)%360)-180;
const dir=d=>['N','NE','E','SE','S','SW','W','NW'][Math.round(norm(d)/45)%8];
function distance(p,t){const R=6371,dLat=rad(t.lat-p.lat),dLng=rad(t.lng-p.lng),x=Math.sin(dLat/2)**2+Math.cos(rad(p.lat))*Math.cos(rad(t.lat))*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function bearing(p,t){const a=rad(p.lat),b=rad(t.lat),dl=rad(t.lng-p.lng);return norm(deg(Math.atan2(Math.sin(dl)*Math.cos(b),Math.cos(a)*Math.sin(b)-Math.sin(a)*Math.cos(b)*Math.cos(dl))))}
function fmt(km){return km<1?`${Math.round(km*1000)} M`:`${km.toFixed(km<10?1:0)} KM`}
function targets(){return points.map(p=>({...p,bearing:bearing(position,p),distance:distance(position,p)})).sort((a,b)=>a.distance-b.distance)}
function render(){
  $('degrees').textContent=`${String(Math.round(heading)).padStart(3,'0')}°`;$('direction').textContent=dir(heading);
  $('lat').textContent=`${position.lat.toFixed(4)}° N`;$('lng').textContent=`${position.lng.toFixed(4)}° E`;$('accuracy').textContent=`±${Math.round(position.accuracy)} M`;
  $('ticks').innerHTML=Array.from({length:25},(_,i)=>{const rel=(i-12)*5,v=norm(Math.round(heading/5)*5+rel),major=v%15===0,label=major?(v===0?'N':v===90?'E':v===180?'S':v===270?'W':v):'';return `<div class="tick ${major?'major':''}"><i></i>${label?`<span>${label}</span>`:''}</div>`}).join('');
  const ts=targets();
  $('target-space').innerHTML=ts.map((t,i)=>{const d=delta(t.bearing,heading),visible=Math.abs(d)<58,x=50+d/58*48,locked=Math.abs(d)<7;return `<article class="target ${visible?'visible':''} ${locked?'aligned':''}" style="left:${x}%;top:${39+i*12}%;--accent:${t.accent}"><div class="target-line"></div><div class="target-dot"><i></i></div><div class="target-card"><div class="target-index">0${i+1}<span>${locked?'LOCKED':`${Math.abs(Math.round(d))}° ${d>0?'RIGHT':'LEFT'}`}</span></div><h2>${t.name}</h2><p>${t.sub}</p><div class="target-meta"><b>${fmt(t.distance)}</b><span>${Math.round(t.bearing)}° ${dir(t.bearing)}</span></div></div></article>`}).join('');
  $('edge-space').innerHTML=ts.map(t=>{const d=delta(t.bearing,heading);if(Math.abs(d)<58)return'';return `<div class="edge ${d<0?'left':'right'}" style="--accent:${t.accent}"><span>${d<0?'‹':'›'}</span><b>${t.name}</b><small>${fmt(t.distance)}</small></div>`}).join('');
  $('panel-items').innerHTML=ts.map(t=>`<div class="panel-item"><i style="background:${t.accent}"></i><span><b>${t.name}</b><small>${Math.round(t.bearing)}° · ${dir(t.bearing)}</small></span><strong>${fmt(t.distance)}</strong></div>`).join('');
}
function orientation(e){let next=null;if(typeof e.webkitCompassHeading==='number')next=e.webkitCompassHeading;else if(typeof e.alpha==='number'&&e.absolute)next=360-e.alpha;if(next===null)return;filtered=norm(filtered+delta(next,filtered)*.16);heading=filtered;liveSensors=true;$('scan-label').textContent='LIVE ORIENTATION';$('live-dot').classList.add('live');render()}
async function start(){
  $('launch').hidden=true;$('hud').hidden=false;$('field').classList.add('started');render();
  let any=false;
  try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});$('camera').srcObject=stream;await $('camera').play();$('camera').classList.add('live');cameraLive=true;any=true;$('live-dot').classList.add('live')}catch(e){console.warn('Camera unavailable',e)}
  if(navigator.geolocation)navigator.geolocation.watchPosition(({coords})=>{position={lat:coords.latitude,lng:coords.longitude,accuracy:coords.accuracy};any=true;$('notice').textContent='FIELD LINK ACTIVE';$('live-dot').classList.add('live');render()},()=>{$('notice').textContent=any?'FIELD LINK ACTIVE':'DEMO SIGNAL · PERMISSION LIMITED'},{enableHighAccuracy:true,maximumAge:3000,timeout:12000});
  try{if(typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission(true);if(p!=='granted')throw Error('denied')}window.addEventListener('deviceorientationabsolute',orientation,true);window.addEventListener('deviceorientation',orientation,true)}catch(e){console.warn('Orientation unavailable',e)}
  setTimeout(()=>{$('notice').textContent=any?'FIELD LINK ACTIVE':'DEMO SIGNAL · DRAG TO SCAN'},1400);
}
$('start').addEventListener('click',start);$('menu').addEventListener('click',()=>$('panel').classList.toggle('open'));$('scan').addEventListener('click',()=>{heading=norm(heading+45);render()});
window.addEventListener('pointermove',e=>{if(!$('hud').hidden&&!liveSensors){heading=norm(e.clientX/innerWidth*360);render()}});
setInterval(()=>$('clock').textContent=new Date().toLocaleTimeString('en-SG',{hour12:false}),1000);render();
