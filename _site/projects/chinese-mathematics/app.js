(function () {
  const isEnglish = document.documentElement.lang.toLowerCase().indexOf("en") === 0;
  const steps = isEnglish ? [
    { rows: [[2,1,5],[1,3,7]], tag: "Encode", title: "Place both equations in one table", note: "This modern transcription puts one equation in each row; the traditional counting-board arrangement is transposed.", label: "Augmented table: row one two, one, five; row two one, three, seven" },
    { rows: [[2,1,5],[0,5,9]], tag: "Eliminate", title: "Double row two, then subtract row one", note: "2 × (1, 3 | 7) − (2, 1 | 5) = (0, 5 | 9)", label: "After elimination: row two zero, five, nine" },
    { rows: [[2,1,5],[0,1,"9/5"]], tag: "Divide", title: "Divide row two by five", note: "y = 9 ÷ 5 = 9/5", label: "Normalized table: row two zero, one, nine fifths" },
    { rows: [[1,0,"8/5"],[0,1,"9/5"]], tag: "Back-substitute", title: "Substitute y back to obtain x", note: "x = 8/5, y = 9/5. Check: 2×8/5 + 9/5 = 5.", label: "Final table: x eight fifths, y nine fifths" }
  ] : [
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
    next.innerHTML = current === steps.length - 1 ? (isEnglish ? '<span>Run again</span> ↻' : '<span>再算一次</span> ↻') : (isEnglish ? '<span>Next operation</span> →' : '<span>下一算</span> →');
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
    dimX.textContent = (isEnglish ? "unknown = " : "天元 = ") + x;
    dimY.textContent = (isEnglish ? "unknown + 1 = " : "天元 + 1 = ") + (x + 1);
    field.style.width = (105 + x * 24) + "px";
    field.style.height = (125 + (x + 1) * 24) + "px";
    field.style.background = value === 12 ? "#56705b" : "#7a7258";
  }
  slider.addEventListener("input", renderField);

  const yuanCards = Array.from(document.querySelectorAll(".yuan-card"));
  const yuanFocus = document.getElementById("yuan-focus");
  const yuanDescription = document.getElementById("yuan-description");
  yuanCards.forEach(function (card) {
    card.addEventListener("click", function () {
      yuanCards.forEach(function (item) { item.classList.remove("active"); });
      card.classList.add("active");
      yuanFocus.textContent = card.dataset.yuan + "元 · " + card.dataset.symbol;
      yuanDescription.textContent = card.dataset.desc;
    });
  });

  const fourSteps = isEnglish ? [
    { kicker:"Step 1 · Set four unknowns", title:"Translate the problem into four relations", formulas:["x² + y² = z²","y · five differences = z² + xz","five sums / x = y² − (z − x)","u = x + y + z + (x + y − z)"], explanation:"The first three relations determine the legs and hypotenuse; the fourth records u, the total requested by the problem.", eliminated:[] },
    { kicker:"Step 2 · Expand the classical terms", title:"Reduce the five sums and differences", formulas:["five differences = 2z","five sums = 2x + 4y + 4z","u = 2x + 2y"], explanation:"Adding the five named differences and sums reduces them to compact expressions. Since d = x + y − z, the requested total is u = 2x + 2y.", eliminated:["u"] },
    { kicker:"Step 3 · Eliminate z", title:"Solve the first condition for the hypotenuse", formulas:["2yz = z² + xz","z(2y − z − x) = 0","z = 2y − x"], explanation:"Because z is a positive length, divide by z. Every later occurrence of z can now be replaced by 2y − x.", eliminated:["u","z"] },
    { kicker:"Step 4 · Eliminate y", title:"Use the right-triangle relation", formulas:["x² + y² = (2y − x)²","3y² − 4xy = 0","y = 4x / 3","z = 5x / 3"], explanation:"Substitute z = 2y − x into the Pythagorean relation. Both y and z are now expressed through x alone.", eliminated:["u","z","y"] },
    { kicker:"Step 5 · Return to x", title:"The last condition contains only x", formulas:["2x + 4y + 4z = x(y² − z + x)","8x² − 3x − 63 = 0","(x − 3)(8x + 21) = 0","x = 3"], explanation:"Substitute y = 4x/3 and z = 5x/3. Length is positive, so x = 3.", eliminated:["u","z","y"] },
    { kicker:"Step 6 · Back-substitute", title:"Leg 3, leg 4, hypotenuse 5, diameter 2", formulas:["x = 3","y = 4","z = 5","d = x + y − z = 2","u = 3 + 4 + 5 + 2 = 14"], explanation:"The requested total is fourteen, exactly matching the answer recorded in the Jade Mirror.", eliminated:[] }
  ] : [
    {
      kicker: "第一步 · 四元立式",
      title: "把原题写成四元关系",
      formulas: ["x² + y² = z²", "y · 五较 = z² + xz", "五和 / x = y² − (z − x)", "u = x + y + z + (x + y − z)"],
      explanation: "四条关系同时放在算板上。前三条确定句、股、弦，第四条记录物元——题目最终要问的总和。",
      eliminated: []
    },
    {
      kicker: "第二步 · 展开古语",
      title: "五较、五和先化成普通式",
      formulas: ["五较 = 2z", "五和 = 2x + 4y + 4z", "u = 2x + 2y"],
      explanation: "把五种‘较’与五种‘和’逐项相加，会分别收束为 2z 与 2x + 4y + 4z；黄方 d = x + y − z，因此总和 u = 2x + 2y。",
      eliminated: ["u"]
    },
    {
      kicker: "第三步 · 消人元",
      title: "从第一条题设解出弦 z",
      formulas: ["2yz = z² + xz", "z(2y − z − x) = 0", "z = 2y − x"],
      explanation: "弦长 z 不为零，所以可以约去 z。此后凡出现 z，都以 2y − x 代替，人元被消去。",
      eliminated: ["u", "z"]
    },
    {
      kicker: "第四步 · 消地元",
      title: "借勾股关系把 y 化成 x",
      formulas: ["x² + y² = (2y − x)²", "3y² − 4xy = 0", "y = 4x / 3", "z = 5x / 3"],
      explanation: "把 z = 2y − x 代入勾股式。股长 y 不为零，约去 y 后，地元与人元都只由天元表示。",
      eliminated: ["u", "z", "y"]
    },
    {
      kicker: "第五步 · 归于天元",
      title: "最后一条题设只剩 x",
      formulas: ["2x + 4y + 4z = x(y² − z + x)", "8x² − 3x − 63 = 0", "(x − 3)(8x + 21) = 0", "x = 3"],
      explanation: "代入 y = 4x/3、z = 5x/3，四元关系归成一元二次方程。长度取正根，得到句 x = 3。",
      eliminated: ["u", "z", "y"]
    },
    {
      kicker: "第六步 · 回代合问",
      title: "句三、股四、弦五、黄方二",
      formulas: ["x = 3", "y = 4", "z = 5", "黄方 d = x + y − z = 2", "u = 3 + 4 + 5 + 2 = 14"],
      explanation: "物元所代表的‘黄方带句股弦共’为十四步，与《四元玉鉴》原书答案完全相合。",
      eliminated: []
    }
  ];

  let fourStep = 0;
  let fourTimer = null;
  const fourAnimation = document.getElementById("four-animation");
  const fourKicker = document.getElementById("four-step-kicker");
  const fourTitle = document.getElementById("four-animation-title");
  const fourFormulas = document.getElementById("four-stage-formulas");
  const fourExplanation = document.getElementById("four-stage-explanation");
  const fourPrev = document.getElementById("four-prev");
  const fourNext = document.getElementById("four-next");
  const fourPlay = document.getElementById("four-play");
  const fourProgress = Array.from(document.querySelectorAll(".four-progress i"));
  const fourVariables = Array.from(document.querySelectorAll(".four-variable-state i"));

  function renderFourStep() {
    const step = fourSteps[fourStep];
    fourAnimation.classList.add("is-changing");
    window.setTimeout(function () {
      fourKicker.textContent = step.kicker;
      fourTitle.textContent = step.title;
      fourFormulas.innerHTML = step.formulas.map(function (formula, index) {
        return '<p style="--delay:' + (index * 55) + 'ms">' + formula + '</p>';
      }).join("");
      fourExplanation.textContent = step.explanation;
      fourPrev.disabled = fourStep === 0;
      fourNext.innerHTML = fourStep === fourSteps.length - 1 ? (isEnglish ? '<span>Run again</span> ↻' : '<span>重新演算</span> ↻') : (isEnglish ? '<span>Eliminate next</span> →' : '<span>消去下一元</span> →');
      fourProgress.forEach(function (dot, index) { dot.classList.toggle("active", index <= fourStep); });
      fourVariables.forEach(function (item) { item.classList.toggle("eliminated", step.eliminated.indexOf(item.dataset.var) !== -1); });
      fourAnimation.classList.remove("is-changing");
    }, 170);
  }

  function stopFourPlay() {
    if (fourTimer) { window.clearInterval(fourTimer); fourTimer = null; }
    fourPlay.setAttribute("aria-pressed", "false");
    fourPlay.innerHTML = (isEnglish ? '<span>Auto play</span><i aria-hidden="true">▶</i>' : '<span>自动演算</span><i aria-hidden="true">▶</i>');
  }

  fourPrev.addEventListener("click", function () {
    stopFourPlay();
    if (fourStep > 0) { fourStep -= 1; renderFourStep(); }
  });
  fourNext.addEventListener("click", function () {
    stopFourPlay();
    fourStep = fourStep === fourSteps.length - 1 ? 0 : fourStep + 1;
    renderFourStep();
  });
  fourPlay.addEventListener("click", function () {
    if (fourTimer) { stopFourPlay(); return; }
    if (fourStep === fourSteps.length - 1) { fourStep = 0; renderFourStep(); }
    fourPlay.setAttribute("aria-pressed", "true");
    fourPlay.innerHTML = (isEnglish ? '<span>Pause</span><i aria-hidden="true">Ⅱ</i>' : '<span>暂停</span><i aria-hidden="true">Ⅱ</i>');
    fourTimer = window.setInterval(function () {
      if (fourStep === fourSteps.length - 1) { stopFourPlay(); return; }
      fourStep += 1;
      renderFourStep();
    }, 2400);
  });

  renderStep();
  renderField();
}());
