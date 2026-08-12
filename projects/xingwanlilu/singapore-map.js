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
  const areaNamesZh = new Map(Object.entries({
    'Ang Mo Kio':'宏茂桥','Bedok':'勿洛','Bishan':'碧山','Boon Lay':'文礼','Bukit Batok':'武吉巴督','Bukit Merah':'红山','Bukit Panjang':'武吉班让','Bukit Timah':'武吉知马','Central Water Catchment':'中央集水区','Changi':'樟宜','Changi Bay':'樟宜湾','Choa Chu Kang':'蔡厝港','Clementi':'金文泰','Downtown Core':'市中心','Geylang':'芽笼','Hougang':'后港','Jurong East':'裕廊东','Jurong West':'裕廊西','Kallang':'加冷','Lim Chu Kang':'林厝港','Mandai':'万礼','Marina East':'滨海东','Marina South':'滨海南','Marine Parade':'马林百列','Museum':'博物馆','Newton':'纽顿','North-Eastern Islands':'东北岛屿','Novena':'诺维娜','Orchard':'乌节','Outram':'欧南','Pasir Ris':'巴西立','Paya Lebar':'巴耶利峇','Pioneer':'先驱','Punggol':'榜鹅','Queenstown':'女皇镇','River Valley':'里峇峇利','Rochor':'梧槽','Seletar':'实里达','Sembawang':'三巴旺','Sengkang':'盛港','Serangoon':'实龙岗','Simpang':'新邦','Singapore River':'新加坡河','Southern Islands':'南部岛屿','Straits View':'海峡景','Sungei Kadut':'双溪加株','Tampines':'淡滨尼','Tanglin':'东陵','Tengah':'登加','Toa Payoh':'大巴窑','Tuas':'大士','Western Islands':'西部岛屿','Western Water Catchment':'西部集水区','Woodlands':'兀兰','Yishun':'义顺'
  }));
  const districtNamesZh = new Map([['Central','中央区'],['East','东区'],['North','北区'],['North-East','东北区'],['West','西区']]);

  const areaKey = feature => feature.properties.planning_area;
  const areaNameZh = feature => areaNamesZh.get(areaKey(feature)) || areaKey(feature);
  const areaName = feature => `${areaNameZh(feature)} / ${areaKey(feature)}`;
  const districtName = feature => `${districtNamesZh.get(feature.properties.district) || feature.properties.district} / ${feature.properties.district}`;

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
    document.querySelector('#singapore-area-count').innerHTML = `${Object.values(counts).filter(count => count > 0).length}<small class="metric-total">/55</small>`;
    const projection = d3.geoMercator().fitExtent([[48, 48], [width - 48, height - 48]], geojson);
    const path = d3.geoPath(projection);
    const mapLayer = svg.append('g').attr('class', 'singapore-areas');

    mapLayer.selectAll('path').data(geojson.features).join('path')
      .attr('d', path)
      .attr('class', feature => counts[areaKey(feature)] > 0 ? 'singapore-area explored' : 'singapore-area')
      .attr('tabindex', 0)
      .attr('role', 'img')
      .attr('aria-label', feature => `${areaName(feature)}, ${districtName(feature)}, ${counts[areaKey(feature)] > 0 ? text('已行', 'visited') : text('未至', 'not visited')}`)
      .on('pointermove', (event, feature) => showArea(event, feature, counts[areaKey(feature)] > 0))
      .on('pointerleave', () => tooltip.classList.remove('visible'))
      .on('focus', (event, feature) => {
        current.textContent = areaName(feature);
        currentNote.textContent = `${districtName(feature)} · ${counts[areaKey(feature)] > 0 ? text('已行', 'Visited') : text('未至', 'Not visited')}`;
      });

    const labelFeatures = geojson.features.filter(feature => counts[areaKey(feature)] > 0)
      .sort((a, b) => counts[areaKey(b)] - counts[areaKey(a)]).slice(0, 14);
    const mapLabels = svg.append('g').attr('class', 'singapore-labels').selectAll('text').data(labelFeatures).join('text')
      .attr('x', feature => path.centroid(feature)[0])
      .attr('y', feature => path.centroid(feature)[1]);
    mapLabels.append('tspan').attr('x', feature => path.centroid(feature)[0]).attr('dy', '-.25em').text(areaNameZh);
    mapLabels.append('tspan').attr('x', feature => path.centroid(feature)[0]).attr('dy', '1.15em').attr('class', 'singapore-label-en').text(areaKey);

    status.classList.add('hidden');
  }).catch(error => {
    console.error(error);
    status.textContent = text('南洋图志暂时未能展开。', 'The Singapore map could not be opened.');
  });
})();
