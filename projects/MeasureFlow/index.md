---
layout: project
permalink: /projects/MeasureFlow
title: "Interative Time-Series of Measures for Exploring Dynamic Networks"
class: project-intro
---
<div class="mid">
<img src="./MeasureFlow/teaser.png" width="100%">
</div>

{% for project in site.data.project %}
  {% if project.id == "MeasureFlow" %}
  {% include projectline.html project=project %}
  {% endif %}
{% endfor %}

#### Abstract
We present *MeasureFlow*, an interface to visually and interactively explore dynamic networks through time-series of network measures such as link number, graph density, or node activation. When networks contain many time steps, become large and more dense, or contain high frequencies of change, traditional visualizations that focus on network topology, such as animations or small multiples, fail to provide adequate overviews and thus fail to guide the analyst towards interesting time points and periods. MeasureFlow presents a complementary approach that relies on visualizing time-series of common network measures to provide a detailed yet comprehensive overview of when changes are happening and which network measures they involve. As dynamic networks undergo changes of varying rates and characteristics, network measures provide important hints on the pace and nature of their evolution and can guide an analysts in their exploration; based on a set of interactive and signal-processing methods, MeasureFlow allows an analyst to select and navigate periods of interest in the network. We demonstrate MeasureFlow through case studies with real-world data.

**Keywords** —— dynamic networks, exploratory data analysis, network measures, interaction, signal processing

#### Citation
Liwenhan Xie, James O’Donnell, Benjamin Bach, and Jean-Daniel Fekete. 2020. Interactive Time-Series of Measures for Exploring Dynamic Networks. In <i>International Conference on Advanced Visual Interfaces (AVI ’20), September 28-October 2, 2020, Salerno, Italy</i>. ACM, New York, NY, USA.
<details><summary>Bibtex</summary><p>
<pre>
<code>
@InProceedings {
    title = {Interactive Time-Series of Measures for Exploring Dynamic Networks},
    author = {Liwenhan, Xie and James, O’Donnell and Benjamin, Bach and Jean-Daniel, Fekete},
    booktitle = {International Conference on Advanced Visual Interfaces (AVI ’20), September 28-October 2, 2020, Salerno, Italy},
    year = {2020},
    pages = {9},
    series = {AVI'20},
    doi = {10.1145/3399715.3399922},
    url = {https://doi.org/10.1145/3399715.3399922}
    publisher = {Association for Computing Society},
    address = {New York, NY, USA}
}
</code>
</pre>
</p>
</details>
