/* CADS 全身 CT 交互解剖阅片器 · cads-viewerv1.1.js
   Interactive multiplanar CT anatomy viewer (axial / coronal / sagittal / 3D) on top of NiiVue (BSD-2-Clause, bundled locally).
   Data: TotalSegmentator dataset v2.0.1 case s0423 (CC BY 4.0) + CADS-model-research T554 output (CC BY-NC-SA 4.0).
   Code: PolyForm Noncommercial 1.0.0 · Copyright (c) 2026 Haixiang Ding */
(function () {
  'use strict';
  var root = document.getElementById('vw');
  if (!root) return;
  var BASE = root.getAttribute('data-base') || 'assets/viewer/';
  function $(s, el) { return (el || root).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }
  function lang() { return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'zh'; }
  function tx(zh, en) { return lang() === 'en' ? en : zh; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var SYS = [
    ['skeletal', '骨骼系统', 'Skeletal'], ['muscular', '肌肉系统', 'Muscular'], ['cardiovascular', '心血管系统', 'Cardiovascular'],
    ['respiratory', '呼吸系统', 'Respiratory'], ['digestive', '消化系统', 'Digestive'], ['urinary', '泌尿系统', 'Urinary'],
    ['reproductive', '生殖系统', 'Reproductive'], ['endocrine', '内分泌系统', 'Endocrine'], ['lymphatic', '淋巴系统（脾）', 'Lymphatic (spleen)'],
    ['nervous', '神经系统', 'Nervous'], ['other', '其他', 'Other']];
  var WIN = { soft: [-160, 240], bone: [-400, 1400], lung: [-1350, 150] };
  var PLANES = { zh: { ax: '横断面', cor: '冠状面', sag: '矢状面', r3d: '3D' }, en: { ax: 'Axial', cor: 'Coronal', sag: 'Sagittal', r3d: '3D' } };

  var META = null, S = [], BYIDX = {}, BYTS = {};
  var nv = null, dims = null, ctData = null, labData = { ref: null, cads: null };
  var state = { src: 'ref', alpha: 0.6, outline: false, tags: false, hidden: {}, focus: null, win: 'soft', layout: 'grid', plane: 'ax', quiz: null, busy: false };
  var gl3 = null;
  var cv = $('#vwCanvas'), tagCv = $('#vwTags'), tip = $('#vwTip');
  var mql = window.matchMedia('(max-width: 760px)');

  function status(html, cls) { var s = $('#vwStatus'); s.innerHTML = html; s.className = 'vw-status ' + (cls || ''); }
  function showErr(msg) { status('<b>' + tx('无法载入阅片器：', 'The viewer could not start: ') + '</b>' + esc(msg), 'err'); }

  // ---------- data loading with progress ----------
  function fetchP(url, expect, onp) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status + ' ' + url);
      var total = +r.headers.get('content-length') || expect || 0;
      if (!r.body || !r.body.getReader) return r.arrayBuffer();
      var rd = r.body.getReader(), got = 0, chunks = [];
      function pump() {
        return rd.read().then(function (x) {
          if (x.done) { var b = new Uint8Array(got), o = 0; chunks.forEach(function (c) { b.set(c, o); o += c.length; }); return b.buffer; }
          chunks.push(x.value); got += x.value.length; onp(got, Math.max(total, got)); return pump();
        });
      }
      return pump();
    });
  }

  function hasWebGL2() { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } }

  function start() {
    if (state.busy || nv) return; state.busy = true;
    if (!window.niivue) { showErr('niivue.umd.js'); return; }
    if (!hasWebGL2()) { showErr(tx('浏览器不支持 WebGL2，请换用新版 Chrome / Edge / Safari / Firefox。', 'WebGL2 is not available; please use a recent Chrome, Edge, Safari or Firefox.')); return; }
    fetch(BASE + 'structures-v1.1.json').then(function (r) { if (!r.ok) throw new Error(r.status + ' structures'); return r.json(); }).then(function (m) {
      META = m; S = m.structures; S.forEach(function (s) { BYIDX[s.idx] = s; BYTS[s.ts] = s; });
      buildLegend(); buildStops();
      var files = [['ct-s0423-v1.1.nii.gz', 'ct'], ['ref-s0423-v1.1.nii.gz', 'ref'], ['cads554-s0423-v1.1.nii.gz', 'cads']];
      var sizes = m.sizes_bytes, total = 0, got = {};
      files.forEach(function (f) { total += sizes[f[0]] || 0; got[f[0]] = 0; });
      function prog() {
        var g = 0; for (var k in got) g += got[k];
        var p = Math.min(100, Math.round(g / total * 100));
        $('#vwBar').style.width = p + '%';
        status(tx('正在下载真实 CT 与分割数据 ', 'Downloading the real CT and segmentations ') + (g / 1e6).toFixed(1) + ' / ' + (total / 1e6).toFixed(1) + ' MB（' + p + '%）', 'load');
      }
      prog();
      return Promise.all(files.map(function (f) {
        return fetchP(BASE + f[0], sizes[f[0]], function (g) { got[f[0]] = g; prog(); });
      })).then(function (bufs) { return init(bufs); });
    }).catch(function (e) { state.busy = false; showErr(e && e.message || e); });
  }

  function init(bufs) {
    status(tx('正在构建三维体数据…', 'Building the 3D volume…'), 'load');
    var N = window.niivue;
    nv = new N.Niivue({
      backColor: [0.02, 0.035, 0.05, 1], crosshairColor: [1, 0.86, 0.15, 0.85], crosshairWidth: 1, show3Dcrosshair: true,
      isRadiologicalConvention: true, multiplanarShowRender: N.SHOW_RENDER.ALWAYS, multiplanarLayout: N.MULTIPLANAR_TYPE.GRID,
      multiplanarPadPixels: 6, isOrientationTextVisible: true, dragAndDropEnabled: false, isColorbar: false, showLegend: false,
      logLevel: 'error', loadingText: '', textHeight: 0.035, fontColor: [0.75, 0.85, 0.95, 1],
      // 左键 = 十字线（拖动联动换层），右键 / 中键 / Shift+左键 = 平移；滚轮 = 逐层（dragMode 设为 none，否则 NiiVue 会把滚轮当缩放）
      dragMode: N.DRAG_MODE.none,
      mouseEventConfig: { leftButton: { primary: N.DRAG_MODE.crosshair, withShift: N.DRAG_MODE.pan }, rightButton: N.DRAG_MODE.pan, centerButton: N.DRAG_MODE.pan },
      isHighResolutionCapable: true
    });
    nv.attachToCanvas(cv);
    var urls = bufs.map(function (b) { return URL.createObjectURL(new Blob([b])); });
    labUrl.ref = urls[1]; labUrl.cads = urls[2];
    return nv.loadVolumes([
      { url: urls[0], name: 'ct-s0423.nii.gz', colormap: 'gray', cal_min: WIN.soft[0], cal_max: WIN.soft[1], opacity: 1 },
      { url: urls[1], name: 'ref-s0423.nii.gz', opacity: state.alpha }
    ]).then(function () {
      URL.revokeObjectURL(urls[0]);
      var v0 = nv.volumes[0];
      dims = [v0.hdr.dims[1], v0.hdr.dims[2], v0.hdr.dims[3]];
      ctData = v0.img; prepLabel('ref');
      // CADS 体积只解码一次，留作原始查表 / decode the CADS volume once for look-ups
      return window.niivue.NVImage.loadFromUrl({ url: urls[2], name: 'cads554-s0423.nii.gz' }).then(function (im) { labData.cads = new Uint8Array(im.img); });
    }).then(function () {
      applyLabels();
      nv.setRenderAzimuthElevation(180, 10);
      nv.onLocationChange = onLoc;
      var origDraw = nv.drawScene.bind(nv);
      nv.drawScene = function () { var r = origDraw(); scheduleTags(); return r; };
      setLayout(mql.matches ? 'single' : 'grid');
      jumpTo(BYTS.vertebrae_L3 ? BYTS.vertebrae_L3.jump : [dims[0] >> 1, dims[1] >> 1, dims[2] >> 1]);
      $('#vwBar').parentNode.style.display = 'none';
      status(tx('已载入：', 'Loaded: ') + S.length + tx(' 个结构 · ', ' structures · ') + dims.join('×') + tx(' 体素，1.5 mm 各向同性', ' voxels, 1.5 mm isotropic'), 'ok');
      root.classList.add('ready'); root.setAttribute('data-ready', '1');
      bindCanvas();
      window.CADSViewer = api;
    });
  }

  // ---------- label volume ----------
  // NiiVue 的标签着色器对值 0 会读取上一层混合纹理，且颜色表采样可能与相邻表项发生插值（alpha>0 即视为不透明）。
  // 因此显示用体积改写为 2v+1：背景 = 1，结构之间隔一个全透明表项，任何 GPU 上背景都不会被染色；查表仍用原始值。
  // The atlas shader treats value 0 specially and the colour-table lookup may blend with the neighbouring entry (any alpha>0
  // becomes opaque). The displayed copy is therefore re-coded as 2v+1 (background = 1) with a transparent gap entry between
  // labels, so the background is never tinted on any GPU; look-ups use the original values.
  var labUrl = {};
  function prepLabel(src) {
    var v = nv.volumes[1], img = v.img;
    if (!labData[src]) labData[src] = new Uint8Array(img);
    for (var i = 0; i < img.length; i++) img[i] = img[i] * 2 + 1;
    v.cal_min = 0; v.cal_max = 256;
  }
  function swapLabel(src) {
    return Promise.resolve().then(function () {
      if (nv.volumes[1]) nv.removeVolumeByIndex(1);
      return nv.addVolumeFromUrl({ url: labUrl[src], name: (src === 'ref' ? 'ref' : 'cads554') + '-s0423.nii.gz', opacity: state.alpha });
    }).then(function () { prepLabel(src); applyLabels(); nv.drawScene(); });
  }
  function applyLabels() {
    var R = [], G = [], B = [], A = [], I = [];
    var present = state.src === 'cads' ? META.cads_present_idx : null;
    for (var k = 0; k < 256; k++) {
      var i = (k - 1) / 2, s = BYIDX[k % 2 ? i : k / 2]; I.push(k);
      if (!s) { R.push(0); G.push(0); B.push(0); A.push(0); continue; }
      R.push(s.rgb[0]); G.push(s.rgb[1]); B.push(s.rgb[2]);
      if (k % 2 === 0) { A.push(0); continue; }
      var a = 255;
      if (state.hidden[s.idx]) a = 0;
      else if (state.focus && state.focus.indexOf(s.idx) < 0) a = 0;
      if (present && present.indexOf(i) < 0) a = 0;
      A.push(a);
    }
    var v = nv.volumes[1]; if (!v) return;
    v.setColormapLabel({ R: R, G: G, B: B, A: A, I: I });
    v.opacity = state.outline ? Math.max(0.15, state.alpha * 0.3) : state.alpha;
    nv.opts.atlasOutline = state.outline ? 1 : 0;
    nv.updateGLVolume();
  }

  // ---------- coordinates ----------
  function voxAtFrac(f) {
    var v = nv.frac2vox(f, 0);
    return [Math.round(v[0]), Math.round(v[1]), Math.round(v[2])];
  }
  function inside(v) { return v[0] >= 0 && v[1] >= 0 && v[2] >= 0 && v[0] < dims[0] && v[1] < dims[1] && v[2] < dims[2]; }
  function at(arr, v) { return arr[v[0] + v[1] * dims[0] + v[2] * dims[0] * dims[1]]; }
  function labelAt(v) { return inside(v) ? at(labData[state.src], v) : 0; }
  function huAt(v) {
    if (!inside(v)) return null; var h = nv.volumes[0].hdr, raw = at(ctData, v);
    return Math.round(raw * (h.scl_slope || 1) + (h.scl_inter || 0));
  }
  function nameHTML(s, full) {
    if (!s) return '<span class="vw-bg">' + tx('背景 / 未标注', 'Background / unlabelled') + '</span>';
    var sw = '<i class="sw" style="background:rgb(' + s.rgb.join(',') + ')"></i>';
    var main = lang() === 'en' ? s.en : s.zh, sub = lang() === 'en' ? s.zh : s.en;
    return sw + '<b>' + esc(main) + '</b> <span class="vw-sub">' + esc(sub) + '</span>' + (full && s.la && s.la !== '—' ? '<br><i class="vw-la">' + esc(s.la) + '</i>' : '');
  }
  function planeOfCanvas(x, y) {
    var t = nv.tileIndex(x, y); if (t < 0 || !nv.screenSlices[t]) return null;
    var st = nv.screenSlices[t].axCorSag; return st === 0 ? 'ax' : st === 1 ? 'cor' : st === 2 ? 'sag' : 'r3d';
  }
  function canvasXY(e) {
    var r = cv.getBoundingClientRect(), dpr = cv.width / r.width;
    return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr];
  }
  function probe(e) {
    var p = canvasXY(e), pl = planeOfCanvas(p[0], p[1]);
    if (!pl || pl === 'r3d') return null;
    var f = nv.canvasPos2frac(p); if (!f || f[0] < 0) return null;
    var v = voxAtFrac(f); if (!inside(v)) return null;
    return { v: v, plane: pl, lab: labelAt(v), hu: huAt(v) };
  }
  function coordText(v) {
    var P = PLANES[lang()];
    return P.ax + ' ' + (v[2] + 1) + '/' + dims[2] + ' · ' + P.cor + ' ' + (v[1] + 1) + '/' + dims[1] + ' · ' + P.sag + ' ' + (v[0] + 1) + '/' + dims[0];
  }

  // ---------- events ----------
  function bindCanvas() {
    cv.addEventListener('mousemove', function (e) {
      if (state.quiz && !state.quiz.done) { tip.style.display = 'none'; return; }
      var q = probe(e);
      if (!q) { tip.style.display = 'none'; return; }
      var s = BYIDX[q.lab];
      tip.innerHTML = nameHTML(s, true) + '<div class="vw-co">' + PLANES[lang()][q.plane] + ' · [' + q.v.join(', ') + '] · ' + q.hu + ' HU</div>';
      var r = root.querySelector('.vw-stage').getBoundingClientRect();
      var x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
      tip.style.display = 'block';
      if (x + tip.offsetWidth > r.width - 4) x = e.clientX - r.left - tip.offsetWidth - 10;
      if (y + tip.offsetHeight > r.height - 4) y = e.clientY - r.top - tip.offsetHeight - 10;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    });
    cv.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
    cv.addEventListener('pointerup', function (e) {
      if (!state.quiz || state.quiz.done) return;
      var q = probe(e); if (!q) return;
      quizAnswer(q);
    });
    window.addEventListener('resize', scheduleTags);
    mql.addEventListener ? mql.addEventListener('change', function () { setLayout(mql.matches ? 'single' : state.layoutPref || 'grid'); }) : null;
  }

  function onLoc(loc) {
    var v = loc && loc.vox ? [Math.round(loc.vox[0]), Math.round(loc.vox[1]), Math.round(loc.vox[2])] : voxAtFrac(nv.scene.crosshairPos);
    var s = BYIDX[labelAt(v)];
    $('#vwRead').innerHTML = nameHTML(s, true) + '<div class="vw-co">' + coordText(v) + ' · ' + huAt(v) + ' HU</div>';
    ['ax', 'cor', 'sag'].forEach(function (p, i) {
      var sl = $('#vwSl-' + p); if (!sl) return;
      var val = p === 'ax' ? v[2] : p === 'cor' ? v[1] : v[0];
      if (+sl.value !== val) sl.value = val;
      $('#vwSlv-' + p).textContent = (val + 1) + '/' + sl.max;
    });
    root.setAttribute('data-vox', v.join(','));
    root.setAttribute('data-label', s ? s.ts : '');
  }

  function jumpTo(v, redraw) {
    nv.scene.crosshairPos = nv.vox2frac([v[0], v[1], v[2]], 0);
    nv.createOnLocationChange && nv.createOnLocationChange();
    // 只移动十字线时不需要重建体纹理（updateGLVolume 很耗时）/ moving the crosshair needs no texture rebuild
    if (redraw !== false) nv.drawScene();
    onLoc(null);
  }
  function setSlice(p, val) {
    var v = voxAtFrac(nv.scene.crosshairPos);
    if (p === 'ax') v[2] = val; else if (p === 'cor') v[1] = val; else v[0] = val;
    jumpTo(v);
  }

  // ---------- layout ----------
  function setLayout(l) {
    var N = window.niivue; state.layout = l;
    $$('.vw-plane button').forEach(function (b) { b.classList.toggle('on', l === 'single' ? b.getAttribute('data-p') === state.plane : b.getAttribute('data-p') === 'grid'); });
    root.classList.toggle('single', l === 'single');
    if (l === 'grid') { nv.setSliceType(N.SLICE_TYPE.MULTIPLANAR); }
    else nv.setSliceType({ ax: N.SLICE_TYPE.AXIAL, cor: N.SLICE_TYPE.CORONAL, sag: N.SLICE_TYPE.SAGITTAL, r3d: N.SLICE_TYPE.RENDER }[state.plane]);
    nv.resizeListener && nv.resizeListener();
    scheduleTags();
  }

  // ---------- persistent label tags on current slices ----------
  var tagTimer = null;
  function scheduleTags() { if (tagTimer) cancelAnimationFrame(tagTimer); tagTimer = requestAnimationFrame(drawTags); }
  function drawTags() {
    tagTimer = null;
    var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    tagCv.width = Math.round(r.width * dpr); tagCv.height = Math.round(r.height * dpr);
    tagCv.style.width = r.width + 'px'; tagCv.style.height = r.height + 'px';
    var g = tagCv.getContext('2d'); g.clearRect(0, 0, tagCv.width, tagCv.height);
    if (!state.tags || !nv || !nv.screenSlices) return;
    var scale = tagCv.width / cv.width;
    var c = voxAtFrac(nv.scene.crosshairPos), arr = labData[state.src], nx = dims[0], ny = dims[1], nz = dims[2];
    var boxes = [];
    g.font = '600 ' + Math.round(11.5 * dpr) + 'px -apple-system,"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif';
    g.textBaseline = 'middle';
    nv.screenSlices.forEach(function (ss, ti) {
      var st = ss.axCorSag; if (st > 2) return;
      var acc = {}, A, Bn, fixed;
      if (st === 0) { fixed = c[2]; for (var y = 0; y < ny; y += 1) for (var x = 0; x < nx; x += 1) add(arr[x + y * nx + fixed * nx * ny], x, y, fixed); }
      else if (st === 1) { fixed = c[1]; for (var z = 0; z < nz; z += 1) for (var x2 = 0; x2 < nx; x2 += 1) add(arr[x2 + fixed * nx + z * nx * ny], x2, fixed, z); }
      else { fixed = c[0]; for (var z2 = 0; z2 < nz; z2 += 1) for (var y2 = 0; y2 < ny; y2 += 1) add(arr[fixed + y2 * nx + z2 * nx * ny], fixed, y2, z2); }
      function add(l, x, y, z) { if (!l) return; var o = acc[l] || (acc[l] = [0, 0, 0, 0]); o[0]++; o[1] += x; o[2] += y; o[3] += z; }
      var L = ss.leftTopWidthHeight;
      var minPix = Math.max(20, (st === 0 ? nx * ny : st === 1 ? nx * nz : ny * nz) * 0.0012);
      Object.keys(acc).map(Number).filter(function (l) { return acc[l][0] >= minPix && !state.hidden[l] && (!state.focus || state.focus.indexOf(l) >= 0); })
        .sort(function (a, b) { return acc[b][0] - acc[a][0]; }).forEach(function (l) {
          var o = acc[l], v = [o[1] / o[0], o[2] / o[0], o[3] / o[0]];
          var res = nv.frac2canvasPosWithTile(nv.vox2frac(v, 0), st);
          if (!res || res.tileIndex !== ti) return;
          var px = res.pos[0] * scale, py = res.pos[1] * scale;
          if (px < L[0] * scale || py < L[1] * scale || px > (L[0] + L[2]) * scale || py > (L[1] + L[3]) * scale) return;
          var s = BYIDX[l], t = lang() === 'en' ? s.en.replace(/ \((left|right)\)/, function (m, a) { return a === 'left' ? ' L' : ' R'; }) : s.zh;
          var w = g.measureText(t).width + 12 * dpr, h = 17 * dpr, bx = px - w / 2, by = py - h / 2;
          for (var i = 0; i < boxes.length; i++) { var b = boxes[i]; if (bx < b[0] + b[2] && bx + w > b[0] && by < b[1] + b[3] && by + h > b[1]) return; }
          boxes.push([bx, by, w, h]);
          g.fillStyle = 'rgba(4,8,12,.78)'; roundRect(g, bx, by, w, h, 4 * dpr); g.fill();
          g.fillStyle = 'rgb(' + s.rgb.join(',') + ')'; g.fillRect(bx, by, 3 * dpr, h);
          g.fillStyle = '#f2f7fb'; g.fillText(t, bx + 7 * dpr, by + h / 2 + 0.5);
        });
    });
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  // ---------- legend ----------
  function buildLegend() {
    var box = $('#vwLegend'), html = '';
    SYS.forEach(function (sy) {
      var items = S.filter(function (s) { return s.sys === sy[0]; }); if (!items.length) return;
      html += '<details class="vw-grp" open data-sys="' + sy[0] + '"><summary><label class="vw-gchk" onclick="event.stopPropagation()"><input type="checkbox" checked data-g="' + sy[0] + '"></label>' +
        '<span class="zh">' + sy[1] + '</span><span class="en">' + sy[2] + '</span> <em>' + items.length + '</em></summary><ul>';
      items.forEach(function (s) {
        html += '<li data-idx="' + s.idx + '" data-ts="' + s.ts + '" data-q="' + esc((s.zh + ' ' + s.en + ' ' + s.la + ' ' + s.ts).toLowerCase()) + '">' +
          '<input type="checkbox" checked data-i="' + s.idx + '" aria-label="show ' + esc(s.en) + '">' +
          '<button type="button" class="vw-go" data-i="' + s.idx + '"><i class="sw" style="background:rgb(' + s.rgb.join(',') + ')"></i>' +
          '<span class="zh">' + esc(s.zh) + '</span><span class="en">' + esc(s.en) + '</span><small>' + (s.ml >= 1 ? s.ml + ' mL' : s.voxels + ' vx') + '</small></button></li>';
      });
      html += '</ul></details>';
    });
    box.innerHTML = html;
    $('#vwCount').textContent = S.length;
    box.addEventListener('change', function (e) {
      var t = e.target;
      if (t.hasAttribute('data-i')) { var i = +t.getAttribute('data-i'); if (t.checked) delete state.hidden[i]; else state.hidden[i] = 1; syncGroupBoxes(); }
      else if (t.hasAttribute('data-g')) {
        var g = t.getAttribute('data-g');
        $$('li', t.closest('details')).forEach(function (li) { var i = +li.getAttribute('data-idx'); li.querySelector('input').checked = t.checked; if (t.checked) delete state.hidden[i]; else state.hidden[i] = 1; });
      }
      if (nv) { applyLabels(); nv.drawScene(); }
    });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.vw-go'); if (!b || !nv) return;
      var s = BYIDX[+b.getAttribute('data-i')];
      focusOn([s.idx], s.jump);
      $$('.vw-go.on').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
    });
    $('#vwSearch').addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      $$('#vwLegend li').forEach(function (li) { li.style.display = !q || li.getAttribute('data-q').indexOf(q) >= 0 ? '' : 'none'; });
      $$('#vwLegend details').forEach(function (d) { var any = $$('li', d).some(function (li) { return li.style.display !== 'none'; }); d.style.display = any ? '' : 'none'; if (q) d.open = true; });
    });
  }
  function syncGroupBoxes() {
    $$('#vwLegend details').forEach(function (d) { var cbs = $$('li input', d), n = cbs.filter(function (c) { return c.checked; }).length, g = d.querySelector('[data-g]'); g.checked = n > 0; g.indeterminate = n > 0 && n < cbs.length; });
  }
  function focusOn(list, jump) {
    state.focus = list && list.length ? list : null;
    $('#vwClearFocus').hidden = !state.focus;
    applyLabels(); if (jump) jumpTo(jump); else nv.drawScene();
  }

  // ---------- teaching stops ----------
  function zmid(ts) { var s = BYTS[ts]; return s ? Math.round((s.zrange[0] + s.zrange[1]) / 2) : null; }
  var STOPS = [
    { id: 'l3', zh: 'L3 层面 · 身体成分', en: 'L3 level · body composition', win: 'soft', at: function () { var s = BYTS.vertebrae_L3; return [s.jump[0], s.jump[1], zmid('vertebrae_L3')]; },
      hl: ['vertebrae_L3', 'iliopsoas_left', 'iliopsoas_right', 'autochthon_left', 'autochthon_right'],
      tzh: 'L3 椎体中层是 CT 身体成分分析的标准层面：此层的髂腰肌（腰大肌）与背深肌面积常用于评估肌少症。注意左右：图像左侧 = 患者右侧。',
      ten: 'Mid-L3 is the standard CT body-composition level: iliopsoas (psoas) and deep back muscle areas here are used to assess sarcopenia. Image left = patient right.' },
    { id: 'pelvis', zh: '骨盆环 · 骶骨（创伤）', en: 'Pelvic ring · sacrum (trauma)', win: 'bone', at: function () { return BYTS.sacrum.jump; },
      hl: ['hip_left', 'hip_right', 'sacrum', 'vertebrae_S1', 'vertebrae_L5', 'femur_left', 'femur_right'],
      tzh: '骨盆环由两侧髋骨与骶骨构成：沿横断面逐层看骶髂关节、耻骨联合，再到冠状面看骨盆环连续性。分割只标解剖，不判断骨折。',
      ten: 'The pelvic ring = both hip bones + sacrum: scroll axially through the sacroiliac joints and pubic symphysis, then check ring continuity on the coronal view. Segmentation labels anatomy; it does not detect fractures.' },
    { id: 'abd', zh: '肝 · 脾 · 肾（腹部钝性伤）', en: 'Liver · spleen · kidneys (blunt abdominal trauma)', win: 'soft', at: function () { var s = BYTS.spleen; return s.jump; },
      hl: ['liver', 'spleen', 'kidney_left', 'kidney_right', 'pancreas', 'adrenal_gland_left', 'adrenal_gland_right'],
      tzh: '腹部钝性伤最常累及脾、肝、肾。先在冠状面建立整体方位（肝在患者右上腹 = 图像左上，脾在患者左上腹 = 图像右上），再回横断面逐层核对。',
      ten: 'Blunt abdominal trauma most often involves spleen, liver and kidneys. Orient on the coronal view first (liver in the patient\'s right upper quadrant = image upper left; spleen = image upper right), then check slice by slice.' },
    { id: 'vessels', zh: '主动脉与髂血管', en: 'Aorta and iliac vessels', win: 'soft', at: function () { var a = BYTS.iliac_artery_left, z = a.zrange[1]; var s = BYTS.aorta; return [s.jump[0], s.jump[1], z]; },
      hl: ['aorta', 'iliac_artery_left', 'iliac_artery_right', 'inferior_vena_cava', 'iliac_vena_left', 'iliac_vena_right'],
      tzh: '主动脉在约 L4 水平分为左右髂总动脉；下腔静脉位于主动脉右侧（图像左侧）。在冠状面和矢状面上拖动，追踪分叉。',
      ten: 'The aorta bifurcates into the common iliac arteries at about L4; the IVC lies to the right of the aorta (image left). Drag on the coronal and sagittal views to follow the bifurcation.' },
    { id: 'chest', zh: '肋骨与肺叶', en: 'Ribs and lung lobes', win: 'lung', at: function () { var s = BYTS.vertebrae_T6; return [s.jump[0], s.jump[1] + 20, zmid('vertebrae_T6')]; },
      hl: ['lung_upper_lobe_left', 'lung_lower_lobe_left', 'lung_upper_lobe_right', 'lung_middle_lobe_right', 'lung_lower_lobe_right', 'rib_left_6', 'rib_right_6', 'vertebrae_T6'],
      tzh: '右肺三叶、左肺两叶；在矢状面上能看到斜裂与水平裂分隔的肺叶。数肋骨时从第 1 肋向下逐根计数，并用胸椎编号交叉核对。',
      ten: 'Right lung three lobes, left lung two; the sagittal view shows the oblique and horizontal fissures. Count ribs from the 1st rib downward and cross-check with thoracic vertebra numbers.' },
    { id: 'medi', zh: '纵隔 · 大血管', en: 'Mediastinum · great vessels', win: 'soft', at: function () { var s = BYTS.aorta; var z = BYTS.brachiocephalic_trunk ? BYTS.brachiocephalic_trunk.zrange[0] : zmid('aorta'); return [s.jump[0], s.jump[1], z - 4]; },
      hl: ['heart', 'aorta', 'superior_vena_cava', 'brachiocephalic_trunk', 'brachiocephalic_vein_left', 'brachiocephalic_vein_right', 'trachea', 'esophagus', 'pulmonary_vein', 'atrial_appendage_left'],
      tzh: '纵隔内从前向后：大血管 → 气管 → 食管。主动脉弓发出头臂干、左颈总动脉和左锁骨下动脉；上腔静脉位于升主动脉右侧。',
      ten: 'Through the mediastinum, front to back: great vessels → trachea → oesophagus. The arch gives off the brachiocephalic trunk, left common carotid and left subclavian; the SVC lies right of the ascending aorta.' }
  ];
  function buildStops() {
    var b = $('#vwStops');
    b.innerHTML = STOPS.map(function (s, i) { return '<button type="button" data-s="' + i + '"><b>' + (i + 1) + '</b><span class="zh">' + s.zh + '</span><span class="en">' + s.en + '</span></button>'; }).join('');
    b.addEventListener('click', function (e) { var t = e.target.closest('button'); if (t && nv) goStop(+t.getAttribute('data-s')); });
  }
  function goStop(i) {
    var s = STOPS[i]; if (state.quiz) endQuiz();
    $$('#vwStops button').forEach(function (b, k) { b.classList.toggle('on', k === i); });
    setWin(s.win);
    var ids = s.hl.map(function (t) { return BYTS[t] && BYTS[t].idx; }).filter(Boolean);
    if (state.src === 'cads') { setSrc('ref'); }
    focusOn(ids, s.at());
    $('#vwStopText').innerHTML = '<b>' + tx(s.zh, s.en) + '</b> — ' + tx(s.tzh, s.ten) + '<div class="vw-hl">' + ids.map(function (k) { return '<span>' + nameHTML(BYIDX[k]) + '</span>'; }).join('') + '</div>';
    root.setAttribute('data-stop', s.id);
  }

  // ---------- quiz ----------
  function quizPool() {
    var pres = state.src === 'cads' ? META.cads_present_idx : null;
    return S.filter(function (s) { return s.voxels > 3000 && (!pres || pres.indexOf(s.idx) >= 0); });
  }
  function newQuestion() {
    var pool = quizPool(), q = state.quiz;
    var s = pool[Math.floor(Math.random() * pool.length)];
    if (q.forced) { s = BYTS[q.forced] || s; q.forced = null; }
    q.target = s; q.done = false; q.tries = 0;
    var v = s.jump.slice(); v[0] = Math.round(dims[0] / 2); v[1] = Math.round(dims[1] / 2);
    jumpTo([s.jump[0], s.jump[1], s.jump[2]]);
    $('#vwQuizQ').innerHTML = tx('请在任一切面上点击：', 'Click it on any plane: ') + '<b>' + esc(tx(s.zh, s.en)) + '</b> <span class="vw-sub">' + esc(tx(s.en, s.zh)) + '</span>';
    $('#vwQuizFb').textContent = ''; $('#vwQuizFb').className = 'vw-fb';
  }
  function startQuiz() {
    state.quiz = { score: 0, n: 0 }; root.classList.add('quiz');
    state.savedAlpha = state.alpha; state.alpha = 0; focusOn(null); applyLabels();
    $('#vwQuizBox').hidden = false; $('#vwQuizBtn').textContent = tx('结束测验', 'End quiz');
    newQuestion(); updScore();
  }
  function endQuiz() {
    state.quiz = null; root.classList.remove('quiz'); state.alpha = state.savedAlpha || 0.6; $('#vwAlpha').value = state.alpha;
    applyLabels(); nv.drawScene(); $('#vwQuizBox').hidden = true; $('#vwQuizBtn').innerHTML = '<span class="zh">开始找结构测验</span><span class="en">Start find-the-structure quiz</span>';
  }
  function updScore() { var q = state.quiz; $('#vwQuizScore').textContent = q ? q.score + ' / ' + q.n : ''; }
  function quizAnswer(p) {
    var q = state.quiz, s = q.target, got = BYIDX[p.lab]; q.tries++;
    var fb = $('#vwQuizFb');
    if (p.lab === s.idx) {
      q.done = true; q.n++; if (q.tries === 1) q.score++;
      fb.className = 'vw-fb ok'; fb.innerHTML = '✓ ' + tx('正确！', 'Correct! ') + nameHTML(s, true);
      state.alpha = 0.6; focusOn([s.idx]); 
    } else {
      fb.className = 'vw-fb no';
      fb.innerHTML = '✗ ' + tx('这里是 ', 'That is ') + (got ? '<b>' + esc(tx(got.zh, got.en)) + '</b>' : tx('未标注区域', 'an unlabelled area')) + tx('，再试一次（第 ', ' — try again (attempt ') + q.tries + tx(' 次）', ')');
      if (q.tries >= 3) { q.done = true; q.n++; state.alpha = 0.6; focusOn([s.idx]); fb.innerHTML += tx('。已显示答案。', '. Answer shown.'); }
    }
    root.setAttribute('data-quiz-last', p.lab === s.idx ? 'correct' : 'wrong');
    updScore();
  }

  // ---------- controls ----------
  function setWin(w) {
    state.win = w; var r = WIN[w]; nv.volumes[0].cal_min = r[0]; nv.volumes[0].cal_max = r[1]; nv.updateGLVolume();
    $$('#vwWin button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-w') === w); });
  }
  function setSrc(s) {
    state.src = s; $$('#vwSrc button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-src') === s); });
    $('#vwSrcNote').innerHTML = s === 'ref'
      ? tx('参考标注：TotalSegmentator 数据集 v2.0.1 自带掩膜（模型生成 + 人工校正），' + S.length + ' 个结构，CC BY 4.0。', 'Reference: the TotalSegmentator v2.0.1 dataset\'s own masks (model-generated, manually corrected), ' + S.length + ' structures, CC BY 4.0.')
      : tx('CADS 实测推理：CADS-model-research 任务 554 在本例上的真实输出（仅骨盆至 L2 的裁剪区域，' + META.cads_present_idx.length + ' 个结构），CC BY-NC-SA 4.0；1 例 CPU 推理，偏离官方配置，不代表模型性能。', 'CADS inference: real output of CADS-model-research task 554 on this case (cropped pelvis-to-L2 region only, ' + META.cads_present_idx.length + ' structures), CC BY-NC-SA 4.0; one CPU run with deviations from the official setup, not a performance claim.');
    root.setAttribute('data-src', s);
    if (nv && nv.volumes[1] && nv.volumes[1].name.indexOf(s === 'ref' ? 'ref' : 'cads') !== 0) { swapLabel(s).then(function () { onLoc(null); }); }
    else if (nv) { applyLabels(); nv.drawScene(); onLoc(null); }
  }
  function zoom(f) {
    var p = nv.scene.pan2Dxyzmm.slice(); p[3] = Math.min(8, Math.max(0.6, p[3] * f)); nv.setPan2Dxyzmm(p);
  }
  function bindControls() {
    $('#vwStart') && $('#vwStart').addEventListener('click', start);
    $('#vwWin').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && nv) { setWin(b.getAttribute('data-w')); nv.drawScene(); } });
    $('#vwSrc').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && META) setSrc(b.getAttribute('data-src')); });
    $('#vwAlpha').addEventListener('input', function () { state.alpha = +this.value; if (nv) { applyLabels(); nv.drawScene(); } });
    $('#vwMode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || !nv) return; state.outline = b.getAttribute('data-m') === 'outline'; $$('#vwMode button').forEach(function (x) { x.classList.toggle('on', x === b); }); applyLabels(); nv.drawScene(); });
    $('#vwTagBtn').addEventListener('click', function () { state.tags = !state.tags; this.classList.toggle('on', state.tags); this.setAttribute('aria-pressed', state.tags); scheduleTags(); });
    $('#vwPlane').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !nv) return; var p = b.getAttribute('data-p');
      if (p === 'grid') { state.layoutPref = 'grid'; setLayout(mql.matches ? 'single' : 'grid'); }
      else { state.plane = p; state.layoutPref = 'single'; setLayout('single'); }
    });
    $('#vwZoomIn').addEventListener('click', function () { nv && zoom(1.25); });
    $('#vwZoomOut').addEventListener('click', function () { nv && zoom(0.8); });
    $('#vwReset').addEventListener('click', function () { if (!nv) return; nv.setPan2Dxyzmm([0, 0, 0, 1]); nv.setRenderAzimuthElevation(180, 10); focusOn(null); $$('#vwStops button').forEach(function (b) { b.classList.remove('on'); }); $('#vwStopText').innerHTML = ''; });
    $('#vwClearFocus').addEventListener('click', function () { if (nv) { focusOn(null); $$('.vw-go.on').forEach(function (x) { x.classList.remove('on'); }); } });
    ['ax', 'cor', 'sag'].forEach(function (p) { $('#vwSl-' + p).addEventListener('input', function () { if (nv) setSlice(p, +this.value); }); });
    $('#vwQuizBtn').addEventListener('click', function () { if (!nv) return; state.quiz ? endQuiz() : startQuiz(); });
    $('#vwQuizNext').addEventListener('click', function () { if (state.quiz) { state.alpha = 0; focusOn(null); applyLabels(); newQuestion(); } });
    $('#vwQuizHint').addEventListener('click', function () { if (state.quiz) { state.alpha = 0.6; focusOn([state.quiz.target.idx]); } });
    document.getElementById('langBtn') && document.getElementById('langBtn').addEventListener('click', function () { setTimeout(function () { if (META) { setSrc(state.src); scheduleTags(); } }, 0); });
    $$('[data-vw-stop]', document).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var id = a.getAttribute('data-vw-stop'); root.scrollIntoView({ behavior: 'smooth' }); var go = function () { var i = STOPS.findIndex(function (s) { return s.id === id; }); if (i >= 0) goStop(i); }; if (nv) go(); else { pendingStop = go; start(); } }); });
  }
  var pendingStop = null;

  // ---------- public API (used by the headless checks) ----------
  var api = {
    get nv() { return nv; }, meta: function () { return META; }, dims: function () { return dims; },
    labelAt: function (v, src) { return inside(v) ? at(labData[src || state.src], v) : 0; },
    structure: function (ts) { return BYTS[ts]; }, byIdx: function (i) { return BYIDX[i]; },
    jump: jumpTo, crosshair: function () { return voxAtFrac(nv.scene.crosshairPos); }, setSrc: setSrc, setWin: setWin, goStop: function (id) { goStop(STOPS.findIndex(function (s) { return s.id === id; })); },
    state: function () { return state; }, startQuiz: function (ts) { startQuiz(); if (ts) { state.quiz.forced = ts; newQuestion(); } },
    canvasOf: function (v, st) { var r = nv.frac2canvasPosWithTile(nv.vox2frac(v, 0), st); if (!r) return null; var b = cv.getBoundingClientRect(), d = cv.width / b.width; return { x: b.left + r.pos[0] / d, y: b.top + r.pos[1] / d, tile: r.tileIndex }; }
  };

  bindControls();
  // 自动启动：进入视口即加载（数据约 22 MB）/ auto-start when the viewer scrolls into view
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); } }, { rootMargin: '200px' });
    io.observe(root);
  } else start();
  var _init = init; init = function (b) { return _init(b).then(function () { if (pendingStop) { pendingStop(); pendingStop = null; } }); };
})();
