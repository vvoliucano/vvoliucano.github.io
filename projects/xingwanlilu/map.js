const map = document.querySelector('#china-map');
const land = document.querySelector('#map-land');
const rivers = document.querySelector('#map-rivers');
const flightRouteLayer = document.querySelector('#map-flight-routes');
const railRouteLayer = document.querySelector('#map-rail-routes');
const carRouteLayer = document.querySelector('#map-car-routes');
const routeCityLayer = document.querySelector('#map-route-cities');
const labels = document.querySelector('#map-labels');
const tooltip = document.querySelector('#tooltip');
const status = document.querySelector('#map-status');
const chinaIsEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
const chinaAssetBase = document.documentElement.dataset.assetBase || '';
const chinaText = (zh, en) => chinaIsEnglish ? en : zh;
const unvisited = new Set(['西藏自治区', '新疆维吾尔自治区', '云南省', '宁夏回族自治区', '台湾省', '吉林省', '澳门特别行政区']);
const labelNames = new Map([['内蒙古自治区','内蒙古'],['广西壮族自治区','广西'],['西藏自治区','西藏'],['宁夏回族自治区','宁夏'],['新疆维吾尔自治区','新疆'],['香港特别行政区','香港'],['澳门特别行政区','澳门']]);
const provinceNamesEn = new Map(Object.entries({'北京市':'Beijing','天津市':'Tianjin','河北省':'Hebei','山西省':'Shanxi','内蒙古自治区':'Inner Mongolia','辽宁省':'Liaoning','吉林省':'Jilin','黑龙江省':'Heilongjiang','上海市':'Shanghai','江苏省':'Jiangsu','浙江省':'Zhejiang','安徽省':'Anhui','福建省':'Fujian','江西省':'Jiangxi','山东省':'Shandong','河南省':'Henan','湖北省':'Hubei','湖南省':'Hunan','广东省':'Guangdong','广西壮族自治区':'Guangxi','海南省':'Hainan','重庆市':'Chongqing','四川省':'Sichuan','贵州省':'Guizhou','云南省':'Yunnan','西藏自治区':'Tibet','陕西省':'Shaanxi','甘肃省':'Gansu','青海省':'Qinghai','宁夏回族自治区':'Ningxia','新疆维吾尔自治区':'Xinjiang','台湾省':'Taiwan','香港特别行政区':'Hong Kong','澳门特别行政区':'Macao'}));
const riverNamesEn = new Map([['长江', 'Yangtze River'], ['黄河', 'Yellow River']]);

function visitCoordinates(geometry, callback) {
  const groups = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  groups.forEach(polygon => polygon.forEach(ring => ring.forEach(callback)));
}

function provinceName(feature) {
  return feature.properties.name || feature.properties.NAME || feature.properties.fullname || '未命名地区';
}

function chinaArcPath(from, to, project) {
  const start = project(from), end = project(to);
  if (!start || !end) return '';
  const dx = end[0] - start[0], dy = end[1] - start[1];
  const bend = Math.min(70, Math.hypot(dx, dy) * .18);
  const mx = (start[0] + end[0]) / 2 - dy / Math.max(1, Math.hypot(dx, dy)) * bend;
  const my = (start[1] + end[1]) / 2 + dx / Math.max(1, Math.hypot(dx, dy)) * bend;
  return `M${start[0].toFixed(2)},${start[1].toFixed(2)}Q${mx.toFixed(2)},${my.toFixed(2)} ${end[0].toFixed(2)},${end[1].toFixed(2)}`;
}

