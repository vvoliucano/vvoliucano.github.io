(() => {
  "use strict";

  const GEO_URL = "./district_and_planning_area.geojson";
  const MANIFEST_URL = "./pcn/manifest.json";
  const STORAGE_KEY = "singapore-pcn-planner-v2";
  const NODE_PRECISION = 6;
  const METERS_PER_DEG_LAT = 111320;

  const state = {
    baseFeatures: [],
    routes: [],
    graphNodes: [],
    adjacency: [],
    componentIds: [],
    componentSizes: [],
    projection: null,
    waypoints: [],
    pathCoordinates: [],
    targetPathCoordinates: [],
    segmentSummaries: [],
    totalDistance: 0,
    targetDistanceMeters: 10000,
    hoveredRoute: null,
  };

  const container = document.querySelector("#map-container");
  const tooltip = document.querySelector("#map-tooltip");
  const waypointCountEl = document.querySelector("#waypoint-count");
  const routeDistanceEl = document.querySelector("#route-distance");
  const targetDistanceDisplay = document.querySelector("#target-distance-display");
  const plannerStatusTitle = document.querySelector("#planner-status-title");
  const plannerStatusChip = document.querySelector("#planner-status-chip");
  const plannerStatusNote = document.querySelector("#planner-status-note");
  const targetDistanceInput = document.querySelector("#target-distance-input");
  const targetCurrentDistance = document.querySelector("#target-current-distance");
  const targetDistanceGap = document.querySelector("#target-distance-gap");
  const targetDistanceNote = document.querySelector("#target-distance-note");
  const waypointList = document.querySelector("#waypoint-list");
  const segmentList = document.querySelector("#segment-list");
  const gpxPreview = document.querySelector("#gpx-preview");
  const exportStatus = document.querySelector("#export-status");
  const undoButton = document.querySelector("#undo-waypoint");
  const clearButton = document.querySelector("#clear-waypoints");
  const exportButton = document.querySelector("#export-gpx");
  const exportTargetButton = document.querySelector("#export-target-gpx");
  const connectivityModal = document.querySelector("#connectivity-modal");
  const connectivityModalMessage = document.querySelector("#connectivity-modal-message");
  const connectivityModalClose = document.querySelector("#connectivity-modal-close");

  let svg;
  let baseGroup;
  let networkGroup;
  let overlayGroup;
  let resizeFrame = null;

  function nodeKey(lon, lat) {
    return `${lon.toFixed(NODE_PRECISION)},${lat.toFixed(NODE_PRECISION)}`;
  }

  function distanceMeters(a, b) {
    const latFactor = METERS_PER_DEG_LAT;
    const lonFactor = Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180) * METERS_PER_DEG_LAT;
    const dx = (b[0] - a[0]) * lonFactor;
    const dy = (b[1] - a[1]) * latFactor;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function formatKm(meters) {
    return `${(meters / 1000).toFixed(1)} km`;
  }

  function formatKmValue(meters) {
    return (meters / 1000).toFixed(1);
  }

  function featureCollectionForFit() {
    return {
      type: "FeatureCollection",
      features: [
        ...state.baseFeatures,
        ...state.routes.flatMap((route) => route.geojson.features),
      ],
    };
  }

  function buildGraph() {
    const nodeIndexByKey = new Map();
    const nodes = [];
    const adjacency = [];

    function getNodeIndex(coord) {
      const key = nodeKey(coord[0], coord[1]);
      if (!nodeIndexByKey.has(key)) {
        const index = nodes.length;
        nodeIndexByKey.set(key, index);
        nodes.push({ coord, key });
        adjacency.push([]);
      }
      return nodeIndexByKey.get(key);
    }

    function addEdge(aIndex, bIndex, weight) {
      adjacency[aIndex].push({ to: bIndex, weight });
      adjacency[bIndex].push({ to: aIndex, weight });
    }

    state.routes.forEach((route) => {
      route.geojson.features.forEach((feature) => {
        const lines = feature.geometry.type === "LineString"
          ? [feature.geometry.coordinates]
          : feature.geometry.coordinates;

        lines.forEach((line) => {
          for (let i = 0; i < line.length - 1; i += 1) {
            const a = line[i];
            const b = line[i + 1];
            const aIndex = getNodeIndex(a);
            const bIndex = getNodeIndex(b);
            addEdge(aIndex, bIndex, distanceMeters(a, b));
          }
        });
      });
    });

    state.graphNodes = nodes;
    state.adjacency = adjacency;
    labelComponents();
  }

  function labelComponents() {
    const componentIds = new Array(state.graphNodes.length).fill(-1);
    const componentSizes = [];
    let componentId = 0;

    for (let i = 0; i < state.graphNodes.length; i += 1) {
      if (componentIds[i] !== -1) continue;

      const queue = [i];
      componentIds[i] = componentId;
      let size = 0;

      for (let head = 0; head < queue.length; head += 1) {
        const node = queue[head];
        size += 1;
        state.adjacency[node].forEach((edge) => {
          if (componentIds[edge.to] !== -1) return;
          componentIds[edge.to] = componentId;
          queue.push(edge.to);
        });
      }

      componentSizes[componentId] = size;
      componentId += 1;
    }

    state.componentIds = componentIds;
    state.componentSizes = componentSizes;
  }

  function nearestGraphNode(lonLat) {
    let bestIndex = -1;
    let bestDistance = Infinity;

    for (let i = 0; i < state.graphNodes.length; i += 1) {
      const candidate = state.graphNodes[i].coord;
      const dist = distanceMeters(lonLat, candidate);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestIndex = i;
      }
    }

    return {
      nodeIndex: bestIndex,
      coord: state.graphNodes[bestIndex].coord,
      distance: bestDistance,
    };
  }

  function dijkstra(startIndex, endIndex) {
    const n = state.graphNodes.length;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const visited = new Uint8Array(n);
    const heap = [];

    function push(node, priority) {
      heap.push({ node, priority });
      let i = heap.length - 1;
      while (i > 0) {
        const p = Math.floor((i - 1) / 2);
        if (heap[p].priority <= heap[i].priority) break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
      }
    }

    function pop() {
      if (!heap.length) return null;
      const top = heap[0];
      const last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        let i = 0;
        while (true) {
          const l = i * 2 + 1;
          const r = l + 1;
          let smallest = i;
          if (l < heap.length && heap[l].priority < heap[smallest].priority) smallest = l;
          if (r < heap.length && heap[r].priority < heap[smallest].priority) smallest = r;
          if (smallest === i) break;
          [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
          i = smallest;
        }
      }
      return top;
    }

    dist[startIndex] = 0;
    push(startIndex, 0);

    while (heap.length) {
      const current = pop();
      if (!current) break;
      const { node } = current;
      if (visited[node]) continue;
      visited[node] = 1;
      if (node === endIndex) break;

      state.adjacency[node].forEach((edge) => {
        if (visited[edge.to]) return;
        const nextDistance = dist[node] + edge.weight;
        if (nextDistance < dist[edge.to]) {
          dist[edge.to] = nextDistance;
          prev[edge.to] = node;
          push(edge.to, nextDistance);
        }
      });
    }

    if (!Number.isFinite(dist[endIndex])) return null;

    const indices = [];
    let cursor = endIndex;
    while (cursor !== -1) {
      indices.push(cursor);
      if (cursor === startIndex) break;
      cursor = prev[cursor];
    }
    indices.reverse();

    return {
      distance: dist[endIndex],
      coordinates: indices.map((index) => state.graphNodes[index].coord),
    };
  }

  function buildGpx(routeCoordinates) {
    const trkpts = routeCoordinates.map(([lon, lat]) => `    <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"></trkpt>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Singapore PCN Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Singapore PCN Planned Route</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Singapore PCN Planned Route</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
  }

  function openConnectivityModal(message) {
    connectivityModalMessage.textContent = message;
    connectivityModal.classList.add("is-visible");
    connectivityModal.setAttribute("aria-hidden", "false");
  }

  function closeConnectivityModal() {
    connectivityModal.classList.remove("is-visible");
    connectivityModal.setAttribute("aria-hidden", "true");
  }

  function persistState() {
    try {
      const payload = {
        targetDistanceMeters: state.targetDistanceMeters,
        waypoints: state.waypoints.map((waypoint) => waypoint.original),
        pathCoordinates: state.pathCoordinates,
        targetPathCoordinates: state.targetPathCoordinates,
        totalDistance: state.totalDistance,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error(error);
    }
  }

  function clearPersistedState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error(error);
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const nextTarget = Number(parsed.targetDistanceMeters);
      if (Number.isFinite(nextTarget) && nextTarget > 0) {
        state.targetDistanceMeters = nextTarget;
        targetDistanceInput.value = (nextTarget / 1000).toFixed(1);
      }
      if (!Array.isArray(parsed.waypoints) || !parsed.waypoints.length) {
        recalculateTargetPath();
        updatePlannerInfo();
        renderMap();
        return;
      }
      state.waypoints = parsed.waypoints
        .filter((coord) => Array.isArray(coord) && coord.length === 2 && coord.every(Number.isFinite))
        .map((coord) => createWaypoint(coord));
      rebuildRoute({ showModal: false });
    } catch (error) {
      console.error(error);
    }
  }

  function trimPathToDistance(routeCoordinates, targetMeters) {
    if (!routeCoordinates.length || targetMeters <= 0) return [];
    if (routeCoordinates.length === 1) return routeCoordinates.slice();

    const trimmed = [routeCoordinates[0]];
    let traveled = 0;

    for (let i = 0; i < routeCoordinates.length - 1; i += 1) {
      const start = routeCoordinates[i];
      const end = routeCoordinates[i + 1];
      const segmentDistance = distanceMeters(start, end);

      if (traveled + segmentDistance <= targetMeters) {
        trimmed.push(end);
        traveled += segmentDistance;
        continue;
      }

      const remaining = targetMeters - traveled;
      const ratio = remaining / segmentDistance;
      const interpolated = [
        start[0] + (end[0] - start[0]) * ratio,
        start[1] + (end[1] - start[1]) * ratio,
      ];
      trimmed.push(interpolated);
      break;
    }

    return trimmed;
  }

  function recalculateTargetPath() {
    if (state.pathCoordinates.length < 2 || state.targetDistanceMeters <= 0) {
      state.targetPathCoordinates = [];
      return;
    }

    if (state.totalDistance + 1e-6 < state.targetDistanceMeters) {
      state.targetPathCoordinates = [];
      return;
    }

    state.targetPathCoordinates = trimPathToDistance(state.pathCoordinates, state.targetDistanceMeters);
  }

  function updatePlannerInfo() {
    waypointCountEl.textContent = String(state.waypoints.length);
    routeDistanceEl.textContent = formatKm(state.totalDistance);
    targetDistanceDisplay.textContent = formatKm(state.targetDistanceMeters);
    targetCurrentDistance.textContent = formatKmValue(state.totalDistance);

    const gapMeters = state.totalDistance - state.targetDistanceMeters;
    const gapPrefix = gapMeters >= 0 ? "+" : "-";
    targetDistanceGap.textContent = `${gapPrefix}${formatKmValue(Math.abs(gapMeters))}`;

    if (!state.waypoints.length) {
      plannerStatusTitle.textContent = "等待选点";
      plannerStatusChip.textContent = "至少需要两个途经点";
      plannerStatusNote.textContent = "点击地图任意位置即可添加途经点。系统会自动吸附到最近的 PCN 节点，再按顺序连接。";
    } else if (state.waypoints.length === 1) {
      plannerStatusTitle.textContent = "已选 1 个点";
      plannerStatusChip.textContent = "再选一个点开始规划";
      plannerStatusNote.textContent = `当前点吸附到最近 PCN 的距离约为 ${state.waypoints[0].snapDistance.toFixed(0)} 米，落在连通块 ${state.waypoints[0].componentSize} 节点范围内。`;
    } else if (!state.pathCoordinates.length) {
      plannerStatusTitle.textContent = "部分点无法连通";
      plannerStatusChip.textContent = "当前途经点之间未找到完整路径";
      const brokenSegment = state.segmentSummaries.find((segment) => !segment.connected);
      plannerStatusNote.textContent = brokenSegment
        ? `${brokenSegment.from} 和 ${brokenSegment.to} 落在不同连通块，当前公开 PCN 数据里不能直接连通。`
        : "这通常表示两点分别落在当前公开 PCN 数据的不同连通分量中。";
    } else {
      plannerStatusTitle.textContent = "路线已生成";
      plannerStatusChip.textContent = `${state.segmentSummaries.length} 段，总长 ${formatKm(state.totalDistance)}`;
      plannerStatusNote.textContent = "可以继续加点重新规划，或直接导出 GPX。当前状态已自动保存到本地。";
    }

    if (!state.pathCoordinates.length) {
      targetDistanceNote.textContent = "连通路线生成后，这里会告诉你距离目标公里数还差多少。";
    } else if (!state.targetDistanceMeters || state.targetDistanceMeters <= 0) {
      targetDistanceNote.textContent = "请输入一个大于 0 的目标公里数。";
    } else if (state.totalDistance + 1e-6 < state.targetDistanceMeters) {
      targetDistanceNote.textContent = `当前已连通路线为 ${formatKm(state.totalDistance)}，距离目标还差 ${formatKm(state.targetDistanceMeters - state.totalDistance)}。`;
    } else {
      targetDistanceNote.textContent = `当前路线已经覆盖目标距离，可以截出前 ${formatKm(state.targetDistanceMeters)} 并导出目标 GPX。`;
    }

    if (!state.waypoints.length) {
      waypointList.innerHTML = '<li class="is-empty">还没有途经点。点击地图开始选点。</li>';
    } else {
      waypointList.innerHTML = state.waypoints.map((waypoint, index) => `
        <li>
          <span>点 ${index + 1} · 吸附 ${waypoint.snapDistance.toFixed(0)}m · 连通块 ${waypoint.componentId + 1}</span>
          <strong>${waypoint.original[1].toFixed(4)}, ${waypoint.original[0].toFixed(4)}</strong>
        </li>
      `).join("");
    }

    if (!state.segmentSummaries.length) {
      segmentList.innerHTML = '<li class="is-empty">至少两个点后，这里会显示逐段路径长度。</li>';
    } else {
      segmentList.innerHTML = state.segmentSummaries.map((segment, index) => `
        <li>
          <span>段 ${index + 1} · ${segment.from} → ${segment.to}</span>
          <strong>${segment.connected ? formatKm(segment.distance) : "未连通"}</strong>
        </li>
      `).join("");
    }

    if (state.targetPathCoordinates.length) {
      gpxPreview.value = buildGpx(state.targetPathCoordinates);
      exportStatus.textContent = "目标 GPX 已生成，预览显示的是按目标公里数截断后的版本。";
    } else if (state.pathCoordinates.length) {
      gpxPreview.value = buildGpx(state.pathCoordinates);
      exportStatus.textContent = "当前整条路线 GPX 已生成。";
    } else {
      gpxPreview.value = "";
      exportStatus.textContent = "生成路线后，这里会出现可导出的 GPX 内容预览。";
    }

    undoButton.disabled = state.waypoints.length === 0;
    clearButton.disabled = state.waypoints.length === 0;
    exportButton.disabled = state.pathCoordinates.length === 0;
    exportTargetButton.disabled = state.targetPathCoordinates.length === 0;
  }

  function rebuildRoute(options = {}) {
    const showModal = options.showModal !== false;
    closeConnectivityModal();
    state.pathCoordinates = [];
    state.targetPathCoordinates = [];
    state.segmentSummaries = [];
    state.totalDistance = 0;

    if (state.waypoints.length < 2) {
      updatePlannerInfo();
      persistState();
      renderMap();
      return;
    }

    const fullPath = [];
    const summaries = [];
    let totalDistance = 0;

    for (let i = 0; i < state.waypoints.length - 1; i += 1) {
      const start = state.waypoints[i];
      const end = state.waypoints[i + 1];

      if (start.componentId !== end.componentId) {
        const message = `${i + 1} 号点和 ${i + 2} 号点之间没有公开 PCN 连通路线，请改一个更接近同一条线路网络的点。`;
        summaries.push({
          from: `点 ${i + 1}`,
          to: `点 ${i + 2}`,
          distance: 0,
          connected: false,
        });
        state.pathCoordinates = [];
        state.segmentSummaries = summaries;
        state.totalDistance = 0;
        if (showModal) openConnectivityModal(message);
        updatePlannerInfo();
        persistState();
        renderMap();
        return;
      }

      const result = dijkstra(start.nodeIndex, end.nodeIndex);

      if (!result) {
        const message = `${i + 1} 号点和 ${i + 2} 号点之间当前没有可计算的 PCN 路线。`;
        summaries.push({
          from: `点 ${i + 1}`,
          to: `点 ${i + 2}`,
          distance: 0,
          connected: false,
        });
        state.pathCoordinates = [];
        state.segmentSummaries = summaries;
        state.totalDistance = 0;
        if (showModal) openConnectivityModal(message);
        updatePlannerInfo();
        persistState();
        renderMap();
        return;
      }

      const segmentCoords = result.coordinates.slice();
      if (i > 0) segmentCoords.shift();
      fullPath.push(...segmentCoords);
      totalDistance += result.distance;
      summaries.push({
        from: `点 ${i + 1}`,
        to: `点 ${i + 2}`,
        distance: result.distance,
        connected: true,
      });
    }

    state.pathCoordinates = fullPath;
    state.segmentSummaries = summaries;
    state.totalDistance = totalDistance;
    recalculateTargetPath();
    updatePlannerInfo();
    persistState();
    renderMap();
  }

  function createWaypoint(lonLat) {
    const snapped = nearestGraphNode(lonLat);
    return {
      original: lonLat,
      snapped: snapped.coord,
      nodeIndex: snapped.nodeIndex,
      snapDistance: snapped.distance,
      componentId: state.componentIds[snapped.nodeIndex],
      componentSize: state.componentSizes[state.componentIds[snapped.nodeIndex]],
    };
  }

  function addWaypoint(lonLat) {
    state.waypoints.push(createWaypoint(lonLat));
    rebuildRoute();
  }

  function showTooltip(event, message) {
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    tooltip.innerHTML = message;
    const bounds = container.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - bounds.left}px`;
    tooltip.style.top = `${event.clientY - bounds.top}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function renderMap() {
    if (!state.baseFeatures.length || !state.routes.length) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);
    state.projection = d3.geoMercator().fitExtent([[28, 28], [width - 28, height - 28]], featureCollectionForFit());
    const path = d3.geoPath(state.projection);

    container.innerHTML = "";
    svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    baseGroup = svg.append("g");
    networkGroup = svg.append("g");
    overlayGroup = svg.append("g");

    baseGroup.selectAll("path")
      .data(state.baseFeatures)
      .join("path")
      .attr("class", "planning-area planning-area-base")
      .attr("d", path)
      .attr("fill", "rgba(255,255,255,0.03)")
      .attr("stroke", "rgba(255,255,255,0.10)")
      .attr("stroke-width", 0.7);

    state.routes.forEach((route) => {
      networkGroup.selectAll(`.pcn-${route.title}`)
        .data(route.geojson.features)
        .join("path")
        .attr("class", "route-segment route-segment-base")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", route.color)
        .attr("stroke-opacity", 0.25)
        .attr("stroke-width", 1.8);
    });

    if (state.pathCoordinates.length > 1) {
      overlayGroup.append("path")
        .datum({ type: "LineString", coordinates: state.pathCoordinates })
        .attr("class", "planner-route")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ffe6a3")
        .attr("stroke-width", 5.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
    }

    if (state.targetPathCoordinates.length > 1) {
      overlayGroup.append("path")
        .datum({ type: "LineString", coordinates: state.targetPathCoordinates })
        .attr("class", "planner-route-target")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#7fe0d2")
        .attr("stroke-width", 7.2)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");

      const targetEnd = state.projection(state.targetPathCoordinates[state.targetPathCoordinates.length - 1]);
      if (targetEnd) {
        overlayGroup.append("circle")
          .attr("class", "planner-target-end")
          .attr("cx", targetEnd[0])
          .attr("cy", targetEnd[1])
          .attr("r", 5.4)
          .attr("fill", "#7fe0d2")
          .attr("stroke", "#082033")
          .attr("stroke-width", 2);
      }
    }

    state.waypoints.forEach((waypoint, index) => {
      const originalXY = state.projection(waypoint.original);
      const snappedXY = state.projection(waypoint.snapped);
      if (!originalXY || !snappedXY) return;

      overlayGroup.append("line")
        .attr("class", "planner-snap-link")
        .attr("x1", originalXY[0])
        .attr("y1", originalXY[1])
        .attr("x2", snappedXY[0])
        .attr("y2", snappedXY[1])
        .attr("stroke", "rgba(127,224,210,0.55)")
        .attr("stroke-dasharray", "5 5")
        .attr("stroke-width", 1.5);

      overlayGroup.append("circle")
        .attr("class", "planner-waypoint")
        .attr("cx", originalXY[0])
        .attr("cy", originalXY[1])
        .attr("r", 6.2)
        .attr("fill", "transparent")
        .attr("stroke", "#f2fbfd")
        .attr("stroke-width", 2.2);

      overlayGroup.append("circle")
        .attr("class", "planner-snapped")
        .attr("cx", snappedXY[0])
        .attr("cy", snappedXY[1])
        .attr("r", 4.2)
        .attr("fill", "#7fe0d2")
        .attr("stroke", "#072030")
        .attr("stroke-width", 1.6);

      overlayGroup.append("text")
        .attr("class", "planner-index")
        .attr("x", originalXY[0])
        .attr("y", originalXY[1] - 10)
        .text(String(index + 1));
    });

    svg.on("click", (event) => {
      const [x, y] = d3.pointer(event);
      const lonLat = state.projection.invert([x, y]);
      if (!lonLat) return;
      addWaypoint(lonLat);
    });

    svg.on("mousemove", (event) => {
      const [x, y] = d3.pointer(event);
      const lonLat = state.projection.invert([x, y]);
      if (!lonLat) return;
      showTooltip(event, `点击新增途经点<br>${lonLat[1].toFixed(5)}, ${lonLat[0].toFixed(5)}`);
    });

    svg.on("mouseleave", hideTooltip);
  }

  function scheduleRender() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      renderMap();
      resizeFrame = null;
    });
  }

  function exportGpx() {
    if (!state.pathCoordinates.length) return;
    const blob = new Blob([buildGpx(state.pathCoordinates)], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "singapore-pcn-route.gpx";
    link.click();
    URL.revokeObjectURL(url);
    exportStatus.textContent = "当前整条路线的 GPX 文件已开始下载。";
  }

  function exportTargetGpx() {
    if (!state.targetPathCoordinates.length) return;
    const blob = new Blob([buildGpx(state.targetPathCoordinates)], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `singapore-pcn-route-${formatKmValue(state.targetDistanceMeters)}km.gpx`;
    link.click();
    URL.revokeObjectURL(url);
    exportStatus.textContent = `目标 ${formatKm(state.targetDistanceMeters)} 的 GPX 文件已开始下载。`;
  }

  function handleTargetDistanceChange() {
    const nextKm = Number.parseFloat(targetDistanceInput.value);
    state.targetDistanceMeters = Number.isFinite(nextKm) && nextKm > 0 ? nextKm * 1000 : 0;
    recalculateTargetPath();
    updatePlannerInfo();
    persistState();
    renderMap();
  }

  function showError(message) {
    container.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;color:#d9e7eb;text-align:center;">${message}</div>`;
    plannerStatusTitle.textContent = "加载失败";
    plannerStatusChip.textContent = "请检查数据文件";
    plannerStatusNote.textContent = message;
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
    buildGraph();
    updatePlannerInfo();
    renderMap();
  }

  undoButton.addEventListener("click", () => {
    state.waypoints.pop();
    rebuildRoute();
  });

  clearButton.addEventListener("click", () => {
    state.waypoints = [];
    closeConnectivityModal();
    clearPersistedState();
    rebuildRoute();
  });

  exportButton.addEventListener("click", exportGpx);
  exportTargetButton.addEventListener("click", exportTargetGpx);
  targetDistanceInput.addEventListener("input", handleTargetDistanceChange);
  connectivityModalClose.addEventListener("click", closeConnectivityModal);
  connectivityModal.addEventListener("click", (event) => {
    if (event.target === connectivityModal) closeConnectivityModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeConnectivityModal();
  });
  window.addEventListener("resize", scheduleRender);

  loadData()
    .then(() => {
      restoreState();
    })
    .catch((error) => {
      console.error(error);
      showError("路径规划数据未能成功加载。请通过本地服务器访问页面，并确认 pcn 目录中的 GeoJSON 文件存在。");
    });
})();
