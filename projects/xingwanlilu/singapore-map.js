(() => {
  const svg = d3.select('#singapore-map');
  const status = document.querySelector('#singapore-status');
  const tooltip = document.querySelector('#singapore-tooltip');
  const current = document.querySelector('#singapore-current');
  const currentNote = document.querySelector('#singapore-current-note');
  const width = 900;
  const height = 560;
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const text = (zh, en) => isEnglish ? en : zh;

  const areaName = feature => feature.properties.planning_area;
  const districtName = feature => feature.properties.district;

  function showArea(event, feature, explored) {
    const bounds = document.querySelector('.singapore-map-wrap').getBoundingClientRect();
    const state = explored ? text('已行', 'Visited') : text('未至', 'Not visited');
    current.textContent = areaName(feature);
    currentNote.textContent = `${districtName(feature)} · ${state}`;
    tooltip.innerHTML = `<strong>${areaName(feature)}</strong><span>${districtName(feature)} · ${state}</span>`;
    tooltip.style.left = `${Math.min(bounds.width - 170, Math.max(12, event.clientX - bounds.left + 14))}px`;
    tooltip.style.top = `${Math.min(bounds.height - 70, Math.max(12, event.clientY - bounds.top + 14))}px`;
    tooltip.classList.add('visible');
  }

  Promise.all([
    fetch('../singapore-map/district_and_planning_area.geojson'),
    fetch('../singapore-map/counts/liucan-singapore-explore-counts.json')
  ]).then(async responses => {
    if (responses.some(response => !response.ok)) throw new Error(text('南洋地图数据读取失败', 'Singapore map data could not be loaded'));
    return Promise.all(responses.map(response => response.json()));
  }).then(([geojson, countData]) => {
    const counts = countData.counts || {};
    document.querySelector('#singapore-area-count').textContent = String(Object.values(counts).filter(count => count > 0).length);
    const projection = d3.geoMercator().fitExtent([[48, 48], [width - 48, height - 48]], geojson);
    const path = d3.geoPath(projection);
    const mapLayer = svg.append('g').attr('class', 'singapore-areas');

    mapLayer.selectAll('path').data(geojson.features).join('path')
      .attr('d', path)
      .attr('class', feature => counts[areaName(feature)] > 0 ? 'singapore-area explored' : 'singapore-area')
      .attr('tabindex', 0)
      .attr('role', 'img')
      .attr('aria-label', feature => `${areaName(feature)}, ${districtName(feature)}, ${counts[areaName(feature)] > 0 ? text('已行', 'visited') : text('未至', 'not visited')}`)
      .on('pointermove', (event, feature) => showArea(event, feature, counts[areaName(feature)] > 0))
      .on('pointerleave', () => tooltip.classList.remove('visible'))
      .on('focus', (event, feature) => {
        current.textContent = areaName(feature);
        currentNote.textContent = `${districtName(feature)} · ${counts[areaName(feature)] > 0 ? text('已行', 'Visited') : text('未至', 'Not visited')}`;
      });

    const labelFeatures = geojson.features.filter(feature => counts[areaName(feature)] > 0)
      .sort((a, b) => counts[areaName(b)] - counts[areaName(a)]).slice(0, 14);
    svg.append('g').attr('class', 'singapore-labels').selectAll('text').data(labelFeatures).join('text')
      .attr('x', feature => path.centroid(feature)[0])
      .attr('y', feature => path.centroid(feature)[1])
      .text(areaName);

    status.classList.add('hidden');
  }).catch(error => {
    console.error(error);
    status.textContent = text('南洋图志暂时未能展开。', 'The Singapore map could not be opened.');
  });
})();
