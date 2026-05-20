/* 轻列传卡片 · 单一来源 (single source of truth)
 * 被 landing/index.html (渲染页) 和 landing/preview.html (预览画廊) 共用。
 * 改样式 / 加皮肤 / 调比例都只改这里。 */
(function (global) {
  'use strict';

  // 皮肤：同版式，换一组配色变量
  var THEMES = {
    su: {
      name: '素白',
      bg: '#e5e5e5', ink: '#1a1a1a', accent: '#47494b', muted: '#5c5e60',
      darkbg: '#47494b', darktext: '#e5e5e5', seal: '#b22222',
      chipborder: 'rgba(71,73,75,.3)', wm: 'rgba(0,0,0,.05)', url: '#1a1a1a'
    },
    zhusha: {
      name: '朱砂宣纸',
      bg: '#f2e7d0', ink: '#2e2218', accent: '#8a5a3b', muted: '#7a6750',
      darkbg: '#5a3826', darktext: '#f2e7d0', seal: '#b22222',
      chipborder: 'rgba(90,56,38,.4)', wm: 'rgba(138,90,59,.08)', url: '#2e2218'
    }
  };

  // 比例：宽固定 1080，按平台改高
  var RATIOS = {
    '1:1':  { w: 1080, h: 1080, label: '1:1 朋友圈' },
    '3:4':  { w: 1080, h: 1440, label: '3:4 小红书' },
    '9:16': { w: 1080, h: 1920, label: '9:16 竖屏' }
  };

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

  function css(themeKey) {
    var t = THEMES[themeKey] || THEMES.su;
    return [
      '*{margin:0;padding:0;box-sizing:border-box}',
      'html,body{width:var(--w);height:var(--h)}',
      'body{background:' + t.bg + ';color:' + t.ink + ';font-family:"Songti SC","STSong","SimSun","Noto Serif CJK SC",Georgia,serif;position:relative;overflow:hidden}',
      '.card{width:var(--w);height:var(--h);background:' + t.bg + ';position:relative;overflow:hidden;display:flex;flex-direction:column}',
      '.watermark{position:absolute;right:-60px;top:30px;font-size:540px;font-weight:700;color:' + t.wm + ';line-height:.9;letter-spacing:-.04em;pointer-events:none;user-select:none}',
      '.kicker-bar{display:flex;justify-content:space-between;align-items:center;padding:48px 80px 0;position:relative;z-index:1;flex:0 0 auto}',
      '.chips{display:flex;gap:8px}',
      '.chip{display:inline-flex;align-items:center;padding:6px 13px;border:1px solid ' + t.chipborder + ';font-size:13px;letter-spacing:.06em;font-family:-apple-system,sans-serif}',
      '.chip .ord{opacity:.55;margin-right:5px}',
      '.right-kicker{font-size:12px;color:' + t.muted + ';letter-spacing:.22em;font-family:-apple-system,sans-serif}',
      '.main{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;min-height:0}',
      '.headline{margin:18px 80px 0;position:relative;z-index:1}',
      'h1{font-size:96px;font-weight:700;line-height:1;letter-spacing:.02em}',
      '.quote{font-size:23px;color:' + t.accent + ';font-style:italic;margin-top:16px}',
      '.quote::before{content:"\\300c"}.quote::after{content:"\\300d"}',
      '.underline{width:88px;height:2px;background:' + t.accent + ';margin-top:8px}',
      '.body-text{padding:24px 80px 0;font-size:24px;line-height:1.72;max-width:820px;letter-spacing:.03em}',
      '.body-text p{margin-bottom:14px}.body-text p:last-child{margin-bottom:0}',
      '.dark-block{margin:18px 80px 0;padding:22px 30px;background:' + t.darkbg + ';color:' + t.darktext + ';position:relative}',
      '.dark-block .label{font-size:14px;letter-spacing:.22em;color:rgba(255,255,255,.5);margin-bottom:12px}',
      '.dark-block .lines{font-size:20px;line-height:1.55}',
      '.dark-block .qm{position:absolute;right:18px;top:-42px;font-size:190px;color:rgba(255,255,255,.08);font-family:Georgia,serif;line-height:1}',
      '.seal{position:absolute;top:0;right:0;width:124px;height:124px;background:' + t.seal + ';display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;z-index:2;box-shadow:inset 0 0 0 4px rgba(255,255,255,.18)}',
      '.seal span{color:#fff;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;font-family:"Heiti SC","PingFang SC","Noto Sans CJK SC",sans-serif}',
      '.footer{position:absolute;bottom:46px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:flex-end;z-index:1}',
      '.url{font-size:17px;color:' + t.url + '}',
      '.sub{font-size:13px;color:' + t.muted + ';margin-top:5px;letter-spacing:.08em;font-family:-apple-system,sans-serif}',
      '.qr{width:100px;height:100px;background:#fff;padding:4px}',
      '.qr img{width:100%;height:100%;display:block}',
      '.warn{background:#fff5e0;border-left:3px solid #b27e3e;padding:8px 16px;margin:12px 80px 0;font-size:12px;color:#6b4a2c;font-family:-apple-system,sans-serif;letter-spacing:.04em}',
      '[contenteditable]{outline:0;cursor:text;border-radius:2px;transition:box-shadow .15s}',
      '[contenteditable]:hover{box-shadow:0 0 0 1px ' + t.accent + '55}',
      '[contenteditable]:focus{box-shadow:0 0 0 1.5px ' + t.accent + '}'
    ].join('\n');
  }

  // 卡片 body 内部结构。editable=true 时给文字加 contenteditable。
  function cardMarkup(d, editable) {
    var ce = editable ? ' contenteditable="true" spellcheck="false"' : '';
    var warnBlock = (d.mode === 'template' && d.warn)
      ? '<div class="warn">' + esc(d.warn) + '</div>' : '';
    return [
      '<div class="card">',
      '<div class="watermark">列</div>',
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
      '<div class="footer"><div><div class="url">simaqian.caojuege.com</div><div class="sub">司馬遷.skill · 扫码访问</div></div>',
      '<div class="qr"><img crossorigin="anonymous" src="https://api.qrserver.com/v1/create-qr-code/?data=https%3A%2F%2Fsimaqian.caojuege.com&size=120x120&margin=0" alt=""/></div></div>',
      '</div>'
    ].join('');
  }

  // 完整 iframe 文档。opts.h2cUrl 存在则附带 html2canvas 脚本。
  function html(data, themeKey, ratioKey, opts) {
    opts = opts || {};
    var d = {};
    for (var k in DEFAULTS) d[k] = (data && data[k] != null && data[k] !== '') ? data[k] : DEFAULTS[k];
    if (data && data.mode) d.mode = data.mode;
    var r = RATIOS[ratioKey] || RATIOS['3:4'];
    var h2c = opts.h2cUrl ? '<scr' + 'ipt src="' + opts.h2cUrl + '"></scr' + 'ipt>' : '';
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">'
      + '<style>:root{--w:' + r.w + 'px;--h:' + r.h + 'px}\n' + css(themeKey) + '</style></head>'
      + '<body>' + cardMarkup(d, !!opts.editable) + h2c + '</body></html>';
  }

  // 从已渲染文档读回当前(可能已编辑过的)文案，用于切换皮肤/比例时保留改动
  function readState(doc) {
    var out = {};
    ['title', 'chip1', 'chip2', 'chip3', 'quote', 'p1', 'p2', 'taishi'].forEach(function (f) {
      var el = doc.querySelector('[data-f="' + f + '"]');
      if (el) out[f] = el.textContent.trim();
    });
    return out;
  }

  global.LieZhuanCard = {
    THEMES: THEMES, RATIOS: RATIOS, DEFAULTS: DEFAULTS,
    css: css, html: html, readState: readState, esc: esc
  };
})(typeof window !== 'undefined' ? window : this);
