const canvas = document.querySelector('#earth');
const routeCanvas = document.querySelector('#routes');
const routeContext = routeCanvas.getContext('2d');
const loading = document.querySelector('#loading');
const spinButton = document.querySelector('#spin');
const resetButton = document.querySelector('#reset');
const monthSelect = document.querySelector('#month');
const currentMonthLabel = document.querySelector('#current-month');
const pageParameters = new URLSearchParams(location.search);
document.body.classList.toggle('embed', pageParameters.has('embed'));
document.body.classList.toggle('hero-embed', pageParameters.has('hero'));
document.body.classList.toggle('plain-earth', pageParameters.has('plain'));
const gl = canvas.getContext('webgl', { antialias: true, alpha: true });

if (!gl) {
  loading.textContent = '当前浏览器暂不支持地球渲染。';
  throw new Error('WebGL unavailable');
}

const vertexSource = `
attribute vec2 position;
void main(){ gl_Position=vec4(position,0.0,1.0); }
`;

const fragmentSource = `
precision highp float;
uniform vec2 resolution;
uniform sampler2D earthTexture;
uniform float longitude;
uniform float latitude;

const float PI=3.141592653589793;

mat3 rotateY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotateX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}

void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  vec2 p=uv-vec2(.5,-.17);
  p.x*=resolution.x/resolution.y;
  float radius=.69;
  float d=dot(p,p);
  if(d>radius*radius){discard;}

  float z=sqrt(max(0.,radius*radius-d));
  vec3 normal=normalize(vec3(-p.x,p.y,z));
  vec3 globe=rotateY(longitude)*rotateX(latitude)*normal;
  vec2 mapUv=vec2(atan(globe.z,globe.x)/(2.*PI)+.5,asin(clamp(globe.y,-1.,1.))/PI+.5);
  vec3 color=texture2D(earthTexture,mapUv).rgb;

  vec3 lightDir=normalize(vec3(-.35,.72,.62));
  float diffuse=max(dot(normal,lightDir),0.0);
  float rim=pow(1.-max(normal.z,0.),2.4);
  float night=smoothstep(-.18,.26,dot(normal,lightDir));
  color*=mix(vec3(.12,.18,.28),vec3(.88,.98,1.08),night);
  color*=.86+diffuse*.34;
  color+=vec3(.12,.38,.58)*rim*.38;
  float edge=smoothstep(.0,.035,radius*radius-d);
  gl_FragColor=vec4(color,edge);
}
`;

function shader(type, source) {
  const item = gl.createShader(type);
  gl.shaderSource(item, source); gl.compileShader(item);
  if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
  return item;
}

const program = gl.createProgram();
gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
gl.linkProgram(program); gl.useProgram(program);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
const position = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

const resolution = gl.getUniformLocation(program, 'resolution');
const longitudeUniform = gl.getUniformLocation(program, 'longitude');
const latitudeUniform = gl.getUniformLocation(program, 'latitude');
let longitude = -1.02, latitude = -.20, spinning = true, dragging = false, previousX = 0, previousY = 0;

function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * ratio); canvas.height = Math.round(innerHeight * ratio);
  routeCanvas.width = canvas.width; routeCanvas.height = canvas.height;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
addEventListener('resize', resize); resize();

canvas.addEventListener('pointerdown', event => {
  dragging = true; previousX = event.clientX; previousY = event.clientY; canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', event => {
  if (!dragging) return;
  longitude += (event.clientX - previousX) * .006;
  latitude = Math.max(-.85, Math.min(.85, latitude - (event.clientY - previousY) * .004));
  previousX = event.clientX; previousY = event.clientY;
});
canvas.addEventListener('pointerup', () => { dragging = false; });

spinButton.addEventListener('click', () => {
  spinning = !spinning;
  spinButton.setAttribute('aria-pressed', String(spinning));
  spinButton.textContent = spinning ? '自转 · 暂停' : '自转 · 继续';
});
resetButton.addEventListener('click', () => { longitude = -1.02; latitude = -.20; });

const texture = gl.createTexture();
const monthFiles = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
let textureReady = false;
let routes = [];
let routesStarted = false;

function scheduleRoutes() {
  if (routesStarted || document.body.classList.contains('plain-earth')) return;
  routesStarted = true;
  const start = () => loadRoutes().catch(() => { routes = []; });
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1200 });
  else window.setTimeout(start, 250);
}

function loadMonth(month) {
  const value = Math.max(1, Math.min(12, Number(month)));
  monthSelect.value = String(value);
  currentMonthLabel.textContent = monthNames[value - 1];
  const image = new Image();
  loading.classList.remove('hidden');
  image.onload = () => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  textureReady = true;
  loading.classList.add('hidden');
  scheduleRoutes();
  };
  image.onerror = () => { loading.textContent = '卫星贴图未能载入，请刷新重试。'; };
  image.src = `data/blue-marble-${String(value).padStart(2,'0')}-${monthFiles[value - 1]}-4096.jpg`;
}

monthSelect.addEventListener('change', event => loadMonth(event.target.value));

