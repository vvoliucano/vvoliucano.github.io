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

{% assign grouped_pubs = site.data.publication | group_by: 'year' | sort: 'name' | reverse %}

<div markdown="0">
{% for group in grouped_pubs %}
  <h3 class="pub-year year" id="y{{ group.name }}">{{ group.name }}</h3>
  <div class="year-group">
    {% for pub in group.items %}
      {% include publication.html pub=pub %}
    {% endfor %}
  </div>
{% endfor %}
</div>

<script src="https://cdn.jsdelivr.net/npm/itemsjs@1.0.40/dist/itemsjs.min.js"></script>

<script src="/assets/js/itemsjs.min.js"></script>
<script src="/assets/js/pubfilter.js"></script>
