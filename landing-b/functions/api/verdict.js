// Cloudflare Pages Function — /api/verdict
// GET  → 健康检查（不泄露 key）：{ ok, hasKey, model }
// POST { name, b1, b2 } → { lines:[..3] } 或可读的 { error, ... }
// key 仅从环境变量读取，绝不写入代码库。

const SYSTEM = [
  '你是「司马迁.skill · 太史判词」。损友给了关于某人的两条线索（一句口头禅、一个反差），你要写判词——能直接甩进群里、让人「卧槽有点准」的那种。',
  '',
  '【狠度·最重要】要扎心、一针见血、出其不意。点破他自己都不愿承认的那件事，让他被冒犯又无法反驳。',
  '【禁止】鸡汤、漂亮话、升华；尤其禁止同情式洗白的软收尾（如「他怕的不是X，是Y」这种把人哄好的句式）；禁止套路、禁止泛泛而谈、禁止只是复述线索。',
  '【语气】半文半白——有《史记》的腔与节奏，但一眼读懂，不堆生僻文言、不掉书袋。',
  '【分寸】是当面也敢说的损，扎人而不羞辱、不作人身攻击；越熟越敢狠。',
  '',
  '范例（只示范狠度与半文白语气，不要照抄、不要套句式）：',
  '· 「这事我熟」开口最快，「这锅我背」从未接过。',
  '· 对世界有一万个主意，对自己一个交代都欠着。',
  '· 永远在「下周开始」，把自己活成了最大的烂尾工程。',
  '',
  '硬规则：输出【3 句角度各不相同】的判词，每句一行、各 ≤30 字；不加引号、不加序号或符号、不写「太史公曰」；除这 3 行外不要任何内容。'
].join('\n');

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function clip(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, 80); }

function cleanLine(s) {
  s = String(s).trim()
    .replace(/^[\s\-—·•*\d.、。)）]+/, '')   // 去掉行首序号/项目符号
    .trim();
  for (var i = 0; i < 2; i++) {
    if (/^[「『"'“”].*[」』"'“”]$/.test(s)) s = s.slice(1, -1).trim();
    else break;
  }
  if (Array.from(s).length > 40) s = Array.from(s).slice(0, 40).join('');
  return s;
}

function extractLines(text) {
  var out = [], seen = {};
  String(text || '').split(/\r?\n/).forEach(function (raw) {
    var s = cleanLine(raw);
    if (s && !seen[s]) { seen[s] = 1; out.push(s); }
  });
  return out.slice(0, 3);
}

export async function onRequestGet({ env }) {
  return json({
    ok: true,
    hasKey: !!(env && env.DEEPSEEK_API_KEY),
    model: (env && env.DEEPSEEK_MODEL) || 'deepseek-chat'
  });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.DEEPSEEK_API_KEY) return json({ error: 'no_key' }, 500);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }

    const name = clip(body.name) || '某人';
    const b1 = clip(body.b1);
    const b2 = clip(body.b2);
    if (!b1 && !b2) return json({ error: 'empty_input' }, 400);

    const user = '对象称呼：' + name + '\n口头禅：' + (b1 || '（未填）') + '\n反差/隐藏bug：' + (b2 || '（未填）');

    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 20000);

    let resp;
    try {
      resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + env.DEEPSEEK_API_KEY },
        body: JSON.stringify({
          model: env.DEEPSEEK_MODEL || 'deepseek-chat',
          messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
          temperature: 1.2,
          max_tokens: 900,
          stream: false
        }),
        signal: ctrl.signal
      });
    } catch (e) {
      clearTimeout(timer);
      const aborted = e && e.name === 'AbortError';
      return json({ error: aborted ? 'timeout' : 'fetch_failed', detail: String((e && e.message) || e).slice(0, 200) }, 504);
    }
    clearTimeout(timer);

    const raw = await resp.text();
    if (!resp.ok) return json({ error: 'upstream', status: resp.status, detail: raw.slice(0, 300) }, 502);

    let data;
    try { data = JSON.parse(raw); } catch (e) { return json({ error: 'bad_upstream_json', detail: raw.slice(0, 200) }, 502); }

    const msg = data && data.choices && data.choices[0] && data.choices[0].message;
    let content = (msg && msg.content) || '';
    if (!content && msg && msg.reasoning_content) content = String(msg.reasoning_content);

    const lines = extractLines(content);
    if (!lines.length) {
      const fr = data && data.choices && data.choices[0] && data.choices[0].finish_reason;
      return json({ error: 'empty_output', finish_reason: fr || null }, 502);
    }
    return json({ lines: lines, line: lines[0] });
  } catch (e) {
    return json({ error: 'exception', detail: String((e && e.stack) || (e && e.message) || e).slice(0, 400) }, 500);
  }
}
