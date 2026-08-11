const fs = require('fs');
const path = require('path');

const sources = [1, 2, 3].map(index => ({
  index,
  text: fs.readFileSync(path.join(__dirname, 'data', `flight-ocr-${index}.txt`), 'utf8')
}));

const airlineNames = ['中国国航', '厦门航空', '南方航空', '东方航空', '海南航空', '山东航空', '深圳航空', '吉祥航空', '上海航空', '长龙航空', '河北航空', '湖南航空', '奥凯航空', '首都航空', '成都航空', '中国联合航空', '港龙航空', '国泰航空', '奥地利航空', '汉莎航空', '泰国航空', '西部航空', '新加坡航空', '印度航空', '印尼亚航', '亚洲航空', '印尼连城航空', '越捷航空', '酷航', '北部湾航空'];
const airportFixes = [
  [/.*新加坡樟宜.*/, '新加坡樟宜'], [/.*北京首都.*/, '北京首都'], [/.*北京大兴.*/, '北京大兴'], [/.*北京南苑.*/, '北京南苑'],
  [/.*厦门高崎.*/, '厦门高崎'], [/.*武汉天河.*/, '武汉天河'], [/.*香港国际.*/, '香港国际'], [/.*温哥华国际.*/, '温哥华国际'],
  [/.*柏林泰格尔.*/, '柏林泰格尔'], [/.*慕尼黑.*/, '慕尼黑'], [/.*维也纳国际.*/, '维也纳国际'], [/.*苏加诺哈达.*/, '雅加达苏加诺哈达'],
  [/.*巴厘岛.*努拉.*伊.*/, '巴厘岛伍拉·赖'], [/.*吉隆坡国际.*/, '吉隆坡国际'], [/.*杭州萧山.*/, '杭州萧山'],
  [/.*上海浦东.*/, '上海浦东'], [/.*上海虹桥.*/, '上海虹桥'], [/.*深圳宝安.*/, '深圳宝安'], [/.*福州长乐.*/, '福州长乐'],
  [/.*曼谷素万那普.*/, '曼谷素万那普'], [/.*悉尼.*斯福德.*/, '悉尼金斯福德·史密斯'], [/.*河内内排.*/, '河内内排'],
  [/.*成都天府.*/, '成都天府'], [/.*成都双流.*/, '成都双流'], [/.*石家庄正定.*/, '石家庄正定'], [/.*珠海金湾.*/, '珠海金湾'],
  [/.*梅州梅县.*/, '梅州梅县']
];

