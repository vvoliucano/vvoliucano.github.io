---
layout: page-zh
permalink: /other/
title: Others
---


<style>
/* 诗集整体样式 */
.poetry-year-section {
    margin: 3rem 0;
    padding: 0 1rem;
}

.poetry-year-title {
    font-size: 2.5rem;
    font-weight: 300;
    text-align: center;
    color: #2c3e50;
    margin: 2rem 0 1rem 0;
    font-family: "STKaiti", "KaiTi", "楷体", serif;
    letter-spacing: 0.2em;
}

.poetry-year-divider {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #bdc3c7, transparent);
    margin: 0 auto 3rem auto;
}

/* 单首诗的样式 */
.poetry-item {
    max-width: 800px;
    margin: 3rem auto;
    padding: 2.5rem;
    background: #fefefe;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    position: relative;
    transition: all 0.3s ease;
}

.poetry-item:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    transform: translateY(-2px);
}

.poetry-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #e74c3c, #f39c12, #e74c3c);
    border-radius: 0 0 2px 2px;
}

/* 诗歌标题区域 */
.poetry-header {
    text-align: center;
    margin-bottom: 2rem;
    border-bottom: 1px solid #ecf0f1;
    padding-bottom: 1.5rem;
}

.poetry-title {
    font-size: 1.8rem;
    font-weight: 400;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-family: "STKaiti", "KaiTi", "楷体", serif;
    letter-spacing: 0.1em;
}

.poetry-type {
    display: inline-block;
    font-size: 0.9rem;
    color: #7f8c8d;
    background: #ecf0f1;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-family: "STKaiti", "KaiTi", "楷体", serif;
    letter-spacing: 0.05em;
}

/* 诗歌内容 */
.poetry-content {
    text-align: center;
    line-height: 2.2;
    margin: 2rem 0;
}

.poetry-line {
    font-size: 1.2rem;
    color: #34495e;
    margin: 0.8rem 0;
    font-family: "STKaiti", "KaiTi", "楷体", serif;
    letter-spacing: 0.05em;
    position: relative;
}

.poetry-line:not(:last-child)::after {
    content: '';
    display: block;
    width: 20px;
    height: 1px;
    background: #bdc3c7;
    margin: 0.5rem auto;
    opacity: 0.5;
}

/* 注释样式 */
.poetry-notes {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-left: 4px solid #e74c3c;
    border-radius: 0 4px 4px 0;
}

.notes-title {
    font-size: 1rem;
    font-weight: 600;
    color: #e74c3c;
    margin-bottom: 0.8rem;
    font-family: "STKaiti", "KaiTi", "楷体", serif;
}

.notes-line {
    font-size: 0.9rem;
    color: #5a6c7d;
    line-height: 1.6;
    margin: 0.4rem 0;
    font-style: italic;
}

/* 图片展示 */
.poetry-images {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #ecf0f1;
}

.poetry-image-item {
    position: relative;
    cursor: pointer;
    max-width: 200px;
    transition: transform 0.3s ease;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.poetry-image-item:hover {
    transform: scale(1.05);
}

.poetry-image-item img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
}

/* 隐藏 checkbox */
.poetry-image-item input[type="checkbox"] {
    display: none;
}

/* 当 checkbox 被选中时放大图片 */
.poetry-image-item input[type="checkbox"]:checked + label img {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    max-width: 90%;
    max-height: 90%;
    z-index: 1000;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
    border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .poetry-item {
        margin: 2rem 0.5rem;
        padding: 1.5rem;
    }
    
    .poetry-year-title {
        font-size: 2rem;
    }
    
    .poetry-title {
        font-size: 1.5rem;
    }
    
    .poetry-line {
        font-size: 1.1rem;
    }
    
    .poetry-images {
        gap: 10px;
    }
    
    .poetry-image-item {
        max-width: 150px;
    }
}
</style>

<!-- <div class="grid">
    {% for img in pub.image %}
    <div class="project">
      <a href="#img{{ forloop.index }}">
        <img id="img{{ forloop.index }}" src="{{ "/assets/poetry/" | append: img | relative_url }}" alt="{{ pub.title }}" />
      </a>
      <div class="overlay"></div>
    </div>
    {% endfor %}
</div> -->



{% assign pubyears = site.data.other | group_by:"year" %}
{% for year in pubyears %}
{%-assign yeartitle = year.name | floor-%}

<div class="poetry-year-section">
  <h2 class="poetry-year-title">{{ yeartitle }}</h2>
  <div class="poetry-year-divider"></div>
  
  {% for pub in year.items %}
  <div class="poetry-item">
    <div class="poetry-header">
      <h3 class="poetry-title">{{ pub.title }}</h3>
      {% if pub.type %}
      <span class="poetry-type">{{ pub.type | join: "·" }}</span>
      {% endif %}
    </div>
    
    <div class="poetry-content">
      {% for line in pub.content %}
      <div class="poetry-line">{{ line }}</div>
      {% endfor %}
    </div>
    
    {% if pub.description %}
    <div class="poetry-notes">
      <div class="notes-title">注释</div>
      {% for line in pub.description %}
      <div class="notes-line">{{ line }}</div>
      {% endfor %}
    </div>
    {% endif %}
    
    {% if pub.image %}
    <div class="poetry-images">
      {% for img in pub.image %}
      <div class="poetry-image-item">
        <input type="checkbox" id="toggle{{pub.id}}{{ forloop.index }}">
        <label for="toggle{{pub.id}}{{ forloop.index }}">
          <img src="{{ "/assets/poetry/" | append: img | relative_url }}" alt="{{ pub.title }}" />
        </label>
      </div>
      {% endfor %}
    </div>
    {% endif %}
  </div>
  {% endfor %}
</div>
{% endfor %}


<div id="language" position="float" style="position: fixed; bottom:0; right: 0;">
  <iframe src="/cat/cat.html" id="catIframe" frameborder="0" data-ruffle-polyfilled=""></iframe>
</div>

<!-- 
<script src="https://cdn.jsdelivr.net/npm/itemsjs@1.0.40/dist/itemsjs.min.js"></script>

<script src="/assets/js/itemsjs.min.js"></script>
<script src="/assets/js/pubfilter.js"></script>
 -->