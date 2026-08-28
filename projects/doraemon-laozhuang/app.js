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

  const englishToggle = document.querySelector("#english-toggle");
  if (englishToggle) {
    const label = englishToggle.querySelector(".language-toggle-label");
    englishToggle.addEventListener("click", () => {
      const showing = englishToggle.getAttribute("aria-pressed") === "true";
      englishToggle.setAttribute("aria-pressed", String(!showing));
      document.body.classList.toggle("english-hidden", showing);
      label.textContent = showing ? "英文说明：关闭" : "英文说明：显示";
    });
  }

  const bambooGrid = document.querySelector("#bamboo-slip-grid");
  if (bambooGrid) {
    const pageSize = 20;
    const slips = [...bambooGrid.querySelectorAll(".bamboo-slip")];
    const pagination = document.querySelector("#bamboo-pagination");
    const previous = document.querySelector("#bamboo-prev");
    const next = document.querySelector("#bamboo-next");
    const status = document.querySelector("#bamboo-page-status");
    const pageCount = Math.ceil(slips.length / pageSize);
    let page = 0;
    const renderBambooPage = () => {
      const first = page * pageSize;
      slips.forEach((slip, index) => {
        slip.hidden = index < first || index >= first + pageSize;
      });
      if (pageCount > 1) {
        pagination.hidden = false;
        previous.disabled = page === 0;
        next.disabled = page === pageCount - 1;
        status.textContent = `${page + 1} / ${pageCount}`;
      }
    };
    previous.addEventListener("click", () => {
      if (page > 0) {
        page -= 1;
        renderBambooPage();
        bambooGrid.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
    next.addEventListener("click", () => {
      if (page < pageCount - 1) {
        page += 1;
        renderBambooPage();
        bambooGrid.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
    renderBambooPage();
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

  const information = document.querySelector("#information-slider");
  if (information) {
    const lab = document.querySelector("#model-lab");
    const cloud = document.querySelector("#information-cloud");
    const abstractButton = document.querySelector("#abstract-button");
    const labels = ["新闻","论文","案例","访谈","观点 A","观点 B","反例","新理论","数据","图表","短视频","评论","报告","综述","博客","播客","知乎","Reddit","小红书","AI 回答","统计","假设","方法","样本","结论","争议","引用","趋势","异常","补充材料"];
    labels.forEach((label,index) => {
      const item = document.createElement("span");
      item.textContent = label;
      item.style.left = `${5 + (index * 37 % 84)}%`;
      item.style.top = `${4 + (index * 53 % 82)}%`;
      item.style.transform = `rotate(${(index * 29 % 17) - 8}deg)`;
      cloud.appendChild(item);
    });
    const update = () => {
      const count = Number(information.value);
      const abstracted = lab.classList.contains("is-abstract");
      document.querySelector("#information-value").textContent = `${count} 条`;
      [...cloud.children].forEach((item,index) => item.style.display = index < count ? "block" : "none");
      const informationScore = Math.round(count / 30 * 100);
      const rawUnderstanding = count <= 9 ? 22 + count * 4.5 : Math.max(27, 66 - (count - 9) * 1.85);
      const understandingScore = Math.round(abstracted ? Math.min(96, 58 + count * 1.15) : rawUnderstanding);
      document.querySelector("#information-bar").style.width = `${informationScore}%`;
      document.querySelector("#understanding-bar").style.width = `${understandingScore}%`;
      document.querySelector("#information-score").textContent = informationScore;
      document.querySelector("#understanding-score").textContent = understandingScore;
      document.querySelector("#model-answer").textContent = abstracted
        ? "资料没有减少，但它们现在进入了同一个结构：你开始看见可以推演的规律。"
        : count < 9
          ? "资料仍少，你正在建立问题的轮廓。"
          : count < 18
            ? "你已经收集了不少材料；它们仍然各说各话。"
            : "信息继续增加，关系却被噪音盖住了。再搜一条，未必更接近答案。";
    };
    information.addEventListener("input", update);
    abstractButton.addEventListener("click", () => {
      const active = !lab.classList.contains("is-abstract");
      lab.classList.toggle("is-abstract", active);
      abstractButton.setAttribute("aria-pressed", String(active));
      abstractButton.firstChild.textContent = active ? "拆回具体资料 " : "抽象成一个模型 ";
      update();
    });
    update();
  }
})();
