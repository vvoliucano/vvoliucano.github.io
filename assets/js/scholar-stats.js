(function () {
  'use strict';
  const section = document.querySelector('.scholar-stats');
  if (!section) return;
  const chinese = section.dataset.lang === 'zh';
  let newest = -Infinity;

  function render(data) {
    const entries = Object.entries(data.cites_per_year).sort((a, b) => Number(a[0]) - Number(b[0]));
    // Keep the compact chart readable under the profile photo.
    const visible = entries.slice(-5);
    const max = Math.max(1, ...visible.map(entry => entry[1]));
    const chart = section.querySelector('.scholar-stats__chart');
    chart.replaceChildren();
    chart.setAttribute('aria-label', visible.map(([year, count]) => `${year}: ${count}`).join('; '));
    visible.forEach(([year, count]) => {
      const column = document.createElement('div');
      column.className = 'scholar-stats__column';
      column.title = chinese ? `${year} 年：${count} 次引用` : `${year}: ${count} citations`;
      const value = document.createElement('span');
      value.className = 'scholar-stats__value';
      value.textContent = count;
      const bar = document.createElement('span');
      bar.className = 'scholar-stats__bar';
      bar.style.height = `${count / max * 82}px`;
      const label = document.createElement('span');
      label.className = 'scholar-stats__year';
      label.textContent = year;
      column.append(value, bar, label);
      chart.append(column);
    });
    section.querySelector('.scholar-stats__total').textContent = chinese
      ? `· ${data.citedby.toLocaleString()} 次引用` : `· ${data.citedby.toLocaleString()} citations`;
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date(data.updated));
    section.querySelector('.scholar-stats__updated').textContent = chinese ? `更新于 ${date}` : `Updated ${date}`;
  }

  async function load(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
      if (!response.ok) throw new Error('Citation data unavailable');
      const data = await response.json();
      if (data.author_id !== section.dataset.author || !Number.isInteger(data.citedby) || data.citedby < 0
          || !Number.isFinite(Date.parse(data.updated)) || !data.cites_per_year
          || typeof data.cites_per_year !== 'object' || Array.isArray(data.cites_per_year)
          || !Object.keys(data.cites_per_year).length
          || !Object.entries(data.cites_per_year).every(([year, count]) => /^\d{4}$/.test(year) && Number.isInteger(count) && count >= 0)) {
        throw new Error('Invalid citation data');
      }
      if (Date.parse(data.updated) > newest) {
        newest = Date.parse(data.updated);
        render(data);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  Promise.allSettled([load(section.dataset.fallback), load(section.dataset.source)]).then(() => {
    if (newest === -Infinity) {
      section.querySelector('.scholar-stats__updated').textContent = chinese
        ? '暂时无法加载，请点击 Google Scholar 查看' : 'View citation statistics on Google Scholar ↗';
    }
  });
}());
