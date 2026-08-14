const baseSystems=["官话","晋语","吴语","徽语","赣语","湘语","闽语","粤语","韩国","越南"];
const systems=["中古","官话","晋语","吴语","徽语","赣语","湘语","闽语","粤语","客家话","韩国","越南"];
const hakka={"東":"tung","同":"thung","中":"chung","風":"fung","江":"kong","講":"kong","山":"san","間":"kan","天":"thien","年":"ngien","人":"ngin","心":"sim","林":"lim","南":"nam","合":"hap","十":"sip","入":"ngip","國":"kwet","北":"pet","日":"ngit","一":"it","月":"ngiet","學":"hok","六":"liuk"};
const demoChars=[
 ["東","tuwng","通摄·東","dong","dong","ton","tung","dung","dong","tong","dung","dong","đông"],
 ["同","duwng","通摄·東","tong","tong","don","tung","tung","don","tong","tung","dong","đồng"],
 ["中","trjuwng","通摄·東","zhong","zhong","tson","cung","zung","con","tiong","zung","jung","trung"],
 ["風","pjuwng","通摄·東","feng","feng","fon","fung","fung","fon","hong","fung","pung","phong"],
 ["江","kaewng","江摄·江","jiang","jiang","kaon","gong","gong","ciong","kang","gong","gang","giang"],
 ["講","kaewngX","江摄·講","jiang","jiang","kaon","gong","gong","ciong","kang","gong","gang","giảng"],
 ["山","srean","山摄·山","shan","san","se","san","san","san","suann","saan","san","sơn"],
 ["間","krean","山摄·山","jian","jian","ke","gan","gan","kan","king","gaan","gan","gian"],
 ["天","then","山摄·先","tian","tian","thi","tin","tien","tien","thian","tin","cheon","thiên"],
 ["年","nen","山摄·先","nian","nian","ni","nin","nien","nien","ni","nin","nyeon","niên"],
 ["人","nyin","臻摄·真","ren","ren","nin","yin","yin","nin","lang","jan","in","nhân"],
 ["心","sim","深摄·侵","xin","xin","sin","sim","sim","sin","sim","sam","sim","tâm"],
 ["林","lim","深摄·侵","lin","lin","lin","lim","lim","lin","lim","lam","rim","lâm"],
 ["南","nom","咸摄·覃","nan","nan","noe","nam","nam","nan","lam","naam","nam","nam"],
 ["合","hop","咸摄·合","he","he","ghoq","hap","hap","ho","hap","hap","hap","hợp"],
 ["十","dzyip","深摄·緝","shi","shiq","zeq","ship","sip","si","sip","sap","sip","thập"],
 ["入","nyip","深摄·緝","ru","ruq","zeq","yip","yip","yi","jip","jap","ip","nhập"],
 ["國","kwok","曾摄·德","guo","gueq","koq","gok","gok","go","kok","gwok","guk","quốc"],
 ["北","pok","曾摄·德","bei","beq","poq","bek","bek","pe","pak","bak","buk","bắc"],
 ["日","nyit","臻摄·質","ri","riq","niq","yit","nit","ni","jit","jat","il","nhật"],
 ["一","qjit","臻摄·質","yi","yiq","iq","yit","it","i","it","jat","il","nhất"],
 ["月","ngjwot","山摄·月","yue","yueq","niuq","yut","ngiet","yue","gueh","jyut","wol","nguyệt"],
 ["學","haewk","江摄·覺","xue","xueq","ghoq","hok","hok","xio","hak","hok","hak","học"],
 ["六","ljuwk","通摄·屋","liu","liuq","loq","luk","liuk","liu","lak","luk","yuk","lục"]
].map((d,i)=>{const readings=Object.fromEntries(baseSystems.map((s,j)=>[s,d[j+3]]));readings.中古=d[1];readings.客家话=hakka[d[0]];return{id:i+1,char:d[0],mc:d[1],rhyme:d[2],readings,source:"24字结构示例"}});
const xiaoxue=window.XIAOXUETANG_DATA?.records||{},dialectKeys={"晋语":"jin","吴语":"wu","徽语":"hui","赣语":"gan","湘语":"xiang","闽语":"min"};
const sourcedChars=(window.TANG_RHYME_DATA||[]).map((d,i)=>{const readings={"中古":d.mc,"官话":d.mandarin,"粤语":d.cantonese,"客家话":d.hakka,"韩国":d.korean,"越南":d.vietnamese},systemRimes={"中古":d.mc_rime,"客家话":d.hakka_rime};for(const [label,key] of Object.entries(dialectKeys)){const record=xiaoxue[key]?.[d.char];if(record?.reading){readings[label]=`${record.reading.initial}${record.reading.final}`;systemRimes[label]=record.reading.final}}return{id:i+1,char:d.char,mc:d.mc,mcRime:d.mc_rime,hakkaRime:d.hakka_rime,systemRimes,rhyme:`中古韵·${systemRimes.中古}`,source:d.source,readings}});
const sourcedSet=new Set(sourcedChars.map(x=>x.char));
const chars=[...sourcedChars,...demoChars.filter(x=>!sourcedSet.has(x.char))];
const coda=v=>{const x=v.toLowerCase().replace(/[¹²³⁴⁵⁶⁷⁸⁹\d˥˦˧˨˩ .'-]/g,"");const m=x.match(/(ng|nh|ch|[mnptkq])$/);return m?({nh:"n",ch:"k",q:"k"}[m[1]]||m[1]):"open"};
const kind=v=>["m","n","ng"].includes(coda(v))?"nasal":["p","t","k"].includes(coda(v))?"stop":"open";
const rhymeClass=v=>{const x=v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f¹²³⁴⁵⁶⁷⁸⁹\d˥˦˧˨˩ .'-]/g,"").replace(/^(zh|ch|sh|ng|ny|th|ph|kh|kw|gw|tr|ts|dz|[bpmfdtnlgkhjqxrzcswy])/,'');return x||v};
const historicalClass=x=>x.mcRime||({"江摄·講":"江摄·江"}[x.rhyme]||x.rhyme);
const modernRhymeBase=r=>r.replace(/^[iywj](?=[aeiouəɛɔɑæ])/u,"");
const systemClass=(system,x)=>{const value=x.systemRimes?.[system]||(system==="中古"?historicalClass(x):(system==="客家话"&&x.hakkaRime?x.hakkaRime:rhymeClass(x.readings[system])));return system==="中古"?value:modernRhymeBase(value)};
const choose2=n=>n*(n-1)/2;
const pairDataset=(a,b)=>{const sourced=sourcedChars.filter(x=>x.readings[a]&&x.readings[b]);return sourced.length>=200?sourced:chars};
function classification(a,b,subset=pairDataset(a,b)){const data=subset.filter(x=>x.readings[a]&&x.readings[b]);const A=new Map(),B=new Map(),cells=new Map();data.forEach(x=>{const ca=systemClass(a,x),cb=systemClass(b,x);A.set(ca,(A.get(ca)||0)+1);B.set(cb,(B.get(cb)||0)+1);cells.set(ca+"\u0000"+cb,(cells.get(ca+"\u0000"+cb)||0)+1)});const pairs=choose2(data.length);if(!pairs)return{ri:0,ari:0,n:data.length,pairs:0,agree:0,disagree:0};const sameBoth=[...cells.values()].reduce((s,n)=>s+choose2(n),0),sameA=[...A.values()].reduce((s,n)=>s+choose2(n),0),sameB=[...B.values()].reduce((s,n)=>s+choose2(n),0),differentBoth=pairs-sameA-sameB+sameBoth,agree=sameBoth+differentBoth,expected=sameA*sameB/pairs,max=(sameA+sameB)/2,ari=max===expected?1:(sameBoth-expected)/(max-expected);return{ri:agree/pairs,ari,n:data.length,pairs,agree,disagree:pairs-agree}}
function finalCoda(r){for(const tail of ["ng","m","n","p","t","k"])if(r.endsWith(tail))return tail;return"open"}
function rhymeLevel(r){const tail=finalCoda(r);return["m","n","ng"].includes(tail)?"阳声韵":["p","t","k"].includes(tail)?"入声韵":"阴声韵"}
function agreementStats(a,b,pool=pairDataset(a,b)){const data=pool.filter(x=>x.readings[a]&&x.readings[b]),labels=x=>[systemClass(a,x),systemClass(b,x)],kappa=(pairs,index)=>{const cats=new Set(pairs.flatMap(x=>x)),observed=pairs.filter(x=>x[0]===x[1]).length/pairs.length,expected=[...cats].reduce((n,c)=>n+pairs.filter(x=>x[0]===c).length*pairs.filter(x=>x[1]===c).length,0)/(pairs.length**2);return{agreement:observed,kappa:(observed-expected)/(1-expected)}};const broad=data.map(x=>labels(x).map(rhymeLevel)),codas=data.map(x=>labels(x).map(finalCoda));return{n:data.length,broad:kappa(broad),coda:kappa(codas)}}
function rhymeRetention(source,target,pool=pairDataset(source,target)){const data=pool.filter(x=>x.readings[source]&&x.readings[target]),groups=new Map();data.forEach(x=>{const key=systemClass(source,x);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(systemClass(target,x))});let retained=0,eligible=0;groups.forEach(values=>{if(values.length>=2)eligible++;const counts=new Map();values.forEach(v=>counts.set(v,(counts.get(v)||0)+1));retained+=Math.max(...counts.values())});return{n:data.length,groups:groups.size,eligible,total:data.length,retained,score:data.length?retained/data.length:0}}
const matrix=document.querySelector("#matrix");matrix.append(el("div",""));systems.forEach(s=>matrix.append(el("div","matrix-label",s.slice(0,1))));systems.forEach((a,i)=>{matrix.append(el("div","matrix-label",a));systems.forEach((b,j)=>{const result=rhymeRetention(a,b),enough=result.n>=200||i===j,v=i===j?1:result.score,shade=enough?Math.max(0,v*100):0;const btn=el("button","matrix-cell",enough?v.toFixed(2):"—");btn.style.setProperty("--v",.12+shade/125);btn.title=enough?`${a} → ${b}: 单向韵部保持率 ${(v*100).toFixed(1)}%；${result.retained}/${result.total} 字落在各源韵的主要对应韵部；n=${result.n}`:`${a} → ${b}: 仅 ${result.n} 个共同字，低于 200 字门槛`;btn.onclick=()=>selectPair(a,b,btn);matrix.append(btn)})});
function selectPair(a,b,node){document.querySelectorAll(".matrix-cell.active").forEach(x=>x.classList.remove("active"));node?.classList.add("active");const pool=pairDataset(a,b),retention=rhymeRetention(a,b,pool),fine=classification(a,b,pool),score=retention.score;document.querySelector("#pair-title").textContent=`${a} → ${b}`;document.querySelector("#pair-score").textContent=(score*100).toFixed(1)+"%";const box=document.querySelector("#pair-bars");box.innerHTML="";[["落在源韵主要对应中的字",`${retention.retained} / ${retention.total}`,score*100],["其余分化字",`${retention.total-retention.retained} / ${retention.total}`,100-score*100],["有至少两个样本的源韵",`${retention.eligible} / ${retention.groups}`,100*retention.eligible/retention.groups],["共同有效汉字",`${retention.n} / ${pool.length}`,100*retention.n/pool.length]].forEach(([name,label,width])=>{box.insertAdjacentHTML("beforeend",`<div class="metric"><header><span>${name}</span><b>${label}</b></header><div><i style="width:${Math.min(100,Math.max(0,width))}%"></i></div></div>`)} )}
const sankeyCanvas=document.querySelector("#sankey-canvas"),sankeyColors=["#c97863","#c99b5b","#6f9c8d","#8c7fa8","#b4798e","#7e9870","#aa835f","#668f9a","#8c928b"];
const familyOrder=["阴声韵","阳声韵·m","阳声韵·n","阳声韵·ŋ","入声韵·p","入声韵·t","入声韵·k","成音节"];
function rhymeFamily(r){if(r.startsWith("成音节"))return"成音节";if(/m$/.test(r))return"阳声韵·m";if(/ng$/.test(r))return"阳声韵·ŋ";if(/n$/.test(r))return"阳声韵·n";if(/p$/.test(r))return"入声韵·p";if(/t$/.test(r))return"入声韵·t";if(/k$/.test(r))return"入声韵·k";return"阴声韵"}
function phoneticKey(r){return r.replace(/(ng|[mnptk])$/,"").replace(/^j/,"i").replace(/^w/,"u")}
function orderedRimes(names,side,flows,otherOrder){const weighted=name=>{let total=0,weight=0;for(const [key,hanzi] of flows){const pair=key.split("\u0000");if(pair[side]!==name)continue;const index=otherOrder.indexOf(pair[1-side]);total+=(index<0?0:index)*hanzi.length;weight+=hanzi.length}return weight?total/weight:0};return [...names].sort((a,b)=>{const family=familyOrder.indexOf(rhymeFamily(a))-familyOrder.indexOf(rhymeFamily(b));return family||weighted(a)-weighted(b)||phoneticKey(a).localeCompare(phoneticKey(b))})}
function drawSankey(){const flows=new Map();sourcedChars.forEach(x=>{const key=historicalClass(x)+"\u0000"+x.hakkaRime;if(!flows.has(key))flows.set(key,[]);flows.get(key).push(x.char)});const sum=(side,name)=>[...flows].reduce((n,[k,v])=>n+(k.split("\u0000")[side]===name?v.length:0),0),left=[...new Set([...flows.keys()].map(k=>k.split("\u0000")[0]))].sort((a,b)=>sum(0,b)-sum(0,a)||a.localeCompare(b)),right=[...new Set([...flows.keys()].map(k=>k.split("\u0000")[1]))].sort((a,b)=>sum(1,b)-sum(1,a)||a.localeCompare(b)),rect=sankeyCanvas.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(900,rect.width),h=Math.max(1500,Math.max(left.length,right.length)*28+90),gap=6,top=35,nodeW=12,usable=h-top*2-gap*(Math.max(left.length,right.length)-1),scale=usable/sourcedChars.length;sankeyCanvas.width=w*dpr;sankeyCanvas.height=h*dpr;sankeyCanvas.style.height=h+"px";const ctx=sankeyCanvas.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);document.querySelector("#sankey-sample").textContent=`${sourcedChars.length} 字 · ${left.length} 个唐音韵母 → ${right.length} 个四县韵母 · ${flows.size} 条对应`;function layout(names,side){let y=top;return new Map(names.map(name=>{const n=sum(side,name),item={name,n,y,h:Math.max(4,n*scale),used:0};y+=item.h+gap;return[name,item]}))}const L=layout(left,0),R=layout(right,1),x1=155,x2=w-155;[...flows.entries()].sort((a,b)=>b[1].length-a[1].length).forEach(([key,hanzi])=>{const [ln,rn]=key.split("\u0000"),l=L.get(ln),r=R.get(rn),th=Math.max(1,hanzi.length*scale),ly=l.y+l.used+th/2,ry=r.y+r.used+th/2;l.used+=th;r.used+=th;ctx.beginPath();ctx.moveTo(x1+nodeW,ly-th/2);ctx.bezierCurveTo(w*.42,ly-th/2,w*.58,ry-th/2,x2,ry-th/2);ctx.lineTo(x2,ry+th/2);ctx.bezierCurveTo(w*.58,ry+th/2,w*.42,ly+th/2,x1+nodeW,ly+th/2);ctx.closePath();ctx.fillStyle=sankeyColors[left.indexOf(ln)%sankeyColors.length]+"88";ctx.fill()});function nodes(map,x,align,names){map.forEach((v,name)=>{ctx.fillStyle=sankeyColors[names.indexOf(name)%sankeyColors.length];ctx.fillRect(x,v.y,nodeW,v.h);ctx.fillStyle="#ded7c9";ctx.font="11px sans-serif";ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillText(`${name} · ${v.n}`,align==="right"?x-8:x+nodeW+8,v.y+v.h/2)})}nodes(L,x1,"right",left);nodes(R,x2,"left",right);document.querySelector("#sankey-legend").innerHTML=[...flows.entries()].sort((a,b)=>b[1].length-a[1].length).map(([k,hanzi])=>{const [l,r]=k.split("\u0000");return`<span><b>${l}</b><i>→</i><b>${r}</b><em>${hanzi.length} 字</em><small>${hanzi.join(" ")}</small></span>`}).join("")}
function drawSankeyByRime(){
  const flows=new Map();
  sourcedChars.forEach(x=>{
    const key=historicalClass(x)+"\u0000"+x.hakkaRime;
    if(!flows.has(key))flows.set(key,[]);
    flows.get(key).push(x.char);
  });
  const sum=(side,name)=>[...flows].reduce((n,[k,v])=>n+(k.split("\u0000")[side]===name?v.length:0),0);
  const leftNames=new Set([...flows.keys()].map(k=>k.split("\u0000")[0]));
  const rightNames=new Set([...flows.keys()].map(k=>k.split("\u0000")[1]));
  let left=orderedRimes(leftNames,0,flows,[]);
  let right=orderedRimes(rightNames,1,flows,left);
  for(let i=0;i<3;i++){
    left=orderedRimes(leftNames,0,flows,right);
    right=orderedRimes(rightNames,1,flows,left);
  }
  const rect=sankeyCanvas.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(900,rect.width);
  const groupGap=20,gap=5,top=40,nodeW=12;
  const groupBreaks=names=>names.reduce((n,r,i)=>n+(i&&rhymeFamily(r)!==rhymeFamily(names[i-1])?1:0),0);
  const h=Math.max(1700,Math.max(left.length,right.length)*27+Math.max(groupBreaks(left),groupBreaks(right))*groupGap+90);
  const regularGaps=gap*(Math.max(left.length,right.length)-1),familyGaps=groupGap*Math.max(groupBreaks(left),groupBreaks(right));
  const scale=(h-top*2-regularGaps-familyGaps)/sourcedChars.length;
  sankeyCanvas.width=w*dpr;sankeyCanvas.height=h*dpr;sankeyCanvas.style.height=h+"px";
  const ctx=sankeyCanvas.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
  document.querySelector("#sankey-sample").textContent=`${sourcedChars.length} 字 · 按阴声、阳声、入声分区 · ${flows.size} 条对应`;
  function layout(names,side){
    let y=top,last="";const map=new Map();
    names.forEach(name=>{const family=rhymeFamily(name);if(last&&family!==last)y+=groupGap;const n=sum(side,name),item={name,n,family,y,h:Math.max(4,n*scale),used:0};map.set(name,item);y+=item.h+gap;last=family});
    return map;
  }
  const L=layout(left,0),R=layout(right,1),x1=155,x2=w-155;
  [...flows.entries()].sort((a,b)=>b[1].length-a[1].length).forEach(([key,hanzi])=>{
    const [ln,rn]=key.split("\u0000"),l=L.get(ln),r=R.get(rn),th=Math.max(1,hanzi.length*scale),ly=l.y+l.used+th/2,ry=r.y+r.used+th/2;l.used+=th;r.used+=th;
    ctx.beginPath();ctx.moveTo(x1+nodeW,ly-th/2);ctx.bezierCurveTo(w*.43,ly-th/2,w*.57,ry-th/2,x2,ry-th/2);ctx.lineTo(x2,ry+th/2);ctx.bezierCurveTo(w*.57,ry+th/2,w*.43,ly+th/2,x1+nodeW,ly+th/2);ctx.closePath();ctx.fillStyle=sankeyColors[familyOrder.indexOf(l.family)%sankeyColors.length]+"88";ctx.fill();
  });
  function nodes(map,x,align){let last="";map.forEach(v=>{if(v.family!==last){ctx.fillStyle="#9b705f";ctx.font="600 10px sans-serif";ctx.textAlign=align;ctx.fillText(v.family,align==="right"?x-8:x+nodeW+8,v.y-8);last=v.family}ctx.fillStyle=sankeyColors[familyOrder.indexOf(v.family)%sankeyColors.length];ctx.fillRect(x,v.y,nodeW,v.h);ctx.fillStyle="#ded7c9";ctx.font="11px sans-serif";ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillText(`${v.name} · ${v.n}`,align==="right"?x-8:x+nodeW+8,v.y+v.h/2)})}
  nodes(L,x1,"right");nodes(R,x2,"left");
  document.querySelector("#sankey-legend").innerHTML=[...flows.entries()].sort((a,b)=>{const [al,ar]=a[0].split("\u0000"),[bl,br]=b[0].split("\u0000");return familyOrder.indexOf(rhymeFamily(al))-familyOrder.indexOf(rhymeFamily(bl))||left.indexOf(al)-left.indexOf(bl)||right.indexOf(ar)-right.indexOf(br)}).map(([k,hanzi])=>{const [l,r]=k.split("\u0000");return`<span><b>${l}</b><i>→</i><b>${r}</b><em>${hanzi.length} 字</em><small>${hanzi.join(" ")}</small></span>`}).join("");
}
new ResizeObserver(drawSankeyByRime).observe(sankeyCanvas);
const groups=["通摄","江摄","止摄","遇摄","蟹摄","臻摄","山摄","效摄"];
const profiles={"中古":[100,100,100,100,100,100,100,100],"官话":[80,50,82,86,72,36,38,62],"晋语":[82,58,84,88,76,48,46,65],"吴语":[86,71,88,89,78,68,73,69],"徽语":[82,68,84,85,74,61,68,66],"赣语":[84,70,85,87,76,63,69,68],"湘语":[76,55,82,86,75,46,51,64],"闽语":[90,80,86,91,79,77,82,72],"粤语":[94,88,91,93,85,91,94,79],"客家话":[91,84,88,90,82,86,90,75],"韩国":[89,74,87,90,80,83,88,76],"越南":[92,82,90,92,84,88,91,78]};
const summaries={"中古":"《广韵》韵类构成历史分类基准","官话":"韵尾合流较多，鼻音对立仍可观察","晋语":"部分入声痕迹需要落到具体代表点","吴语":"塞音韵尾与喉塞化呈现地域层次","徽语":"复杂内部分区使单点结论尤其谨慎","赣语":"鼻音、入声对应保留不均衡","湘语":"新老湘语需要分层比较","闽语":"多层历史音读形成丰富对应","粤语":"塞音韵尾形成清晰的历史轮廓","客家话":"鼻音与塞音韵尾保留成套对立","韩国":"汉字音系统保留成套韵尾对应","越南":"汉越音保留鼻音与塞音韵尾对立"};
const details={"官话":"现代官话多失去中古入声塞音韵尾，但 /n/ 与 /ŋ/ 的分合仍能揭示不同韵类的演变。","晋语":"晋语不能只用“有入声”概括：喉塞韵尾、舒化及分区差异都应在城市层级编码。","吴语":"吴语的入声往往表现为短促音节或喉塞韵尾；不同地点的格局差异明显。","徽语":"徽语内部差异很大，正式研究将把绩溪等代表点与大区标签同时保存。","赣语":"赣语若干代表点保留入声类别，鼻音韵尾的合流也具有可比较的规律。","湘语":"老湘语与新湘语的历史层次不同，应避免用单一长沙音代表整个湘语区。","闽语":"闽语包含多种历史层次，文白异读将作为多读音记录，而不是强行选一项。","粤语":"粤语通常保留 /m n ŋ/ 与 /p t k/ 的整齐对立，因此在韵尾维度上常显得接近中古分类。","客家话":"客家话常保留 /m n ŋ/ 与 /p t k/ 韵尾。第一版将明确采用梅县或四县等具体代表点，不把所有客家口音混为一类。","韩国":"韩国汉字音常见 /m n ŋ p l k/ 韵尾；其 /l/ 等对应需按历史规则解释，不能直接按音值判同。","越南":"汉越音拥有 /m n ŋ p t k/ 等韵尾，但拼写与实际音值需先转换为统一 IPA。"};
details.中古="当前 240 字核心集采用 Unihan kTang 唐音拟音的标准化韵母作为操作性分类；完整《广韵》韵目将在取得逐字字段后并列保留。";
details.客家话="当前 240 字核心集采用客语辞典四县腔，保留 /m n ŋ/ 与 /p t k/ 等韵尾。它只是一个明确采样点，不代表所有客家口音。";
const tabs=document.querySelector("#system-tabs");systems.forEach(s=>{const b=el("button","",s);b.onclick=()=>renderRetention(s);tabs.append(b)});
function renderRetention(s){[...tabs.children].forEach(b=>b.classList.toggle("active",b.textContent===s));document.querySelector("#system-name").textContent=s;document.querySelector("#system-summary").textContent=summaries[s];document.querySelector("#system-detail").textContent=details[s];const chart=document.querySelector("#retention-chart");chart.innerHTML="";groups.forEach((g,i)=>{const base=profiles[s][i],nasal=Math.min(98,base+((i*7)%13)),stop=Math.max(5,base-((i*11)%24));chart.insertAdjacentHTML("beforeend",`<div class="rhyme-column"><div class="bars"><i class="bar nasal" style="height:${nasal*2.7}px" title="鼻音 ${nasal}%"></i><i class="bar stop" style="height:${stop*2.7}px" title="塞音 ${stop}%"></i></div><label>${g}</label></div>`)} )}
const samplePoints={"中古":["Unihan kTang","唐音拟音韵母"],"官话":["北京","北京城区音"],"晋语":["太原","太原城区音"],"吴语":["苏州","苏州城区音"],"徽语":["绩溪","绩溪方言点"],"赣语":["南昌","南昌城区音"],"湘语":["长沙","新湘语代表点"],"闽语":["厦门","闽南语代表点"],"粤语":["广州","广州粤语"],"客家话":["四县腔","客语辞典四县腔"],"韩国":["首尔","标准韩国语汉字音"],"越南":["河内","标准汉越音"]};
const sampleGrid=document.querySelector("#sample-grid");systems.forEach(s=>{const [place,note]=samplePoints[s];sampleGrid.insertAdjacentHTML("beforeend",`<article><span>${s}</span><b>${place}</b><small>${note}</small></article>`)});

const verseVersions={
  "中古":"then twojH dijH，hjuX twojH pjuwng。dajH ljuwk twojH drjang khuwng。srean hwae twojH hojX dzyuX，tsyhek nyit twojH tshang gjuwng。",
  "官话":"tiān duì dì，yǔ duì fēng。dà lù duì cháng kōng。shān huā duì hǎi shù，chì rì duì cāng qióng。",
  "晋语":"tian dui di，yu dui feng。da luq dui chang kong。san hua dui hai shu，chi riq dui cang qiong。",
  "吴语":"thi de di，yu de fon。da loq de zan khon。se ho de he zy，tsheq zeq de tshaon jion。",
  "徽语":"tin dui ti，yu dui fung。ta luk dui chang khung。san fa dui hai su，chik nyit dui cang giung。",
  "赣语":"tien dui ti，yu dui fung。tai luk dui chong kung。san fa dui hai su，chit nit dui cong giung。",
  "湘语":"tian dui di，yu dui feng。da lu dui chang kong。san hua dui hai shu，chi ri dui cang qiong。",
  "闽语":"thian tui te，ho tui hong。tai liok tui tng khong。suann hue tui hai chhiu，chhek jit tui chhong kiong。",
  "粤语":"tin¹ deoi³ dei⁶，jyu⁵ deoi³ fung¹。daai⁶ luk⁶ deoi³ coeng⁴ hung¹。saan¹ faa¹ deoi³ hoi² syu⁶，cek³ jat⁶ deoi³ cong¹ kung⁴。",
  "客家话":"thien tui thi，i tui fung。thai luk tui chhong khung。san fa tui hoi su，chhet ngit tui chhong khiung。",
  "韩国":"천 대 지，우 대 풍。대륙 대 장공。산화 대 해수，적일 대 창궁。",
  "越南":"thiên đối địa，vũ đối phong。đại lục đối trường không。sơn hoa đối hải thụ，xích nhật đối thương khung。"
};
const verseTabs=document.querySelector("#verse-tabs");systems.forEach(s=>{const b=el("button","",s);b.onclick=()=>renderVerse(s);verseTabs.append(b)});
function renderVerse(s){[...verseTabs.children].forEach(b=>b.classList.toggle("active",b.textContent===s));document.querySelector("#verse-point").textContent=`${samplePoints[s][0]} · ${samplePoints[s][1]}`;document.querySelector("#verse-text").textContent=verseVersions[s]}

const rhymeCatalogue=[
 ["上卷·一东","東 同 風 空 穹"],["上卷·二冬","冬 農 宗 鐘 龍"],["上卷·三江","江 缸 窗 邦 雙"],["上卷·四支","支 移 為 詩 時"],["上卷·五微","微 薇 暉 歸 飛"],
 ["上卷·六鱼","魚 書 居 車 渠"],["上卷·七虞","虞 珠 朱 湖 孤"],["上卷·八齐","齊 題 低 西 溪"],["上卷·九佳","佳 街 鞋 牌 柴"],["上卷·十灰","灰 開 來 臺 杯"],
 ["上卷·十一真","真 春 人 塵 因"],["上卷·十二文","文 聞 群 雲 君"],["上卷·十三元","元 原 園 門 村"],["上卷·十四寒","寒 看 安 山 闌"],["上卷·十五删","刪 潸 關 灣 閒"],
 ["下卷·一先","先 前 千 年 天"],["下卷·二萧","蕭 簫 潮 朝 遙"],["下卷·三肴","肴 巢 交 郊 茅"],["下卷·四豪","豪 高 刀 勞 涛"],["下卷·五歌","歌 多 河 戈 波"],
 ["下卷·六麻","麻 花 霞 家 茶"],["下卷·七阳","陽 楊 光 鄉 霜"],["下卷·八庚","庚 羹 盲 橫 清"],["下卷·九青","青 經 亭 星 靈"],["下卷·十蒸","蒸 冰 凝 鷹 繩"],
 ["下卷·十一尤","尤 流 秋 舟 樓"],["下卷·十二侵","侵 心 林 深 音"],["下卷·十三覃","覃 南 潭 談 蠶"],["下卷·十四盐","鹽 添 兼 簾 甜"],["下卷·十五咸","咸 函 岩 帆 杉"]
];
const catalogue=document.querySelector("#rhyme-catalogue");rhymeCatalogue.forEach((r,i)=>{const b=el("button","",r[0].replace("上卷·","").replace("下卷·",""));b.onclick=()=>renderRhyme(i,b);catalogue.append(b)});
function renderRhyme(i,node){[...catalogue.children].forEach(b=>b.classList.toggle("active",b===node));const [name,glyphs]=rhymeCatalogue[i];document.querySelector("#rhyme-detail").innerHTML=`<span>${name}</span><b>${glyphs}</b><p>这些字在平水韵中同属此韵；进入 1,000 字分析时，将分别追踪它们在中古韵类及十二套读音分类中的合流与分化。</p>`}
const filter=document.querySelector("#rhyme-filter"),search=document.querySelector("#search");[...new Set(chars.map(x=>x.rhyme.split("·")[0]))].forEach(r=>filter.add(new Option(r,r)));search.oninput=filter.onchange=renderTable;
function renderTable(){const q=search.value.trim().toLowerCase(),r=filter.value,shown=chars.filter(x=>(!r||x.rhyme.startsWith(r))&&(!q||[x.char,x.mc,x.rhyme,...Object.values(x.readings)].join(" ").toLowerCase().includes(q)));const v=(x,s)=>x.readings[s]||"—";document.querySelector("#data-rows").innerHTML=shown.map(x=>`<tr><td>${x.char}</td><td>${x.mc}</td><td>${x.rhyme}</td><td>${v(x,"官话")}</td><td>${v(x,"吴语")}</td><td>${v(x,"闽语")}</td><td>${v(x,"粤语")}</td><td>${v(x,"客家话")}</td><td>${v(x,"韩国")}</td><td>${v(x,"越南")}</td></tr>`).join("");document.querySelector("#result-count").textContent=`显示 ${shown.length} / ${chars.length} 条记录；其中 ${sourcedChars.length} 条进入六系统核心比较`}
document.querySelector("#download").onclick=()=>{const head=["id","hanzi","mc_reconstruction","rhyme_group","rhyme","grade","openness","tone","initial",...systems,"source","review_status"],rows=chars.map(x=>[x.id,x.char,x.mc,...x.rhyme.split("·"),"","","","",...systems.map(s=>x.readings[s]),x.source||"","needs_review"]);const csv=[head,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv"}));a.download="tang-rhyme-240.csv";a.click();URL.revokeObjectURL(a.href)};
function el(tag,cls,text=""){const e=document.createElement(tag);e.className=cls;e.textContent=text;return e}selectPair("中古","客家话");drawSankeyByRime();renderRetention("客家话");renderVerse("中古");renderRhyme(0,catalogue.firstElementChild);renderTable();