Promise.all([
  fetch(`${chinaAssetBase}data/china-provinces.geojson`),
  fetch(`${chinaAssetBase}data/china-rivers.geojson`),
  fetch(`${chinaAssetBase}data/flight-history.json`),
  fetch(`${chinaAssetBase}data/airport-cities.json`),
  fetch(`${chinaAssetBase}data/train-history.json?v=20260812-4`),
  fetch(`${chinaAssetBase}data/train-cities.json?v=20260812-5`),
  fetch(`${chinaAssetBase}data/car-history.json?v=20260812-4`),
  fetch(`${chinaAssetBase}data/car-cities.json?v=20260812-4`)
])
  .then(async responses => {
    if (responses.some(response => !response.ok)) throw new Error(chinaText('地图数据读取失败', 'Map data could not be loaded'));
    return Promise.all(responses.map(response => response.json()));
  })
  .then(([data, riverData, flightHistory, airportCities, trainHistory, trainCities, carHistory, carCities]) => {
    const width = 900, height = 720, pad = 28;
    const points = [];
    data.features.forEach(feature => visitCoordinates(feature.geometry, point => points.push(point)));
    const meanLatitude = points.reduce((sum, point) => sum + point[1], 0) / points.length;
    const longitudeFactor = Math.cos(meanLatitude * Math.PI / 180);
    const corrected = ([longitude, latitude]) => [longitude * longitudeFactor, latitude];
    const correctedPoints = points.map(corrected);
    const xs = correctedPoints.map(point => point[0]), ys = correctedPoints.map(point => point[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min((width - pad * 2) / (maxX - minX), (height - pad * 2) / (maxY - minY));
    const offsetX = (width - (maxX - minX) * scale) / 2;
    const offsetY = (height - (maxY - minY) * scale) / 2;
    const project = coordinates => {
      const [x, y] = corrected(coordinates);
      return [offsetX + (x - minX) * scale, height - offsetY - (y - minY) * scale];
    };
    const linePath = geometry => {
      const lines = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates;
      return lines.map(line => line.map((point, index) => {
        const [x, y] = project(point);
        return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join('')).join('');
    };
    const pathFor = geometry => {
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
      return polygons.map(polygon => polygon.map(ring => ring.map((point, index) => {
        const [x, y] = project(point);
        return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join('') + 'Z').join('')).join('');
    };

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const mapDefs = map.querySelector('defs');
    const satelliteClip = document.createElementNS(svgNamespace, 'clipPath');
    satelliteClip.setAttribute('id', 'china-satellite-clip');
    satelliteClip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    mapDefs.appendChild(satelliteClip);

    data.features.forEach(feature => {
      const clipProvince = document.createElementNS(svgNamespace, 'path');
      clipProvince.setAttribute('d', pathFor(feature.geometry));
      satelliteClip.appendChild(clipProvince);
    });

    const satellite = document.createElementNS(svgNamespace, 'image');
    const [satelliteX, satelliteY] = project([-180, 90]);
    satellite.setAttribute('x', satelliteX);
    satellite.setAttribute('y', satelliteY);
    satellite.setAttribute('width', 360 * longitudeFactor * scale);
    satellite.setAttribute('height', 180 * scale);
    satellite.setAttribute('preserveAspectRatio', 'none');
    satellite.setAttribute('clip-path', 'url(#china-satellite-clip)');
    satellite.setAttribute('class', 'china-satellite');
    const mapMonth = new Date().getMonth() + 1;
    const mapMonthFiles = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const satelliteSource = `${chinaAssetBase}data/blue-marble-${String(mapMonth).padStart(2, '0')}-${mapMonthFiles[mapMonth - 1]}-4096.jpg`;
    satellite.setAttribute('href', satelliteSource);
    satellite.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', satelliteSource);
    land.parentNode.insertBefore(satellite, land);

    data.features.forEach(feature => {
      const name = provinceName(feature);
      const displayName = chinaIsEnglish ? (provinceNamesEn.get(name) || name) : name;
      const isVisited = !unvisited.has(name) && name !== '未命名地区';
      const path = document.createElementNS(svgNamespace, 'path');
      path.setAttribute('d', pathFor(feature.geometry));
      path.setAttribute('class', `province${isVisited ? ' visited' : ' future'}`);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'img');
      path.setAttribute('aria-label', `${displayName}, ${isVisited ? chinaText('已经走过', 'visited') : chinaText('等待抵达', 'not yet visited')}`);
      path.setAttribute('fill-opacity', isVisited ? '.16' : '.32');
      const show = event => {
        const wrapRect = map.parentElement.getBoundingClientRect();
        const rect = path.getBoundingClientRect();
        tooltip.textContent = `${displayName} · ${isVisited ? chinaText('已经走过', 'Visited') : chinaText('等待抵达', 'Not yet visited')}`;
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
        label.textContent = chinaIsEnglish ? displayName : (labelNames.get(name) || name.replace(/[省市]$/, ''));
        labels.appendChild(label);
      }
    });

    const riverLabelPoints = new Map([['长江', [112.2, 29.8]], ['黄河', [110.4, 35.8]]]);
    riverData.features.forEach(feature => {
      const river = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      river.setAttribute('d', linePath(feature.geometry));
      river.setAttribute('class', 'river');
      rivers.appendChild(river);

      const labelPoint = riverLabelPoints.get(feature.properties.name);
      if (labelPoint) {
        const [x, y] = project(labelPoint);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y);
        label.setAttribute('class', 'river-label');
        label.textContent = chinaIsEnglish ? (riverNamesEn.get(feature.properties.name) || feature.properties.name) : feature.properties.name;
        rivers.appendChild(label);
      }
    });

    const routeSets = { flight: new Map(), rail: new Map(), car: new Map() };
    const routeCities = new Map();
    const addRoute = (from, to, mode) => {
      if (!from || !to || from.country !== 'China' || to.country !== 'China' || from.city === to.city) return;
      const ends = [from, to].sort((a, b) => a.city.localeCompare(b.city, 'zh-CN'));
      const key = `${ends[0].city}—${ends[1].city}`;
      if (!routeSets[mode].has(key)) routeSets[mode].set(key, { from: ends[0], to: ends[1] });
      ends.forEach(city => {
        const previous = routeCities.get(city.city);
        routeCities.set(city.city, { ...city, modes: new Set([...(previous?.modes || []), mode]), count: (previous?.count || 0) + 1 });
      });
    };
    flightHistory.records.forEach(record => record.legs.forEach(leg => addRoute(airportCities[leg.departure.airport], airportCities[leg.arrival.airport], 'flight')));
    trainHistory.records.filter(record => record.status === 'completed').forEach(record => record.legs.forEach(leg => {
      const from = trainCities[leg.departure.city], to = trainCities[leg.arrival.city];
      addRoute(from && { ...from, city: leg.departure.city }, to && { ...to, city: leg.arrival.city }, 'rail');
    }));
    carHistory.records.filter(record => record.status === 'completed').forEach(record => record.legs.forEach(leg => {
      const from = carCities[leg.departure.city], to = carCities[leg.arrival.city];
      addRoute(from && { ...from, city: leg.departure.city }, to && { ...to, city: leg.arrival.city }, 'car');
    }));
    const renderRoutes = (layer, routesForMode, mode) => routesForMode.forEach(route => {
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      halo.setAttribute('d', chinaArcPath(route.from.coordinates, route.to.coordinates, project));
      halo.setAttribute('class', `china-route-halo ${mode}`);
      layer.appendChild(halo);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', chinaArcPath(route.from.coordinates, route.to.coordinates, project));
      path.setAttribute('class', `china-route ${mode}`);
      layer.appendChild(path);
    });
    renderRoutes(flightRouteLayer, routeSets.flight, 'flight');
    renderRoutes(railRouteLayer, routeSets.rail, 'rail');
    renderRoutes(carRouteLayer, routeSets.car, 'car');
    const cityRanks = new Map([...routeCities.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'zh-CN')).map((city, index) => [city.city, index]));
    routeCities.forEach(city => {
      const point = project(city.coordinates);
      if (!point) return;
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'china-city-group');
      group.setAttribute('tabindex', '0');
      group.setAttribute('role', 'button');
      const displayCity = chinaIsEnglish && typeof cityNamesEn !== 'undefined' ? (cityNamesEn.get(city.city) || city.city) : city.city;
      const modes = [...city.modes].map(mode => mode === 'flight' ? chinaText('航空', 'Flight') : mode === 'rail' ? chinaText('铁路', 'Rail') : chinaText('汽车', 'Road')).join(' / ');
      group.setAttribute('aria-label', `${displayCity} · ${modes}`);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point[0]); circle.setAttribute('cy', point[1]); circle.setAttribute('r', 2.8);
      circle.setAttribute('class', `china-route-city${city.modes.has('rail') && !city.modes.has('flight') ? ' rail' : ''}`);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', point[0] + 5); label.setAttribute('y', point[1] - 5);
      label.setAttribute('class', 'china-route-city-label'); label.dataset.rank = cityRanks.get(city.city); label.textContent = displayCity;
      const showCity = event => {
        const wrapRect = map.parentElement.getBoundingClientRect();
        const rect = circle.getBoundingClientRect();
        tooltip.textContent = `${displayCity} · ${modes}`;
        tooltip.style.left = `${event.clientX ? event.clientX - wrapRect.left : rect.left + rect.width / 2 - wrapRect.left}px`;
        tooltip.style.top = `${event.clientY ? event.clientY - wrapRect.top : rect.top - wrapRect.top}px`;
        tooltip.classList.add('show');
      };
      group.addEventListener('pointermove', showCity);
      group.addEventListener('pointerleave', () => tooltip.classList.remove('show'));
      group.addEventListener('focus', showCity);
      group.addEventListener('blur', () => tooltip.classList.remove('show'));
      group.append(circle, label);
      routeCityLayer.appendChild(group);
    });
    const bindToggle = (id, layer, mode) => document.querySelector(id).addEventListener('click', event => {
      const visible = !layer.classList.contains('visible');
      layer.classList.toggle('visible', visible);
      event.currentTarget.setAttribute('aria-pressed', String(visible));
      const labels = mode === 'flight' ? ['隐藏航线','Hide flights','显示航线','Show flights'] : mode === 'rail' ? ['隐藏铁路','Hide rail','显示铁路','Show rail'] : ['隐藏汽车路线','Hide roads','显示汽车路线','Show roads'];
      event.currentTarget.textContent = visible ? chinaText(labels[0], labels[1]) : chinaText(labels[2], labels[3]);
    });
    bindToggle('#china-flight-routes', flightRouteLayer, 'flight');
    bindToggle('#china-rail-routes', railRouteLayer, 'rail');
    bindToggle('#china-car-routes', carRouteLayer, 'car');
    const chinaSvg = d3.select(map);
    const chinaViewport = d3.select('#china-map-viewport');
    const updateChinaCityLabels = scale => {
      const limit = scale < 1.6 ? 8 : scale < 2.5 ? 14 : scale < 4 ? 22 : routeCities.size;
      routeCityLayer.querySelectorAll('.china-route-city-label').forEach(label => { label.style.display = Number(label.dataset.rank) < limit ? '' : 'none'; });
    };
    const keepChinaLabelsReadable = scale => {
      map.querySelectorAll('.province-label, .river-label, .china-route-city-label').forEach(label => {
        const x = Number(label.getAttribute('x'));
        const y = Number(label.getAttribute('y'));
        label.setAttribute('transform', `translate(${x} ${y}) scale(${1 / scale}) translate(${-x} ${-y})`);
      });
    };
    updateChinaCityLabels(1);
    keepChinaLabelsReadable(1);
    const chinaZoom = d3.zoom().scaleExtent([1, 14]).on('zoom', event => {
      chinaViewport.attr('transform', event.transform);
      updateChinaCityLabels(event.transform.k);
      keepChinaLabelsReadable(event.transform.k);
    });
    chinaSvg.call(chinaZoom).on('dblclick.zoom', null);
    map.addEventListener('wheel', event => event.preventDefault(), { passive: false });
    const zoomBy = factor => chinaSvg.transition().duration(260).call(chinaZoom.scaleBy, factor);
    document.querySelector('#china-zoom-in').addEventListener('click', () => zoomBy(1.45));
    document.querySelector('#china-zoom-out').addEventListener('click', () => zoomBy(1 / 1.45));
    document.querySelector('#china-zoom-home').addEventListener('click', () => chinaSvg.transition().duration(320).call(chinaZoom.transform, d3.zoomIdentity));
    status.classList.add('hidden');
  })
  .catch(() => { status.textContent = chinaText('地图暂时未能展开，请刷新重试。', 'The map could not be opened. Please refresh and try again.'); });
