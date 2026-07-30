(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const EN = document.documentElement.lang === 'en';

  const daySlider = $('#day-slider');
  const sky = $('#sky');
  const dayNames = EN ? [
    { max: 12.5, name: 'midnight' }, { max: 25, name: 'before dawn' }, { max: 37.5, name: 'dawn' },
    { max: 62.5, name: 'midday' }, { max: 75, name: 'afternoon' }, { max: 87.5, name: 'dusk' }, { max: 101, name: 'midnight' }
  ] : [
    { max: 12.5, name: '夜半' }, { max: 25, name: '将旦' }, { max: 37.5, name: '破晓' },
    { max: 62.5, name: '日中' }, { max: 75, name: '日昃' }, { max: 87.5, name: '入暮' }, { max: 101, name: '夜半' }
  ];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  function setOrb(el, hour, isSun) {
    const visible = isSun ? hour >= 6 && hour <= 18 : hour < 6 || hour > 18;
    const local = isSun ? (hour - 6) / 12 : ((hour + 6) % 24) / 12;
    const x = 8 + Math.max(0, Math.min(1, local)) * 84;
    const y = 69 - Math.sin(Math.PI * Math.max(0, Math.min(1, local))) * 56;
    el.style.left = `${x}%`; el.style.top = `${y}%`; el.style.opacity = visible ? '1' : '0';
    el.style.transform = 'translate(-50%,-50%)';
  }
  function updateDay() {
    const t = +daySlider.value, hour = t / 100 * 24;
    const name = dayNames.find(d => t <= d.max).name;
    const branch = branches[Math.floor(((hour + 1) % 24) / 2)];
    const hh = String(Math.floor(hour) % 24).padStart(2, '0');
    const mm = String(Math.round((hour % 1) * 60) % 60).padStart(2, '0');
    $('#time-name').textContent = name; $('#time-clock').textContent = EN ? `${hh}:${mm}` : `${branch}时 · ${hh}:${mm}`;
    setOrb($('#sun'), hour, true); setOrb($('#moon'), hour, false);
    const yang = Math.round((1 - Math.cos(Math.PI * 2 * t / 100)) * 50), yin = 100 - yang;
    $('#yang-value').textContent = yang; $('#yin-value').textContent = yin; $('#balance-bar').style.width = `${yang}%`;
    const daylight = Math.max(0, Math.sin(Math.PI * (hour - 6) / 12));
    const dawn = Math.max(0, 1 - Math.abs(hour - 6) / 4), dusk = Math.max(0, 1 - Math.abs(hour - 18) / 4);
    const warm = Math.max(dawn, dusk);
    sky.style.background = `linear-gradient(180deg, rgb(${Math.round(24+130*daylight+90*warm)},${Math.round(39+150*daylight+60*warm)},${Math.round(54+160*daylight+25*warm)}) 0%,rgb(${Math.round(42+180*daylight)},${Math.round(61+174*daylight)},${Math.round(70+150*daylight)}) 64%,#a99a70 100%)`;
  }
  daySlider.addEventListener('input', updateDay); updateDay();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let stopped = false, start = performance.now();
    const stop = () => { stopped = true; }; daySlider.addEventListener('pointerdown', stop, { once: true }); daySlider.addEventListener('keydown', stop, { once: true });
    const coach = now => { if (stopped || now - start > 5200) return; daySlider.value = 25 + Math.sin((now-start)/5200*Math.PI) * 18; updateDay(); requestAnimationFrame(coach); };
    requestAnimationFrame(coach);
  }

  const lifeSlider = $('#life-slider'), lifeCanvas = $('#life-canvas'), ctx = lifeCanvas.getContext('2d');
  const lifePoints = [[0,.1],[.14,.2],[.35,.62],[.55,.94],[.72,.55],[.86,.1],[1,.3]];
  const lifeStages = EN ? [
    [10,'Latent','seed','Strength has not yet appeared.'],[28,'Germination','sprout','Stored energy begins to become growth.'],[48,'Growth','tree','Conditions align and growth accelerates.'],
    [62,'Fullness','peak','Near the peak, further growth costs more.'],[86,'Decline','fall','Old structure loosens and makes room for change.'],[101,'Return','renew','The low point is not stillness; another cycle begins.']
  ] : [
    [10,'潜藏','种','力量尚未显露。'],[28,'萌发','芽','积蓄开始转为生长。'],[48,'成长','木','条件相合，增长加快。'],
    [62,'盛极','盛','越接近峰顶，继续增长的代价越高。'],[86,'衰退','落','旧结构松动，为新的变化腾出位置。'],[101,'复始','复','低处不是静止，新的循环已经发端。']
  ];
  function curveValue(t){
    let i=0; while(i<lifePoints.length-2 && t>lifePoints[i+1][0]) i++;
    const [x1,y1]=lifePoints[i],[x2,y2]=lifePoints[i+1],u=(t-x1)/(x2-x1),s=u*u*(3-2*u); return y1+(y2-y1)*s;
  }
  function drawLife(){
    const r=lifeCanvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2); lifeCanvas.width=r.width*d;lifeCanvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);
    const w=r.width,h=r.height,padX=Math.min(80,w*.09),padY=55,base=h-padY;
    ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(24,39,45,.14)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(padX,base);ctx.lineTo(w-padX,base);ctx.stroke();
    ctx.beginPath(); for(let n=0;n<=220;n++){const t=n/220,x=padX+t*(w-padX*2),y=base-curveValue(t)*(h-padY*2);n?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    ctx.strokeStyle='#315f70';ctx.lineWidth=3;ctx.stroke();
    const peakX=padX+.55*(w-padX*2),peakY=base-.94*(h-padY*2);ctx.fillStyle='#ae3b2d';ctx.beginPath();ctx.arc(peakX,peakY,6,0,Math.PI*2);ctx.fill();ctx.font='13px serif';ctx.fillText(EN?'fullness':'盛极',peakX+12,peakY-8);
    const t=+lifeSlider.value/100,x=padX+t*(w-padX*2),y=base-curveValue(t)*(h-padY*2);ctx.fillStyle='#d0a052';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#efe8d8';ctx.lineWidth=3;ctx.stroke();
  }
  function updateLife(){const v=+lifeSlider.value,s=lifeStages.find(x=>v<=x[0]);$('#life-stage').textContent=s[1];$('#life-glyph').textContent=s[2];$('#life-note').textContent=s[3];drawLife()}
  lifeSlider.addEventListener('input',updateLife);new ResizeObserver(drawLife).observe(lifeCanvas);updateLife();

  const seasons=EN?{spring:['spring','Yang begins to rise; plants stir.','sow','Sow now: use the first movement of growth.'],summer:['summer','Days are long and growth is vigorous.','weed','Weed now: clear room for rapid growth.'],autumn:['autumn','Grain ripens and living things come to fruit.','harvest','Harvest now: maturity has arrived.'],winter:['winter','Water withdraws; living things conserve.','prune','Prune and conserve now: keep strength for the next beginning.']}:{spring:['春','阳气初生，草木萌动。','sow','此时宜播种：借初生之势，让种子进入生长。'],summer:['夏','日长物盛，生长迅速。','weed','此时宜耘田：为旺盛生长清理空间。'],autumn:['秋','百谷成实，万物收成。','harvest','此时宜收获：成熟已经到来，不再错过窗口。'],winter:['冬','水藏于地，万物收敛。','prune','此时宜修剪蓄养：保存力量，为下一轮萌发做准备。']};
  let season='winter';
  $$('.season-tabs button').forEach(b=>b.addEventListener('click',()=>{season=b.dataset.season;$$('.season-tabs button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#season-visual').dataset.season=season;$('#season-mark').textContent=seasons[season][0];$('#season-line').textContent=seasons[season][1];$$('.action-list button').forEach(x=>x.className='');$('#season-answer').innerHTML=EN?'<b>Choose an action</b><span>Ability has not changed; conditions have.</span>':'<b>请选择一件事</b><span>能力没有改变，条件正在改变。</span>'}));
  $$('.action-list button').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.action===seasons[season][2];$$('.action-list button').forEach(x=>x.className='');b.classList.add(ok?'correct':'wrong');$('#season-answer').innerHTML=ok?`<b>${EN?'Right time':'得时'}</b><span>${seasons[season][3]}</span>`:`<b>${EN?'Wrong time':'失时'}</b><span>${EN?'The act may not be wrong; present conditions do not fit it.':'事情本身未必错，只是此刻的条件还不相合。'}</span>`}));

  const roleMatch={pioneer:'start',builder:'grow',steward:'mature',mentor:'renew'},roleNames=EN?{pioneer:'Pioneer',builder:'Builder',steward:'Steward',mentor:'Mentor'}:{pioneer:'开路者',builder:'经营者',steward:'治理者',mentor:'传承者'},stageNames=EN?{start:'Beginning',grow:'Expansion',mature:'Maturity',renew:'Succession'}:{start:'初创',grow:'扩张',mature:'成熟',renew:'传承'};let selectedRole='';
  function selectRole(role){selectedRole=role;$$('.role').forEach(x=>x.classList.toggle('selected',x.dataset.role===role))}
  function placeRole(role,stage){const ok=roleMatch[role]===stage;$$('.stage-slot').forEach(x=>x.classList.toggle('filled',x.dataset.stage===stage));$('#position-answer').innerHTML=`<span>${EN?(ok?'right position':'wrong position'):(ok?'得位':'失位')}</span><strong>${roleNames[role]} · ${stageNames[stage]}</strong><p>${EN?(ok?'Capacity and stage fit; action can form a coherent force.':'Capacity remains, but this time and place do not let it work fully. Try another stage.'):(ok?'能力与阶段彼此相称，行动较容易形成合力。':'能力并没有消失，只是此时此位未能让它充分发挥。换一个阶段再试。')}</p>`}
  $$('.role').forEach(b=>{b.addEventListener('click',()=>selectRole(b.dataset.role));b.addEventListener('dragstart',e=>{selectRole(b.dataset.role);e.dataTransfer.setData('text/plain',b.dataset.role)})});
  $$('.stage-slot').forEach(b=>{b.addEventListener('click',()=>{if(selectedRole)placeRole(selectedRole,b.dataset.stage)});b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('over')});b.addEventListener('dragleave',()=>b.classList.remove('over'));b.addEventListener('drop',e=>{e.preventDefault();b.classList.remove('over');const role=e.dataTransfer.getData('text/plain')||selectedRole;if(role)placeRole(role,b.dataset.stage)})});

  const dragonNotes=EN?['The time to act has not arrived. Preserve strength. This is not incapacity; time and position are not ready.','You begin to be seen and to carry responsibility in real relationships.','The position is not secure; sustained effort offsets risk.','Test the move between advance and retreat; do not treat one leap as final success.','Capacity, timing, and position fit; action can unfold fully.','If ascent continues at the height, room to turn disappears.']:['未到行动之时，先保存力量。不是无能，而是时位未至。','开始被看见，也开始承担真实关系中的责任。','位置尚未稳定，以持续精进来抵消风险。','进退之间先试探，不把一次跃起当作最终成功。','能力、时机与位置相称，行动可以充分展开。','到达高处仍一味上升，回旋余地便会消失。'];
  const dragonSlider=$('#dragon-slider');function updateDragon(){const n=+dragonSlider.value;$('#dragon-line').textContent=(EN?['one','two','three','four','five','six']:['一','二','三','四','五','六'])[n-1];$$('#yao-list li').forEach((x,i)=>x.classList.toggle('active',i===n-1));const dragon=$('.dragon');dragon.style.left=`${4+(n-1)*17.4}%`;dragon.style.bottom=`${14+Math.sin((n-1)/5*Math.PI)*170}px`;dragon.style.transform=`rotate(${-12+(n-1)*7}deg)`;$('#dragon-reading').textContent=dragonNotes[n-1]}
  dragonSlider.addEventListener('input',updateDragon);$$('#yao-list li').forEach(x=>x.addEventListener('click',()=>{dragonSlider.value=x.dataset.line;updateDragon()}));updateDragon();

  const order=['乾','兑','离','震','巽','坎','艮','坤'];
  const trigrams={乾:{bits:[1,1,1],symbol:'☰',image:'天',en:'Qian · Heaven'},兑:{bits:[1,1,0],symbol:'☱',image:'泽',en:'Dui · Lake'},离:{bits:[1,0,1],symbol:'☲',image:'火',en:'Li · Fire'},震:{bits:[1,0,0],symbol:'☳',image:'雷',en:'Zhen · Thunder'},巽:{bits:[0,1,1],symbol:'☴',image:'风',en:'Xun · Wind'},坎:{bits:[0,1,0],symbol:'☵',image:'水',en:'Kan · Water'},艮:{bits:[0,0,1],symbol:'☶',image:'山',en:'Gen · Mountain'},坤:{bits:[0,0,0],symbol:'☷',image:'地',en:'Kun · Earth'}};
  const matrix=[['乾','夬','大有','大壮','小畜','需','大畜','泰'],['履','兑','睽','归妹','中孚','节','损','临'],['同人','革','离','丰','家人','既济','贲','明夷'],['无妄','随','噬嗑','震','益','屯','颐','复'],['姤','大过','鼎','恒','巽','井','蛊','升'],['讼','困','未济','解','涣','坎','蒙','师'],['遁','咸','旅','小过','渐','蹇','艮','谦'],['否','萃','晋','豫','观','比','剥','坤']];
  const matrixEn=[['The Creative','Breakthrough','Great Possession','Great Power','Small Taming','Waiting','Great Taming','Peace'],['Treading','The Joyous','Opposition','Marrying Maiden','Inner Truth','Limitation','Decrease','Approach'],['Fellowship','Revolution','Clinging Fire','Abundance','The Family','After Completion','Grace','Darkening of Light'],['Innocence','Following','Biting Through','Arousing Thunder','Increase','Difficulty at the Beginning','Nourishment','Return'],['Coming to Meet','Great Exceeding','The Cauldron','Duration','Gentle Wind','The Well','Work on Decay','Pushing Upward'],['Conflict','Oppression','Before Completion','Deliverance','Dispersion','Abysmal Water','Youthful Folly','The Army'],['Retreat','Influence','The Wanderer','Small Exceeding','Development','Obstruction','Keeping Still','Modesty'],['Standstill','Gathering','Progress','Enthusiasm','Contemplation','Holding Together','Splitting Apart','The Receptive']];
  const special=EN?{乾:'Heaven moves with vigor. Six yang lines describe sustained initiative.',坤:'Earth receives. Six yin lines describe bearing and responsiveness.',泰:'Earth above and Heaven below tend toward encounter; hence Peace.',否:'Heaven above and Earth below tend to separate; hence Standstill.',既济:'Water and fire have taken their places. Completion still requires care.',未济:'Fire and water have not yet met. The work remains underway, and change remains possible.',复:'One yang line returns. The low point begins another cycle.'}:{乾:'天行健。六爻皆阳，显示一种持续发动的状态。',坤:'地势坤。六爻皆阴，显示一种承载与顺应的状态。',泰:'地在上、天在下；两者趋向交会，故名泰。',否:'天在上、地在下；两者趋向分离，故名否。',既济:'水火各得其位，事情已经渡过；完成之后仍须守成。',未济:'火水尚未相交，事情仍在途中；未成也意味着仍可变化。',复:'一阳复生。低处不是终止，而是新一轮变化的起点。'};
  let lines=[1,1,1,1,1,1];
  function trigramFrom(bits){return order.find(n=>trigrams[n].bits.join('')===bits.join(''))}
  function renderPickers(id,which){const root=$(id);order.forEach(name=>{const b=document.createElement('button');b.type='button';b.dataset.name=name;b.textContent=`${trigrams[name].symbol} ${EN?trigrams[name].en:name}`;b.addEventListener('click',()=>{const start=which==='upper'?3:0;lines.splice(start,3,...trigrams[name].bits);renderHex()});root.appendChild(b)})}
  renderPickers('#upper-pickers','upper');renderPickers('#lower-pickers','lower');
  function renderHex(){const lower=trigramFrom(lines.slice(0,3)),upper=trigramFrom(lines.slice(3,6)),name=matrix[order.indexOf(upper)][order.indexOf(lower)];
    $$('.trigram-buttons button').forEach(b=>{const own=b.parentElement.id.startsWith('upper')?upper:lower;b.setAttribute('aria-pressed',String(b.dataset.name===own))});
    const root=$('#hex-lines');root.innerHTML='';lines.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.className=`hex-line ${v?'yang':'yin'}`;b.setAttribute('aria-label',EN?`Line ${i+1}, ${v?'yang':'yin'}; click to change`:`第${i+1}爻，${v?'阳爻':'阴爻'}；点击变爻`);b.addEventListener('click',()=>{lines[i]=lines[i]?0:1;renderHex()});root.appendChild(b)});
    $('#hex-structure').textContent=EN?`${trigrams[upper].en} above · ${trigrams[lower].en} below`:`上${upper} · 下${lower}　${trigrams[upper].image}${trigrams[lower].image}`;$('#hex-name').textContent=EN?`${name} · ${matrixEn[order.indexOf(upper)][order.indexOf(lower)]}`:name;$('#hex-image').textContent=special[name]||(EN?`${trigrams[upper].en} is above and ${trigrams[lower].en} below. Their relation forms ${matrixEn[order.indexOf(upper)][order.indexOf(lower)]}; change one line and the relation moves.`:`${trigrams[upper].image}在上，${trigrams[lower].image}在下。两种情势相重，形成“${name}”所描述的关系；再变一爻，关系便会移动。`);
  }renderHex();
})();
