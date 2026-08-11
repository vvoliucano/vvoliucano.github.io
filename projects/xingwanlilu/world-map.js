const worldSvg = d3.select('#world-map');
const worldStatus = document.querySelector('#world-status');
const journeyList = document.querySelector('#journey-list');
const cityDetail = document.querySelector('#city-detail');
const worldTooltip = document.querySelector('#world-tooltip');
const globePane = document.querySelector('.globe-pane');
const worldWidth = 900;
const worldHeight = 620;
const initialRotation = [-104, -24, 0];
const visitedCountries = new Set();
const journeys = [
  { year: '2014—2023', city: '北京', country: '中国', markerRadius: 11, coordinates: [116.4074, 39.9042], label: [13, -8], kind: 'home' },
  { year: '2023', city: '武汉', country: '中国', markerRadius: 7, coordinates: [114.3055, 30.5928], label: [11, 15], kind: 'home' },
  { year: '2024—2026', city: '新加坡', country: '新加坡', markerRadius: 9, coordinates: [103.8198, 1.3521], label: [12, 4], kind: 'home' },
  { year: '2018', city: '柏林', country: '德国', markerRadius: 5.5, coordinates: [13.405, 52.52], kind: 'visit' },
  { year: '2019', city: '温哥华', country: '加拿大', markerRadius: 5, coordinates: [-123.1207, 49.2827], kind: 'visit' },
  { year: '2025', city: '巴厘岛', country: '印度尼西亚', markerRadius: 5.2, coordinates: [115.1889, -8.4095], label: [10, 15], kind: 'visit' },
  { year: '2025', city: '雅加达', country: '印度尼西亚', markerRadius: 4, coordinates: [106.8456, -6.2088], label: [10, -7], kind: 'visit' }
];

const projection = d3.geoOrthographic()
  .translate([worldWidth / 2, worldHeight / 2])
  .scale(255)
  .clipAngle(90)
  .precision(.2)
  .rotate(initialRotation);
const worldPath = d3.geoPath(projection);

const starLayer = worldSvg.append('g').attr('class', 'world-stars').attr('aria-hidden', 'true');
let starSeed = 20260811;
const starRandom = () => {
  starSeed = (starSeed * 1664525 + 1013904223) >>> 0;
  return starSeed / 4294967296;
};
const stars = d3.range(96).map(() => {
  const angle = starRandom() * Math.PI * 2;
  const radius = 360 + starRandom() * 180;
  return {
    x: worldWidth / 2 + Math.cos(angle) * radius,
    y: worldHeight / 2 + Math.sin(angle) * radius * .72,
    radius: .55 + starRandom() * 1.65,
    opacity: .35 + starRandom() * .62
  };
});
starLayer.selectAll('circle').data(stars).join('circle').attr('class', 'world-star')
  .attr('cx', star => star.x).attr('cy', star => star.y).attr('r', star => star.radius).attr('opacity', star => star.opacity);

const sphere = worldSvg.append('path').datum({ type: 'Sphere' }).attr('class', 'world-ocean').attr('filter', 'url(#globe-shadow)');
const graticule = worldSvg.append('path').datum(d3.geoGraticule10()).attr('class', 'world-graticule');
const landLayer = worldSvg.append('g').attr('class', 'world-land');
const visitedLayer = worldSvg.append('g').attr('class', 'world-visited-countries');
const borderLayer = worldSvg.append('g').attr('class', 'world-country-lines');
const routeLayer = worldSvg.append('g').attr('class', 'world-routes');
const shadeLayer = worldSvg.append('path').datum({ type: 'Sphere' }).attr('class', 'world-shade');
const solarLayer = worldSvg.append('g').attr('class', 'world-solar-layer');
const dayLayer = solarLayer.append('path').attr('class', 'world-daylight');
const nightLayer = solarLayer.append('path').attr('class', 'world-night');
const flightCityLayer = worldSvg.append('g').attr('class', 'flight-cities');
const pointLayer = worldSvg.append('g').attr('class', 'world-points');
let landSelection;
let visitedSelection;
let borderSelection;
let routeSelection;
let flightCitySelection;
let pointSelection;
let spinning = true;
let worldScale = 255;
let lastFrame = performance.now();
let flightRoutesVisible = false;
let trainRoutesVisible = false;
let selectedCity = null;
let allCities = [];
let lastListSignature = '';

