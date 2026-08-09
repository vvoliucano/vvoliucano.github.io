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
  const COORD_MERGE_EPSILON_METERS = 1;
  const GOOGLE_MAX_WAYPOINTS = 9;
  const DEBUG_SESSION_ID = "pcn-false-disconnect";
  const DEBUG_SERVER_URL = "http://127.0.0.1:7777/event";
  const ROUTE_LABELS = {
    "Western Adventure Loop": "西部探游环线",
    "Southern Ridges Loop": "南部山脊环线",
    "Round Island Route": "环岛路线",
    "Rail Corridor": "铁道走廊线",
    "Northern Explorer Loop": "北部探索环线",
    "North Eastern Riverine Loop": "东北河岸环线",
    "Eastern Corridor": "东部走廊线",
    "Eastern Coastal Loop": "东部海岸环线",
    "Coast To Coast Trail": "跨岛步道",
    "Central Urban Loop": "中部城市环线",
  };

  const state = {
    baseFeatures: [],
    routes: [],
    graphNodes: [],
    graphSegments: [],
    topologyNodeIndices: [],
    adjacency: [],
    edgeMetaByPair: new Map(),
    componentIds: [],
    componentSizes: [],
    projection: null,
    waypoints: [],
    pathSegments: [],
    pathCoordinates: [],
    segmentSummaries: [],
    routeUsage: [],
    totalDistance: 0,
    hoveredRoute: null,
    zoomTransform: { k: 1, x: 0, y: 0 },
    googleMapsUrl: "",
  };

  const container = document.querySelector("#map-container");
  const tooltip = document.querySelector("#map-tooltip");
  const plannerInlineNote = document.querySelector("#planner-inline-note");
  const plannerSummary = document.querySelector("#planner-summary");
  const plannerExportNote = document.querySelector("#planner-export-note");
  const plannerRouteBreakdown = document.querySelector("#planner-route-breakdown");
  const undoButton = document.querySelector("#undo-waypoint");
  const clearButton = document.querySelector("#clear-waypoints");
  const exportButton = document.querySelector("#export-gpx");
  const copyGpxButton = document.querySelector("#copy-gpx");
  const openGoogleMapsButton = document.querySelector("#open-google-maps");
  const copyGoogleMapsLinkButton = document.querySelector("#copy-google-maps-link");
  const zoomInButton = document.querySelector("#zoom-in");
  const zoomOutButton = document.querySelector("#zoom-out");
  const zoomResetButton = document.querySelector("#zoom-reset");
  const connectivityModal = document.querySelector("#connectivity-modal");
  const connectivityModalMessage = document.querySelector("#connectivity-modal-message");
  const connectivityModalClose = document.querySelector("#connectivity-modal-close");

  let svg;
  let viewportGroup;
  let baseGroup;
  let networkGroup;
  let overlayGroup;
  let zoomBehavior;
  let resizeFrame = null;
  let debugRunId = "post-fix";

  // #region debug-point A-E:reporting
  function reportDebug(hypothesisId, location, msg, data = {}) {
    fetch(DEBUG_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: debugRunId,
        hypothesisId,
        location,
        msg: `[DEBUG] ${msg}`,
        data,
        ts: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

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

  function coordToGoogleLatLon(coord) {
    return `${coord[1].toFixed(6)},${coord[0].toFixed(6)}`;
  }

  function formatRouteLabel(title) {
    return ROUTE_LABELS[title] || title;
  }

  function pairKey(aIndex, bIndex) {
    return aIndex < bIndex ? `${aIndex}:${bIndex}` : `${bIndex}:${aIndex}`;
  }

  function uniqueNeighborIndices(adjacency, nodeIndex) {
    return [...new Set(adjacency[nodeIndex].map((edge) => edge.to))];
  }

  function lerpCoord(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];
  }

  function meterDistanceBetweenPoints(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function projectPointOntoSegment(pointCoord, startCoord, endCoord) {
    const p = lonLatToMeterPoint(pointCoord);
    const a = lonLatToMeterPoint(startCoord);
    const b = lonLatToMeterPoint(endCoord);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      return {
        t: 0,
        coord: startCoord.slice(),
        distance: meterDistanceBetweenPoints(p, a),
      };
    }

    const rawT = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
    const t = Math.max(0, Math.min(1, rawT));
    const projectionMeter = {
      x: a.x + t * dx,
      y: a.y + t * dy,
    };

    return {
      t,
      coord: lerpCoord(startCoord, endCoord, t),
      distance: meterDistanceBetweenPoints(p, projectionMeter),
    };
  }

  function buildGoogleMapsUrlFromWaypoints(waypointCoordinates) {
    if (!waypointCoordinates || waypointCoordinates.length < 2) return "";
    const origin = waypointCoordinates[0];
    const destination = waypointCoordinates[waypointCoordinates.length - 1];
    const intermediate = waypointCoordinates.slice(1, -1);
    const stride = intermediate.length > GOOGLE_MAX_WAYPOINTS
      ? intermediate.length / GOOGLE_MAX_WAYPOINTS
      : 1;
    const waypointCoords = intermediate.length > GOOGLE_MAX_WAYPOINTS
      ? Array.from({ length: GOOGLE_MAX_WAYPOINTS }, (_, index) => intermediate[Math.floor(index * stride)])
      : intermediate;
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

  function computeComponents(adjacency) {
    const componentIds = new Array(adjacency.length).fill(-1);
    const componentSizes = [];
    let componentId = 0;

    for (let i = 0; i < adjacency.length; i += 1) {
      if (componentIds[i] !== -1) continue;

      const queue = [i];
      componentIds[i] = componentId;
      let size = 0;

      for (let head = 0; head < queue.length; head += 1) {
        const node = queue[head];
        size += 1;
        adjacency[node].forEach((edge) => {
          if (componentIds[edge.to] !== -1) return;
          componentIds[edge.to] = componentId;
          queue.push(edge.to);
        });
      }

      componentSizes[componentId] = size;
      componentId += 1;
    }

    return { componentIds, componentSizes };
  }

  function collectTopologyNodeIndices(nodes, adjacency, baseComponentIds) {
    const topologySet = new Set();
    const firstNodeByComponent = new Map();
    let endpointCount = 0;
    let junctionCount = 0;
    let cycleRepresentativeCount = 0;

    nodes.forEach((_, index) => {
      const componentId = baseComponentIds[index];
      if (!firstNodeByComponent.has(componentId)) {
        firstNodeByComponent.set(componentId, index);
      }

      const degree = uniqueNeighborIndices(adjacency, index).length;
      if (degree === 1) endpointCount += 1;
      if (degree > 2 || degree === 0) junctionCount += 1;
      if (degree !== 2) {
        topologySet.add(index);
      }
    });

    firstNodeByComponent.forEach((index, componentId) => {
      const hasTopologyNode = [...topologySet].some((nodeIndex) => baseComponentIds[nodeIndex] === componentId);
      if (!hasTopologyNode) {
        topologySet.add(index);
        cycleRepresentativeCount += 1;
      }
    });

    return {
      indices: [...topologySet],
      endpointCount,
      junctionCount,
      cycleRepresentativeCount,
    };
  }

  function buildGraph() {
    const nodes = [];
    const segments = [];
    const adjacency = [];
    const edgeMetaByPair = new Map();
    const nodeBuckets = new Map();
    const bucketSize = COORD_MERGE_EPSILON_METERS;

    function getNodeIndex(coord) {
      const meterPoint = lonLatToMeterPoint(coord);
      const cellX = Math.floor(meterPoint.x / bucketSize);
      const cellY = Math.floor(meterPoint.y / bucketSize);

      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          const bucketKey = `${cellX + dx},${cellY + dy}`;
          const candidateIndices = nodeBuckets.get(bucketKey);
          if (!candidateIndices) continue;

          for (const candidateIndex of candidateIndices) {
            if (meterDistanceBetweenPoints(meterPoint, nodes[candidateIndex].meterPoint) <= COORD_MERGE_EPSILON_METERS) {
              return candidateIndex;
            }
          }
        }
      }

      const index = nodes.length;
      const bucketKey = `${cellX},${cellY}`;
      nodes.push({
        coord: coord.slice(),
        key: nodeKey(coord[0], coord[1]),
        meterPoint,
        routeKeys: new Set(),
      });
      adjacency.push([]);
      if (!nodeBuckets.has(bucketKey)) nodeBuckets.set(bucketKey, []);
      nodeBuckets.get(bucketKey).push(index);
      return index;
    }

    function registerEdgeMeta(aIndex, bIndex, weight, routeTitle = null, connectionType = "route") {
      const key = pairKey(aIndex, bIndex);
      if (!edgeMetaByPair.has(key)) {
        edgeMetaByPair.set(key, {
          weight,
          routeTitles: new Set(),
          connectionType,
        });
      }
      const meta = edgeMetaByPair.get(key);
      if (weight < meta.weight) meta.weight = weight;
      if (routeTitle) {
        meta.routeTitles.add(routeTitle);
        meta.connectionType = "route";
      }
    }

    function addEdge(aIndex, bIndex, weight, routeTitle = null, connectionType = "route") {
      adjacency[aIndex].push({ to: bIndex, weight });
      adjacency[bIndex].push({ to: aIndex, weight });
      registerEdgeMeta(aIndex, bIndex, weight, routeTitle, connectionType);
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
            addEdge(aIndex, bIndex, distanceMeters(a, b), route.title, "route");
            segments.push({
              key: `${route.title}:${feature.id || "feature"}:${i}`,
              routeTitle: route.title,
              aIndex,
              bIndex,
              aCoord: a,
              bCoord: b,
            });
          }
        });
      });
    });

    state.graphNodes = nodes;
    state.graphSegments = segments;
    state.adjacency = adjacency;
    state.edgeMetaByPair = edgeMetaByPair;
    const baseComponents = computeComponents(state.adjacency);
    const topology = collectTopologyNodeIndices(
      state.graphNodes,
      state.adjacency,
      baseComponents.componentIds
    );
    state.topologyNodeIndices = topology.indices;
    addNearbyConnections(baseComponents.componentIds, topology.indices);
    labelComponents();
    // #region debug-point D:graph-summary
    reportDebug("D", "planner.js:buildGraph", "Built planner graph", {
      nodeCount: state.graphNodes.length,
      segmentCount: state.graphSegments.length,
      topologyNodeCount: topology.indices.length,
      topologyEndpointCount: topology.endpointCount,
      topologyJunctionCount: topology.junctionCount,
      topologyCycleRepresentativeCount: topology.cycleRepresentativeCount,
      baseComponentCount: baseComponents.componentSizes.length,
      componentCount: state.componentSizes.length,
      largestComponentSize: state.componentSizes.length ? Math.max(...state.componentSizes) : 0,
    });
    // #endregion
  }

  function lonLatToMeterPoint(coord) {
    return {
      x: coord[0] * METERS_PER_DEG_LON,
      y: coord[1] * METERS_PER_DEG_LAT,
    };
  }

  function addNearbyConnections(baseComponentIds = [], candidateNodeIndices = []) {
    const buckets = new Map();
    const cellSize = NEAR_CONNECTION_METERS;
    let nearConnectionCount = 0;
    let skippedSameBaseComponentCount = 0;
    const indices = candidateNodeIndices.length
      ? candidateNodeIndices
      : state.graphNodes.map((_, index) => index);

    function bucketKey(point) {
      return `${Math.floor(point.x / cellSize)},${Math.floor(point.y / cellSize)}`;
    }

    indices.forEach((index) => {
      const node = state.graphNodes[index];
      const key = bucketKey(node.meterPoint);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(index);
    });

    const seenPairs = new Set();

    indices.forEach((index) => {
      const node = state.graphNodes[index];
      const cellX = Math.floor(node.meterPoint.x / cellSize);
      const cellY = Math.floor(node.meterPoint.y / cellSize);

      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          const neighborKey = `${cellX + dx},${cellY + dy}`;
          const neighborIndices = buckets.get(neighborKey);
          if (!neighborIndices) continue;

          neighborIndices.forEach((otherIndex) => {
            if (otherIndex <= index) return;

            const seenKey = `${index}:${otherIndex}`;
            if (seenPairs.has(seenKey)) return;
            seenPairs.add(seenKey);

            if (baseComponentIds[index] === baseComponentIds[otherIndex]) {
              skippedSameBaseComponentCount += 1;
              return;
            }

            const otherNode = state.graphNodes[otherIndex];
            const distance = distanceMeters(node.coord, otherNode.coord);
            if (distance > NEAR_CONNECTION_METERS) return;

            state.adjacency[index].push({ to: otherIndex, weight: distance });
            state.adjacency[otherIndex].push({ to: index, weight: distance });
            nearConnectionCount += 1;
            const metaKey = pairKey(index, otherIndex);
            if (!state.edgeMetaByPair.has(metaKey)) {
              state.edgeMetaByPair.set(metaKey, {
                weight: distance,
                routeTitles: new Set(),
                connectionType: "near",
              });
            }
          });
        }
      }
    });

    // #region debug-point C:near-connection-summary
    reportDebug("C", "planner.js:addNearbyConnections", "Applied nearby node connections", {
      candidateNodeCount: indices.length,
      nearConnectionCount,
      skippedSameBaseComponentCount,
      thresholdMeters: NEAR_CONNECTION_METERS,
    });
    // #endregion
  }

  function labelComponents() {
    const { componentIds, componentSizes } = computeComponents(state.adjacency);
    state.componentIds = componentIds;
    state.componentSizes = componentSizes;
  }

  function nearestGraphSegment(lonLat) {
    let bestSegment = null;
    let bestDistance = Infinity;

    for (let i = 0; i < state.graphSegments.length; i += 1) {
      const candidate = state.graphSegments[i];
      const projection = projectPointOntoSegment(lonLat, candidate.aCoord, candidate.bCoord);
      if (projection.distance < bestDistance) {
        bestDistance = projection.distance;
        bestSegment = {
          ...candidate,
          snappedCoord: projection.coord,
          snappedDistance: projection.distance,
          distanceToA: distanceMeters(projection.coord, candidate.aCoord),
          distanceToB: distanceMeters(projection.coord, candidate.bCoord),
          t: projection.t,
        };
      }
    }

    return bestSegment;
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
      indices,
      coordinates: indices.map((index) => state.graphNodes[index].coord),
    };
  }

  function summarizeRouteUsage(pathNodeSegments, partialUsage = []) {
    const usage = new Map();

    pathNodeSegments.forEach((pathNodeIndices) => {
      for (let i = 0; i < pathNodeIndices.length - 1; i += 1) {
        const fromIndex = pathNodeIndices[i];
        const toIndex = pathNodeIndices[i + 1];
        const meta = state.edgeMetaByPair.get(pairKey(fromIndex, toIndex));
        if (!meta) continue;

        const routeTitle = meta.routeTitles.size
          ? [...meta.routeTitles][0]
          : "PCN 近接连接";
        usage.set(routeTitle, (usage.get(routeTitle) || 0) + meta.weight);
      }
    });

    partialUsage.forEach((item) => {
      if (!item || !item.routeTitle || !item.meters) return;
      usage.set(item.routeTitle, (usage.get(item.routeTitle) || 0) + item.meters);
    });

    return [...usage.entries()]
      .map(([title, meters]) => ({
        title,
        label: formatRouteLabel(title),
        meters,
      }))
      .sort((a, b) => b.meters - a.meters);
  }

  function buildGpx(routeSegments) {
    const segments = routeSegments
      .filter((segment) => Array.isArray(segment) && segment.length > 1)
      .map((segment) => {
        const trkpts = segment
          .map(([lon, lat]) => `      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"></trkpt>`)
          .join("\n");
        return `    <trkseg>\n${trkpts}\n    </trkseg>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Singapore PCN Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Singapore PCN Planned Route</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Singapore PCN Planned Route</name>
${segments}
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
        waypoints: state.waypoints.map((waypoint) => waypoint.original),
        pathCoordinates: state.pathCoordinates,
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
      const nextZoom = parsed.zoomTransform;
      if (nextZoom && Number.isFinite(nextZoom.k) && Number.isFinite(nextZoom.x) && Number.isFinite(nextZoom.y)) {
        state.zoomTransform = nextZoom;
      }
      if (!Array.isArray(parsed.waypoints) || !parsed.waypoints.length) {
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

  function updatePlannerInfo() {
    if (!state.waypoints.length) {
      plannerInlineNote.textContent = `点击地图任意位置即可添加途经点。系统会自动吸附到最近的 PCN 线段，并把 ${NEAR_CONNECTION_METERS} 米内的近接点视作可连通。`;
      plannerSummary.textContent = "还没有路线。点击地图开始选点。";
    } else if (state.waypoints.length === 1) {
      plannerInlineNote.textContent = `已选 1 个点，当前吸附距离约 ${state.waypoints[0].snapDistance.toFixed(0)} 米。`;
      plannerSummary.textContent = "再选一个点开始生成路线。";
    } else if (!state.pathSegments.length) {
      const brokenSegment = state.segmentSummaries.find((segment) => !segment.connected);
      plannerInlineNote.textContent = brokenSegment
        ? `${brokenSegment.from} 和 ${brokenSegment.to} 即使按 ${NEAR_CONNECTION_METERS} 米近接规则补连后，当前公开 PCN 数据里仍不能连通。`
        : "这通常表示两点分别落在当前公开 PCN 数据的不同连通分量中。";
      plannerSummary.textContent = "当前选点之间没有完整可导出的路线。";
    } else {
      const disconnectedCount = state.segmentSummaries.filter((segment) => !segment.connected).length;
      if (disconnectedCount) {
        plannerInlineNote.textContent = `有 ${disconnectedCount} 段未连通，已自动跳过；当前保留 ${state.pathSegments.length} 段连续路线，总长 ${formatKm(state.totalDistance)}。`;
        plannerSummary.textContent = "GPX 会导出已连上的全部连续段，Google 会按你当前的选点顺序直接计算。";
      } else {
        plannerInlineNote.textContent = `已生成 ${state.segmentSummaries.length} 段路线，总长 ${formatKm(state.totalDistance)}。`;
        plannerSummary.textContent = "可以直接导出 GPX，或者一键发送到 Google Maps。";
      }
    }

    state.googleMapsUrl = buildGoogleMapsUrlFromWaypoints(
      state.waypoints.map((waypoint) => waypoint.original)
    );
    if (state.googleMapsUrl) {
      const waypointCount = new URL(state.googleMapsUrl).searchParams.get("waypoints")?.split("|").filter(Boolean).length || 0;
      plannerExportNote.textContent = waypointCount
        ? `Google 链接会按你当前的选点顺序生成，保留了 ${waypointCount} 个中途点，其余路段交给 Google 自己计算。`
        : "Google 链接会按你当前的起终点生成，其余路线交给 Google 自己计算。";
    } else {
      plannerExportNote.textContent = "支持滚轮缩放、拖动平移，以及 100 米近接连通。";
    }

    if (!state.routeUsage.length) {
      plannerRouteBreakdown.innerHTML = '<li class="is-empty">还没有路线。生成路线后，这里会显示当前经过哪些 PCN 线路以及各自里程。</li>';
    } else {
      plannerRouteBreakdown.innerHTML = state.routeUsage.map((item) => `
        <li>
          <span>${item.label}</span>
          <strong>${formatKm(item.meters)}</strong>
        </li>
      `).join("");
    }

    undoButton.disabled = state.waypoints.length === 0;
    clearButton.disabled = state.waypoints.length === 0;
    exportButton.disabled = state.pathSegments.length === 0;
    copyGpxButton.disabled = state.pathSegments.length === 0;
    openGoogleMapsButton.disabled = state.waypoints.length < 2 || !state.googleMapsUrl;
    copyGoogleMapsLinkButton.disabled = state.waypoints.length < 2 || !state.googleMapsUrl;
  }

  function rebuildRoute(options = {}) {
    const showModal = options.showModal !== false;
    closeConnectivityModal();
    state.pathSegments = [];
    state.pathCoordinates = [];
    state.segmentSummaries = [];
    state.routeUsage = [];
    state.totalDistance = 0;

    if (state.waypoints.length < 2) {
      updatePlannerInfo();
      persistState();
      renderMap();
      return;
    }

    const fullPath = [];
    const fullPathNodeSegments = [];
    const partialUsage = [];
    const summaries = [];
    const pathSegments = [];
    const disconnectedMessages = [];
    let activePathCoords = [];
    let activePathNodeIndices = [];
    let totalDistance = 0;

    function flushActiveSegment() {
      if (activePathCoords.length > 1) {
        pathSegments.push(activePathCoords);
        fullPathNodeSegments.push(activePathNodeIndices);
      }
      activePathCoords = [];
      activePathNodeIndices = [];
    }

    for (let i = 0; i < state.waypoints.length - 1; i += 1) {
      const start = state.waypoints[i];
      const end = state.waypoints[i + 1];

      let result = null;
      let pathExtraUsage = [];

      if (start.segmentKey === end.segmentKey) {
        const directDistance = distanceMeters(start.snapped, end.snapped);
        result = {
          distance: directDistance,
          indices: [],
          coordinates: [start.snapped, end.snapped],
        };
        pathExtraUsage = [{
          routeTitle: start.routeTitle,
          meters: directDistance,
        }];
      } else {
        const combos = [
          {
            startNodeIndex: start.aIndex,
            endNodeIndex: end.aIndex,
            startExtra: start.distanceToA,
            endExtra: end.distanceToA,
          },
          {
            startNodeIndex: start.aIndex,
            endNodeIndex: end.bIndex,
            startExtra: start.distanceToA,
            endExtra: end.distanceToB,
          },
          {
            startNodeIndex: start.bIndex,
            endNodeIndex: end.aIndex,
            startExtra: start.distanceToB,
            endExtra: end.distanceToA,
          },
          {
            startNodeIndex: start.bIndex,
            endNodeIndex: end.bIndex,
            startExtra: start.distanceToB,
            endExtra: end.distanceToB,
          },
        ];

        let bestTotal = Infinity;

        combos.forEach((combo) => {
          const candidate = dijkstra(combo.startNodeIndex, combo.endNodeIndex);
          if (!candidate) return;
          const total = combo.startExtra + candidate.distance + combo.endExtra;
          if (total >= bestTotal) return;
          bestTotal = total;
          result = {
            distance: total,
            indices: candidate.indices,
            coordinates: candidate.coordinates,
          };
          pathExtraUsage = [
            { routeTitle: start.routeTitle, meters: combo.startExtra },
            { routeTitle: end.routeTitle, meters: combo.endExtra },
          ];
        });
      }

      if (!result) {
        // #region debug-point B:no-route-found
        reportDebug("B", "planner.js:rebuildRoute", "No route found between consecutive waypoints", {
          segmentIndex: i,
          startSegmentKey: start.segmentKey,
          endSegmentKey: end.segmentKey,
          startRouteTitle: start.routeTitle,
          endRouteTitle: end.routeTitle,
          startNodeOptions: [
            {
              index: start.aIndex,
              componentId: state.componentIds[start.aIndex],
              coord: start.aCoord,
            },
            {
              index: start.bIndex,
              componentId: state.componentIds[start.bIndex],
              coord: start.bCoord,
            },
          ],
          endNodeOptions: [
            {
              index: end.aIndex,
              componentId: state.componentIds[end.aIndex],
              coord: end.aCoord,
            },
            {
              index: end.bIndex,
              componentId: state.componentIds[end.bIndex],
              coord: end.bCoord,
            },
          ],
        });
        // #endregion
        const message = `${i + 1} 号点和 ${i + 2} 号点之间当前没有可计算的 PCN 路线。`;
        summaries.push({
          from: `点 ${i + 1}`,
          to: `点 ${i + 2}`,
          distance: 0,
          connected: false,
        });
        disconnectedMessages.push(message);
        flushActiveSegment();
        continue;
      }

      const segmentCoords = result.coordinates.slice();
      const segmentIndices = result.indices.slice();
      if (segmentCoords.length) {
        if (distanceMeters(segmentCoords[0], start.snapped) <= COORD_MERGE_EPSILON_METERS) {
          segmentCoords[0] = start.snapped;
        } else {
          segmentCoords.unshift(start.snapped);
        }
        if (distanceMeters(segmentCoords[segmentCoords.length - 1], end.snapped) <= COORD_MERGE_EPSILON_METERS) {
          segmentCoords[segmentCoords.length - 1] = end.snapped;
        } else {
          segmentCoords.push(end.snapped);
        }
      }
      if (activePathCoords.length && segmentCoords.length) segmentCoords.shift();
      if (activePathNodeIndices.length) segmentIndices.shift();
      activePathCoords.push(...segmentCoords);
      activePathNodeIndices.push(...segmentIndices);
      totalDistance += result.distance;
      partialUsage.push(...pathExtraUsage);
      summaries.push({
        from: `点 ${i + 1}`,
        to: `点 ${i + 2}`,
        distance: result.distance,
        connected: true,
      });
    }

    flushActiveSegment();
    pathSegments.forEach((segment) => {
      fullPath.push(...segment);
    });

    state.pathSegments = pathSegments;
    state.pathCoordinates = fullPath;
    state.segmentSummaries = summaries;
    state.totalDistance = totalDistance;
    state.routeUsage = summarizeRouteUsage(fullPathNodeSegments, partialUsage);
    updatePlannerInfo();
    persistState();
    renderMap();

    if (showModal && disconnectedMessages.length) {
      openConnectivityModal(`${disconnectedMessages[0]} 已自动跳过这段，其余已连通部分仍可继续导出。`);
    }
  }

  function createWaypoint(lonLat) {
    const snapped = nearestGraphSegment(lonLat);
    // #region debug-point A:waypoint-snap
    reportDebug("A", "planner.js:createWaypoint", "Snapped waypoint to segment", {
      original: lonLat,
      snapped: snapped.snappedCoord,
      routeTitle: snapped.routeTitle,
      segmentKey: snapped.key,
      aIndex: snapped.aIndex,
      bIndex: snapped.bIndex,
      distanceToSegmentMeters: Number(snapped.snappedDistance.toFixed(2)),
      distanceToA: Number(snapped.distanceToA.toFixed(2)),
      distanceToB: Number(snapped.distanceToB.toFixed(2)),
    });
    // #endregion
    return {
      original: lonLat,
      snapped: snapped.snappedCoord,
      snapDistance: snapped.snappedDistance,
      segmentKey: snapped.key,
      routeTitle: snapped.routeTitle,
      aIndex: snapped.aIndex,
      bIndex: snapped.bIndex,
      aCoord: snapped.aCoord,
      bCoord: snapped.bCoord,
      distanceToA: snapped.distanceToA,
      distanceToB: snapped.distanceToB,
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

    state.pathSegments.forEach((segment) => {
      if (segment.length < 2) return;
      overlayGroup.append("path")
        .datum({ type: "LineString", coordinates: segment })
        .attr("class", "planner-route")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ffe6a3")
        .attr("stroke-width", 5.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
    });

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
    if (!state.pathSegments.length) return;
    const blob = new Blob([buildGpx(state.pathSegments)], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "singapore-pcn-route.gpx";
    link.click();
    URL.revokeObjectURL(url);
    plannerSummary.textContent = state.pathSegments.length > 1
      ? `已开始下载 GPX，包含 ${state.pathSegments.length} 段已连通路线。`
      : "当前路线的 GPX 文件已开始下载。";
  }

  async function copyGpx() {
    if (!state.pathSegments.length) return;
    try {
      await navigator.clipboard.writeText(buildGpx(state.pathSegments));
      plannerSummary.textContent = state.pathSegments.length > 1
        ? `GPX 已复制到剪贴板，包含 ${state.pathSegments.length} 段已连通路线。`
        : "当前路线的 GPX 已复制到剪贴板。";
    } catch (error) {
      console.error(error);
      plannerSummary.textContent = "GPX 复制失败了，但仍然可以直接导出文件。";
    }
  }

  function openGoogleMaps() {
    if (!state.googleMapsUrl) return;
    window.open(state.googleMapsUrl, "_blank", "noopener,noreferrer");
    plannerSummary.textContent = "Google Maps 已按当前选点顺序在新标签页打开。";
  }

  async function copyGoogleMapsLink() {
    if (!state.googleMapsUrl) return;
    try {
      await navigator.clipboard.writeText(state.googleMapsUrl);
      plannerSummary.textContent = "Google Maps 链接已复制到剪贴板。";
    } catch (error) {
      console.error(error);
      plannerSummary.textContent = "Google 链接复制失败了，但仍然可以直接一键打开。";
    }
  }

  function showError(message) {
    container.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;color:#d9e7eb;text-align:center;">${message}</div>`;
    plannerInlineNote.textContent = "加载失败";
    plannerSummary.textContent = message;
    plannerExportNote.textContent = "请检查 pcn 目录中的 GeoJSON 文件是否存在。";
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
  copyGpxButton.addEventListener("click", copyGpx);
  openGoogleMapsButton.addEventListener("click", openGoogleMaps);
  copyGoogleMapsLinkButton.addEventListener("click", copyGoogleMapsLink);
  zoomInButton.addEventListener("click", () => zoomBy(1.35));
  zoomOutButton.addEventListener("click", () => zoomBy(1 / 1.35));
  zoomResetButton.addEventListener("click", resetZoom);
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
