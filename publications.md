---
layout: page
permalink: /publications/
title: Publications
class: pubs
---


## Papers

{% assign sorted_pubs = site.data.publication | sort: 'year' | reverse %}
{% assign grouped_pubs = sorted_pubs | group_by: 'year' %}

{% for group in grouped_pubs %}
  <h3 class="pub-year">{{ group.name }}</h3>
  <div class="year-group">
    {% for pub in group.items %}
      {% if pub.type[0] == "Journal" or pub.type[0] == "Conference" %}
        {% include publication.html pub=pub %}
      {% endif %}
    {% endfor %}
  </div>
{% endfor %}

## Posters & Others

{% for group in grouped_pubs %}
  {% assign has_posters = false %}
  {% for pub in group.items %}
    {% if pub.type[0] == "Poster" or pub.type[0] == "Notes" or pub.type[0] == "preprint" %}
      {% assign has_posters = true %}
    {% endif %}
  {% endfor %}

  {% if has_posters %}
    <h3 class="pub-year">{{ group.name }}</h3>
    <div class="year-group">
      {% for pub in group.items %}
        {% if pub.type[0] == "Poster" or pub.type[0] == "Notes" or pub.type[0] == "preprint" %}
          {% include publication.html pub=pub %}
        {% endif %}
      {% endfor %}
    </div>
  {% endif %}
{% endfor %}

<script src="https://cdn.jsdelivr.net/npm/itemsjs@1.0.40/dist/itemsjs.min.js"></script>

<script src="{{ '/assets/js/itemsjs.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pubfilter.js' | relative_url }}"></script>