const normalize = vector => {
  const length = Math.hypot(...vector);
  return vector.map(value => value / length);
};
const geoVector = ([lon, lat]) => {
  const lambda = lon * Math.PI / 180, phi = lat * Math.PI / 180, c = Math.cos(phi);
  return [c * Math.cos(lambda), Math.sin(phi), c * Math.sin(lambda)];
};
const slerp = (a, b, t) => {
  const angle = Math.acos(Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2])));
  if (angle < .0001) return a;
  const denominator = Math.sin(angle), left = Math.sin((1-t)*angle)/denominator, right = Math.sin(t*angle)/denominator;
  return normalize([a[0]*left+b[0]*right,a[1]*left+b[1]*right,a[2]*left+b[2]*right]);
};
function projectVector(globe) {
  const cy = Math.cos(longitude), sy = Math.sin(longitude);
  const x1 = cy * globe[0] - sy * globe[2], y1 = globe[1], z1 = sy * globe[0] + cy * globe[2];
  const cx = Math.cos(latitude), sx = Math.sin(latitude);
  const normal = [x1, cx * y1 + sx * z1, -sx * y1 + cx * z1];
  const aspect = canvas.width / canvas.height, radius = .69;
  return { x: canvas.width * (.5 - normal[0] * radius / aspect), y: canvas.height * (1 - (-.17 + normal[1] * radius)), visible: normal[2] > .015 };
}
function drawRoutes() {
  routeContext.clearRect(0, 0, routeCanvas.width, routeCanvas.height);
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const styles = { flight:['#55c8ff',1.25], rail:['#d49cff',1.4], road:['#efb44d',1.55] };
  routeContext.globalCompositeOperation = 'screen';
  routes.forEach(route => {
    const [color, width] = styles[route.mode];
    const a = geoVector(route.from), b = geoVector(route.to);
    let drawing = false;
    routeContext.beginPath();
    for (let step = 0; step <= 42; step++) {
      const point = projectVector(slerp(a, b, step / 42));
      if (point.visible) {
        if (!drawing) routeContext.moveTo(point.x, point.y); else routeContext.lineTo(point.x, point.y);
        drawing = true;
      } else drawing = false;
    }
    routeContext.strokeStyle = color; routeContext.lineWidth = width * ratio; routeContext.globalAlpha = route.mode === 'flight' ? .38 : .52;
    routeContext.stroke();
  });
  const points = new Map();
  routes.forEach(route => { points.set(route.from.join(','), route.from); points.set(route.to.join(','), route.to); });
  routeContext.globalAlpha = .88; routeContext.fillStyle = '#f4fbff';
  points.forEach(coordinates => { const point = projectVector(geoVector(coordinates)); if(point.visible){routeContext.beginPath();routeContext.arc(point.x,point.y,1.35*ratio,0,Math.PI*2);routeContext.fill();} });
  routeContext.globalCompositeOperation = 'source-over'; routeContext.globalAlpha = 1;
}

function findLocation(map, key) {
  if (map[key]) return map[key].coordinates;
  const clean = String(key || '').replace(/\s*T?\d+$/i,'').trim();
  const match = Object.keys(map).find(item => clean.startsWith(item) || item.startsWith(clean));
  return match ? map[match].coordinates : null;
}
async function loadRoutes() {
  const paths = ['flight-history','airport-cities','train-history','train-cities','car-history','car-cities'];
  const [flights, airports, trains, trainCities, cars, carCities] = await Promise.all(paths.map(path => fetch(`data/${path}.json`).then(response => response.json())));
  const collected = [];
  const append = (records, places, mode, field) => records.filter(record => !record.status || record.status === 'completed').forEach(record => (record.legs || []).forEach(leg => {
    const from = findLocation(places, leg.departure?.[field]); const to = findLocation(places, leg.arrival?.[field]);
    if (from && to && (from[0] !== to[0] || from[1] !== to[1])) collected.push({from,to,mode});
  }));
  append(flights.records, airports, 'flight', 'airport'); append(trains.records, trainCities, 'rail', 'city'); append(cars.records, carCities, 'road', 'city');
  const unique = new Map();
  collected.forEach(route => { const ends=[route.from.join(','),route.to.join(',')].sort(); unique.set(`${route.mode}:${ends.join('|')}`,route); });
  routes = [...unique.values()];
}

let last = performance.now();
function render(now) {
  if (spinning && !dragging && !matchMedia('(prefers-reduced-motion: reduce)').matches) longitude += (now - last) * .000025;
  last = now;
  if (textureReady) {
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(longitudeUniform, longitude); gl.uniform1f(latitudeUniform, latitude);
    gl.drawArrays(gl.TRIANGLES, 0, 6); drawRoutes();
  }
  requestAnimationFrame(render);
}

loadMonth(new Date().getMonth() + 1);
requestAnimationFrame(render);

if (document.body.classList.contains('embed')) {
  let wheelLocked = false;
  addEventListener('wheel', event => {
    event.preventDefault();
    if (window.parent === window) return;
    if (document.body.classList.contains('hero-embed') && event.deltaY > 8) {
      if (wheelLocked) return;
      wheelLocked = true;
      window.parent.document.querySelector('#world')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => { wheelLocked = false; }, 850);
      return;
    }
    window.parent.scrollBy({ top: event.deltaY, left: 0, behavior: 'auto' });
  }, { passive: false });
}
