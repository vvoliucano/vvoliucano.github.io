---
layout: page-zh
permalink: /publications-zh/
title: Publications
class: pubs
---

{:.hidden}
# Publications

<div id="facets" class="hidden">
  <div class="facet" id="venue_tags">
    <strong>Venue</strong>
    <ul></ul>
  </div>
  <div class="facet" id="authors">
    <strong>Author</strong>
    <ul></ul>
  </div>
  <div class="facet" id="tags">
    <strong>Tag</strong>
    <ul></ul>
  </div>
  <div class="facet" id="type">
    <strong>Type</strong>
    <ul></ul>
  </div>
  <div class="facet" id="awards">
    <strong>Award</strong>
    <ul></ul>
  </div>

</div>

<label id="only-highlight" class="hidden">
  <input type="checkbox" id="highlight">
  Show only highlights
</label>

<!-- <p id="clear-filters" class="hidden">
  <i class="fas fa-times-circle" aria-hidden="true"></i> Clear all filters. <span id="count_hidden">X</span> of <span id="count_total">X</span> publications are hidden by the filters.
</p> -->

<!-- <input id="ft-search" type="search" placeholder="Search papers..." /> -->

<div markdown="0">
  {% include publication-map.html lang="zh" topic_title="研究主题" topic_hint="悬停或点击主题，查看它与论文之间的联系。" filter_label="主题筛选" all_topics_label="全部主题" clear_topics_label="清除选择" author_title="合作者" author_hint="当前视口内论文的合作者。" %}
</div>

<script src="https://cdn.jsdelivr.net/npm/itemsjs@1.0.40/dist/itemsjs.min.js"></script>

<script src="/assets/js/itemsjs.min.js"></script>
<script src="/assets/js/pubfilter.js"></script>
<script src="{{ '/assets/js/publication-map.js' | relative_url }}"></script>