function drawWorld() {
  const center = projection.invert([worldWidth / 2, worldHeight / 2]);
  sphere.attr('d', worldPath);
  graticule.attr('d', worldPath);
  if (landSelection) landSelection.attr('d', worldPath);
  if (visitedSelection) visitedSelection.attr('d', worldPath);
  if (borderSelection) borderSelection.attr('d', worldPath);
  if (routeSelection) routeSelection.attr('d', route => {
    const visible = (flightRoutesVisible && route.properties.modes.has('flight')) || (trainRoutesVisible && route.properties.modes.has('train'));
    return visible ? worldPath(route) : null;
  });
  shadeLayer.attr('d', worldPath);
  dayLayer.attr('d', worldPath);
  nightLayer.attr('d', worldPath);
  if (flightCitySelection) {
    flightCitySelection
      .attr('transform', d => `translate(${projection(d.coordinates).join(',')})`)
      .style('display', d => d3.geoDistance(center, d.coordinates) < Math.PI / 2 ? null : 'none');
    updateCityLabels(center);
    updateVisibleCityList(center);
  }
  if (pointSelection) {
    pointSelection
      .attr('transform', d => `translate(${projection(d.coordinates).join(',')})`)
      .style('display', d => d3.geoDistance(center, d.coordinates) < Math.PI / 2 ? null : 'none');
  }
}

function yearRange(years) {
  const ordered = [...years].filter(Boolean).sort();
  if (!ordered.length) return '年份待核';
  return ordered.length === 1 ? ordered[0] : `${ordered[0]}-${ordered[ordered.length - 1]}`;
}

function updateSolarLayer(now = new Date()) {
  const daysSinceJ2000 = (now.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const radians = Math.PI / 180;
  const meanLongitude = (280.459 + .98564736 * daysSinceJ2000) % 360;
  const meanAnomaly = (357.529 + .98560028 * daysSinceJ2000) % 360;
  const eclipticLongitude = meanLongitude + 1.915 * Math.sin(meanAnomaly * radians) + .02 * Math.sin(2 * meanAnomaly * radians);
  const obliquity = 23.439 - .00000036 * daysSinceJ2000;
  const rightAscension = Math.atan2(Math.cos(obliquity * radians) * Math.sin(eclipticLongitude * radians), Math.cos(eclipticLongitude * radians)) / radians;
  const declination = Math.asin(Math.sin(obliquity * radians) * Math.sin(eclipticLongitude * radians)) / radians;
  const siderealTime = (280.46061837 + 360.98564736629 * daysSinceJ2000) % 360;
  const solarLongitude = ((rightAscension - siderealTime + 540) % 360) - 180;
  const nightLongitude = ((solarLongitude + 720) % 360) - 180;
  dayLayer.datum(d3.geoCircle().center([solarLongitude, declination]).radius(90).precision(1.5)());
  nightLayer.datum(d3.geoCircle().center([nightLongitude, -declination]).radius(90).precision(1.5)());
  drawWorld();
}

function updateVisibleCityList(center) {
  const limit = worldScale < 290 ? 7 : worldScale < 520 ? 10 : worldScale < 1100 ? 14 : 20;
  const visible = allCities.filter(city => d3.geoDistance(center, city.coordinates) < Math.PI / 2)
    .sort((a, b) => b.trip_count - a.trip_count || a.city.localeCompare(b.city, 'zh-CN')).slice(0, limit);
  const signature = `${limit}:${visible.map(city => `${city.country}:${city.city}`).join('|')}`;
  if (signature === lastListSignature) return;
  lastListSignature = signature;
  journeyList.replaceChildren(...visible.map(city => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'journey-card';
    button.innerHTML = `<span class="journey-year">${yearRange(city.years)}</span><span class="journey-place"><strong>${city.city}</strong><small>${city.country_zh}</small></span><span class="journey-arrow" aria-hidden="true">↗</span>`;
    button.addEventListener('click', () => focusCity(city));
    return button;
  }));
}

function focusCity(city) {
  spinning = false;
  updateSpinButton();
  selectCity(city);
  animateWorldView([-city.coordinates[0], -city.coordinates[1], 0], Math.max(worldScale, 360));
}

