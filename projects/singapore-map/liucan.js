(() => {
  "use strict";

  const GEO_URL = "./district_and_planning_area.geojson";
  const COUNTS_URL = "./counts/liucan-singapore-explore-counts.json";
  const VIEW_STORAGE_KEY = "singapore-liucan-view-v1";
  const districtOrder = ["Central", "East", "North", "North-East", "West"];
  const districtColors = {
    Central: "#d7bc77",
    East: "#57c4b0",
    North: "#88b9ff",
    "North-East": "#cf96ff",
    West: "#ff9c8a",
  };

  const state = {
    features: [],
    districts: [],
    counts: {},
    hoveredArea: null,
    maxCount: 0,
    totalVisits: 0,
    exploredAreas: 0,
    showLabels: true,
    useMonochrome: false,
  };

  const container = document.querySelector("#map-container");
  const tooltip = document.querySelector("#map-tooltip");
  const totalVisitsEl = document.querySelector("#total-visits");
  const exploredAreasEl = document.querySelector("#explored-areas");
  const currentArea = document.querySelector("#current-area");
  const currentDistrict = document.querySelector("#current-district");
  const currentNote = document.querySelector("#current-note");
  const topAreas = document.querySelector("#top-areas");
  const districtSummary = document.querySelector("#district-summary");
  const legendRamp = document.querySelector("#legend-ramp");
  const legendMin = document.querySelector("#legend-min");
  const legendMid = document.querySelector("#legend-mid");
  const legendMax = document.querySelector("#legend-max");
  const toggleLabelsButton = document.querySelector("#toggle-labels");
  const toggleColorModeButton = document.querySelector("#toggle-color-mode");

  let svg;
  let pathsGroup;
  let labelGroup;
  let resizeFrame = null;

  const areaKey = (feature) => feature.properties.planning_area;
  const districtKey = (feature) => feature.properties.district;
  const featureCollection = () => ({ type: "FeatureCollection", features: state.features });
  const getCount = (name) => state.counts[name] || 0;

  function getSortedVisitedEntries() {
    return Object.entries(state.counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  function getDistrictFeatures(district) {
    return state.features.filter((feature) => districtKey(feature) === district);
  }

  function getDistrictStats(district) {
    const features = getDistrictFeatures(district);
    const visits = features.reduce((sum, feature) => sum + getCount(areaKey(feature)), 0);
    const explored = features.filter((feature) => getCount(areaKey(feature)) > 0).length;
    return { visits, explored };
  }

  function persistViewState() {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify({
        showLabels: state.showLabels,
        useMonochrome: state.useMonochrome,
      }));
    } catch (error) {
      console.warn("保存新加坡探索页视图设置失败", error);
    }
  }

  function restoreViewState() {
    try {
      const raw = localStorage.getItem(VIEW_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.showLabels === "boolean") state.showLabels = parsed.showLabels;
      if (typeof parsed.useMonochrome === "boolean") state.useMonochrome = parsed.useMonochrome;
    } catch (error) {
      console.warn("读取新加坡探索页视图设置失败", error);
    }
  }

  function fillForFeature(feature) {
    const count = getCount(areaKey(feature));
    if (count <= 0) {
      return "#112132";
    }
    const ratio = Math.max(0, Math.min(1, count / Math.max(1, state.maxCount)));
    if (state.useMonochrome) {
      return d3.interpolateRgb("#213344", "#a7f0df")(0.2 + ratio * 0.8);
    }
    const start = "#203447";
    const end = districtColors[districtKey(feature)] || "#8aa3ad";
    return d3.interpolateRgb(start, end)(0.32 + ratio * 0.68);
  }

  function renderLegend() {
    const base = state.useMonochrome
      ? "linear-gradient(90deg, #112132 0%, #213344 18%, #335367 42%, #4f7b86 64%, #77baa9 82%, #a7f0df 100%)"
      : "linear-gradient(90deg, #112132 0%, #39546b 18%, #5f9fd5 40%, #57c4b0 62%, #d7bc77 82%, #ffead0 100%)";
    legendRamp.style.background = base;
    legendMin.textContent = "0";
    legendMid.textContent = String(Math.round(state.maxCount / 2));
    legendMax.textContent = String(state.maxCount);
    toggleLabelsButton.textContent = state.showLabels ? "隐藏次数" : "显示次数";
    toggleColorModeButton.textContent = state.useMonochrome ? "恢复分区色" : "单色强度";
  }

  function renderInfo() {
    totalVisitsEl.textContent = String(state.totalVisits);
    exploredAreasEl.textContent = String(state.exploredAreas);

    const feature = state.hoveredArea
      ? state.features.find((item) => areaKey(item) === state.hoveredArea)
      : null;

    if (!feature) {
      currentArea.textContent = "移动鼠标查看";
      currentDistrict.textContent = "显示 district 与累计次数";
      currentNote.textContent = state.useMonochrome
        ? "当前使用单色强度模式，只看去过与频率，不再按 district 分色。"
        : "颜色只表示 visit_count，不表示地理面积。未探索区域的计数为 0。";
    } else {
      const count = getCount(areaKey(feature));
      currentArea.textContent = areaKey(feature);
      currentDistrict.textContent = `${districtKey(feature)} · ${count} 次`;
      currentNote.textContent = count > 0
        ? `这个区域已经累计踏足 ${count} 次。`
        : "这个区域当前还没有被记录为已探索。";
    }

    const top = getSortedVisitedEntries().slice(0, 10);
    topAreas.innerHTML = top.map(([name, count]) => `<li><span>${name}</span><strong>${count}</strong></li>`).join("");

    districtSummary.innerHTML = state.districts.map((district) => {
      const stats = getDistrictStats(district);
      return `
        <div class="district-row">
          <i class="legend-swatch" style="background:${districtColors[district] || "#8aa3ad"}"></i>
          <strong>${district}</strong>
          <span>${stats.explored} 区域 / ${stats.visits} 次</span>
        </div>
      `;
    }).join("");
  }

  function renderLabels() {
    labelGroup.selectAll("*").remove();
    if (!state.showLabels) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    const projection = d3.geoMercator().fitExtent([[28, 28], [width - 28, height - 28]], featureCollection());
    const path = d3.geoPath(projection);

    state.features
      .filter((feature) => getCount(areaKey(feature)) >= Math.max(3, state.maxCount * 0.55))
      .forEach((feature) => {
        const centroid = path.centroid(feature);
        if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) return;

        labelGroup.append("text")
          .attr("class", "selection-label")
          .attr("x", centroid[0])
          .attr("y", centroid[1])
          .text(String(getCount(areaKey(feature))));
      });
  }

  function showTooltip(event, feature) {
    const count = getCount(areaKey(feature));
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.innerHTML = `<strong>${areaKey(feature)}</strong><br>${districtKey(feature)}<br>visit_count: ${count}`;
    moveTooltip(event);
  }

  function moveTooltip(event) {
    const bounds = container.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - bounds.left}px`;
    tooltip.style.top = `${event.clientY - bounds.top}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function syncMapState() {
    if (!pathsGroup) return;

    pathsGroup.selectAll("path")
      .attr("fill", (feature) => fillForFeature(feature))
      .classed("is-hovered", (feature) => areaKey(feature) === state.hoveredArea)
      .classed("is-selected", false)
      .classed("is-muted", false);

    renderLabels();
    renderInfo();
  }

  function toggleLabels() {
    state.showLabels = !state.showLabels;
    persistViewState();
    syncMapState();
  }

  function toggleColorMode() {
    state.useMonochrome = !state.useMonochrome;
    persistViewState();
    syncMapState();
  }

  function renderMap() {
    if (!state.features.length) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    const projection = d3.geoMercator().fitExtent([[28, 28], [width - 28, height - 28]], featureCollection());
    const path = d3.geoPath(projection);

    container.innerHTML = "";
    svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");

    pathsGroup = svg.append("g");
    labelGroup = svg.append("g");

    pathsGroup.selectAll("path")
      .data(state.features)
      .join("path")
      .attr("class", "planning-area")
      .attr("d", path)
      .attr("fill", (feature) => fillForFeature(feature))
      .attr("fill-opacity", 1)
      .attr("stroke", "rgba(8, 20, 33, 0.94)")
      .attr("stroke-width", 1.1)
      .on("mouseenter", (event, feature) => {
        state.hoveredArea = areaKey(feature);
        showTooltip(event, feature);
        syncMapState();
      })
      .on("mousemove", (event, feature) => {
        showTooltip(event, feature);
      })
      .on("mouseleave", () => {
        state.hoveredArea = null;
        hideTooltip();
        syncMapState();
      });

    syncMapState();
  }

  function scheduleRender() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      renderMap();
      resizeFrame = null;
    });
  }

  function showError(message) {
    container.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;color:#d9e7eb;text-align:center;">${message}</div>`;
    currentArea.textContent = "加载失败";
    currentDistrict.textContent = "请检查数据文件";
    currentNote.textContent = message;
  }

  async function loadData() {
    const [geoResponse, countResponse] = await Promise.all([
      fetch(GEO_URL),
      fetch(COUNTS_URL),
    ]);

    if (!geoResponse.ok) throw new Error(`加载 GeoJSON 失败：${geoResponse.status}`);
    if (!countResponse.ok) throw new Error(`加载 counts JSON 失败：${countResponse.status}`);

    const geojson = await geoResponse.json();
    const countsJson = await countResponse.json();

    state.features = geojson.features.slice().sort((a, b) => areaKey(a).localeCompare(areaKey(b)));
    state.districts = [...new Set(state.features.map(districtKey))]
      .sort((a, b) => districtOrder.indexOf(a) - districtOrder.indexOf(b));
    state.counts = countsJson.counts || {};
    state.maxCount = Math.max(0, ...Object.values(state.counts));
    state.totalVisits = countsJson.total_visits || 0;
    state.exploredAreas = countsJson.explored_areas || 0;

    restoreViewState();
    renderLegend();
    renderInfo();
    renderMap();
  }

  window.addEventListener("resize", scheduleRender);
  toggleLabelsButton.addEventListener("click", toggleLabels);
  toggleColorModeButton.addEventListener("click", toggleColorMode);

  loadData().catch((error) => {
    console.error(error);
    showError("地图或统计数据未能成功加载。请通过本地服务器访问页面，并确认 counts JSON 文件存在。");
  });
})();
