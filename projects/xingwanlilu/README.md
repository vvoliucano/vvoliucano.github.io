# 行万里路：本地启动

在网站仓库根目录运行：

```bash
cd "/Volumes/Can Disk/writing/vvoliucano.github.io"
python3 -m http.server 1111
```

然后在浏览器访问：

<http://localhost:1111/projects/xingwanlilu/>

停止服务时，在运行命令的终端中按 `Control + C`。

> 请从仓库根目录启动服务器，不要直接双击 `index.html`。这样河流和省界的 GeoJSON 文件才能正常加载。

## 地图数据

- 世界国家边界：[vvoliucano/world.geo.json](https://github.com/vvoliucano/world.geo.json) 的 `countries.geo.json`
- 新加坡边界补充：Natural Earth Admin 0 Countries（主边界数据为精简版，未包含部分微型国家）
- 中国省级边界：`data/china-provinces.geojson`
- 中国河流：ArcGIS `china_rivers` 图层中的长江与黄河

## 行程数据

三张航班历史截图已整理为 [`data/flight-history.json`](data/flight-history.json)。文件以日期卡片为记录，联程航班保存在每条记录的 `legs` 数组中，并附带原始 OCR 文本、来源截图编号和置信度，便于后续校对。

火车截图与补充行程已整理为 [`data/train-history.json`](data/train-history.json)，共 38 条记录，其中 32 条已完成、6 条退票或改签；已完成记录包含 38 段车程。地图只使用已完成记录点亮城市与年份。车站对应的城市坐标保存在 [`data/train-cities.json`](data/train-cities.json)。

重新运行提取脚本：

```bash
node projects/xingwanlilu/extract-flight-history.js
```
