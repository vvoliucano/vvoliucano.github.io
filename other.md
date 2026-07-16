---
layout: page-zh
permalink: /other/
title: 華夏文化
class: culture-page
---

<style>
@font-face {
  font-family: "OuyangxunKaishu";
  src: url("{{ '/assets/font/正欧阳询楷书+简繁.TTF' | relative_url | replace: '+', '%2B' }}") format("truetype");
  font-display: swap;
}

.culture-page {
  max-width: 1040px;
  --culture-serif: "OuyangxunKaishu", "STKaiti", "KaiTi", "Kaiti SC", serif;
  --culture-song: "Songti SC", "STSong", "SimSun", serif;
  --culture-ink: #202d35;
  --culture-muted: #738089;
  --culture-line: rgba(37, 55, 64, 0.14);
  --culture-paper: #ffffff;
  --culture-red: #8b2018;
  --culture-jade: #446b5a;
  --culture-blue: #3e6073;
}

.culture-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(15rem, 0.55fr);
  gap: clamp(2rem, 7vw, 5.5rem);
  align-items: end;
  min-height: 25rem;
  margin: 1.6rem 0 2.8rem;
  padding: 3.2rem 0 2.2rem;
  border-top: 1px solid var(--culture-line);
  border-bottom: 1px solid var(--culture-line);
}

.culture-hero::before {
  content: "華夏";
  position: absolute;
  right: 0;
  top: 0.22rem;
  color: rgba(32, 45, 53, 0.026);
  font-family: var(--culture-serif);
  font-size: clamp(7rem, 18vw, 13rem);
  line-height: 1;
  letter-spacing: -0.08em;
  pointer-events: none;
}

.culture-hero-copy {
  position: relative;
  z-index: 1;
}

.culture-kicker {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 0 0 1.2rem;
  color: var(--culture-red);
  font-family: var(--culture-serif);
  font-size: 0.88rem;
  letter-spacing: 0.24em;
}

.culture-kicker::after {
  content: "";
  width: clamp(3rem, 9vw, 7rem);
  height: 1px;
  background: currentColor;
  opacity: 0.34;
}

.culture-title {
  position: relative;
  z-index: 1;
  margin: 0;
  color: var(--culture-ink);
  font-family: var(--culture-serif);
  font-size: clamp(3.35rem, 8vw, 6.25rem);
  font-weight: 400;
  line-height: 1.04;
  letter-spacing: 0.04em;
}

.culture-title span {
  display: block;
  width: max-content;
  white-space: nowrap;
}

.culture-title span:last-child {
  margin-left: clamp(1.5rem, 8vw, 6rem);
  color: transparent;
  -webkit-text-stroke: 1px rgba(32, 45, 53, 0.48);
  text-stroke: 1px rgba(32, 45, 53, 0.48);
}

.culture-lead {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 1.6rem 0 0;
  color: #66747d;
  font-family: var(--culture-song);
  font-size: 0.95rem;
  line-height: 2;
}

.culture-emblem {
  position: relative;
  z-index: 1;
  padding: 1.2rem 0 0.15rem;
  border-top: 1px solid rgba(37, 55, 64, 0.24);
}

.culture-emblem-main {
  display: block;
  color: var(--culture-ink);
  font-family: var(--culture-serif);
  font-size: clamp(4.6rem, 10vw, 7.5rem);
  font-weight: 400;
  line-height: 0.95;
}

.culture-emblem-axis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 1rem;
  border-top: 1px solid var(--culture-line);
  border-bottom: 1px solid var(--culture-line);
}

.culture-emblem-axis span {
  padding: 0.48rem 0;
  border-right: 1px solid var(--culture-line);
  color: #69767e;
  font-family: var(--culture-serif);
  font-size: 0.86rem;
  text-align: center;
}

.culture-emblem-axis span:last-child {
  border-right: 0;
}

.culture-emblem-note {
  margin: 0.65rem 0 0;
  color: #8d979d;
  font-family: var(--culture-song);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
}

.culture-card {
  position: relative;
  display: flex;
  min-height: 20rem;
  flex-direction: column;
  overflow: hidden;
  padding: 1.4rem;
  border: 1px solid var(--culture-line);
  border-radius: 10px;
  background: var(--culture-paper);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.culture-card:hover,
.culture-card:focus-within {
  border-color: rgba(68, 107, 90, 0.42);
  transform: translateY(-2px);
}

.culture-card:has(.culture-details[open]) {
  border-color: rgba(139, 32, 24, 0.42);
  transform: translateY(-2px);
}

.culture-card::after {
  content: "";
  position: absolute;
  right: 1.35rem;
  bottom: 1.25rem;
  left: 1.35rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(37, 55, 64, 0.12), transparent);
  pointer-events: none;
}

