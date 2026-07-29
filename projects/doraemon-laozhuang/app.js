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

  const inward = document.querySelector("#inward-slider");
  if (inward) {
    const value = document.querySelector("#inward-value");
    const answer = document.querySelector("#inward-answer");
    const outer = document.querySelector(".inward-scale .outer");
    const inner = document.querySelector(".inward-scale .inner");
    const update = () => {
      const level = Number(inward.value);
      value.textContent = level < 45 ? "向外" : level > 55 ? "向内" : "居中";
      outer.style.opacity = String(1.15 - level / 100);
      inner.style.opacity = String(.25 + level / 100);
      outer.style.transform = `scale(${1.06 - level / 900})`;
      inner.style.transform = `scale(${.94 + level / 900})`;
      answer.textContent = level < 40
        ? "你正在用收入、职位、名次与关注来确认自己。尺子在别人手里。"
        : level < 62
          ? "比较仍然存在，但你开始问：我真正想要什么？"
          : "你把注意力放回认知、习惯、价值与作品。尺子回到了自己手里。";
    };
    inward.addEventListener("input", update);
    update();
  }
})();
