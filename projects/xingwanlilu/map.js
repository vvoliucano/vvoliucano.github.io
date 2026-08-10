const map = document.querySelector('#china-map');
const land = document.querySelector('#map-land');
const labels = document.querySelector('#map-labels');
const tooltip = document.querySelector('#tooltip');
const status = document.querySelector('#map-status');
const unvisited = new Set(['西藏自治区', '新疆维吾尔自治区', '云南省', '宁夏回族自治区', '台湾省', '吉林省', '澳门特别行政区']);
const labelNames = new Map([['内蒙古自治区','内蒙古'],['广西壮族自治区','广西'],['西藏自治区','西藏'],['宁夏回族自治区','宁夏'],['新疆维吾尔自治区','新疆'],['香港特别行政区','香港'],['澳门特别行政区','澳门']]);

function visitCoordinates(geometry, callback) {
  const groups = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  groups.forEach(polygon => polygon.forEach(ring => ring.forEach(callback)));
}

function provinceName(feature) {
  return feature.properties.name || feature.properties.NAME || feature.properties.fullname || '未命名地区';
}

fetch('data/china-provinces.geojson')
  .then(response => {
    if (!response.ok) throw new Error('地图数据读取失败');
    return response.json();
  })
  .then(data => {
    const points = [];
    data.features.forEach(feature => visitCoordinates(feature.geometry, point => points.push(point)));
    const xs = points.map(point => point[0]);
    const ys = points.map(point => point[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const width = 900, height = 720, pad = 28;
    const scale = Math.min((width - pad * 2) / (maxX - minX), (height - pad * 2) / (maxY - minY));
    const offsetX = (width - (maxX - minX) * scale) / 2;
    const offsetY = (height - (maxY - minY) * scale) / 2;
    const project = ([x, y]) => [offsetX + (x - minX) * scale, height - offsetY - (y - minY) * scale];
    const pathFor = geometry => {
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
      return polygons.map(polygon => polygon.map(ring => ring.map((point, index) => {
        const [x, y] = project(point);
        return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join('') + 'Z').join('')).join('');
    };

    data.features.forEach(feature => {
      const name = provinceName(feature);
      const isVisited = !unvisited.has(name) && name !== '未命名地区';
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathFor(feature.geometry));
      path.setAttribute('class', `province${isVisited ? ' visited' : ' future'}`);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'img');
      path.setAttribute('aria-label', `${name}${isVisited ? '，已经走过' : '，等待抵达'}`);
      const show = event => {
        const wrapRect = map.parentElement.getBoundingClientRect();
        const rect = path.getBoundingClientRect();
        tooltip.textContent = `${name} · ${isVisited ? '已经走过' : '等待抵达'}`;
        tooltip.style.left = `${event.clientX ? event.clientX - wrapRect.left : rect.left + rect.width / 2 - wrapRect.left}px`;
        tooltip.style.top = `${event.clientY ? event.clientY - wrapRect.top : rect.top - wrapRect.top}px`;
        tooltip.classList.add('show');
      };
      path.addEventListener('pointermove', show);
      path.addEventListener('pointerleave', () => tooltip.classList.remove('show'));
      path.addEventListener('focus', show);
      path.addEventListener('blur', () => tooltip.classList.remove('show'));
      land.appendChild(path);
      const center = feature.properties.center || feature.properties.centroid;
      if (center && name !== '未命名地区') {
        const [cx, cy] = project(center);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', cx); label.setAttribute('y', cy);
        label.setAttribute('class', `province-label${isVisited ? '' : ' future-label'}`);
        label.textContent = labelNames.get(name) || name.replace(/[省市]$/, '');
        labels.appendChild(label);
      }
    });
    status.classList.add('hidden');
  })
  .catch(() => { status.textContent = '地图暂时未能展开，请刷新重试。'; });