.culture-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.culture-number {
  color: #a3acb2;
  font-family: var(--culture-serif);
  font-size: 0.9rem;
  letter-spacing: 0.18em;
}

.culture-seal {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 4px;
  color: var(--culture-red);
  font-family: var(--culture-serif);
  font-size: 1.45rem;
  line-height: 1;
  transform: rotate(-2deg);
}

.culture-card h2 {
  margin: 1rem 0 0.25rem;
  border: 0;
  color: var(--culture-ink);
  font-family: var(--culture-serif);
  font-size: 1.9rem;
  font-weight: 400;
  letter-spacing: 0.12em;
}

.culture-card-subtitle {
  margin: 0;
  color: var(--culture-muted);
  font-family: var(--culture-serif);
  font-size: 0.93rem;
  letter-spacing: 0.08em;
}

.culture-card-copy {
  margin: 1rem 0 1.2rem;
  color: #596871;
  font-family: var(--culture-song);
  font-size: 0.88rem;
  line-height: 1.82;
}

.culture-card-teaser {
  margin: 1rem 0 0.9rem;
  color: #596871;
  font-family: var(--culture-song);
  font-size: 0.88rem;
  line-height: 1.82;
}

.culture-details {
  margin: 0 0 1.2rem;
}

.culture-details summary {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.1rem 0.48rem;
  border-top: 1px solid rgba(37, 55, 64, 0.13);
  color: #7c898f;
  cursor: pointer;
  font-family: var(--culture-serif);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  list-style: none;
  transition: color 0.18s ease, border-color 0.18s ease;
}

.culture-details summary::-webkit-details-marker { display: none; }

.culture-details summary:hover,
.culture-details summary:focus-visible,
.culture-details[open] summary {
  border-color: rgba(139, 32, 24, 0.28);
  color: var(--culture-red);
  outline: none;
}

.culture-details summary::after {
  content: "";
  width: 0.42rem;
  height: 0.42rem;
  margin-right: 0.18rem;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg) translateY(-0.12rem);
  transition: transform 0.2s ease;
}

.culture-details[open] summary::after { transform: rotate(225deg) translate(-0.1rem, -0.05rem); }
.culture-details-less { display: none; }
.culture-details[open] .culture-details-more { display: none; }
.culture-details[open] .culture-details-less { display: inline; }

.culture-details-body {
  padding-top: 0.2rem;
  animation: culture-detail-in 0.2s ease both;
}

@keyframes culture-detail-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.culture-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: auto;
  padding-bottom: 1.1rem;
}

.culture-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.42rem 0.68rem;
  border: 1px solid rgba(37, 55, 64, 0.16);
  border-radius: 5px;
  color: #394e59;
  background: #fff;
  font-size: 0.76rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.18s ease, border-color 0.18s ease, padding 0.18s ease;
}

.culture-link:hover,
.culture-link:focus-visible {
  padding-right: 0.85rem;
  border-color: rgba(139, 32, 24, 0.38);
  color: var(--culture-red);
  text-decoration: none;
  outline: none;
}

.culture-link span[aria-hidden="true"] {
  font-size: 0.9em;
}

.culture-cite {
  margin-left: 0.12em;
  color: var(--culture-red);
  font-size: 0.72em;
  font-weight: 700;
  text-decoration: none;
  vertical-align: super;
}

.culture-sources {
  margin: -0.35rem 0 1.2rem;
  padding: 0.75rem 0 0 1.1rem;
  border-top: 1px solid rgba(37, 55, 64, 0.1);
  color: #8b959b;
  font-family: var(--culture-song);
  font-size: 0.66rem;
  line-height: 1.55;
}

.culture-sources li + li { margin-top: 0.3rem; }

.culture-sources a {
  color: inherit;
  text-decoration-color: rgba(139, 32, 24, 0.28);
  text-underline-offset: 0.16em;
}

.culture-card--writing .culture-seal {
  color: var(--culture-blue);
}

.culture-card--science .culture-seal {
  color: var(--culture-jade);
}

.culture-card--divination .culture-seal {
  color: #71533f;
}

.culture-topics {
  display: grid;
  gap: 0.62rem;
  margin: 0.2rem 0 1.1rem;
}

.culture-topic {
  padding: 0.75rem 0.8rem;
  border-left: 2px solid rgba(68, 107, 90, 0.32);
  background: rgba(68, 107, 90, 0.035);
}

.culture-topic strong {
  display: block;
  margin-bottom: 0.2rem;
  color: #344b41;
  font-family: var(--culture-serif);
  font-size: 1.02rem;
  font-weight: 400;
  letter-spacing: 0.08em;
}

