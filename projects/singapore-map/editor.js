(() => {
  "use strict";

  const DATA_URL = "./district_and_planning_area.geojson";
  const STORAGE_KEY = "singapore-map-editor-counts-v1";
  const EXPORT_TYPE = "singapore-explore-counts";
  const colors = {
    Central: "#d7bc77",
    East: "#57c4b0",
    North: "#88b9ff",
    "North-East": "#cf96ff",
    West: "#ff9c8a",
  };
  const districtOrder = ["Central", "East", "North", "North-East", "West"];

  const state = {
    features: [],
    districts: [],
    counts: {},
    currentArea: null,
    hoveredArea: null,
  };

  const container = document.querySelector("#map-container");
  const tooltip = document.querySelector("#map-tooltip");
  const legend = document.querySelector("#legend");
  const currentArea = document.querySelector("#current-area");
  const currentDistrict = document.querySelector("#current-district");
  const currentNote = document.querySelector("#current-note");
  const featureCount = document.querySelector("#feature-count");
  const exploredCount = document.querySelector("#explored-count");
  const totalVisits = document.querySelector("#total-visits");
  const visitedAreas = document.querySelector("#visited-areas");
  const topCount = document.querySelector("#top-count");
  const districtSummary = document.querySelector("#district-summary");
  const visitedList = document.querySelector("#visited-list");
  const jsonOutput = document.querySelector("#json-output");
  const exportStatus = document.querySelector("#export-status");
  const currentMinus = document.querySelector("#current-minus");
  const clearCurrent = document.querySelector("#clear-current");
  const copyJson = document.querySelector("#copy-json");
  const downloadJson = document.querySelector("#download-json");
  const clearAll = document.querySelector("#clear-all");

  let svg;
  let pathsGroup;
  let badgesGroup;
  let resizeFrame = null;

  const areaKey = (feature) => feature.properties.planning_area;
  const districtKey = (feature) => feature.properties.district;
  const featureCollection = () => ({ type: "FeatureCollection", features: state.features });

  function getCount(name) {
    return state.counts[name] || 0;
  }

  function getCurrentFeature() {
    const activeArea = state.currentArea || state.hoveredArea;
    return state.features.find((feature) => areaKey(feature) === activeArea) || null;
  }

  function getVisitedEntries() {
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

  function totalVisitCount() {
    return getVisitedEntries().reduce((sum, [, count]) => sum + count, 0);
  }

  function maxVisitCount() {
    return Math.max(0, ...Object.values(state.counts));
  }

  function buildExportPayload() {
    const counts = Object.fromEntries(
      getVisitedEntries()
        .slice()
        .sort((a, b) => a[0].localeCompare(b[0]))
    );

    return {
      type: EXPORT_TYPE,
      version: 1,
      metric: "visit_count",
      generated_at: new Date().toISOString(),
      total_visits: totalVisitCount(),
      explored_areas: getVisitedEntries().length,
      counts,
    };
  }

  function saveCounts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.counts));
    } catch (error) {
      console.error(error);
    }
  }

  function loadCounts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
      state.counts = Object.fromEntries(
        Object.entries(parsed).filter(([, count]) => Number.isFinite(count) && count > 0)
      );
    } catch (error) {
      console.error(error);
      state.counts = {};
    }
  }

  function setStatus(message) {
    exportStatus.textContent = message;
  }

  function fillForFeature(feature) {
    const count = getCount(areaKey(feature));
    const maxCount = Math.max(1, maxVisitCount());
    const t = count === 0 ? 0.14 : 0.28 + (count / maxCount) * 0.72;
    return d3.interpolateRgb("#10202f", colors[districtKey(feature)] || "#8aa3ad")(Math.min(t, 1));
  }

  function renderLegend() {
    legend.innerHTML = state.districts.map((district) => `
      <span class="legend-item">
        <i class="legend-swatch" style="background:${colors[district] || "#8aa3ad"}"></i>
        <span>${district}</span>
      </span>
    `).join("");
  }

  function renderInfo() {
    const currentFeature = getCurrentFeature();
    const topEntry = getVisitedEntries()[0];
    const visitedEntryCount = getVisitedEntries().length;
    const currentCount = currentFeature ? getCount(areaKey(currentFeature)) : 0;

    exploredCount.textContent = String(visitedEntryCount);
    totalVisits.textContent = String(totalVisitCount());
    visitedAreas.textContent = String(visitedEntryCount);
    topCount.textContent = String(topEntry ? topEntry[1] : 0);

    if (!currentFeature) {
      currentArea.textContent = "未选择";
      currentDistrict.textContent = "点击地图中的任一区域";
      currentNote.textContent = "每点击一次，该区域累计值加一。当前区域可单独减一或清零。";
      currentMinus.disabled = true;
      clearCurrent.disabled = true;
    } else {
      currentArea.textContent = areaKey(currentFeature);
      currentDistrict.textContent = `${districtKey(currentFeature)} · 当前累计 ${currentCount}`;
      currentNote.textContent = `继续点击 ${areaKey(currentFeature)} 会持续累加。这个值会被写入导出的 JSON。`;
      currentMinus.disabled = currentCount <= 0;
      clearCurrent.disabled = currentCount <= 0;
    }

    districtSummary.innerHTML = state.districts.map((district) => {
      const stats = getDistrictStats(district);
      const currentClass = currentFeature && districtKey(currentFeature) === district ? "district-row is-active" : "district-row";
      return `
        <div class="${currentClass}">
          <i class="legend-swatch" style="background:${colors[district] || "#8aa3ad"}"></i>
          <strong>${district}</strong>
          <span>${stats.explored} 区域 / ${stats.visits} 次</span>
        </div>
      `;
    }).join("");

    const visitedEntries = getVisitedEntries();
    if (!visitedEntries.length) {
      visitedList.innerHTML = '<li class="is-empty">还没有记录任何区域。点击地图开始累计。</li>';
    } else {
      visitedList.innerHTML = visitedEntries.map(([name, count]) => {
        const isCurrent = currentFeature && areaKey(currentFeature) === name;
        return `<li class="${isCurrent ? "is-focus" : ""}"><span>${name}</span><strong>${count}</strong></li>`;
      }).join("");
    }

    jsonOutput.value = JSON.stringify(buildExportPayload(), null, 2);
  }

  function showTooltip(event, feature) {
    const count = getCount(areaKey(feature));
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.innerHTML = `<strong>${areaKey(feature)}</strong><br>${districtKey(feature)}<br>当前累计：${count}`;
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

  function renderBadges() {
    badgesGroup.selectAll("*").remove();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    const projection = d3.geoMercator().fitExtent([[28, 28], [width - 28, height - 28]], featureCollection());
    const path = d3.geoPath(projection);

    state.features
      .filter((feature) => getCount(areaKey(feature)) > 0)
      .forEach((feature) => {
        const centroid = path.centroid(feature);
        if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) return;

        const group = badgesGroup.append("g").attr("class", "visit-badge");
        group.append("circle")
          .attr("class", "visit-badge-circle")
          .attr("cx", centroid[0])
          .attr("cy", centroid[1])
          .attr("r", 11);

        group.append("text")
          .attr("class", "visit-badge-text")
          .attr("x", centroid[0])
          .attr("y", centroid[1] + 4)
          .text(String(getCount(areaKey(feature))));
      });
  }

  function syncMapState() {
    if (!pathsGroup) return;

    pathsGroup.selectAll("path")
      .attr("fill", (feature) => fillForFeature(feature))
      .classed("is-selected", (feature) => areaKey(feature) === state.currentArea)
      .classed("is-hovered", (feature) => areaKey(feature) === state.hoveredArea)
      .classed("is-muted", false);

    renderBadges();
    renderInfo();
  }

  function changeCount(name, delta) {
    const next = Math.max(0, getCount(name) + delta);
    if (next === 0) {
      delete state.counts[name];
    } else {
      state.counts[name] = next;
    }
    saveCounts();
    syncMapState();
  }

  function clearCurrentArea() {
    if (!state.currentArea) return;
    delete state.counts[state.currentArea];
    saveCounts();
    syncMapState();
  }

  function clearAllCounts() {
    state.counts = {};
    saveCounts();
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
    badgesGroup = svg.append("g");

    pathsGroup.selectAll("path")
      .data(state.features)
      .join("path")
      .attr("class", "planning-area")
      .attr("d", path)
      .attr("fill", (feature) => fillForFeature(feature))
      .attr("fill-opacity", 1)
      .attr("stroke", "rgba(8, 20, 33, 0.92)")
      .attr("stroke-width", 1.15)
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
      })
      .on("click", (event, feature) => {
        const name = areaKey(feature);
        state.currentArea = name;
        changeCount(name, 1);
        showTooltip(event, feature);
        setStatus(`已为 ${name} 累计一次。`);
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

  async function copyExportJson() {
    try {
      await navigator.clipboard.writeText(jsonOutput.value);
      setStatus("JSON 已复制到剪贴板。");
    } catch (error) {
      console.error(error);
      setStatus("复制失败，请直接从文本框中手动复制。");
    }
  }

  function downloadExportJson() {
    const blob = new Blob([jsonOutput.value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "singapore-explore-counts.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("JSON 文件已开始下载。");
  }

  function bindEvents() {
    currentMinus.addEventListener("click", () => {
      if (!state.currentArea) return;
      changeCount(state.currentArea, -1);
      setStatus(`已将 ${state.currentArea} 的累计次数减一。`);
    });

    clearCurrent.addEventListener("click", () => {
      if (!state.currentArea) return;
      clearCurrentArea();
      setStatus(`已清零 ${state.currentArea} 的累计次数。`);
    });

    copyJson.addEventListener("click", copyExportJson);
    downloadJson.addEventListener("click", downloadExportJson);
    clearAll.addEventListener("click", () => {
      clearAllCounts();
      setStatus("全部统计已清空。");
    });

    window.addEventListener("resize", scheduleRender);
  }

  function showError(message) {
    container.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;color:#d9e7eb;text-align:center;">${message}</div>`;
    currentArea.textContent = "加载失败";
    currentDistrict.textContent = "请检查 GeoJSON 文件";
    currentNote.textContent = message;
  }

  async function loadData() {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`加载地图数据失败：${response.status}`);
    const geojson = await response.json();
    state.features = geojson.features.slice().sort((a, b) => areaKey(a).localeCompare(areaKey(b)));
    state.districts = [...new Set(state.features.map(districtKey))]
      .sort((a, b) => districtOrder.indexOf(a) - districtOrder.indexOf(b));
    featureCount.textContent = String(state.features.length);
    loadCounts();
    renderLegend();
    renderInfo();
    renderMap();
  }

  bindEvents();
  loadData().catch((error) => {
    console.error(error);
    showError("地图数据未能成功加载。请通过本地服务器访问该页面，而不是直接以 file:// 打开。");
  });
})();
