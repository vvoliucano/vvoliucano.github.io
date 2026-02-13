---
layout: none
title: NTU 校园水质系统
permalink: /ntu_water/
---
<link rel="stylesheet" href="{{ '/ntu_water/style.css' | relative_url }}">
<div class="lang-switch">
  <a href="#" id="lang-en" class="active">EN</a> |
  <a href="#" id="lang-zh">中</a>
</div>
<div class="container" id="ntu-water-app">
<h1>NTU Waterpoint Quality System<br><small>南洋理工大学饮水点监测</small></h1>

{% assign lang = 'en' %}
<script>
(function(){
  function setLang(l){
    document.querySelectorAll('.ntu-card .lang-en').forEach(e=>e.style.display=l==='en'?'block':'none');
    document.querySelectorAll('.ntu-card .lang-zh').forEach(e=>e.style.display=l==='zh'?'block':'none');
    document.getElementById('lang-en').classList.toggle('active', l==='en');
    document.getElementById('lang-zh').classList.toggle('active', l==='zh');
  }
  setLang('en');
  document.getElementById('lang-en').onclick=function(e){e.preventDefault(); setLang('en');};
  document.getElementById('lang-zh').onclick=function(e){e.preventDefault(); setLang('zh');};
})();
</script>

{% for pt in site.data.ntu_water.points %}
<div class="ntu-card">
  <div style="min-width:98px;min-height:88px">
    {% if pt.img %}<img class="ntu-card-img" src="{{ pt.img }}" alt="{{ pt.name_en }}" loading="lazy">{% endif %}
  </div>
  <div class="ntu-card-main">
    <div class="ntu-card-title">
      <span class="lang-en">{{ pt.name_en }}</span>
      <span class="lang-zh" style="display:none">{{ pt.name_zh }}</span>
    </div>
    <div class="ntu-card-sub">
      <span class="lang-en">{{ pt.building_en }} - {{ pt.location }}</span>
      <span class="lang-zh" style="display:none">{{ pt.building_zh }} · {{ pt.location }}</span>
    </div>
    <div class="ntu-card-grade">
      {{ pt.grade }}<span class="ntu-card-status">{{ pt.status }}</span>
    </div>
    <div class="ntu-card-tags">
      {% if pt.tags %}Tags: {{ pt.tags | join: ', ' }}{% endif %}
    </div>
    <div class="ntu-card-notes">
      <span class="lang-en">{{ pt.comment_en }}</span>
      <span class="lang-zh" style="display:none">{{ pt.comment_zh }}</span>
    </div>
  </div>
</div>
{% endfor %}

<hr style='border-top:1.5px solid #2a6aff44'>
<p style='font-size:0.98em;color:#7ec7ff;margin-top:2em;'>
  Data from campus survey · 海报/数据如有补充请联系管理员添加
</p>
</div>
