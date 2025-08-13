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
    cursor: zoom-in;
    max-width: 200px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.poetry-image-item img {
    width: 100%;
    height: auto;
    display: block;
    transition: none;
}

/* 全屏图片覆盖层 */
.image-fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.image-fullscreen-overlay.active {
    opacity: 1;
    visibility: visible;
}

.image-fullscreen-overlay img {
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

/* 关闭按钮 */
.image-fullscreen-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    transition: background 0.2s ease;
}

.image-fullscreen-close:hover {
    background: rgba(255, 255, 255, 0.3);
}

.image-fullscreen-close::before {
    content: '×';
    font-weight: bold;
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
      <div class="poetry-image-item" onclick="toggleImageZoom(this)">
        <img src="{{ "/assets/poetry/" | append: img | relative_url }}" alt="{{ pub.title }}" />
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

<script>
document.addEventListener('DOMContentLoaded', function() {
    let fullscreenOverlay = null;
    
    // 创建全屏覆盖层
    function createFullscreenOverlay() {
        if (fullscreenOverlay) return fullscreenOverlay;
        
        const overlay = document.createElement('div');
        overlay.className = 'image-fullscreen-overlay';
        
        const closeBtn = document.createElement('div');
        closeBtn.className = 'image-fullscreen-close';
        
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        
        fullscreenOverlay = overlay;
        return overlay;
    }
    
    // 显示全屏图片
    function showFullscreenImage(imgSrc, imgAlt) {
        const overlay = createFullscreenOverlay();
        
        // 移除之前的图片
        const existingImg = overlay.querySelector('img');
        if (existingImg) {
            existingImg.remove();
        }
        
        // 创建新图片
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = imgAlt || '';
        
        // 将图片插入到关闭按钮之前
        const closeBtn = overlay.querySelector('.image-fullscreen-close');
        overlay.insertBefore(img, closeBtn);
        
        // 显示覆盖层
        overlay.classList.add('active');
        
        // 防止页面滚动
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭全屏图片
    function closeFullscreenImage() {
        if (fullscreenOverlay) {
            fullscreenOverlay.classList.remove('active');
            // 恢复页面滚动
            document.body.style.overflow = '';
        }
    }
    
    // 为所有图片添加点击事件
    const imageItems = document.querySelectorAll('.poetry-image-item');
    imageItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const img = this.querySelector('img');
            if (img) {
                showFullscreenImage(img.src, img.alt);
            }
        });
    });
    
    // 点击覆盖层关闭全屏图片
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('image-fullscreen-overlay') || 
            e.target.classList.contains('image-fullscreen-close')) {
            closeFullscreenImage();
        }
    });
    
    // ESC键关闭全屏图片
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFullscreenImage();
        }
    });
    
    // 窗口大小改变时关闭全屏图片
    window.addEventListener('resize', function() {
        closeFullscreenImage();
    });
});
</script>

<!-- 
<script src="https://cdn.jsdelivr.net/npm/itemsjs@1.0.40/dist/itemsjs.min.js"></script>

<script src="/assets/js/itemsjs.min.js"></script>
<script src="/assets/js/pubfilter.js"></script>
 -->