function updateCityLabels(center) {
  if (!flightCitySelection) return;
  const occupied = [];
  const minimumTrips = worldScale < 270 ? 6 : worldScale < 420 ? 4 : worldScale < 800 ? 2 : 1;
  flightCitySelection.each(function(city) {
    const group = d3.select(this);
    const point = projection(city.coordinates);
    const onFront = d3.geoDistance(center, city.coordinates) < Math.PI / 2;
    const eligible = selectedCity === city || city.trip_count >= minimumTrips;
    const collision = occupied.some(other => Math.hypot(other[0] - point[0], other[1] - point[1]) < (worldScale >= 800 ? 28 : worldScale >= 420 ? 34 : 46));
    const show = onFront && eligible && (!collision || selectedCity === city);
    group.select('text').style('display', show ? null : 'none');
    if (show) occupied.push(point);
  });
}

function selectCity(city) {
  selectedCity = city;
  flightCitySelection.classed('selected', item => item === city);
  const years = yearRange(city.years);
  const modes = [...city.modes].map(mode => mode === 'flight' ? '航空' : '铁路').join(' / ');
  cityDetail.innerHTML = `<span>${city.city} · ${city.country_zh}</span><strong>${years || '年份待核'}</strong><small>${modes}</small>`;
  drawWorld();
}

function showWorldTooltip(event, title, years, modes = '') {
  const pane = document.querySelector('.globe-pane').getBoundingClientRect();
  worldTooltip.innerHTML = `<strong>${title}</strong><span>${years || '年份待核'}</span>${modes ? `<small>${modes}</small>` : ''}`;
  worldTooltip.style.left = `${Math.max(10, Math.min(pane.width - 190, event.clientX - pane.left + 14))}px`;
  worldTooltip.style.top = `${Math.max(10, Math.min(pane.height - 92, event.clientY - pane.top + 14))}px`;
  worldTooltip.classList.add('visible');
}

function hideWorldTooltip() {
  worldTooltip.classList.remove('visible');
}

function focusJourney(index) {
  const journey = journeys[index];
  spinning = false;
  updateSpinButton();
  journeyList.querySelectorAll('.journey-card').forEach((card, cardIndex) => card.classList.toggle('active', cardIndex === index));
  worldSvg.transition().duration(850).tween('rotate', () => {
    const interpolate = d3.interpolate(projection.rotate(), [-journey.coordinates[0], -journey.coordinates[1], 0]);
    return t => { projection.rotate(interpolate(t)); drawWorld(); };
  });
}

function updateSpinButton() {
  const button = document.querySelector('#world-spin');
  button.setAttribute('aria-pressed', String(spinning));
  button.textContent = spinning ? '自转 · 暂停' : '自转 · 开始';
}

function setWorldScale(nextScale) {
  worldScale = Math.max(120, Math.min(5000, nextScale));
  projection.scale(worldScale);
  worldSvg.node().__zoom = d3.zoomIdentity.scale(worldScale / 255);
  drawWorld();
}

function animateWorldView(targetRotation, targetScale) {
  const startRotation = projection.rotate();
  const startScale = worldScale;
  const rotationTween = d3.interpolate(startRotation, targetRotation);
  const scaleTween = d3.interpolateNumber(startScale, targetScale);
  worldSvg.interrupt().transition().duration(720).ease(d3.easeCubicInOut).tween('world-view', () => t => {
    worldScale = scaleTween(t);
    projection.rotate(rotationTween(t)).scale(worldScale);
    drawWorld();
  }).on('end', () => {
    worldSvg.node().__zoom = d3.zoomIdentity.scale(worldScale / 255);
    drawWorld();
  });
}