function normalizeAirport(raw) {
  const cleaned = raw.replace(/[“”"'，,。©°?9|]/g, '').replace(/\s+/g, '').replace(/^1(?=[\u4e00-\u9fff])/, '').replace(/T\d.*$/i, '').trim();
  const match = airportFixes.find(([pattern]) => pattern.test(cleaned));
  return match ? match[1] : cleaned || null;
}

function normalizeFlightNumber(raw) {
  return raw.toUpperCase().replace(/\s+/g, '').replace(/^CAI(?=\d)/, 'CA1').replace(/^TRI(?=\d|$)/, 'TR1').replace(/^TRIO$/, 'TR10').replace(/^AI(?=\d)/, 'AI');
}

function blocksForSource(source) {
  const lines = source.text.split(/\r?\n/);
  const starts = [];
  lines.forEach((line, index) => { if (/^[^0-9]{0,8}\d{2}-\d{2}\b/.test(line.trim())) starts.push(index); });
  return starts.map((start, blockIndex) => ({
    source: source.index,
    lines: lines.slice(start, starts[blockIndex + 1] ?? lines.length).filter(line => line.trim())
  }));
}

function parseBlock(block) {
  const first = block.lines[0].trim();
  const dateMatch = first.match(/(\d{2})-(\d{2})/);
  if (!dateMatch) return null;
  const yearMatch = block.lines.slice(0, 5).join(' ').match(/\b(20(?:1[4-9]|2[0-6]))\b/);
  const flightMatches = block.lines.flatMap(line => [...line.matchAll(/\b([A-Z]{1,3}\s?\d{1,4}|[A-Z]{2,3}OPEN)\b/gi)].map(match => normalizeFlightNumber(match[1])));
  const uniqueFlights = [...new Set(flightMatches.filter(value => !/^20\d{2}$/.test(value) && !/^T\d+$/i.test(value)))];
  const airline = airlineNames.find(name => first.includes(name)) || airlineNames.find(name => block.lines.join(' ').includes(name)) || null;
  const stops = [];
  for (const line of block.lines) {
    const timeMatch = line.match(/(\d{1,3})[:：](\d{2,3})(?:\+?1)?\s*(.+)$/);
    if (!timeMatch) continue;
    const hourText = timeMatch[1].length === 3 ? timeMatch[1].slice(0, 2) : timeMatch[1];
    const minuteText = timeMatch[2].slice(-2);
    const hour = Number(hourText);
    if (hour > 23) continue;
    const airport = normalizeAirport(timeMatch[3]);
    if (!airport || airport.length < 2) continue;
    stops.push({ time: `${String(hour).padStart(2, '0')}:${minuteText}`, airport });
  }
  const legs = [];
  for (let index = 0; index + 1 < stops.length; index += 2) {
    legs.push({
      flight_number: uniqueFlights[index / 2] || uniqueFlights[0] || null,
      departure: stops[index],
      arrival: stops[index + 1]
    });
  }
  const correction = [
    { test: /MF8590/, from: '泉州晋江', to: '北京大兴' },
    { test: /TR188/, from: '新加坡樟宜', to: '杭州萧山' },
    { test: /酷航 TRIS/, from: '巴厘岛伍拉·赖', to: '新加坡樟宜', flight: 'TR115' },
    { test: /CZ3732/, from: '北京大兴', to: '珠海金湾' },
    { test: /CA1303/, from: '北京首都', to: '深圳宝安' },
    { test: /PN6323/, from: '南京禄口', to: '福州长乐' },
    { test: /MU2812/, from: '北京大兴', to: '南京禄口' },
    { test: /KN5917/, from: '北京大兴', to: '连城冠豸山' },
    { test: /KN5918/, from: '连城冠豸山', to: '北京大兴' },
    { test: /QG523/, from: '新加坡樟宜', to: '雅加达苏加诺哈达' }
  ].find(item => item.test.test(block.lines.join(' ')));
  if (correction && legs[0]) {
    legs[0].departure.airport = correction.from;
    legs[0].arrival.airport = correction.to;
    if (correction.flight) {
      legs[0].flight_number = correction.flight;
      uniqueFlights.splice(0, uniqueFlights.length, correction.flight);
    }
  }
  const year = yearMatch ? Number(yearMatch[1]) : null;
  return {
    date: year ? `${year}-${dateMatch[1]}-${dateMatch[2]}` : null,
    month_day: `${dateMatch[1]}-${dateMatch[2]}`,
    airline,
    flight_numbers: uniqueFlights,
    legs,
    manually_corrected: Boolean(correction),
    source_image: block.source,
    confidence: year && legs.length && legs.every(leg => leg.departure.airport && leg.arrival.airport) ? 'medium' : 'low',
    raw_text: block.lines.join('\n')
  };
}

const parsed = sources.flatMap(blocksForSource).map(parseBlock).filter(Boolean);

// The screenshots are reverse chronological. Fill rare missed years from adjacent records.
for (const sourceIndex of [1, 2, 3]) {
  const records = parsed.filter(record => record.source_image === sourceIndex);
  let currentYear = null;
  for (const record of records) {
    if (record.date) currentYear = Number(record.date.slice(0, 4));
    else if (currentYear) record.date = `${currentYear}-${record.month_day}`;
  }
}

function dedupeKey(record) {
  const route = record.legs.map(leg => `${leg.departure.airport}>${leg.arrival.airport}`).join('|');
  return `${record.date}|${record.flight_numbers[0] || route}`;
}

const seen = new Map();
for (const record of parsed) {
  const key = dedupeKey(record);
  const previous = seen.get(key);
  if (!previous || (previous.confidence === 'low' && record.confidence !== 'low')) seen.set(key, record);
}

const records = [...seen.values()]
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  .map((record, index) => ({ id: `flight-${String(index + 1).padStart(3, '0')}`, ...record }));

const output = {
  schema_version: 1,
  generated_from: [
    'codex-clipboard-3b2f603b-4fcd-417b-88a2-8d1418608ef3.jpg',
    'codex-clipboard-a5a8b769-e8d6-40db-9f88-49a249d0618a.jpg',
    'codex-clipboard-017d3ae9-4de1-4c21-be62-f8dd44ca79f3.jpg'
  ],
  source_header_reported_count: 142,
  record_count: records.length,
  flight_segment_count: records.reduce((sum, record) => sum + record.legs.length, 0),
  note: 'The screenshots contain 136 visible date cards; connecting flights are stored in each card’s legs array. The app header reports 142 trips. Review records marked low confidence against the source images.',
  records
};

fs.writeFileSync(path.join(__dirname, 'data', 'flight-history.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ count: records.length, medium: records.filter(record => record.confidence === 'medium').length, low: records.filter(record => record.confidence === 'low').length }));
