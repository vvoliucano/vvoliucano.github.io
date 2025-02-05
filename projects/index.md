---
layout: page
permalink: /projects/
title: Projects
class: projects
---

{:.hidden}
# Projects

Below are visualization projects I have been working on by chronological order.

<div class="grid">
  {% for project in site.data.project %}
    {% include project.html project=project %}
  {% endfor %}
</div>
