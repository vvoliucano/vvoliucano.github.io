(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const PI = Math.PI;

  function prepareCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(240, Math.round(rect.height));
    if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
    }
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    return { context, width, height };
  }

  function polygonPath(context, centerX, centerY, radius, sides) {
    context.beginPath();
    for (let index = 0; index < sides; index += 1) {
      const angle = -PI / 2 + index * PI * 2 / sides;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
  }

  function initCut() {
    const canvas = $("#cut-canvas");
    const slider = $("#cut-slider");
    const draw = () => {
      const level = Number(slider.value);
      const sides = 6 * Math.pow(2, level);
      const { context, width, height } = prepareCanvas(canvas);
      const radius = Math.min(width, height) * .37;
      const centerX = width / 2;
      const centerY = height / 2;

      context.fillStyle = "rgba(169,56,45,.1)";
      context.beginPath(); context.arc(centerX, centerY, radius, 0, PI * 2); context.fill();
      polygonPath(context, centerX, centerY, radius, sides);
      context.fillStyle = "rgba(23,35,43,.88)"; context.fill();
      context.strokeStyle = "#a9382d"; context.lineWidth = sides < 50 ? 1.6 : 1; context.stroke();
      context.beginPath(); context.arc(centerX, centerY, radius, 0, PI * 2);
      context.strokeStyle = "rgba(199,149,71,.9)"; context.lineWidth = 1.4; context.stroke();

      if (sides <= 48) {
        context.strokeStyle = "rgba(241,237,226,.18)"; context.lineWidth = 1;
        for (let index = 0; index < sides; index += 1) {
          const angle = -PI / 2 + index * PI * 2 / sides;
          context.beginPath(); context.moveTo(centerX, centerY); context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius); context.stroke();
        }
      }
      context.fillStyle = "#efc77e"; context.font = "20px Ouyang, serif"; context.textAlign = "center"; context.fillText(`${sides} 觚`, centerX, centerY + 7);

      const piApproximation = sides * Math.sin(PI / sides);
      const polygonArea = sides / 2 * Math.sin(PI * 2 / sides);
      const uncovered = (PI - polygonArea) / PI * 100;
      $("#cut-sides").textContent = sides.toLocaleString("zh-CN");
      $("#cut-pi").textContent = piApproximation.toFixed(6);
      $("#cut-gap").textContent = `${uncovered.toFixed(level > 5 ? 5 : 3)}%`;
    };
    slider.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw();
  }

  function initApproach() {
    const slider = $("#approach-slider");
    const axisMin = 3;
    const axisMax = 6 * Math.tan(PI / 6);
    const initialWidth = axisMax - axisMin;
    const position = (value) => clamp((value - axisMin) / (axisMax - axisMin) * 100, 0, 100);
    const update = () => {
      const level = Number(slider.value);
      const sides = 6 * Math.pow(2, level);
      const lower = sides * Math.sin(PI / sides);
      const upper = sides * Math.tan(PI / sides);
      const interval = upper - lower;
      $("#lower-marker").style.left = `${position(lower)}%`;
      $("#upper-marker").style.left = `${position(upper)}%`;
      $("#lower-value").textContent = lower.toFixed(7);
      $("#upper-value").textContent = upper.toFixed(7);
      $("#interval-value").textContent = interval.toExponential(level > 5 ? 2 : 3);
      $("#error-bar").style.transform = `scaleX(${Math.max(interval / initialWidth, .0015)})`;
      $("#approach-discovery").textContent = level < 3 ? `正 ${sides} 边形：π 仍被一段可见区间夹住。` : level < 7 ? `边数增至 ${sides}：区间缩短到初始的 ${(interval / initialWidth * 100).toFixed(2)}%。` : `区间只剩 ${interval.toExponential(2)}：目标没有移动，误差正在消失。`;
    };
    slider.addEventListener("input", update);
    update();
  }

  function initAccumulate() {
    const canvas = $("#accumulate-canvas");
    const slider = $("#slice-slider");
    const draw = () => {
      const slices = Number(slider.value);
      const { context, width, height } = prepareCanvas(canvas);
      const mobile = width < 560;
      const centerX = mobile ? width / 2 : width * .29;
      const centerY = mobile ? height * .3 : height * .5;
      const radius = Math.min(mobile ? width * .28 : width * .2, mobile ? height * .24 : height * .36);
      const visualSlices = Math.min(slices, 48);
      const bandHeight = radius * 2 / visualSlices;

      context.fillStyle = "rgba(255,255,255,.18)"; context.fillRect(0, 0, width, height);
      context.save();
      context.beginPath(); context.arc(centerX, centerY, radius, 0, PI * 2); context.clip();
      for (let index = 0; index < visualSlices; index += 1) {
        const normalizedY = -1 + (index + .5) * 2 / visualSlices;
        const halfWidth = radius * Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY));
        context.fillStyle = index % 2 ? "rgba(67,108,120,.42)" : "rgba(169,56,45,.32)";
        context.fillRect(centerX - halfWidth, centerY - radius + index * bandHeight, halfWidth * 2, Math.max(1, bandHeight - .4));
      }
      context.restore();
      context.beginPath(); context.arc(centerX, centerY, radius, 0, PI * 2); context.strokeStyle = "#263b44"; context.lineWidth = 1.3; context.stroke();
      context.strokeStyle = "rgba(23,35,43,.24)"; context.setLineDash([4, 5]); context.beginPath(); context.moveTo(centerX - radius - 14, centerY); context.lineTo(centerX + radius + 14, centerY); context.stroke(); context.setLineDash([]);
      context.fillStyle = "#5f6e72"; context.font = "12px Songti SC, serif"; context.textAlign = "center"; context.fillText("球体横截", centerX, centerY + radius + 28);

      const stackX = mobile ? width / 2 : width * .75;
      const stackBaseY = mobile ? height * .87 : height * .78;
      const stackRadius = mobile ? radius * .72 : radius * .9;
      const stackHeight = mobile ? height * .29 : height * .58;
      const layerGap = stackHeight / visualSlices;
      for (let index = visualSlices - 1; index >= 0; index -= 1) {
        const normalizedY = -1 + (index + .5) * 2 / visualSlices;
        const diskRadius = stackRadius * Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY));
        const y = stackBaseY - index * layerGap;
        context.beginPath(); context.ellipse(stackX, y, diskRadius, Math.max(1.2, layerGap * .38), 0, 0, PI * 2);
        context.fillStyle = index % 2 ? "rgba(67,108,120,.3)" : "rgba(169,56,45,.27)"; context.fill();
        context.strokeStyle = index % 2 ? "rgba(67,108,120,.55)" : "rgba(169,56,45,.5)"; context.lineWidth = .7; context.stroke();
      }
      context.fillStyle = "#5f6e72"; context.fillText(slices > visualSlices ? `薄片累积 · 示意 ${visualSlices}/${slices} 层` : "薄片累积", stackX, stackBaseY + 30);

      const thickness = 2 / slices;
      let approximation = 0;
      for (let index = 0; index < slices; index += 1) {
        const z = -1 + (index + .5) * thickness;
        approximation += PI * (1 - z * z) * thickness;
      }
      const exact = 4 * PI / 3;
      const error = Math.abs(approximation - exact) / exact * 100;
      $("#slice-count").textContent = String(slices);
      $("#slice-thickness").textContent = `${thickness.toFixed(4)} r`;
      $("#volume-value").textContent = approximation.toFixed(5);
      $("#volume-error").textContent = `${error.toFixed(3)}%`;
    };
    slider.addEventListener("input", draw);
    window.addEventListener("resize", draw);
    draw();
  }

  function initMerge() {
    const slider = $("#merge-slider");
    const update = () => {
      const value = Number(slider.value);
      $("#modern-layer").style.clipPath = `inset(0 0 0 ${100 - value}%)`;
      $("#merge-seam").style.left = `${value}%`;
    };
    slider.addEventListener("input", update);
    update();
  }

  function initAutoGuides() {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const running = new Map();
    const cancel = (slider) => {
      const frame = running.get(slider);
      if (frame) cancelAnimationFrame(frame);
      running.delete(slider);
      slider.dataset.guided = "true";
    };
    const guide = (slider) => {
      if (slider.dataset.guided === "true") return;
      const min = Number(slider.min); const max = Number(slider.max); const origin = Number(slider.value);
      const target = min + (max - min) * .72; const start = performance.now(); const outward = 5200; const hold = 800; const returning = 2600;
      const tick = (now) => {
        const elapsed = now - start; let value;
        if (elapsed <= outward) { const p = elapsed / outward; value = origin + (target - origin) * (.5 - Math.cos(PI * p) / 2); }
        else if (elapsed <= outward + hold) value = target;
        else { const p = clamp((elapsed - outward - hold) / returning, 0, 1); value = target + (origin - target) * (.5 - Math.cos(PI * p) / 2); }
        slider.value = String(value); slider.dispatchEvent(new Event("input", { bubbles:true }));
        if (elapsed < outward + hold + returning) running.set(slider, requestAnimationFrame(tick));
        else { slider.value = String(origin); slider.dispatchEvent(new Event("input", { bubbles:true })); cancel(slider); }
      };
      running.set(slider, requestAnimationFrame(tick));
    };
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const slider = entry.target.querySelector(".timeline");
      if (slider) window.setTimeout(() => guide(slider), 650);
      observer.unobserve(entry.target);
    }), { threshold:.4 });
    $$(".chapter").forEach((chapter) => observer.observe(chapter));
    $$(".timeline").forEach((slider) => {
      ["pointerdown","touchstart","keydown"].forEach((eventName) => slider.addEventListener(eventName, () => cancel(slider), { passive:true }));
      slider.addEventListener("input", (event) => { if (event.isTrusted) cancel(slider); });
    });
  }

  initCut();
  initApproach();
  initAccumulate();
  initMerge();
  initAutoGuides();
})();
