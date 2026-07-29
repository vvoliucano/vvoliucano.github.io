(() => {
  "use strict";
  const progress = document.querySelector(".reading-progress");
  if (progress) {
    const updateProgress = () => {
      const range = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${range > 0 ? scrollY / range * 100 : 0}%`;
    };
    addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  const reveals = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: .12 });
    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add("is-visible"));
  }

  const slider = document.querySelector("#control-slider");
  if (slider) {
    const value = document.querySelector("#control-value");
    const result = document.querySelector("#control-result");
    const bars = [...document.querySelectorAll(".rule-stack i")];
    const update = () => {
      const level = Number(slider.value);
      value.textContent = `${level}%`;
      bars.forEach((bar, index) => {
        const threshold = (index + 1) * 10;
        bar.style.opacity = level >= threshold ? "1" : ".1";
        bar.style.transform = `scaleX(${level >= threshold ? .45 + level / 180 : .2})`;
      });
      result.textContent = level < 35
        ? "规则太少，方向会模糊；先把目标说清楚。"
        : level < 68
          ? "目标清楚，留有余地：人开始主动负责。"
          : "规则变成了工作本身：人开始优化检查，而不再优化真正的目标。";
    };
    slider.addEventListener("input", update);
    update();
  }
})();
