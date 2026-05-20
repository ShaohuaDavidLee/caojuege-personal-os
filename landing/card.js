/* 轻列传卡片 · 单一来源 (single source of truth)
 * 固定 3:4 (1080x1440) · 素白皮肤。被 landing/index.html 与 landing/preview.html 共用。
 * 改样式只改这里。 */
(function (global) {
  'use strict';

  var W = 1080, H = 1440;

  var DEFAULTS = {
    mode: 'template',
    title: '今人列传',
    chip1: '行路人', chip2: '问学者', chip3: '造物者',
    quote: '向未知处行',
    p1: '今人者，华夏人也。',
    p2: '其所求者，行远自迩，沉之为作。',
    taishi: '志之所趋，无远弗届。',
    warn: ''
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function css() {
    return [
      '*{margin:0;padding:0;box-sizing:border-box}',
      'html,body{width:' + W + 'px;height:' + H + 'px}',
      'body{background:#e5e5e5;color:#1a1a1a;font-family:"Songti SC","STSong","Source Han Serif SC","Source Han Serif CN","Noto Serif CJK SC","Noto Serif SC","SimSun","NSimSun",Georgia,serif;position:relative;overflow:hidden}',
      '.card{width:' + W + 'px;height:' + H + 'px;background:#e5e5e5;position:relative;overflow:hidden;display:flex;flex-direction:column}',
      '.watermark{position:absolute;right:-24px;top:48px;display:flex;flex-direction:column;line-height:.8;font-size:400px;font-weight:700;color:rgba(0,0,0,.05);letter-spacing:-.04em;pointer-events:none;user-select:none}',
      '.kicker-bar{display:flex;justify-content:space-between;align-items:center;padding:60px 80px 0;position:relative;z-index:1;flex:0 0 auto}',
      '.chips{display:flex;gap:8px}',
      '.chip{display:inline-flex;align-items:center;padding:7px 14px;border:1px solid rgba(71,73,75,.3);font-size:14px;letter-spacing:.06em;font-family:-apple-system,sans-serif}',
      '.chip .ord{opacity:.55;margin-right:5px}',
      '.right-kicker{font-size:13px;color:#5c5e60;letter-spacing:.22em;font-family:-apple-system,sans-serif}',
      '.main{flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-evenly;min-height:0;padding-bottom:200px}',
      '.headline{margin:0 80px;position:relative;z-index:1}',
      'h1{font-size:110px;font-weight:700;line-height:1;letter-spacing:.02em}',
      '.quote{font-size:28px;color:#47494b;font-style:italic;margin-top:22px}',
      '.quote::before{content:"\\300c"}.quote::after{content:"\\300d"}',
      '.underline{width:96px;height:2px;background:#47494b;margin-top:14px}',
      '.body-text{padding:0 80px;font-size:30px;line-height:1.95;max-width:900px;letter-spacing:.03em}',
      '.body-text p{margin-bottom:18px}.body-text p:last-child{margin-bottom:0}',
      '.dark-block{margin:0 80px;padding:30px 36px;background:#47494b;color:#e5e5e5;position:relative}',
      '.dark-block .label{font-size:15px;letter-spacing:.22em;color:rgba(229,229,229,.6);margin-bottom:14px}',
      '.dark-block .lines{font-size:24px;line-height:1.65}',
      '.dark-block .qm{position:absolute;right:20px;top:-46px;font-size:200px;color:rgba(255,255,255,.08);font-family:Georgia,serif;line-height:1}',
      '.seal{position:absolute;top:0;right:0;width:124px;height:124px;background:#b22222;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;z-index:2;box-shadow:inset 0 0 0 4px rgba(255,255,255,.18)}',
      '.seal span{color:#fff;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;font-family:"PingFang SC","Heiti SC","Microsoft YaHei","Source Han Sans SC","Noto Sans CJK SC",sans-serif}',
      '.footer{position:absolute;bottom:60px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:flex-end;z-index:1}',
      '.footer .info{display:flex;flex-direction:column;justify-content:flex-end}',
      '.brand{font-size:20px;letter-spacing:.1em;color:#5c5e60;font-family:-apple-system,sans-serif;margin-bottom:8px}',
      '.url{font-size:30px;font-weight:700;color:#1a1a1a;letter-spacing:.01em}',
      '.sub{font-size:16px;color:#47494b;margin-top:8px;letter-spacing:.04em;font-family:-apple-system,sans-serif}',
      '.qr{width:148px;height:148px;background:#fff;padding:8px;box-shadow:0 0 0 2px #1a1a1a}',
      '.qr img{width:100%;height:100%;display:block}',
      '.warn{background:#fff5e0;border-left:3px solid #b27e3e;padding:9px 18px;margin:14px 80px 0;font-size:13px;color:#6b4a2c;font-family:-apple-system,sans-serif;letter-spacing:.04em}',
      '[contenteditable]{outline:0;cursor:text;border-radius:2px;transition:box-shadow .15s}',
      '[contenteditable]:hover{box-shadow:0 0 0 1px rgba(71,73,75,.45)}',
      '[contenteditable]:focus{box-shadow:0 0 0 1.5px #47494b}'
    ].join('\n');
  }

  // 卡片 body 内部结构。editable=true 时给文字加 contenteditable。
  function cardMarkup(d, editable) {
    var ce = editable ? ' contenteditable="true" spellcheck="false"' : '';
    var warnBlock = (d.mode === 'template' && d.warn)
      ? '<div class="warn">' + esc(d.warn) + '</div>' : '';
    return [
      '<div class="card">',
      '<div class="watermark"><span>列</span><span>傳</span></div>',
      '<div class="kicker-bar"><div class="chips">',
      '<span class="chip"><span class="ord">一</span><span data-f="chip1"' + ce + '>' + esc(d.chip1) + '</span></span>',
      '<span class="chip"><span class="ord">二</span><span data-f="chip2"' + ce + '>' + esc(d.chip2) + '</span></span>',
      '<span class="chip"><span class="ord">三</span><span data-f="chip3"' + ce + '>' + esc(d.chip3) + '</span></span>',
      '</div><span class="right-kicker">PERSONAL ANNAL · 列 傳</span></div>',
      '<div class="main">',
      '<div class="headline">',
      '<h1 data-f="title"' + ce + '>' + esc(d.title) + '</h1>',
      '<div class="quote" data-f="quote"' + ce + '>' + esc(d.quote) + '</div>',
      '<div class="underline"></div>',
      '<div class="seal"><span>司</span><span>馬</span><span>遷</span><span>撰</span></div>',
      '</div>',
      warnBlock,
      '<div class="body-text"><p data-f="p1"' + ce + '>' + esc(d.p1) + '</p><p data-f="p2"' + ce + '>' + esc(d.p2) + '</p></div>',
      '<div class="dark-block"><div class="qm">"</div><div class="label">太 史 公 曰 ——</div><div class="lines" data-f="taishi"' + ce + '>' + esc(d.taishi) + '</div></div>',
      '</div>',
      '<div class="footer"><div class="info"><div class="brand">司馬遷.skill · 列傳</div><div class="url">simaqian.caojuege.com</div><div class="sub">扫码生成你的列传</div></div>',
      '<div class="qr"><img crossorigin="anonymous" src="https://api.qrserver.com/v1/create-qr-code/?data=https%3A%2F%2Fsimaqian.caojuege.com&size=160x160&margin=0" alt=""/></div></div>',
      '</div>'
    ].join('');
  }

  // 完整 iframe 文档。opts.editable 文字可编辑；opts.h2cUrl 存在则附带 html2canvas 脚本。
  function html(data, opts) {
    opts = opts || {};
    var d = {};
    for (var k in DEFAULTS) d[k] = (data && data[k] != null && data[k] !== '') ? data[k] : DEFAULTS[k];
    if (data && data.mode) d.mode = data.mode;
    var h2c = opts.h2cUrl ? '<scr' + 'ipt src="' + opts.h2cUrl + '"></scr' + 'ipt>' : '';
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">'
      + '<style>' + css() + '</style></head>'
      + '<body>' + cardMarkup(d, !!opts.editable) + h2c + '</body></html>';
  }

  // 从已渲染文档读回当前(可能已编辑过的)文案
  function readState(doc) {
    var out = {};
    ['title', 'chip1', 'chip2', 'chip3', 'quote', 'p1', 'p2', 'taishi'].forEach(function (f) {
      var el = doc.querySelector('[data-f="' + f + '"]');
      if (el) out[f] = el.textContent.trim();
    });
    return out;
  }

  global.LieZhuanCard = { W: W, H: H, DEFAULTS: DEFAULTS, html: html, readState: readState, esc: esc };
})(typeof window !== 'undefined' ? window : this);
