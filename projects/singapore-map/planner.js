(() => {
  "use strict";

  const GEO_URL = "./district_and_planning_area.geojson";
  const MANIFEST_URL = "./pcn/manifest.json";
  const STORAGE_KEY = "singapore-pcn-planner-v2";
  const NODE_PRECISION = 6;
  const METERS_PER_DEG_LAT = 111320;
  const SINGAPORE_REF_LAT = 1.3521 * Math.PI / 180;
  const METERS_PER_DEG_LON = Math.cos(SINGAPORE_REF_LAT) * METERS_PER_DEG_LAT;
  const NEAR_CONNECTION_METERS = 100;
  const GOOGLE_SIMPLIFY_TOLERANCE_METERS = 18;
  const GOOGLE_MIN_WAYPOINT_SPACING_METERS = 350;
  const GOOGLE_TURN_THRESHOLD_DEGREES = 32;
  const GOOGLE_ANCHOR_SEGMENT_METERS = 3500;
  const GOOGLE_MAX_WAYPOINTS = 9;

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
    zoomTransform: { k: 1, x: 0, y: 0 },
    googleMapsUrl: "",
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
  const openGoogleMapsButton = document.querySelector("#open-google-maps");
  const copyGoogleMapsLinkButton = document.querySelector("#copy-google-maps-link");
  const zoomInButton = document.querySelector("#zoom-in");
  const zoomOutButton = document.querySelector("#zoom-out");
  const zoomResetButton = document.querySelector("#zoom-reset");
  const connectivityModal = document.querySelector("#connectivity-modal");
  const connectivityModalMessage = document.querySelector("#connectivity-modal-message");
  const connectivityModalClose = document.querySelector("#connectivity-modal-close");
  const googleMapsLinkPreview = document.querySelector("#google-maps-link-preview");
  const googleLinkNote = document.querySelector("#google-link-note");

  let svg;
  let viewportGroup;
  let baseGroup;
  let networkGroup;
  let overlayGroup;
  let zoomBehavior;
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

  function coordToGoogleLatLon(coord) {
    return `${coord[1].toFixed(6)},${coord[0].toFixed(6)}`;
  }

  function normalizeDegrees(angle) {
    let normalized = angle;
    while (normalized > 180) normalized -= 360;
    while (normalized < -180) normalized += 360;
    return normalized;
  }

  function bearingDegrees(a, b) {
    const dx = (b[0] - a[0]) * METERS_PER_DEG_LON;
    const dy = (b[1] - a[1]) * METERS_PER_DEG_LAT;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  function turnAngleDegrees(prev, current, next) {
    const inBearing = bearingDegrees(prev, current);
    const outBearing = bearingDegrees(current, next);
    return Math.abs(normalizeDegrees(outBearing - inBearing));
  }

  function pointLineDistanceMeters(point, start, end) {
    const p = lonLatToMeterPoint(point);
    const a = lonLatToMeterPoint(start);
    const b = lonLatToMeterPoint(end);
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (dx === 0 && dy === 0) {
      return Math.hypot(p.x - a.x, p.y - a.y);
    }

    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    const projectionX = a.x + t * dx;
    const projectionY = a.y + t * dy;
    return Math.hypot(p.x - projectionX, p.y - projectionY);
  }

  function simplifyCoordinatesForGoogle(routeCoordinates, toleranceMeters) {
    if (routeCoordinates.length <= 2) return routeCoordinates.slice();

    const keep = new Array(routeCoordinates.length).fill(false);
    keep[0] = true;
    keep[routeCoordinates.length - 1] = true;
    const stack = [[0, routeCoordinates.length - 1]];

    while (stack.length) {
      const [startIndex, endIndex] = stack.pop();
      let maxDistance = -1;
      let splitIndex = -1;

      for (let i = startIndex + 1; i < endIndex; i += 1) {
        const distance = pointLineDistanceMeters(
          routeCoordinates[i],
          routeCoordinates[startIndex],
          routeCoordinates[endIndex]
        );
        if (distance > maxDistance) {
          maxDistance = distance;
          splitIndex = i;
        }
      }

      if (maxDistance > toleranceMeters && splitIndex !== -1) {
        keep[splitIndex] = true;
        stack.push([startIndex, splitIndex], [splitIndex, endIndex]);
      }
    }

    return routeCoordinates.filter((_, index) => keep[index]);
  }

  function cumulativeDistances(routeCoordinates) {
    const distances = [0];
    for (let i = 1; i < routeCoordinates.length; i += 1) {
      distances.push(distances[i - 1] + distanceMeters(routeCoordinates[i - 1], routeCoordinates[i]));
    }
    return distances;
  }

  function buildGoogleWaypointCoordinates(routeCoordinates) {
    const simplified = simplifyCoordinatesForGoogle(routeCoordinates, GOOGLE_SIMPLIFY_TOLERANCE_METERS);
    if (simplified.length <= 2) {
      return [];
    }

    const cumDist = cumulativeDistances(simplified);
    const candidates = [];
    let lastAcceptedDistance = 0;

    for (let i = 1; i < simplified.length - 1; i += 1) {
      const angle = turnAngleDegrees(simplified[i - 1], simplified[i], simplified[i + 1]);
      const currentDistance = cumDist[i];
      const remainingDistance = cumDist[cumDist.length - 1] - currentDistance;

      if (
        angle >= GOOGLE_TURN_THRESHOLD_DEGREES &&
        currentDistance - lastAcceptedDistance >= GOOGLE_MIN_WAYPOINT_SPACING_METERS &&
        remainingDistance >= GOOGLE_MIN_WAYPOINT_SPACING_METERS
      ) {
        candidates.push({
          index: i,
          coord: simplified[i],
          score: angle,
          distance: currentDistance,
        });
        lastAcceptedDistance = currentDistance;
      }
    }

    let lastAnchorDistance = 0;
    for (let i = 1; i < simplified.length - 1; i += 1) {
      const currentDistance = cumDist[i];
      const remainingDistance = cumDist[cumDist.length - 1] - currentDistance;
      if (
        currentDistance - lastAnchorDistance >= GOOGLE_ANCHOR_SEGMENT_METERS &&
        remainingDistance >= GOOGLE_MIN_WAYPOINT_SPACING_METERS
      ) {
        candidates.push({
          index: i,
          coord: simplified[i],
          score: 18,
          distance: currentDistance,
        });
        lastAnchorDistance = currentDistance;
      }
    }

    const uniqueByIndex = new Map();
    candidates.forEach((candidate) => {
      const existing = uniqueByIndex.get(candidate.index);
      if (!existing || candidate.score > existing.score) {
        uniqueByIndex.set(candidate.index, candidate);
      }
    });

    return [...uniqueByIndex.values()]
      .sort((a, b) => b.score - a.score || a.distance - b.distance)
      .slice(0, GOOGLE_MAX_WAYPOINTS)
      .sort((a, b) => a.distance - b.distance)
      .map((candidate) => candidate.coord);
  }

  function buildGoogleMapsUrl(routeCoordinates) {
    if (!routeCoordinates || routeCoordinates.length < 2) return "";
    const origin = routeCoordinates[0];
    const destination = routeCoordinates[routeCoordinates.length - 1];
    const waypointCoords = buildGoogleWaypointCoordinates(routeCoordinates);
    const params = new URLSearchParams({
      api: "1",
      origin: coordToGoogleLatLon(origin),
      destination: coordToGoogleLatLon(destination),
      travelmode: "bicycling",
      dir_action: "navigate",
    });

    if (waypointCoords.length) {
      params.set("waypoints", waypointCoords.map(coordToGoogleLatLon).join("|"));
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`;
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
        nodes.push({
          coord,
          key,
          meterPoint: lonLatToMeterPoint(coord),
          routeKeys: new Set(),
        });
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
            nodes[aIndex].routeKeys.add(route.title);
            nodes[bIndex].routeKeys.add(route.title);
            addEdge(aIndex, bIndex, distanceMeters(a, b));
          }
        });
      });
    });

    state.graphNodes = nodes;
    state.adjacency = adjacency;
    addNearbyConnections();
    labelComponents();
  }

  function lonLatToMeterPoint(coord) {
    return {
      x: coord[0] * METERS_PER_DEG_LON,
      y: coord[1] * METERS_PER_DEG_LAT,
    };
  }

  function sharesRouteKey(a, b) {
    for (const key of a.routeKeys) {
      if (b.routeKeys.has(key)) return true;
    }
    return false;
  }

  function addNearbyConnections() {
    const buckets = new Map();
    const cellSize = NEAR_CONNECTION_METERS;

    function bucketKey(point) {
      return `${Math.floor(point.x / cellSize)},${Math.floor(point.y / cellSize)}`;
    }

    state.graphNodes.forEach((node, index) => {
      const key = bucketKey(node.meterPoint);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(index);
    });

    const seenPairs = new Set();

    state.graphNodes.forEach((node, index) => {
      const cellX = Math.floor(node.meterPoint.x / cellSize);
      const cellY = Math.floor(node.meterPoint.y / cellSize);

      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          const neighborKey = `${cellX + dx},${cellY + dy}`;
          const neighborIndices = buckets.get(neighborKey);
          if (!neighborIndices) continue;

          neighborIndices.forEach((otherIndex) => {
            if (otherIndex <= index) return;

            const pairKey = `${index}:${otherIndex}`;
            if (seenPairs.has(pairKey)) return;
            seenPairs.add(pairKey);

            const otherNode = state.graphNodes[otherIndex];
            if (sharesRouteKey(node, otherNode)) return;

            const distance = distanceMeters(node.coord, otherNode.coord);
            if (distance > NEAR_CONNECTION_METERS) return;

            state.adjacency[index].push({ to: otherIndex, weight: distance });
            state.adjacency[otherIndex].push({ to: index, weight: distance });
          });
        }
      }
    });
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

  function getZoomTransform() {
    return d3.zoomIdentity
      .translate(state.zoomTransform.x, state.zoomTransform.y)
      .scale(state.zoomTransform.k);
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
        zoomTransform: state.zoomTransform,
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
      const nextZoom = parsed.zoomTransform;
      if (nextZoom && Number.isFinite(nextZoom.k) && Number.isFinite(nextZoom.x) && Number.isFinite(nextZoom.y)) {
        state.zoomTransform = nextZoom;
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
      plannerStatusNote.textContent = `点击地图任意位置即可添加途经点。系统会自动吸附到最近的 PCN 节点，并把 ${NEAR_CONNECTION_METERS} 米内的近接点视作可连通。`;
    } else if (state.waypoints.length === 1) {
      plannerStatusTitle.textContent = "已选 1 个点";
      plannerStatusChip.textContent = "再选一个点开始规划";
      plannerStatusNote.textContent = `当前点吸附到最近 PCN 的距离约为 ${state.waypoints[0].snapDistance.toFixed(0)} 米，落在连通块 ${state.waypoints[0].componentSize} 节点范围内。`;
    } else if (!state.pathCoordinates.length) {
      plannerStatusTitle.textContent = "部分点无法连通";
      plannerStatusChip.textContent = "当前途经点之间未找到完整路径";
      const brokenSegment = state.segmentSummaries.find((segment) => !segment.connected);
      plannerStatusNote.textContent = brokenSegment
        ? `${brokenSegment.from} 和 ${brokenSegment.to} 即使按 ${NEAR_CONNECTION_METERS} 米近接规则补连后，当前公开 PCN 数据里仍不能连通。`
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

    state.googleMapsUrl = state.pathCoordinates.length ? buildGoogleMapsUrl(state.pathCoordinates) : "";
    googleMapsLinkPreview.value = state.googleMapsUrl;
    if (!state.googleMapsUrl) {
      googleLinkNote.textContent = "生成连通路线后，这里会出现可直接打开的 Google Maps 骑行链接。";
    } else {
      const waypointCount = new URL(state.googleMapsUrl).searchParams.get("waypoints")?.split("|").filter(Boolean).length || 0;
      googleLinkNote.textContent = `当前链接已保留起点、终点和 ${waypointCount} 个关键转折点，用于让 Google Maps 尽量贴近这条 PCN 路线。`;
    }

    undoButton.disabled = state.waypoints.length === 0;
    clearButton.disabled = state.waypoints.length === 0;
    exportButton.disabled = state.pathCoordinates.length === 0;
    exportTargetButton.disabled = state.targetPathCoordinates.length === 0;
    openGoogleMapsButton.disabled = !state.googleMapsUrl;
    copyGoogleMapsLinkButton.disabled = !state.googleMapsUrl;
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

  function pointerToLonLat(event) {
    const [x, y] = d3.pointer(event, svg.node());
    const zoomTransform = d3.zoomTransform(svg.node());
    const localPoint = zoomTransform.invert([x, y]);
    return state.projection.invert(localPoint);
  }

  function zoomBy(factor) {
    if (!svg || !zoomBehavior) return;
    svg.transition().duration(180).call(zoomBehavior.scaleBy, factor);
  }

  function resetZoom() {
    if (!svg || !zoomBehavior) return;
    svg.transition().duration(180).call(zoomBehavior.transform, d3.zoomIdentity);
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

    viewportGroup = svg.append("g");
    baseGroup = viewportGroup.append("g");
    networkGroup = viewportGroup.append("g");
    overlayGroup = viewportGroup.append("g");

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

    zoomBehavior = d3.zoom()
      .scaleExtent([1, 12])
      .translateExtent([[-width, -height], [width * 2, height * 2]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        viewportGroup.attr("transform", event.transform);
        state.zoomTransform = { k: event.transform.k, x: event.transform.x, y: event.transform.y };
        persistState();
      });

    svg.call(zoomBehavior)
      .call(zoomBehavior.transform, getZoomTransform());

    svg.on("dblclick.zoom", null);

    svg.on("click", (event) => {
      if (event.defaultPrevented) return;
      const lonLat = pointerToLonLat(event);
      if (!lonLat) return;
      addWaypoint(lonLat);
    });

    svg.on("mousemove", (event) => {
      const lonLat = pointerToLonLat(event);
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

  function openGoogleMaps() {
    if (!state.googleMapsUrl) return;
    window.open(state.googleMapsUrl, "_blank", "noopener,noreferrer");
    googleLinkNote.textContent = "Google Maps 链接已在新标签页打开。";
  }

  async function copyGoogleMapsLink() {
    if (!state.googleMapsUrl) return;
    try {
      await navigator.clipboard.writeText(state.googleMapsUrl);
      googleLinkNote.textContent = "Google Maps 链接已复制到剪贴板。";
    } catch (error) {
      console.error(error);
      googleLinkNote.textContent = "复制失败了，但下方预览框里仍然有完整链接。";
    }
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
  openGoogleMapsButton.addEventListener("click", openGoogleMaps);
  copyGoogleMapsLinkButton.addEventListener("click", copyGoogleMapsLink);
  zoomInButton.addEventListener("click", () => zoomBy(1.35));
  zoomOutButton.addEventListener("click", () => zoomBy(1 / 1.35));
  zoomResetButton.addEventListener("click", resetZoom);
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
