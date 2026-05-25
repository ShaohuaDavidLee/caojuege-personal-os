// 太史判词卡 · Canvas 2D 渲染器（单一来源，三页复用）
// 3:4 (1080×1440)。三色变体 a 灰 / b 白 / c 黑。规避 html2canvas 中文叠字。
(function (g) {
  'use strict';
  var SERIF = '"Noto Serif SC","Songti SC","STSong",serif';
  var MONO = 'ui-monospace,Menlo,monospace';
  var RATIO = 2, W = 1080, H = 1440, P = 84;
  var NO_START = '」』）】》〉。，、；：！？·…％”’';
  var NO_END = '「『（【《〈“‘';

  var PAL = {
    a: { bg: '#e5e5e5', ink: '#1a1a1a', mut: '#5c5e60', wm: 'rgba(0,0,0,.06)', rule: 'rgba(0,0,0,.16)', cod: 'rgba(26,26,26,.58)' },
    b: { bg: '#ffffff', ink: '#1a1a1a', mut: '#5c5e60', wm: 'rgba(0,0,0,.05)', rule: 'rgba(0,0,0,.14)', cod: 'rgba(26,26,26,.58)' },
    c: { bg: '#1a1a1a', ink: '#e8e6e1', mut: '#9a9c9e', wm: 'rgba(255,255,255,.07)', rule: 'rgba(255,255,255,.16)', cod: 'rgba(232,230,225,.6)' }
  };

  var CODICILS = [
    '此判七分戏，三分真——{who}虽如此，急难时却总第一个到。',
    '损归损，{who}这人，值得交。',
    '能被这样记一笔的，都是舍不得删的好友。',
    '判其短，亦记其长：{who}之「坏」，是熟人才懂的好。'
  ];

  function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function stripTail(s) { return clean(s).replace(/[。.!！；;，,]+$/, ''); }
  function shorten(s, n) { var a = Array.from(String(s || '')); return a.length > n ? a.slice(0, n - 1).join('') + '…' : a.join(''); }
  function hash(seed) { var h = 2166136261, s = String(seed); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
  function vol(seed) { return String(hash(seed) % 899 + 100); }
  function fillWho(t, who) { return String(t).replace(/\{who\}/g, who); }

  function buildLine(name, b1, b2, off) {
    var q = stripTail(b1).replace(/[（(].*$/, '').trim() || '在吗';
    var fc = stripTail(b2) || '想法太多，三天换一个新坑';
    var t = [
      '世人只记得他那句「' + q + '」，没人替他说出：' + fc + '。',
      name + '最大的破绽，不是「' + q + '」，是' + fc + '。',
      '嘴上「' + q + '」，身体却很诚实——' + fc + '。',
      '别信他那句「' + q + '」。真相是，' + fc + '。',
      '一个把「' + q + '」挂在嘴边的人，偏偏' + fc + '。这才是他。'
    ];
    return t[(hash(name + b1 + b2) + (off || 0)) % t.length];
  }

  function pickCodicil(name, off) {
    return fillWho(CODICILS[(hash(name) + (off || 0)) % CODICILS.length], clean(name) || '某君');
  }

  // o: { name, b1, b2, off, line?, codicil?, variant? }
  function buildData(o) {
    o = o || {};
    var name = clean(o.name) || '某人';
    var b1 = o.b1 || '', b2 = o.b2 || '', off = o.off || 0;
    return {
      name: name,
      line: o.line || buildLine(name, b1, b2, off),
      ev: '损友供词　' + shorten(stripTail(b1) || '—', 16) + '；' + shorten(stripTail(b2) || '—', 18) + '。',
      codicil: o.codicil || pickCodicil(name, off),
      vol: vol(name + b1 + b2),
      variant: o.variant || 'a'
    };
  }

  function setLS(ctx, px) { try { ctx.letterSpacing = px + 'px'; } catch (e) {} }

  function wrap(ctx, text, maxW, maxLines) {
    var toks = String(text || '').match(/[A-Za-z0-9_.:#%+\-]+|\s+|./gu) || [];
    var lines = [], line = '';
    function push() { if (line.trim()) lines.push(line.trim()); line = ''; }
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (ctx.measureText(line + t).width <= maxW) { line += t; continue; }
      if (line) push();
      if (!/^\s+$/.test(t)) line = t;
      if (maxLines && lines.length >= maxLines) break;
    }
    if (line && (!maxLines || lines.length < maxLines)) push();
    for (var k = 0; k < lines.length - 1; k++) {
      while (lines[k].length > 1 && lines[k + 1] && NO_START.indexOf(lines[k + 1][0]) >= 0) {
        lines[k + 1] = lines[k].slice(-1) + lines[k + 1]; lines[k] = lines[k].slice(0, -1);
      }
      while (lines[k].length > 1 && NO_END.indexOf(lines[k].slice(-1)) >= 0) {
        lines[k + 1] = lines[k].slice(-1) + lines[k + 1]; lines[k] = lines[k].slice(0, -1);
      }
    }
    if (maxLines && lines.length === maxLines) {
      var last = lines[maxLines - 1];
      while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
      if (last && text.trim() !== lines.join('').trim()) lines[maxLines - 1] = last + '…';
    }
    return lines;
  }

  function drawSeal(ctx, x, y, w, h) {
    var ch = ['司', '馬', '毒', '判'];
    ctx.save();
    ctx.fillStyle = '#a8302d'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#7d211e'; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.strokeStyle = 'rgba(240,223,196,.5)'; ctx.lineWidth = 2.5; ctx.strokeRect(x + 11, y + 11, w - 22, h - 22);
    ctx.fillStyle = '#f0dfc4'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 ' + Math.round(Math.min(w, h) * 0.34) + 'px ' + SERIF; setLS(ctx, 0);
    ctx.fillText(ch[0], x + w * 0.3, y + h * 0.3); ctx.fillText(ch[1], x + w * 0.7, y + h * 0.3);
    ctx.fillText(ch[2], x + w * 0.3, y + h * 0.7); ctx.fillText(ch[3], x + w * 0.7, y + h * 0.7);
    ctx.restore();
  }

  // 占位二维码（正式版本地生成真码，指向 s.caojuege.com）
  function drawQR(ctx, x, y, s) {
    ctx.save();
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, s, s);
    var pad = Math.round(s * 0.08), n = 21, cell = (s - pad * 2) / n, ox = x + pad, oy = y + pad, h = hash('s.caojuege.com');
    ctx.fillStyle = '#1a1a1a';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8)) continue;
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      if (h % 100 < 46) ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
    }
    function f(fx, fy) {
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(ox + fx * cell, oy + fy * cell, cell * 7, cell * 7);
      ctx.fillStyle = '#fff'; ctx.fillRect(ox + (fx + 1) * cell, oy + (fy + 1) * cell, cell * 5, cell * 5);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(ox + (fx + 2) * cell, oy + (fy + 2) * cell, cell * 3, cell * 3);
    }
    f(0, 0); f(n - 7, 0); f(0, n - 7);
    ctx.restore();
  }

  function draw(canvas, d) {
    if (!canvas) return;
    var p = PAL[d.variant] || PAL.a;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(RATIO, 0, 0, RATIO, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);

    // 水印 判詞（繁体竖排两字）
    ctx.save();
    ctx.fillStyle = p.wm; ctx.font = '900 440px ' + SERIF; setLS(ctx, 0);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('判', W * 0.66, H * 0.33); ctx.fillText('詞', W * 0.66, H * 0.63);
    ctx.restore();

    // 顶部：对象名标题 + 卷号 + 右上 annal
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.fillStyle = p.ink; ctx.font = '700 44px ' + SERIF; setLS(ctx, 0); ctx.textAlign = 'left';
    ctx.fillText(d.name, P, 80);
    ctx.fillStyle = p.mut; ctx.font = '500 20px ' + SERIF; setLS(ctx, 1);
    ctx.fillText('毒判 · 第 ' + d.vol + ' 卷', P, 138);
    ctx.font = '500 19px ' + MONO; setLS(ctx, 4); ctx.textAlign = 'right';
    ctx.fillText('PERSONAL ANNAL · 判', W - P, 106);
    ctx.restore();

    // 朱印
    drawSeal(ctx, W - P - 148, 174, 148, 166);

    // 判词正文（区间居中）
    ctx.save();
    ctx.fillStyle = p.ink; ctx.font = '700 70px ' + SERIF; setLS(ctx, 1);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var lineH = 104, lines = wrap(ctx, '「' + d.line + '」', W - 2 * P, 5);
    var zT = 398, zB = 946, y = Math.max(zT, (zT + zB) / 2 - (lines.length * lineH) / 2);
    for (var i = 0; i < lines.length; i++) { ctx.fillText(lines[i], P, y); y += lineH; }
    ctx.restore();

    // 分隔线 + 损友供词
    ctx.save();
    ctx.fillStyle = p.rule; ctx.fillRect(P, 982, W - 2 * P, 2);
    ctx.fillStyle = p.mut; ctx.font = '400 24px ' + SERIF; setLS(ctx, 0);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var ey = 1010, evl = wrap(ctx, d.ev, W - 2 * P, 2);
    for (var j = 0; j < evl.length; j++) { ctx.fillText(evl[j], P, ey); ey += 36; }
    ctx.restore();

    // 太史公附言（留功德反转）
    ctx.save();
    ctx.fillStyle = p.cod; ctx.font = '400 23px ' + SERIF; setLS(ctx, 0);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var cy = 1104, codl = wrap(ctx, '太史公附言　' + d.codicil, W - 2 * P, 2);
    for (var m = 0; m < codl.length; m++) { ctx.fillText(codl[m], P, cy); cy += 34; }
    ctx.restore();

    // 页脚
    drawQR(ctx, W - P - 150, 1206, 150);
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = p.mut; ctx.font = '400 22px ' + SERIF; setLS(ctx, 0);
    ctx.fillText('司马迁.skill · 太史判词', P, 1258);
    ctx.fillStyle = p.ink; ctx.font = '600 36px ' + MONO; setLS(ctx, 1);
    ctx.fillText('s.caojuege.com', P, 1306);
    ctx.fillStyle = p.mut; ctx.font = '500 16px ' + MONO; setLS(ctx, 2);
    ctx.fillText('扫码也给朋友定一句', P, 1342);
    ctx.restore();
  }

  function ensureFonts() {
    if (document.fonts && document.fonts.load) {
      return Promise.all([
        document.fonts.load('700 70px "Noto Serif SC"'),
        document.fonts.load('900 200px "Noto Serif SC"'),
        document.fonts.load('400 24px "Noto Serif SC"')
      ]).catch(function () {});
    }
    return Promise.resolve();
  }

  function download(canvas, filename) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        if (!blob) { resolve(false); return; }
        var file = new File([blob], filename, { type: 'image/png' });
        function fallback() {
          var url = URL.createObjectURL(blob), a = document.createElement('a');
          a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000); resolve(true);
        }
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: '太史判词' }).then(function () { resolve(true); })
            .catch(function (e) { if (e && e.name === 'AbortError') { resolve(true); return; } fallback(); });
          return;
        }
        fallback();
      }, 'image/png', 0.96);
    });
  }

  g.VerdictCard = { W: W, H: H, buildData: buildData, buildLine: buildLine, draw: draw, ensureFonts: ensureFonts, download: download, clean: clean, vol: vol };
})(window);