document.querySelector('#world-zoom-in').addEventListener('click', () => setWorldScale(worldScale * 1.32));
document.querySelector('#world-zoom-out').addEventListener('click', () => setWorldScale(worldScale / 1.32));
document.querySelector('#world-spin').addEventListener('click', () => { spinning = !spinning; updateSpinButton(); });
document.querySelector('#world-routes').addEventListener('click', event => {
  flightRoutesVisible = !flightRoutesVisible;
  event.currentTarget.setAttribute('aria-pressed', String(flightRoutesVisible));
  event.currentTarget.textContent = flightRoutesVisible ? '隐藏航线' : '显示航线';
  drawWorld();
});
document.querySelector('#world-rail-routes').addEventListener('click', event => {
  trainRoutesVisible = !trainRoutesVisible;
  event.currentTarget.setAttribute('aria-pressed', String(trainRoutesVisible));
  event.currentTarget.textContent = trainRoutesVisible ? '隐藏铁路' : '显示铁路';
  drawWorld();
});
globePane.addEventListener('mouseenter', () => { spinning = false; updateSpinButton(); });
globePane.addEventListener('mouseleave', () => { spinning = true; hideWorldTooltip(); updateSpinButton(); });
globePane.addEventListener('wheel', event => event.preventDefault(), { passive: false });
document.querySelector('#world-home').addEventListener('click', () => {
  spinning = false;
  updateSpinButton();
  journeyList.querySelectorAll('.journey-card').forEach(card => card.classList.remove('active'));
  projection.rotate(initialRotation); setWorldScale(255);
});
worldSvg.call(d3.drag()
  .on('start', () => { spinning = false; updateSpinButton(); })
  .on('drag', event => {
    const rotation = projection.rotate();
    projection.rotate([rotation[0] + event.dx * .28, Math.max(-75, Math.min(75, rotation[1] - event.dy * .28)), 0]);
    drawWorld();
  }));

worldSvg.call(d3.zoom()
  .filter(event => event.type === 'wheel' || (event.touches && event.touches.length > 1))
  .scaleExtent([120 / 255, 5000 / 255])
  .on('zoom', event => {
    worldScale = 255 * event.transform.k;
    projection.scale(worldScale);
    drawWorld();
  }));

updateSolarLayer();
setInterval(() => updateSolarLayer(), 60000);

