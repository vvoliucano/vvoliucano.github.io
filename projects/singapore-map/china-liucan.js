(() => {
  "use strict";

  const TOPO_URL = "./china.topo.json";
  const COUNTS_URL = "./counts/liucan-china-explore-counts.json";
  const LABEL_STORAGE_KEY = "china-liucan-labels-v1";
  const DECORATION_NAMES = new Set(["中国南海十段线", "南海诸岛及缩略图"]);

  const state = {
    features: [],
    counts: {},
    excludedAreas: [],
    hoveredArea: null,
    showLabels: false,
  };

  const container = document.querySelector("#china-preset-map-container");
  const tooltip = document.querySelector("#china-preset-tooltip");
  const totalExploredEl = document.querySelector("#china-total-explored");
  const totalUnvisitedEl = document.querySelector("#china-total-unvisited");
  const currentAreaEl = document.querySelector("#china-preset-current-area");
  const currentStateEl = document.querySelector("#china-preset-current-state");
  const currentNoteEl = document.querySelector("#china-preset-current-note");
  const visitedListEl = document.querySelector("#china-preset-visited-list");
  const excludedListEl = document.querySelector("#china-preset-excluded-list");
  const legendRamp = document.querySelector("#china-preset-legend-ramp");
  const toggleLabelsButton = document.querySelector("#china-preset-toggle-labels");

  let svg;
  let pathsGroup;
  let labelGroup;
  let resizeFrame = null;

  function provinceName(feature) {
    return feature.properties.fullname || feature.properties.name;
  }

  function getCount(name) {
    return state.counts[name] || 0;
  }

  function persistState() {
    try {
      localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify({ showLabels: state.showLabels }));
    } catch (error) {
      console.warn("保存中国探索页标签状态失败", error);
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(LABEL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.showLabels === "boolean") {
        state.showLabels = parsed.showLabels;
      }
    } catch (error) {
      console.warn("读取中国探索页标签状态失败", error);
    }
  }

  function isDecorativeFeature(feature) {
    return DECORATION_NAMES.has(provinceName(feature));
  }

  function fillForFeature(feature) {
    return getCount(provinceName(feature)) > 0 ? "#8ce9d7" : "#112132";
  }

  function renderLegend() {
    legendRamp.style.background = "linear-gradient(90deg, #112132 0%, #305060 40%, #8ce9d7 100%)";
    toggleLabelsButton.textContent = state.showLabels ? "隐藏名称" : "显示名称";
  }

  function renderInfo() {
    const visitedNames = state.features
      .map(provinceName)
      .filter((name) => getCount(name) > 0)
      .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
    const unvisitedNames = state.features
      .map(provinceName)
      .filter((name) => getCount(name) === 0)
      .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

    totalExploredEl.textContent = String(visitedNames.length);
    totalUnvisitedEl.textContent = String(unvisitedNames.length);

    const feature = state.hoveredArea
      ? state.features.find((item) => provinceName(item) === state.hoveredArea)
      : null;

    if (!feature) {
      currentAreaEl.textContent = "移动鼠标查看";
      currentStateEl.textContent = "显示探索状态";
      currentNoteEl.textContent = "亮色表示已探索，暗色表示当前还没有记录为已探索。";
    } else {
      const name = provinceName(feature);
      const visited = getCount(name) > 0;
      currentAreaEl.textContent = name;
      currentStateEl.textContent = visited ? "已探索" : "未探索";
      currentNoteEl.textContent = visited
        ? `${name} 当前已被标记为去过。`
        : `${name} 当前在排除名单中，尚未标记为已探索。`;
    }

    visitedListEl.innerHTML = visitedNames.map((name) => `<li><span>${name}</span><strong>已探索</strong></li>`).join("");
    excludedListEl.innerHTML = unvisitedNames.map((name) => `<li><span>${name}</span><strong>未探索</strong></li>`).join("");
  }

  function renderLabels(path) {
    labelGroup.selectAll("*").remove();
    if (!state.showLabels) return;

    state.features
      .forEach((feature) => {
        const centroid = path.centroid(feature);
        if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) return;

        labelGroup.append("text")
          .attr("class", "selection-label")
          .attr("x", centroid[0])
          .attr("y", centroid[1])
          .text(feature.properties.name || provinceName(feature));
      });
  }

  function showTooltip(event, feature) {
    const name = provinceName(feature);
    const visited = getCount(name) > 0;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.innerHTML = `<strong>${name}</strong><br>${visited ? "已探索" : "未探索"}`;
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

  function syncMapState(path) {
    if (!pathsGroup) return;

    pathsGroup.selectAll("path")
      .attr("fill", (feature) => fillForFeature(feature))
      .classed("is-hovered", (feature) => provinceName(feature) === state.hoveredArea)
      .classed("is-selected", false)
      .classed("is-muted", false);

    renderLegend();
    renderLabels(path);
    renderInfo();
  }

  function renderMap() {
    if (!state.features.length) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    const featureCollection = { type: "FeatureCollection", features: state.features };
    const projection = d3.geoMercator().fitExtent([[28, 28], [width - 28, height - 28]], featureCollection);
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
        state.hoveredArea = provinceName(feature);
        showTooltip(event, feature);
        syncMapState(path);
      })
      .on("mousemove", (event, feature) => {
        showTooltip(event, feature);
      })
      .on("mouseleave", () => {
        state.hoveredArea = null;
        hideTooltip();
        syncMapState(path);
      });

    syncMapState(path);
  }

  function scheduleRender() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      renderMap();
      resizeFrame = null;
    });
  }

  function toggleLabels() {
    state.showLabels = !state.showLabels;
    persistState();
    renderMap();
  }

  function showError(message) {
    container.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;color:#d9e7eb;text-align:center;">${message}</div>`;
    currentAreaEl.textContent = "加载失败";
    currentStateEl.textContent = "请检查数据文件";
    currentNoteEl.textContent = message;
  }

  async function loadData() {
    const [topoResponse, countsResponse] = await Promise.all([
      fetch(TOPO_URL),
      fetch(COUNTS_URL),
    ]);

    if (!topoResponse.ok) throw new Error(`加载中国 topojson 失败：${topoResponse.status}`);
    if (!countsResponse.ok) throw new Error(`加载 counts JSON 失败：${countsResponse.status}`);

    const topology = await topoResponse.json();
    const countsJson = await countsResponse.json();
    const featureCollection = topojson.feature(topology, topology.objects.default);

    state.features = featureCollection.features.filter((feature) => !isDecorativeFeature(feature));
    state.counts = countsJson.counts || {};
    state.excludedAreas = countsJson.excluded_areas || [];

    restoreState();
    renderLegend();
    renderInfo();
    renderMap();
  }

  toggleLabelsButton.addEventListener("click", toggleLabels);
  window.addEventListener("resize", scheduleRender);

  loadData().catch((error) => {
    console.error(error);
    showError("中国探索地图未能成功加载。请通过本地服务器访问页面，并确认 topojson 与 counts 文件存在。");
  });
})();
