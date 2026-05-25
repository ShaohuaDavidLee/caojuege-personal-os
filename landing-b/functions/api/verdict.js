// Cloudflare Pages Function — /api/verdict
// GET  → 健康检查（不泄露 key）：{ ok, hasKey, model }
// POST { name, b1, b2 } → { line } 或可读的 { error, ... }
// key 仅从环境变量读取，绝不写入代码库。

const SYSTEM = [
  '你是「司马迁.skill · 太史判词」。损友给了关于某人的两条线索（一句口头禅、一个反差），你只写一句判词，是能直接甩进群里的那种。',
  '',
  '语气：半文半白——有《史记》的腔与节奏，但要一眼读懂，绝不用生僻文言、不掉书袋。狠、准、带刺。',
  '手法：别总结他是谁。抓住线索里的矛盾，点破他不肯承认的「怕／装／求而不得」，可用一句反转收尾，让他「被冒犯，但确实很准」。',
  '分寸：毒里留情——是当面也敢说的损，落点是「太懂你了」，不是羞辱，不作人身攻击。',
  '',
  '范例（只示范语气与狠度，不要照抄）：',
  '· 嘴上日日喊躺平，群里出事第一个冲——他怕的从不是累，是没人再需要他。',
  '· 「在吗」喊得最勤，回得最慢；非真忙，是早把你排到了第二。',
  '· 骂这破系统骂了十年，又夜夜替它收尾——骂得最狠的，往往最走不掉。',
  '',
  '硬规则：一句话，≤30字；不加引号；不写「太史公曰」；只输出这一句，不要解释、不要任何多余内容。'
].join('\n');

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function clip(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, 80);
}

function unwrap(line) {
  line = String(line).trim();
  for (var i = 0; i < 2; i++) {
    if (/^[「『"'“”].*[」』"'“”]$/.test(line)) line = line.slice(1, -1).trim();
    else break;
  }
  return line;
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
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + env.DEEPSEEK_API_KEY
        },
        body: JSON.stringify({
          model: env.DEEPSEEK_MODEL || 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: user }
          ],
          temperature: 1.1,
          max_tokens: 800,
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
    // 思考型模型答案在 content；万一 content 空，退而取 reasoning_content 的最后一句
    let line = (msg && msg.content) || '';
    if (!line && msg && msg.reasoning_content) {
      const parts = String(msg.reasoning_content).split(/[\n。！？]/).map(function (s) { return s.trim(); }).filter(Boolean);
      line = parts.length ? parts[parts.length - 1] : '';
    }
    line = unwrap(line);
    if (!line) {
      const fr = data && data.choices && data.choices[0] && data.choices[0].finish_reason;
      return json({ error: 'empty_output', finish_reason: fr || null }, 502);
    }
    if (Array.from(line).length > 40) line = Array.from(line).slice(0, 40).join('');

    return json({ line: line });
  } catch (e) {
    return json({ error: 'exception', detail: String((e && e.stack) || (e && e.message) || e).slice(0, 400) }, 500);
  }
}
