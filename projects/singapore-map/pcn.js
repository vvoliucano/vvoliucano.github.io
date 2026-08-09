(() => {
  "use strict";

  const GEO_URL = "./district_and_planning_area.geojson";
  const MANIFEST_URL = "./pcn/manifest.json";

  const state = {
    baseFeatures: [],
    routes: [],
    hiddenRoutes: new Set(),
    hoveredRoute: null,
  };

  const container = document.querySelector("#map-container");
  const tooltip = document.querySelector("#map-tooltip");
  const routeCount = document.querySelector("#route-count");
  const segmentCount = document.querySelector("#segment-count");
  const currentRoute = document.querySelector("#current-route");
  const currentColor = document.querySelector("#current-color");
  const currentNote = document.querySelector("#current-note");
  const routeLegend = document.querySelector("#route-legend");
  const routeSummary = document.querySelector("#route-summary");
  const showAllRoutesButton = document.querySelector("#show-all-routes");

  let svg;
  let baseGroup;
  let routeGroup;
  let resizeFrame = null;

  function routeKey(route) {
    return route.title;
  }

  function visibleRoutes() {
    return state.routes.filter((route) => !state.hiddenRoutes.has(routeKey(route)));
  }

  function allFeaturesForFit() {
    const routeFeatures = visibleRoutes().flatMap((route) => route.geojson.features);
    return {
      type: "FeatureCollection",
      features: [...state.baseFeatures, ...routeFeatures],
    };
  }

  function routeFeatureCount(route) {
    return route.geojson.features.length;
  }

  function setCurrentRoute(route) {
    if (!route) {
      currentRoute.textContent = "移动鼠标查看";
      currentColor.textContent = "显示颜色与线段数";
      currentNote.textContent = "右侧每条线路都可以单独开关。颜色来自原始 ArcGIS 图层配置。";
      return;
    }

    currentRoute.textContent = route.title;
    currentColor.textContent = `${route.color} · ${routeFeatureCount(route)} 段`;
    currentNote.textContent = `当前线路共有 ${routeFeatureCount(route)} 个线段要素，数据文件是 ${route.geojson_file}。`;
  }

  function renderLegend() {
    routeLegend.innerHTML = state.routes.map((route) => {
      const hidden = state.hiddenRoutes.has(routeKey(route));
      return `
        <button class="route-legend-item ${hidden ? "is-off" : ""}" type="button" data-route="${route.title}">
          <i class="legend-swatch" style="background:${route.color}"></i>
          <span>${route.title}</span>
          <strong>${routeFeatureCount(route)}</strong>
        </button>
      `;
    }).join("");

    routeLegend.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.route;
        if (state.hiddenRoutes.has(key)) {
          state.hiddenRoutes.delete(key);
        } else {
          state.hiddenRoutes.add(key);
        }
        syncMapState();
      });
    });
  }

  function renderSummary() {
    routeSummary.innerHTML = state.routes.map((route) => {
      const hidden = state.hiddenRoutes.has(routeKey(route));
      const active = state.hoveredRoute === routeKey(route);
      const classes = ["district-row"];
      if (active) classes.push("is-active");
      if (hidden) classes.push("is-off");

      return `
        <div class="${classes.join(" ")}">
          <i class="legend-swatch" style="background:${route.color}"></i>
          <strong>${route.title}</strong>
          <span>${routeFeatureCount(route)} 段</span>
        </div>
      `;
    }).join("");
  }

  function updateRouteStyles() {
    if (!routeGroup) return;

    routeGroup.selectAll(".route-segment")
      .attr("stroke-opacity", function () {
        const key = this.getAttribute("data-route");
        return state.hoveredRoute && key !== state.hoveredRoute ? 0.38 : 0.92;
      })
      .attr("stroke-width", function () {
        const key = this.getAttribute("data-route");
        return key === state.hoveredRoute ? 4.8 : 3.1;
      });
  }

  function showTooltip(event, route) {
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.innerHTML = `<strong>${route.title}</strong><br>${routeFeatureCount(route)} 个线段<br>${route.color}`;
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
    renderLegend();
    renderSummary();
    setCurrentRoute(state.routes.find((route) => routeKey(route) === state.hoveredRoute) || null);
    renderMap();
  }

  function renderMap() {
    if (!state.baseFeatures.length || !state.routes.length) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    const projection = d3.geoMercator().fitExtent([[28, 28], [width - 28, height - 28]], allFeaturesForFit());
    const path = d3.geoPath(projection);

    container.innerHTML = "";
    svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    baseGroup = svg.append("g");
    routeGroup = svg.append("g");

    baseGroup.selectAll("path")
      .data(state.baseFeatures)
      .join("path")
      .attr("class", "planning-area planning-area-base")
      .attr("d", path)
      .attr("fill", "rgba(255,255,255,0.04)")
      .attr("stroke", "rgba(255,255,255,0.12)")
      .attr("stroke-width", 0.8);

    visibleRoutes().forEach((route) => {
      routeGroup.append("g")
        .attr("data-route-group", routeKey(route))
        .selectAll("path")
        .data(route.geojson.features)
        .join("path")
        .attr("class", "route-segment")
        .attr("data-route", routeKey(route))
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", route.color)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .on("mouseenter", (event) => {
          state.hoveredRoute = routeKey(route);
          showTooltip(event, route);
          renderSummary();
          setCurrentRoute(route);
          updateRouteStyles();
        })
        .on("mousemove", (event) => {
          showTooltip(event, route);
        })
        .on("mouseleave", () => {
          state.hoveredRoute = null;
          hideTooltip();
          renderSummary();
          setCurrentRoute(null);
          updateRouteStyles();
        });
    });

    updateRouteStyles();
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
    setCurrentRoute(null);
    currentNote.textContent = message;
  }

  async function loadData() {
    const [baseResponse, manifestResponse] = await Promise.all([
      fetch(GEO_URL),
      fetch(MANIFEST_URL),
    ]);

    if (!baseResponse.ok) throw new Error(`加载底图失败：${baseResponse.status}`);
    if (!manifestResponse.ok) throw new Error(`加载 PCN 清单失败：${manifestResponse.status}`);

    const baseGeojson = await baseResponse.json();
    const manifest = await manifestResponse.json();
    const routeGeojsons = await Promise.all(
      manifest.map(async (route) => {
        const response = await fetch(`./pcn/${route.geojson_file}`);
        if (!response.ok) throw new Error(`加载路线失败：${route.geojson_file}`);
        return {
          ...route,
          geojson: await response.json(),
        };
      })
    );

    state.baseFeatures = baseGeojson.features;
    state.routes = routeGeojsons;

    routeCount.textContent = String(state.routes.length);
    segmentCount.textContent = String(state.routes.reduce((sum, route) => sum + routeFeatureCount(route), 0));

    renderLegend();
    renderSummary();
    setCurrentRoute(null);
    renderMap();
  }

  showAllRoutesButton.addEventListener("click", () => {
    state.hiddenRoutes.clear();
    state.hoveredRoute = null;
    hideTooltip();
    syncMapState();
  });

  window.addEventListener("resize", scheduleRender);

  loadData().catch((error) => {
    console.error(error);
    showError("PCN 路线数据未能成功加载。请通过本地服务器访问页面，并确认 pcn 目录中的 GeoJSON 文件存在。");
  });
})();
