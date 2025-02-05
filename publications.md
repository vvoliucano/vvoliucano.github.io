---
layout: page
permalink: /publications/
title: Publications
class: pubs
---


## Papers

{% assign pubyears = site.data.publication | group_by:"year" %}
{% for year in pubyears %}
{%-assign yeartitle = year.name | floor-%}


{:#y{{ year.name }} .year}
{% for pub in year.items %}
	{% if pub.type[0]=="Journal" or pub.type[0] =="Conference" %} 
	{% include publication.html pub=pub %}
	{% endif %}
{% endfor %}
{% endfor %}


## Posters

{% assign pubyears = site.data.publication | group_by:"year" %}
{% for year in pubyears %}
{%-assign yeartitle = year.name | floor-%}


{:#y{{ year.name }} .year}
{% for pub in year.items %}
	{% if pub.type[0]=="Poster" %} 
	{% include publication.html pub=pub %}
	{% endif %}
{% endfor %}
{% endfor %}

<script src="https://cdn.jsdelivr.net/npm/itemsjs@1.0.40/dist/itemsjs.min.js"></script>

<script src="{{ '/assets/js/itemsjs.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/pubfilter.js' | relative_url }}"></script>

