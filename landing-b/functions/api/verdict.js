// Cloudflare Pages Function — POST /api/verdict
// 入参 { name, b1, b2 } → 出参 { line }
// key 仅从环境变量读取（Cloudflare 控制台 / .dev.vars），绝不写入代码库。

const SYSTEM = [
  '你是司马迁.skill的「太史判词」生成器。损友给了关于某人的两条线索，',
  '你只输出一句判词：史官腔说现代事，狠、准、能被单独截图。',
  '规则：',
  '① 不要总结他是谁；要么点破他不肯承认的怕/装/求而不得，要么一句反转。',
  '② 毒要留功德——当面也能说的损，落点是「懂」不是羞辱，不做人身攻击。',
  '③ ≤32字，不含「太史公曰」前缀，不加引号，只输出这一句，不要任何解释或前后缀。'
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

export async function onRequestPost({ request, env }) {
  if (!env.DEEPSEEK_API_KEY) return json({ error: 'no_key' }, 500);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }

  const name = clip(body.name) || '某人';
  const b1 = clip(body.b1);
  const b2 = clip(body.b2);
  if (!b1 && !b2) return json({ error: 'empty_input' }, 400);

  const user = '对象称呼：' + name + '\n口头禅：' + (b1 || '（未填）') + '\n反差/隐藏bug：' + (b2 || '（未填）');

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
        max_tokens: 120,
        stream: false
      })
    });
  } catch (e) {
    return json({ error: 'fetch_failed', detail: String(e).slice(0, 150) }, 502);
  }

  if (!resp.ok) {
    const t = await resp.text().catch(function () { return ''; });
    return json({ error: 'upstream', status: resp.status, detail: t.slice(0, 200) }, 502);
  }

  const data = await resp.json().catch(function () { return null; });
  let line = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  line = String(line).trim()
    .replace(/^[「『"'“”]+/, '')   // 去掉模型自行加的开引号（卡片会自己加「」）
    .replace(/[」』"'“”]+$/, '')
    .trim();
  if (!line) return json({ error: 'empty_output' }, 502);
  if (Array.from(line).length > 40) line = Array.from(line).slice(0, 40).join('');

  return json({ line: line });
}
