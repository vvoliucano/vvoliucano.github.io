(() => {
  "use strict";

  const DATA_URL = "./district_and_planning_area.geojson";
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
    selectedArea: null,
    hoveredArea: null,
  };

  const container = document.querySelector("#map-container");
  const tooltip = document.querySelector("#map-tooltip");
  const resetButton = document.querySelector("#reset-selection");
  const currentArea = document.querySelector("#current-area");
  const currentDistrict = document.querySelector("#current-district");
  const currentNote = document.querySelector("#current-note");
  const districtSummary = document.querySelector("#district-summary");
  const districtAreas = document.querySelector("#district-areas");
  const legend = document.querySelector("#legend");
  const featureCount = document.querySelector("#feature-count");
  const districtCount = document.querySelector("#district-count");

  let svg;
  let pathsGroup;
  let overlayGroup;
  let resizeFrame = null;

  const areaKey = (feature) => feature.properties.planning_area;
  const districtKey = (feature) => feature.properties.district;

  function getActiveFeature() {
    const activeArea = state.selectedArea || state.hoveredArea;
    return state.features.find((feature) => areaKey(feature) === activeArea) || null;
  }

  function getDistrictFeatures(district) {
    return state.features
      .filter((feature) => districtKey(feature) === district)
      .sort((a, b) => areaKey(a).localeCompare(areaKey(b)));
  }

  function renderLegend() {
    legend.innerHTML = state.districts.map((district) => `
      <span class="legend-item">
        <i class="legend-swatch" style="background:${colors[district] || "#8aa3ad"}"></i>
        <span>${district}</span>
      </span>
    `).join("");
  }

  function renderSummary() {
    const activeFeature = getActiveFeature();
    const activeDistrict = activeFeature ? districtKey(activeFeature) : null;

    districtSummary.innerHTML = state.districts.map((district) => {
      const count = getDistrictFeatures(district).length;
      const activeClass = district === activeDistrict ? "district-row is-active" : "district-row";
      return `
        <div class="${activeClass}">
          <i class="legend-swatch" style="background:${colors[district] || "#8aa3ad"}"></i>
          <strong>${district}</strong>
          <span>${count} 个区域</span>
        </div>
      `;
    }).join("");
  }

  function renderAreaList() {
    const activeFeature = getActiveFeature();
    if (!activeFeature) {
      districtAreas.innerHTML = '<li class="is-empty">选中任一区域后，这里会列出同一 district 下的 planning areas。</li>';
      return;
    }

    const district = districtKey(activeFeature);
    districtAreas.innerHTML = getDistrictFeatures(district).map((feature) => {
      const activeClass = areaKey(feature) === areaKey(activeFeature) ? "is-focus" : "";
      return `<li class="${activeClass}">${areaKey(feature)}</li>`;
    }).join("");
  }

  function renderInfo() {
    const activeFeature = getActiveFeature();
    if (!activeFeature) {
      currentArea.textContent = "未选中";
      currentDistrict.textContent = "移动鼠标或点击区域";
      currentNote.textContent = "悬停时预览，点击后锁定信息。再次点击同一区域可取消选中。";
      renderSummary();
      renderAreaList();
      return;
    }

    const district = districtKey(activeFeature);
    const districtItems = getDistrictFeatures(district).length;
    const modeText = state.selectedArea ? "已锁定" : "悬停预览";

    currentArea.textContent = areaKey(activeFeature);
    currentDistrict.textContent = `${district} · ${modeText}`;
    currentNote.textContent = `${district} 大区当前共有 ${districtItems} 个 planning areas。当前版本展示的是边界分布底图。`;
    renderSummary();
    renderAreaList();
  }

  function showTooltip(event, feature) {
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.innerHTML = `<strong>${areaKey(feature)}</strong><br>${districtKey(feature)}`;
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

  function syncPathState() {
    if (!pathsGroup) return;

    pathsGroup.selectAll("path")
      .classed("is-selected", (feature) => areaKey(feature) === state.selectedArea)
      .classed("is-hovered", (feature) => areaKey(feature) === state.hoveredArea)
      .classed("is-muted", (feature) => Boolean(state.selectedArea || state.hoveredArea) && areaKey(feature) !== (state.selectedArea || state.hoveredArea));

    renderOverlay();
    renderInfo();
  }

  function renderOverlay() {
    overlayGroup.selectAll("*").remove();

    const activeFeature = getActiveFeature();
    if (!activeFeature) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const projection = d3.geoMercator().fitExtent([[28, 28], [width - 28, height - 28]], {
      type: "FeatureCollection",
      features: state.features,
    });
    const path = d3.geoPath(projection);
    const centroid = path.centroid(activeFeature);

    if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) return;

    overlayGroup.append("circle")
      .attr("class", "selection-dot")
      .attr("cx", centroid[0])
      .attr("cy", centroid[1])
      .attr("r", 5.5);

    overlayGroup.append("text")
      .attr("class", "selection-label")
      .attr("x", centroid[0])
      .attr("y", centroid[1] - 12)
      .text(areaKey(activeFeature));
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
    overlayGroup = svg.append("g");

    pathsGroup.selectAll("path")
      .data(state.features)
      .join("path")
      .attr("class", "planning-area")
      .attr("d", path)
      .attr("fill", (feature) => colors[districtKey(feature)] || "#8aa3ad")
      .attr("fill-opacity", 0.86)
      .attr("stroke", "rgba(8, 20, 33, 0.92)")
      .attr("stroke-width", 1.15)
      .on("mouseenter", (event, feature) => {
        state.hoveredArea = areaKey(feature);
        showTooltip(event, feature);
        syncPathState();
      })
      .on("mousemove", (event) => {
        if (tooltip.classList.contains("is-visible")) moveTooltip(event);
      })
      .on("mouseleave", () => {
        state.hoveredArea = null;
        hideTooltip();
        syncPathState();
      })
      .on("click", (event, feature) => {
        const name = areaKey(feature);
        state.selectedArea = state.selectedArea === name ? null : name;
        state.hoveredArea = name;
        showTooltip(event, feature);
        syncPathState();
      });

    syncPathState();
  }

  function scheduleRender() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      renderMap();
      resizeFrame = null;
    });
  }

  async function loadData() {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`加载地图数据失败：${response.status}`);
    const geojson = await response.json();
    state.features = geojson.features.slice().sort((a, b) => areaKey(a).localeCompare(areaKey(b)));
    state.districts = [...new Set(state.features.map(districtKey))]
      .sort((a, b) => districtOrder.indexOf(a) - districtOrder.indexOf(b));
    featureCount.textContent = String(state.features.length);
    districtCount.textContent = String(state.districts.length);
    renderLegend();
    renderInfo();
    renderMap();
  }

  function bindEvents() {
    resetButton.addEventListener("click", () => {
      state.selectedArea = null;
      state.hoveredArea = null;
      hideTooltip();
      syncPathState();
    });

    window.addEventListener("resize", scheduleRender);
  }

  function showError(message) {
    container.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;color:#d9e7eb;text-align:center;">${message}</div>`;
    currentArea.textContent = "加载失败";
    currentDistrict.textContent = "请检查 GeoJSON 文件";
    currentNote.textContent = message;
  }

  bindEvents();
  loadData().catch((error) => {
    console.error(error);
    showError("地图数据未能成功加载。请通过本地服务器访问该页面，而不是直接以 file:// 打开。");
  });
})();
