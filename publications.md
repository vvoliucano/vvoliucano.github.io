---
layout: page
permalink: /publications/
title: Publications
class: pubs
---

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

<script src="{{ '/assets/js/itemsjs.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pubfilter.js' | relative_url }}"></script>

