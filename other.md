---
layout: page-zh
permalink: /other/
title: Others
---


<style>
.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}


.project {
    position: relative;
    flex: 1 0 30%;
    cursor: pointer;
    max-width: 50%;
    transition: transform 0.3s ease;
}

.project img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    transition: transform 0.3s ease;
}

/* 隐藏 checkbox */
.project input[type="checkbox"] {
    display: none;
}

/* 当 checkbox 被选中时放大图片 */
.project input[type="checkbox"]:checked + label img {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    max-width: 90%;
    /* max-height: 90%; */
    z-index: 1000;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
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
## {{ yeartitle }} 
{:#y{{ year.name }} .year}
{% for pub in year.items %}
  <div class="publication">
    <h3><strong>{{ pub.title }}</strong>
    {% if pub.type %}
     「{{ pub.type }}」
    {% endif %}
    </h3>
    {% for line in pub.content %}<p> {{ line }}</p>{% endfor %}
    {% if pub.description %}
    <h4>部分解释</h4>
    {% for line in pub.description %}<p><i> {{ line }}</i></p>{% endfor %}
    {% endif %}
    {% if pub.image %}

    <div class="grid">
    {% for img in pub.image %}
    <div class="project">
      <input type="checkbox" id="toggle{{pub.id}}{{ forloop.index }}">
      <label for="toggle{{pub.id}}{{ forloop.index }}">
        <img src="{{ "/assets/poetry/" | append: img | relative_url }}" alt="{{ pub.title }}" />
      </label>
    </div>
    {% endfor %}
</div>

    {% endif %}
    <!-- {% if pub.image %}
    <div class="grid">
      {% for img in pub.image %}
      <div class="project">
    <img src="{{ "/assets/poetry/" | append: img | relative_url }}" alt="{{ pub.title }}" />
    </div>
    {% endfor %}
    </div>
    {% endif %} -->
  </div>
{% endfor %}
{% endfor %}


<div id="language" position="float" style="position: fixed; bottom:0; right: 0;">
  <iframe src="/cat/cat.html" id="catIframe" frameborder="0" data-ruffle-polyfilled=""></iframe>
</div>

<!-- 
<script src="https://cdn.jsdelivr.net/npm/itemsjs@1.0.40/dist/itemsjs.min.js"></script>

<script src="/assets/js/itemsjs.min.js"></script>
<script src="/assets/js/pubfilter.js"></script>
 -->