.culture-topic span {
  display: block;
  color: #748078;
  font-family: var(--culture-song);
  font-size: 0.75rem;
  line-height: 1.55;
}

.culture-status {
  display: inline-block;
  margin-top: auto;
  padding-bottom: 1.1rem;
  color: #929b99;
  font-family: var(--culture-serif);
  font-size: 0.82rem;
  letter-spacing: 0.12em;
}

.culture-note {
  margin: 0;
  padding: 0.85rem 0 1.1rem;
  border-top: 1px solid rgba(37, 55, 64, 0.1);
  color: #939da3;
  font-family: var(--culture-song);
  font-size: 0.75rem;
  line-height: 1.7;
  text-align: left;
}

.culture-closing {
  margin: 0 0 2.6rem;
  padding: clamp(2.8rem, 7vw, 5rem) 0;
  border-top: 1px solid var(--culture-line);
  border-bottom: 1px solid var(--culture-line);
  color: var(--culture-ink);
  font-family: var(--culture-serif);
  font-size: clamp(2.5rem, 6vw, 4.6rem);
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0.16em;
  text-align: center;
}

.culture-closing span {
  display: block;
  white-space: nowrap;
}

.culture-closing span:last-child {
  color: var(--culture-jade);
}

@media (max-width: 760px) {
  .culture-hero {
    grid-template-columns: 1fr;
    gap: 2.2rem;
    min-height: 0;
    margin-top: 0.6rem;
    padding-top: 2.2rem;
  }

  .culture-title {
    font-size: clamp(3rem, 16vw, 5rem);
  }

  .culture-title span:last-child {
    margin-left: 1.2rem;
  }

  .culture-emblem {
    max-width: 19rem;
  }

  .culture-grid {
    grid-template-columns: 1fr;
  }

  .culture-card {
    min-height: auto;
  }
}
</style>

