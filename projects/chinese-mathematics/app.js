(function () {
  const steps = [
    {
      rows: [[2, 1, 5], [1, 3, 7]],
      tag: "置列",
      title: "把两条方程放进同一张表",
      note: "下方使用现代“方程占一行”的方向展示；《九章算术》的算板方向与此转置。",
      label: "增广数字表：第一行二、一、五；第二行一、三、七"
    },
    {
      rows: [[2, 1, 5], [0, 5, 9]],
      tag: "消元",
      title: "第二行乘二，再减去第一行",
      note: "2 ×（1，3｜7）−（2，1｜5）=（0，5｜9）",
      label: "消元后数字表：第一行二、一、五；第二行零、五、九"
    },
    {
      rows: [[2, 1, 5], [0, 1, "9/5"]],
      tag: "以法除之",
      title: "第二行同除以五，得到下禾",
      note: "下禾 = 9 ÷ 5 = 9/5 斗",
      label: "化简后数字表：第二行零、一、九分之五"
    },
    {
      rows: [[1, 0, "8/5"], [0, 1, "9/5"]],
      tag: "回代",
      title: "把下禾代回，得到上禾",
      note: "上禾 = 8/5 斗，下禾 = 9/5 斗。验算：2×8/5 + 9/5 = 5。",
      label: "最终数字表：上禾八分之五，下禾九分之五"
    }
  ];

  let current = 0;
  const lab = document.querySelector(".elimination-lab");
  const matrix = document.getElementById("matrix");
  const operation = document.getElementById("operation");
  const currentLabel = document.getElementById("step-current");
  const prev = document.getElementById("prev-step");
  const next = document.getElementById("next-step");
  const dots = Array.from(document.querySelectorAll(".step-dots i"));

  function renderStep() {
    const step = steps[current];
    matrix.innerHTML = step.rows.map(function (row, rowIndex) {
      return '<div class="matrix-row ' + (current > 0 && rowIndex === (current === 3 ? 0 : 1) ? 'changed' : '') + '">' +
        '<span>' + row[0] + '</span><span>' + row[1] + '</span><i></i><span>' + row[2] + '</span></div>';
    }).join("");
    matrix.setAttribute("aria-label", step.label);
    operation.innerHTML = '<small>' + step.tag + '</small><strong>' + step.title + '</strong><p>' + step.note + '</p>';
    currentLabel.textContent = String(current + 1).padStart(2, "0");
    prev.disabled = current === 0;
    next.innerHTML = current === steps.length - 1 ? '<span>再算一次</span> ↻' : '<span>下一算</span> →';
    dots.forEach(function (dot, index) { dot.classList.toggle("active", index === current); });
    lab.dataset.step = current;
  }

  prev.addEventListener("click", function () { if (current > 0) { current -= 1; renderStep(); } });
  next.addEventListener("click", function () { current = current === steps.length - 1 ? 0 : current + 1; renderStep(); });

  const slider = document.getElementById("yuan-slider");
  const yuanValue = document.getElementById("yuan-value");
  const field = document.getElementById("field-shape");
  const area = document.getElementById("field-area");
  const dimX = document.getElementById("dim-x");
  const dimY = document.getElementById("dim-y");

  function renderField() {
    const x = Number(slider.value);
    const value = x * (x + 1);
    yuanValue.textContent = x;
    area.textContent = value;
    dimX.textContent = "天元 = " + x;
    dimY.textContent = "天元 + 1 = " + (x + 1);
    field.style.width = (105 + x * 24) + "px";
    field.style.height = (125 + (x + 1) * 24) + "px";
    field.style.background = value === 12 ? "#56705b" : "#7a7258";
  }
  slider.addEventListener("input", renderField);

  const yuanCards = Array.from(document.querySelectorAll(".yuan-card"));
  const yuanFocus = document.getElementById("yuan-focus");
  const yuanDescription = document.getElementById("yuan-description");
  const marks = Array.from(document.querySelectorAll(".equation-large mark"));
  yuanCards.forEach(function (card) {
    card.addEventListener("click", function () {
      yuanCards.forEach(function (item) { item.classList.remove("active"); });
      card.classList.add("active");
      yuanFocus.textContent = card.dataset.yuan + "元 · " + card.dataset.symbol;
      yuanDescription.textContent = card.dataset.desc;
      marks.forEach(function (mark) {
        mark.classList.toggle("focus", mark.dataset.symbol === card.dataset.symbol || mark.textContent.indexOf(card.dataset.symbol) !== -1);
      });
    });
  });

  renderStep();
  renderField();
}());