Promise.all([
  fetch('data/world-countries-vvoliucano.geojson'),
  fetch('data/ying-land.json'),
  fetch('data/flight-history.json'),
  fetch('data/airport-cities.json'),
  fetch('data/train-history.json'),
  fetch('data/train-cities.json'),
  fetch('data/singapore-supplement.geojson')
])
  .then(async responses => {
    if (responses.some(response => !response.ok)) throw new Error('世界地图数据读取失败');
    return Promise.all(responses.map(response => response.json()));
  })
  .then(([countryData, referenceLand, flightHistory, airportCities, trainHistory, trainCities, singaporeData]) => {
    countryData.features.push(...singaporeData.features);
    countryData.features.forEach(feature => {
      if (d3.geoArea(feature) <= Math.PI * 2) return;
      if (feature.geometry?.type === 'Polygon') feature.geometry.coordinates = feature.geometry.coordinates.map(ring => [...ring].reverse());
      if (feature.geometry?.type === 'MultiPolygon') feature.geometry.coordinates = feature.geometry.coordinates.map(polygon => polygon.map(ring => [...ring].reverse()));
    });
    const cityMap = new Map();
    const routeMap = new Map();
    const addCity = (place, year, mode) => {
      if (!place) return;
      visitedCountries.add(place.country);
      const key = `${place.country}:${place.city}`;
      const city = cityMap.get(key) || { ...place, years: new Set(), modes: new Set(), trip_count: 0 };
      if (year) city.years.add(year);
      city.modes.add(mode);
      city.trip_count += 1;
      cityMap.set(key, city);
    };
    const addRoute = (from, to, mode) => {
      if (!from || !to || from.city === to.city || !from.coordinates || !to.coordinates) return;
      const ends = [`${from.country}:${from.city}`, `${to.country}:${to.city}`].sort();
      const key = ends.join('—');
      const route = routeMap.get(key) || { type: 'Feature', geometry: { type: 'LineString', coordinates: [from.coordinates, to.coordinates] }, properties: { from: from.city, to: to.city, modes: new Set(), count: 0 } };
      route.properties.modes.add(mode);
      route.properties.count += 1;
      routeMap.set(key, route);
    };
    flightHistory.records.forEach(record => record.legs.forEach(leg => {
      const departure = airportCities[leg.departure.airport];
      const arrival = airportCities[leg.arrival.airport];
      addRoute(departure, arrival, 'flight');
      [leg.departure.airport, leg.arrival.airport].forEach(airport => {
        const place = airportCities[airport];
        addCity(place, record.date?.slice(0, 4), 'flight');
      });
    }));
    trainHistory.records.filter(record => record.status === 'completed').forEach(record => record.legs.forEach(leg => {
      const departure = trainCities[leg.departure.city];
      const arrival = trainCities[leg.arrival.city];
      addRoute(departure && { ...departure, city: leg.departure.city }, arrival && { ...arrival, city: leg.arrival.city }, 'train');
      [leg.departure.city, leg.arrival.city].forEach(cityName => {
        const place = trainCities[cityName];
        if (place) addCity({ ...place, city: cityName }, record.date?.slice(0, 4), 'train');
      });
    }));
    const flightCities = [...cityMap.values()].sort((a, b) => b.trip_count - a.trip_count);
    allCities = flightCities;
    const routes = [...routeMap.values()];

    landSelection = landLayer.append('path').datum(referenceLand.land).attr('class', 'ying-land');
    borderSelection = borderLayer.append('path').datum(referenceLand.lines).attr('class', 'ying-lines');
    routeSelection = routeLayer.selectAll('path').data(routes).join('path')
      .attr('class', route => `world-route ${route.properties.modes.size > 1 ? 'mixed' : [...route.properties.modes][0]}`)
      .attr('aria-label', route => `${route.properties.from}至${route.properties.to}，${[...route.properties.modes].map(mode => mode === 'flight' ? '航线' : '铁路').join('与')}`);
    routeSelection.append('title').text(route => `${route.properties.from} ↔ ${route.properties.to}`);
    visitedSelection = visitedLayer.selectAll('path')
      .data(countryData.features.filter(feature => visitedCountries.has(feature.properties.name)))
      .join('path').attr('class', 'world-country visited');
    visitedSelection.append('title').text(feature => `${feature.properties.chinese_name || feature.properties.name} · 已经到访`);

    flightCitySelection = flightCityLayer.selectAll('g').data(flightCities).join('g').attr('class', 'flight-city')
      .attr('tabindex', 0).attr('role', 'button').attr('aria-label', city => `${city.city}，查看到访年份`)
      .on('pointermove', (event, city) => showWorldTooltip(event, `${city.city} · ${city.country_zh}`, yearRange(city.years), [...city.modes].map(mode => mode === 'flight' ? '航空' : '铁路').join(' / ')))
      .on('pointerleave', hideWorldTooltip)
      .on('pointerdown', (event, city) => { event.stopPropagation(); spinning = false; updateSpinButton(); selectCity(city); })
      .on('click', (event, city) => { event.stopPropagation(); selectCity(city); })
      .on('keydown', (event, city) => { if (event.key === 'Enter' || event.key === ' ') selectCity(city); });
    flightCitySelection.append('circle').attr('r', city => Math.min(6.5, 2.6 + Math.sqrt(city.trip_count) * .32));
    flightCitySelection.append('text').attr('x', 8).attr('y', -7).text(city => city.city);
    flightCitySelection.append('title').text(city => `${city.city} · ${city.country_zh}`);

    pointSelection = pointLayer.selectAll('g').data(journeys).join('g')
      .attr('class', journey => `world-point ${journey.kind}`)
      .attr('tabindex', 0)
      .attr('role', 'img')
      .attr('aria-label', journey => `${journey.year}，${journey.city}，${journey.country}`);
    pointSelection.append('circle').attr('class', 'point-ring').attr('r', journey => journey.markerRadius);
    pointSelection.append('circle').attr('class', 'point-core').attr('r', journey => Math.max(2.5, journey.markerRadius * .42));
    pointSelection.append('text').attr('x', journey => journey.label?.[0] ?? 10).attr('y', journey => journey.label?.[1] ?? 4).text(journey => journey.city);
    drawWorld();
    worldStatus.classList.add('hidden');

    d3.timer(now => {
      const delta = now - lastFrame;
      lastFrame = now;
      if (spinning) {
        const rotation = projection.rotate();
        projection.rotate([rotation[0] + delta * .003, rotation[1], 0]);
        drawWorld();
      }
    });
  })
  .catch(() => { worldStatus.textContent = '世界地图暂时未能展开，请刷新重试。'; });

drawWorld();