<main class="culture-hub">
  <header class="culture-hero">
    <div class="culture-hero-copy">
      <p class="culture-kicker">華夏文化专区</p>
      <h1 class="culture-title"><span>赫赫華夏</span><span>光照四方</span></h1>
      <p class="culture-lead">从共同的文字基础出发，沿诗词、科技与象数的不同路径，整理可阅读、可探索、可交互的華夏古典文化。这里关注文字如何传承、知识如何成形，以及观念如何在时间与地域之间流动。</p>
    </div>
    <aside class="culture-emblem" aria-label="专区的四条内容路径">
      <span class="culture-emblem-main">文</span>
      <div class="culture-emblem-axis"><span>诗</span><span>书</span><span>器</span><span>象</span></div>
      <p class="culture-emblem-note">shared script&nbsp;&nbsp;living knowledge</p>
    </aside>
  </header>

  <section class="culture-grid" aria-label="華夏文化专题">
    <article class="culture-card culture-card--poetry">
      <div class="culture-card-head">
        <span class="culture-number">壹</span>
        <span class="culture-seal" aria-hidden="true">詩</span>
      </div>
      <h2>诗词</h2>
      <p class="culture-card-subtitle">诗以言志，歌以咏怀</p>
      <p class="culture-card-teaser">收录个人古体诗词，并连接竖排诗词阅读界面。</p>
      <details class="culture-details">
        <summary><span class="culture-details-more">查看详情</span><span class="culture-details-less">收起</span></summary>
        <div class="culture-details-body"><p class="culture-card-copy">《牧山集》收录个人古体诗词，并将目录与原有诗词阅读界面相连。可按年份浏览，也可进入单篇的竖排宣纸阅读体验。</p></div>
      </details>
      <div class="culture-actions">
        <a class="culture-link" href="{{ '/mushan/' | relative_url }}">进入牧山集 <span aria-hidden="true">→</span></a>
        {% assign latest_poems = site.data.other | sort: 'year' | reverse %}
        {% assign latest_poem = latest_poems.first %}
        {% if latest_poem %}
          {% assign latest_poem_id = latest_poem.id | url_encode %}
          {% assign latest_poem_url = '/poem/?id=' | append: latest_poem_id %}
          <a class="culture-link" href="{{ latest_poem_url | relative_url }}">打开诗词界面 <span aria-hidden="true">→</span></a>
        {% endif %}
      </div>
    </article>

    <article class="culture-card culture-card--writing">
      <div class="culture-card-head">
        <span class="culture-number">贰</span>
        <span class="culture-seal" aria-hidden="true">文</span>
      </div>
      <h2>文字</h2>
      <p class="culture-card-subtitle">书同文，文以载道</p>
      <p class="culture-card-teaser">从 658 个通用汉字词出发，对照字形、读音与英文释义。</p>
      <details class="culture-details">
        <summary><span class="culture-details-more">查看详情与出处</span><span class="culture-details-less">收起</span></summary>
        <div class="culture-details-body">
          <p class="culture-card-copy">“书同文”计划（Hanzi 658）以六百五十八个華夏文化圈通用汉字词为入口，对照中、日、韩、越的字形与读音，并为每个词提供英文释义。汉字源于中国，后来被日、韩、越吸收和改造：日语至今使用 kanji，韩语保留 hanja，越南历史上使用 chữ Hán 与 chữ Nôm。<a class="culture-cite" href="#culture-source-1" aria-label="参见来源一">[1]</a> 汉源词在三种现代语言中仍占显著比例；一项 2025 年综述估计，汉源词约占日语词汇的 43–54%、韩语的 47–56%、越南语约 70%，具体比例随语料与分类方法而异。<a class="culture-cite" href="#culture-source-2" aria-label="参见来源二">[2]</a> 文字不仅是书写工具，也是華夏文化圈共享知识与历史记忆的基础设施。</p>
          <ol class="culture-sources" aria-label="汉字传播与汉源词研究来源">
            <li id="culture-source-1"><a href="https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-18/" target="_blank" rel="noopener">《Unicode 标准》第 17 版，第 18 章“东亚文字”</a>。</li>
            <li id="culture-source-2">木下瞳：<a href="https://cir.nii.ac.jp/crid/1390023549705999872?lang=ja" target="_blank" rel="noopener">《日语、韩语、越南语中汉源词的量化研究综述》</a>，《国立国语研究所论集》29，2025。<a href="https://www.ninjal.ac.jp/info/publication/papers/29/" target="_blank" rel="noopener">国立国语研究所期刊目录</a>。</li>
          </ol>
        </div>
      </details>
      <div class="culture-actions">
        <a class="culture-link" href="{{ '/projects/hanzi658/overview.html' | relative_url }}">认识“书同文”计划 <span aria-hidden="true">→</span></a>
        <a class="culture-link" href="{{ '/projects/hanzi658/' | relative_url }}">直接探索 <span aria-hidden="true">→</span></a>
      </div>
    </article>

    <article class="culture-card culture-card--science">
      <div class="culture-card-head">
        <span class="culture-number">叁</span>
        <span class="culture-seal" aria-hidden="true">技</span>
      </div>
      <h2>科技</h2>
      <p class="culture-card-subtitle">格物致知，巧思成器</p>
      <p class="culture-card-teaser">从中国古典数学与建筑理解数、尺度、结构与营造。</p>
      <details class="culture-details">
        <summary><span class="culture-details-more">查看详情</span><span class="culture-details-less">收起</span></summary>
        <div class="culture-details-body">
          <p class="culture-card-copy">从数与形、尺度与结构出发，理解古人如何以抽象方法认识世界，又如何把知识落实为器物、建筑与城市。</p>
          <div class="culture-topics">
            <div class="culture-topic">
              <strong>中国古典数学</strong>
              <span>《九章算术》、筹算、勾股、天元术与传统算法思想。</span>
            </div>
            <div class="culture-topic">
              <strong>中国古典建筑</strong>
              <span>木构模数、斗拱、营造法式，以及礼制与空间秩序。</span>
            </div>
          </div>
          <span class="culture-status">专题内容筹备中</span>
        </div>
      </details>
    </article>

    <article class="culture-card culture-card--divination">
      <div class="culture-card-head">
        <span class="culture-number">肆</span>
        <span class="culture-seal" aria-hidden="true">象</span>
      </div>
      <h2>术数</h2>
      <p class="culture-card-subtitle">观象取数，推时察变</p>
      <p class="culture-card-teaser">以交互方式呈现干支、历法、象数与传统推演方法。</p>
      <details class="culture-details">
        <summary><span class="culture-details-more">查看详情</span><span class="culture-details-less">收起</span></summary>
        <div class="culture-details-body"><p class="culture-card-copy">以现代交互方式呈现传统历法、干支、象数与推演方法。排盘均在浏览器本地完成，作为文化研究、方法学习与自我反思的辅助工具。</p></div>
      </details>
      <div class="culture-actions">
        <a class="culture-link" href="{{ '/projects/bazi/' | relative_url }}">八字排盘 <span aria-hidden="true">→</span></a>
        <a class="culture-link" href="{{ '/projects/liuyao/' | relative_url }}">六爻问卦 <span aria-hidden="true">→</span></a>
      </div>
      <p class="culture-note">术数内容仅供传统文化研究与自我反思，不构成现实决策建议。</p>
    </article>
  </section>

  <p class="culture-closing" aria-label="由字入诗 由器见道"><span>由字入诗</span><span>由器见道</span></p>
</main>
