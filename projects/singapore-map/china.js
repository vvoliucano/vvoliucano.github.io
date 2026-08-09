(() => {
  "use strict";

  const BASE_GEO_URL = "./china-province-full.geojson";
  const STORAGE_KEY = "china-explore-map-v1";

  const state = {
    baseFeatures: [],
    counts: {},
    hoveredArea: null,
    maxCount: 0,
    totalVisits: 0,
    exploredAreas: 0,
    showLabels: false,
    rawInput: "",
  };

  const container = document.querySelector("#china-map-container");
  const tooltip = document.querySelector("#china-map-tooltip");
  const totalVisitsEl = document.querySelector("#china-total-visits");
  const exploredAreasEl = document.querySelector("#china-explored-areas");
  const currentAreaEl = document.querySelector("#china-current-area");
  const currentStateEl = document.querySelector("#china-current-state");
  const currentNoteEl = document.querySelector("#china-current-note");
  const topAreasEl = document.querySelector("#china-top-areas");
  const legendRamp = document.querySelector("#china-legend-ramp");
  const legendMin = document.querySelector("#china-legend-min");
  const legendMid = document.querySelector("#china-legend-mid");
  const legendMax = document.querySelector("#china-legend-max");
  const fileInput = document.querySelector("#china-geojson-file");
  const textInput = document.querySelector("#china-geojson-text");
  const importTextButton = document.querySelector("#china-import-text");
  const clearDataButton = document.querySelector("#china-clear-data");
  const toggleLabelsButton = document.querySelector("#china-toggle-labels");
  const importStatus = document.querySelector("#china-import-status");

  let svg;
  let pathsGroup;
  let labelGroup;
  let resizeFrame = null;

  function normalizeProvinceName(name) {
    return String(name || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市/g, "");
  }

  function provinceName(feature) {
    return feature.properties.name;
  }

  function getCount(name) {
    return state.counts[name] || 0;
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        rawInput: state.rawInput,
        showLabels: state.showLabels,
      }));
    } catch (error) {
      console.warn("保存中国探索地图设置失败", error);
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.rawInput === "string") {
        state.rawInput = parsed.rawInput;
        textInput.value = parsed.rawInput;
      }
      if (typeof parsed.showLabels === "boolean") {
        state.showLabels = parsed.showLabels;
      }
    } catch (error) {
      console.warn("读取中国探索地图设置失败", error);
    }
  }

  function fillForFeature(feature) {
    const count = getCount(provinceName(feature));
    if (count <= 0) return "#112132";
    const ratio = Math.max(0, Math.min(1, count / Math.max(1, state.maxCount)));
    return d3.interpolateRgb("#213344", "#a7f0df")(0.22 + ratio * 0.78);
  }

  function renderLegend() {
    legendRamp.style.background = "linear-gradient(90deg, #112132 0%, #213344 18%, #335367 42%, #4f7b86 64%, #77baa9 82%, #a7f0df 100%)";
    legendMin.textContent = "0";
    legendMid.textContent = String(Math.round(state.maxCount / 2));
    legendMax.textContent = String(state.maxCount);
    toggleLabelsButton.textContent = state.showLabels ? "隐藏次数" : "显示次数";
  }

  function getSortedEntries() {
    return Object.entries(state.counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"));
  }

  function renderInfo() {
    totalVisitsEl.textContent = String(state.totalVisits);
    exploredAreasEl.textContent = String(state.exploredAreas);

    const feature = state.hoveredArea
      ? state.baseFeatures.find((item) => provinceName(item) === state.hoveredArea)
      : null;

    if (!feature) {
      currentAreaEl.textContent = "移动鼠标查看";
      currentStateEl.textContent = "显示是否已探索与累计次数";
      currentNoteEl.textContent = state.exploredAreas
        ? "当前已导入探索数据。悬停任一省级区即可查看状态。"
        : "未导入时，地图只显示全国省级边界底图。";
    } else {
      const count = getCount(provinceName(feature));
      currentAreaEl.textContent = provinceName(feature);
      currentStateEl.textContent = count > 0 ? `已探索 · ${count} 次` : "尚未记录";
      currentNoteEl.textContent = count > 0
        ? `${provinceName(feature)} 当前累计记录为 ${count} 次。`
        : `${provinceName(feature)} 当前还没有出现在导入数据中。`;
    }

    const entries = getSortedEntries();
    topAreasEl.innerHTML = entries.length
      ? entries.map(([name, count]) => `<li><span>${name}</span><strong>${count}</strong></li>`).join("")
      : '<li class="is-empty">还没有导入任何已探索省级区。</li>';
  }

  function renderLabels(path) {
    labelGroup.selectAll("*").remove();
    if (!state.showLabels) return;

    state.baseFeatures
      .filter((feature) => getCount(provinceName(feature)) > 0)
      .forEach((feature) => {
        const centroid = path.centroid(feature);
        if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) return;

        labelGroup.append("text")
          .attr("class", "selection-label")
          .attr("x", centroid[0])
          .attr("y", centroid[1])
          .text(String(getCount(provinceName(feature))));
      });
  }

  function showTooltip(event, feature) {
    const count = getCount(provinceName(feature));
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.innerHTML = count > 0
      ? `<strong>${provinceName(feature)}</strong><br>已探索 · ${count} 次`
      : `<strong>${provinceName(feature)}</strong><br>当前未记录`;
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

    renderLabels(path);
    renderLegend();
    renderInfo();
  }

  function renderMap() {
    if (!state.baseFeatures.length) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    const featureCollection = { type: "FeatureCollection", features: state.baseFeatures };
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
      .data(state.baseFeatures)
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

  function showError(message) {
    importStatus.textContent = message;
    currentAreaEl.textContent = "导入失败";
    currentStateEl.textContent = "请检查 GeoJSON";
    currentNoteEl.textContent = message;
  }

  function extractFeatures(payload) {
    if (!payload) return [];
    if (payload.type === "FeatureCollection" && Array.isArray(payload.features)) return payload.features;
    if (payload.type === "Feature") return [payload];
    if (Array.isArray(payload)) {
      return payload.flatMap((item) => extractFeatures(item));
    }
    return [];
  }

  function getFeatureName(feature) {
    const properties = feature.properties || {};
    return properties.name || properties.NAME || properties.province || properties.PROVINCE || properties.region || properties.REGION || "";
  }

  function getFeatureCount(feature) {
    const properties = feature.properties || {};
    const candidates = [
      properties.count,
      properties.value,
      properties.visit_count,
      properties.visits,
      properties.frequency,
      properties.times,
      properties.explored,
      properties.visited,
    ];
    const explicit = candidates.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
    if (explicit === undefined) return 1;
    const numeric = Number(explicit);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  }

  function applyImportedFeatures(features, sourceLabel) {
    const baseNameByNormalized = new Map(
      state.baseFeatures.map((feature) => [normalizeProvinceName(provinceName(feature)), provinceName(feature)])
    );
    const nextCounts = {};
    const unmatched = [];

    features.forEach((feature) => {
      const rawName = getFeatureName(feature);
      const normalized = normalizeProvinceName(rawName);
      if (!normalized) return;

      const baseName = baseNameByNormalized.get(normalized);
      if (!baseName) {
        unmatched.push(rawName);
        return;
      }

      nextCounts[baseName] = (nextCounts[baseName] || 0) + getFeatureCount(feature);
    });

    state.counts = nextCounts;
    state.maxCount = Math.max(0, ...Object.values(state.counts));
    state.totalVisits = Object.values(state.counts).reduce((sum, value) => sum + value, 0);
    state.exploredAreas = Object.values(state.counts).filter((value) => value > 0).length;

    const matched = Object.keys(state.counts).length;
    importStatus.textContent = unmatched.length
      ? `${sourceLabel} 已导入：匹配 ${matched} 个省级区，另有 ${unmatched.length} 个名称未匹配到底图。`
      : `${sourceLabel} 已导入：匹配 ${matched} 个省级区。`;

    persistState();
    renderMap();
  }

  function importFromText(rawText, sourceLabel) {
    const trimmed = rawText.trim();
    if (!trimmed) {
      showError("请先粘贴 GeoJSON 文本，或选择本地文件。");
      return;
    }

    try {
      const payload = JSON.parse(trimmed);
      const features = extractFeatures(payload);
      if (!features.length) {
        throw new Error("GeoJSON 中没有可读取的 Feature。");
      }
      state.rawInput = trimmed;
      textInput.value = trimmed;
      applyImportedFeatures(features, sourceLabel);
    } catch (error) {
      console.error(error);
      showError("GeoJSON 解析失败。请提供完整、有效的 FeatureCollection、Feature 或 Feature 数组。");
    }
  }

  async function handleFileImport(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const rawText = await file.text();
    importFromText(rawText, `文件 ${file.name}`);
  }

  function clearImportedData() {
    state.counts = {};
    state.maxCount = 0;
    state.totalVisits = 0;
    state.exploredAreas = 0;
    state.hoveredArea = null;
    state.rawInput = "";
    textInput.value = "";
    fileInput.value = "";
    importStatus.textContent = "已清空导入数据。";
    persistState();
    renderMap();
  }

  function toggleLabels() {
    state.showLabels = !state.showLabels;
    persistState();
    renderMap();
  }

  async function loadBaseMap() {
    const response = await fetch(BASE_GEO_URL);
    if (!response.ok) throw new Error(`加载中国底图失败：${response.status}`);
    const geojson = await response.json();
    state.baseFeatures = geojson.features.slice();
    restoreState();
    renderLegend();
    renderInfo();
    renderMap();

    if (state.rawInput.trim()) {
      importFromText(state.rawInput, "本地缓存");
    }
  }

  window.addEventListener("resize", scheduleRender);
  fileInput.addEventListener("change", handleFileImport);
  importTextButton.addEventListener("click", () => importFromText(textInput.value, "文本框"));
  clearDataButton.addEventListener("click", clearImportedData);
  toggleLabelsButton.addEventListener("click", toggleLabels);

  loadBaseMap().catch((error) => {
    console.error(error);
    showError("中国省级底图加载失败。请通过本地服务器访问页面，并确认底图文件存在。");
  });
})();
