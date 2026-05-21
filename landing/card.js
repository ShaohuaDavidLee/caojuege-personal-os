/* 司马迁.skill · 轻列传 Canvas renderer
 * Single renderer: preview image === exported image.
 * No DOM screenshot / html2canvas dependency.
 */
(function(global){
  'use strict';

  const W = 600;
  const H = 800;
  const QR_SRC = './qr-simaqian.png';
  let qrPromise = null;

  const SERIF = '"Noto Serif SC","Source Han Serif SC","Source Han Serif CN","Songti SC","STSongti","STSong","SimSun","NSimSun","FangSong",Georgia,"Times New Roman",serif';
  const SANS = '"Inter","PingFang SC","Hiragino Sans GB","Source Han Sans SC","Microsoft YaHei",system-ui,-apple-system,sans-serif';
  const MONO = '"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

  const DEFAULTS = {
    style: 'classic', label: '正史版', watermark: '正',
    title: '今人列传', chip1: '行路人', chip2: '问学者', chip3: '造物者',
    quote: '向未知处行',
    p1: '今人者，华夏人也。少习诸艺，长而问己，未竟之事尤多。',
    p2: '其所求者，行远自迩，沉之为作。所好者深文，所厌者喧嚣。',
    taishi: '志之所趋，无远弗届。', warn: '', volume: '', volumeLabel: '列傳'
  };

  const THEMES = {
    classic: {
      bg:'#ffffff', fg:'#1a1a1a', muted:'rgba(26,26,26,.55)', quote:'rgba(26,26,26,.72)',
      chipBorder:'rgba(26,26,26,.40)', chipBg:'transparent', wm:'rgba(0,0,0,.05)',
      taishiBg:'#1a1a1a', taishiFg:'#e5e5e5', taishiMuted:'rgba(229,229,229,.68)', qmark:'rgba(229,229,229,.16)',
      qrBorder:'rgba(71,73,75,.20)', seal:['司','馬','遷','撰']
    },
    roast: {
      bg:'#e5e5e5', fg:'#1a1a1a', muted:'rgba(26,26,26,.55)', quote:'rgba(26,26,26,.72)',
      chipBorder:'rgba(26,26,26,.45)', chipBg:'rgba(255,255,255,.32)', wm:'rgba(0,0,0,.05)',
      taishiBg:'#47494b', taishiFg:'#e5e5e5', taishiMuted:'rgba(229,229,229,.68)', qmark:'rgba(229,229,229,.16)',
      qrBorder:'rgba(71,73,75,.20)', seal:['司','馬','毒','撰']
    },
    diagnosis: {
      bg:'#f1eadc', fg:'#1a1a1a', muted:'rgba(26,26,26,.58)', quote:'#755f3d',
      chipBorder:'rgba(26,26,26,.34)', chipBg:'rgba(255,255,255,.34)', wm:'rgba(122,92,46,.10)',
      taishiBg:'#3f3426', taishiFg:'#f4f0e8', taishiMuted:'rgba(244,240,232,.66)', qmark:'rgba(244,240,232,.14)',
      qrBorder:'rgba(71,73,75,.20)', seal:['太','史','診','斷']
    },
    observer: {
      bg:'#1a1a1a', fg:'#e5e5e5', muted:'rgba(229,229,229,.55)', quote:'rgba(229,229,229,.72)',
      chipBorder:'rgba(229,229,229,.40)', chipBg:'transparent', wm:'rgba(255,255,255,.07)',
      taishiBg:'#e5e5e5', taishiFg:'#1a1a1a', taishiMuted:'rgba(26,26,26,.62)', qmark:'rgba(26,26,26,.16)',
      qrBorder:'transparent', seal:['司','馬','觀','察']
    }
  };

  function normalize(data){
    return Object.assign({}, DEFAULTS, data || {});
  }

  function loadQr(){
    if(qrPromise) return qrPromise;
    qrPromise = new Promise((resolve)=>{
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = QR_SRC;
    });
    return qrPromise;
  }

  async function ready(){
    if(document.fonts && document.fonts.ready){
      try{ await document.fonts.ready; }catch(_){ /* ignore */ }
    }
    await loadQr();
  }

  function font(weight, size, family){
    return `${weight} ${size}px ${family}`;
  }

  function setFont(ctx, weight, size, family){
    ctx.font = font(weight, size, family);
  }

  function tokenise(text){
    const s = String(text || '').replace(/\r/g,'');
    return s.match(/[A-Za-z0-9_./:+#%\-]+|\s+|./gu) || [];
  }

  function wrap(ctx, text, maxWidth, maxLines){
    const tokens = tokenise(text);
    const lines = [];
    let line = '';
    const push = () => {
      if(line.trim()) lines.push(line.trim());
      line = '';
    };
    for(const tok of tokens){
      if(tok === '\n') { push(); continue; }
      const isSpace = /^\s+$/.test(tok);
      if(isSpace && !line) continue;
      const candidate = line + tok;
      if(ctx.measureText(candidate).width <= maxWidth){
        line = candidate;
        continue;
      }
      if(line) push();
      if(!isSpace){
        if(ctx.measureText(tok).width <= maxWidth){
          line = tok;
        }else{
          // Very long latin token; split by character.
          for(const ch of Array.from(tok)){
            const c = line + ch;
            if(ctx.measureText(c).width <= maxWidth) line = c;
            else { push(); line = ch; }
          }
        }
      }
      if(maxLines && lines.length >= maxLines) break;
    }
    if(line && (!maxLines || lines.length < maxLines)) push();
    if(maxLines && lines.length > maxLines) lines.length = maxLines;
    if(maxLines && lines.length === maxLines){
      let last = lines[maxLines - 1];
      while(last && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
      if(last && (tokens.join('').trim() !== lines.join('').trim())) lines[maxLines - 1] = last + '…';
    }
    return lines;
  }

  function drawTextLines(ctx, lines, x, y, lineHeight){
    for(const line of lines){
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    return y;
  }

  function roundedRect(ctx, x, y, w, h, r){
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }

  function normaliseVolume(v){
    const raw = String(v || '').trim();
    if(!raw || raw === 'auto') return '';
    const digits = raw.match(/\d+/)?.[0];
    if(!digits) return raw.slice(0, 8);
    return String(Math.max(1, Math.min(999, parseInt(digits, 10)))).padStart(3, '0');
  }

  function styleDefaultWatermark(style){
    if(style === 'roast') return '毒';
    if(style === 'diagnosis') return '診';
    if(style === 'observer') return '觀';
    return '傳';
  }

  function drawChip(ctx, text, x, y, theme){
    setFont(ctx, '500', 13, SERIF);
    const padX = 11;
    const w = Math.ceil(ctx.measureText(text).width + padX * 2);
    ctx.save();
    ctx.strokeStyle = theme.chipBorder;
    ctx.fillStyle = theme.chipBg;
    ctx.lineWidth = 1;
    if(theme.chipBg !== 'transparent') ctx.fillRect(x, y, w, 27);
    ctx.strokeRect(x, y, w, 27);
    ctx.fillStyle = theme.fg;
    ctx.globalAlpha = .85;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX, y + 13.5);
    ctx.restore();
    return w;
  }

  function drawSeal(ctx, chars){
    const x = 462, y = 124, w = 92, h = 104;
    ctx.save();
    ctx.fillStyle = '#a8302d';
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle = '#7d211e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x+1,y+1,w-2,h-2);
    ctx.strokeStyle = 'rgba(240,223,196,.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x+6,y+6,w-12,h-12);
    ctx.fillStyle = '#f0dfc4';
    setFont(ctx, '700', 31, SERIF);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pos = [[.25,.25],[.75,.25],[.25,.75],[.75,.75]];
    chars.forEach((ch,i)=>ctx.fillText(ch, x + w*pos[i][0], y + h*pos[i][1]));
    ctx.restore();
  }

  function drawWatermark(ctx, wm, theme){
    ctx.save();
    ctx.fillStyle = theme.wm;
    setFont(ctx, '900', 430, SERIF);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(wm || '正', 285, 690);
    ctx.restore();
  }

  function fitTitleSize(ctx, title, maxWidth){
    let size = 96;
    while(size > 58){
      setFont(ctx, '700', size, SERIF);
      if(ctx.measureText(title).width <= maxWidth) break;
      size -= 4;
    }
    return size;
  }

  function drawCard(ctx, raw){
    const d = normalize(raw);
    const style = d.style || 'classic';
    const theme = THEMES[style] || THEMES.classic;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0,0,W,H);

    drawWatermark(ctx, d.watermark || styleDefaultWatermark(style), theme);

    // Meta row
    let x = 46;
    const y = 42;
    const chips = [`一·${d.chip1}`, `二·${d.chip2}`, `三·${d.chip3}`];
    chips.forEach((c)=>{ x += drawChip(ctx, c, x, y, theme) + 8; });
    ctx.save();
    ctx.fillStyle = theme.muted;
    setFont(ctx, '500', 10, MONO);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('PERSONAL ANNAL · 列傳', 554, 48);
    const vol = normaliseVolume(d.volume);
    if(vol){
      setFont(ctx, '500', 10, MONO);
      ctx.fillStyle = theme.muted;
      ctx.fillText(`${d.volumeLabel || '列傳'}·第${vol}卷`, 554, 66);
    }
    ctx.restore();

    drawSeal(ctx, d.sealChars || theme.seal);

    // Title
    ctx.save();
    ctx.fillStyle = theme.fg;
    const titleSize = fitTitleSize(ctx, d.title, 380);
    setFont(ctx, '700', titleSize, SERIF);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(d.title, 46, 158);
    ctx.restore();

    // Quote
    ctx.save();
    ctx.fillStyle = theme.quote;
    setFont(ctx, '400', 22, SERIF);
    ctx.textBaseline = 'top';
    ctx.font = `italic 22px ${SERIF}`;
    ctx.fillText(`「${d.quote}」`, 46, 264);
    ctx.globalAlpha = .65;
    ctx.fillRect(46, 306, 56, 2);
    ctx.restore();

    // Body
    ctx.save();
    ctx.fillStyle = theme.fg;
    setFont(ctx, '400', 17.5, SERIF);
    ctx.textBaseline = 'top';
    const p1Lines = wrap(ctx, d.p1, 470, 3);
    const p2Lines = wrap(ctx, d.p2, 470, Math.max(2, 6 - p1Lines.length));
    let by = 332;
    by = drawTextLines(ctx, p1Lines, 46, by, 33);
    by += 6;
    drawTextLines(ctx, p2Lines, 46, by, 33);
    ctx.restore();

    // Taishi block
    const tx = 46, ty = 520, tw = 508, th = 112;
    ctx.save();
    ctx.fillStyle = theme.taishiBg;
    ctx.fillRect(tx, ty, tw, th);
    ctx.fillStyle = theme.qmark;
    setFont(ctx, '700', 170, 'Georgia,serif');
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('”', tx + tw - 12, ty - 24);
    ctx.fillStyle = theme.taishiMuted;
    setFont(ctx, '400', 12, SANS);
    ctx.textAlign = 'left';
    ctx.fillText('太史公曰 ——', tx + 30, ty + 28);
    ctx.fillStyle = theme.taishiFg;
    setFont(ctx, '700', 20, SERIF);
    const tLines = wrap(ctx, d.taishi, tw - 60, 2);
    drawTextLines(ctx, tLines, tx + 30, ty + 55, 31);
    ctx.restore();

    // Warn
    if(d.warn){
      ctx.save();
      const wy = 644;
      ctx.fillStyle = style === 'observer' ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.48)';
      ctx.fillRect(46, wy, 508, 24);
      ctx.fillStyle = theme.fg;
      ctx.globalAlpha = .75;
      setFont(ctx, '400', 10.5, SANS);
      ctx.textBaseline = 'middle';
      const lines = wrap(ctx, d.warn, 486, 1);
      ctx.fillText(lines[0] || d.warn, 56, wy + 12);
      ctx.restore();
    }

    // Footer
    ctx.save();
    ctx.fillStyle = theme.fg;
    ctx.globalAlpha = .75;
    setFont(ctx, '500', 13.5, MONO);
    ctx.textBaseline = 'top';
    ctx.fillText('simaqian.caojuege.com', 46, 710);
    setFont(ctx, '400', 10, SANS);
    ctx.globalAlpha = .55;
    ctx.fillText('司马迁.skill · 扫码访问', 46, 735);
    ctx.restore();

    drawQr(ctx, theme);
  }

  let cachedQr = null;
  async function ensureQr(){
    cachedQr = await loadQr();
    return cachedQr;
  }

  function drawQr(ctx, theme){
    const x = 492, y = 702, s = 62;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, s, s);
    if(theme.qrBorder !== 'transparent'){
      ctx.strokeStyle = theme.qrBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, s, s);
    }
    if(cachedQr) ctx.drawImage(cachedQr, x + 4, y + 4, s - 8, s - 8);
    else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x+18,y+18,26,26);
    }
    ctx.restore();
  }

  async function renderToCanvas(data, opts){
    opts = opts || {};
    await ready();
    cachedQr = await ensureQr();
    const ratio = opts.ratio || 2;
    const canvas = opts.canvas || document.createElement('canvas');
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);
    canvas.style.aspectRatio = '3 / 4';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawCard(ctx, data);
    return canvas;
  }

  async function renderToBlob(data, opts){
    const canvas = await renderToCanvas(data, opts || {ratio: 2});
    return new Promise((resolve)=>canvas.toBlob(resolve, 'image/png', 0.96));
  }

  async function renderToDataURL(data, opts){
    const canvas = await renderToCanvas(data, opts || {ratio: 2});
    return canvas.toDataURL('image/png');
  }

  global.LieZhuanCard = { W, H, DEFAULTS, renderToCanvas, renderToBlob, renderToDataURL, ready };
})(typeof window !== 'undefined' ? window : this);
