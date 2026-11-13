/* EV 提取方法指南 v1.1 — 推荐器、流程步进、质控清单（localStorage）、章节导航高亮。无外部依赖。 */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let D = null;
  try { D = JSON.parse($('#recData').textContent); } catch (e) { D = null; }

  const cite = nums => {
    if (!nums || !nums.length) return '';
    return '<span class="cite">[' + nums.map(n => `<a href="#ref-${n}" title="${esc(D.short[n] || '')}">${n}</a>`).join(',') + ']</span>';
  };
  const tagify = s => esc(s).replace(/【([^】]+)】/g, (m, t) => `<span class="tag ${t.startsWith('估算') ? 'tag-est' : 'tag-lab'}">【${t}】</span>`);
  const mkind = c => {
    const map = [['密度', 'purple'], ['SEC', 'green'], ['TFF', 'orange'], ['超滤', 'orange'], ['沉淀', 'yellow'], ['免疫', 'red'], ['珠上', 'red'], ['靶向', 'red'], ['AF4', 'teal'], ['超离', 'blue']];
    for (const [k, v] of map) if (c.includes(k)) return v;
    return 'ink';
  };

  /* ---------- recommender ---------- */
  const form = $('#recForm');
  if (form && D) {
    const out = $('#recOut');
    const render = (animate) => {
      const fd = new FormData(form);
      const s = fd.get('sample'), u = fd.get('use'), p = fd.get('priority');
      const r = D.rules.find(x => x.s === s && x.u === u && x.p === p);
      if (!r) { $('#roRoute').innerHTML = '<p>这个组合暂无规则，请换一个选项。</p>'; return; }
      $('#roSel').textContent = `${D.labels.sample[s]} · ${D.labels.use[u]} · ${D.labels.priority[p]}`;
      $('#roRoute').innerHTML = r.route.split('→').map(c => `<span class="chip" data-m="${mkind(c)}">${esc(c.trim())}</span>`).join('<span class="arr" aria-hidden="true">→</span>');
      $('#roRefs').innerHTML = r.rr.length ? '依据 ' + cite(r.rr) : '';
      $('#roNote').innerHTML = tagify(r.note) + ' ' + cite(r.nr);
      const g = D.global_rules, show = [0];
      if (s === 'plasma') show.push(1);
      if (u === 'omics' || u === 'func') show.push(2);
      show.push(3);
      $('#roGlobal').innerHTML = show.map(i => `<li>${tagify(g[i].rule)} ${cite(g[i].refs)}</li>`).join('');
      if (animate) { out.classList.remove('flash'); void out.offsetWidth; out.classList.add('flash'); }
      try { localStorage.setItem('evg-rec', JSON.stringify({ s, u, p })); } catch (e) {}
    };
    try {
      const saved = JSON.parse(localStorage.getItem('evg-rec') || 'null');
      if (saved) for (const [k, v] of [['sample', saved.s], ['use', saved.u], ['priority', saved.p]]) {
        const el = form.querySelector(`input[name="${k}"][value="${v}"]`); if (el) el.checked = true;
      }
    } catch (e) {}
    form.addEventListener('change', () => render(true));
    render(false);
  }

  /* ---------- workflow stepper ---------- */
  const tabs = $$('.stab'), steps = $$('.step');
  if (tabs.length) {
    let cur = 1;
    const go = (n, focus) => {
      cur = Math.max(1, Math.min(steps.length, n));
      steps.forEach((el, i) => el.classList.toggle('on', i + 1 === cur));
      tabs.forEach((t, i) => {
        t.setAttribute('aria-selected', i + 1 === cur ? 'true' : 'false');
        t.tabIndex = i + 1 === cur ? 0 : -1;
        t.classList.toggle('done', i + 1 < cur);
      });
      $('#sCount').textContent = `${cur} / ${steps.length}`;
      $('#sPrev').disabled = cur === 1;
      $('#sNext').disabled = cur === steps.length;
      const t = tabs[cur - 1];
      if (focus) t.focus();
      const bar = t.parentElement; bar.scrollTo({ left: t.offsetLeft - bar.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
    };
    tabs.forEach((t, i) => {
      t.setAttribute('role', 'tab');
      t.addEventListener('click', () => go(i + 1));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, true); }
      });
    });
    steps.forEach(s => s.setAttribute('role', 'tabpanel'));
    $('#sPrev').addEventListener('click', () => go(cur - 1));
    $('#sNext').addEventListener('click', () => go(cur + 1));
    go(1);
  }

  /* ---------- QC checklist ---------- */
  const boxes = $$('input[data-qc]');
  if (boxes.length) {
    const KEY = 'evg-qc-v1';
    let st = {};
    try { st = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { st = {}; }
    const upd = () => {
      const n = boxes.filter(b => b.checked).length;
      $('#qCount').textContent = `${n} / ${boxes.length}`;
      $('#qBar').style.width = (100 * n / boxes.length) + '%';
      $('.qprog').setAttribute('aria-valuenow', n);
    };
    boxes.forEach(b => {
      b.checked = !!st[b.dataset.qc];
      b.addEventListener('change', () => {
        st[b.dataset.qc] = b.checked;
        try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
        upd();
      });
    });
    $('#qReset').addEventListener('click', () => {
      boxes.forEach(b => { b.checked = false; }); st = {};
      try { localStorage.removeItem(KEY); } catch (e) {}
      upd();
    });
    upd();
  }

  /* ---------- section nav highlight ---------- */
  const links = $$('.secnav a');
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(ents => {
      ents.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.removeAttribute('aria-current'));
          const a = map.get(en.target.id);
          if (a) {
            a.setAttribute('aria-current', 'true');
            const ul = a.closest('ul');
            ul.scrollTo({ left: a.parentElement.offsetLeft - 16, behavior: 'smooth' });
          }
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    map.forEach((a, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    const top = document.getElementById('top');
    if (top) new IntersectionObserver(ents => { if (ents[0].isIntersecting) links.forEach(a => a.removeAttribute('aria-current')); }, { rootMargin: '-35% 0px -60% 0px' }).observe(top);
  }

  /* ---------- citation jump-back ---------- */
  const back = $('#backJump');
  let ret = null;
  document.addEventListener('click', e => {
    const a = e.target.closest('.cite a');
    if (a) { ret = window.scrollY; back.hidden = false; }
  });
  back.addEventListener('click', () => {
    if (ret !== null) window.scrollTo({ top: ret, behavior: 'smooth' });
    back.hidden = true; ret = null;
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  });
  window.addEventListener('scroll', () => {
    if (ret !== null && Math.abs(window.scrollY - ret) < 40) { back.hidden = true; ret = null; }
  }, { passive: true });



  /* ---------- v1.1 keep schematic label chips inside the image ---------- */
  const fitPins = box => {
    const b = box.getBoundingClientRect(); if (!b.width) return;
    box.querySelectorAll('.pin span').forEach(s => {
      s.style.marginLeft = ''; s.style.marginTop = '';
      if (getComputedStyle(s).display === 'none') return;
      const r = s.getBoundingClientRect();
      if (r.right > b.right - 3) s.style.marginLeft = (b.right - 3 - r.right) + 'px';
      else if (r.left < b.left + 3) s.style.marginLeft = (b.left + 3 - r.left) + 'px';
      if (r.bottom > b.bottom - 2) s.style.marginTop = (b.bottom - 2 - r.bottom) + 'px';
      else if (r.top < b.top + 2) s.style.marginTop = (b.top + 2 - r.top) + 'px';
    });
  };
  const sboxes = $$('.simg');
  if (sboxes.length) {
    const runAll = () => sboxes.forEach(fitPins);
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(ents => ents.forEach(e => fitPins(e.target))); sboxes.forEach(s => ro.observe(s)); }
    else window.addEventListener('resize', runAll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(runAll);
    runAll();
  }

  /* ---------- v1.1 lightbox ---------- */
  const lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('#lbImg'); let opener = null;
    document.addEventListener('click', e => {
      const a = e.target.closest('a[data-lb]');
      if (!a) return;
      e.preventDefault();
      const fig = a.closest('figure');
      const t = fig.querySelector('.ft');
      const badge = fig.querySelector('.fbadge');
      const attr = fig.querySelector('.attr');
      img.removeAttribute('src');
      img.width = +a.dataset.w || 0; img.height = +a.dataset.h || 0;
      img.src = a.getAttribute('href');
      img.alt = (a.querySelector('img') || {}).alt || '';
      $('#lbTitle').textContent = t ? t.textContent : '';
      $('#lbBadge').innerHTML = badge ? badge.outerHTML : '';
      $('#lbAttr').innerHTML = attr ? attr.outerHTML : (fig.classList.contains('schem') ? '<p class="attr">AI 生成示意图，仅帮助理解原理，非实验数据。</p>' : '');
      opener = a;
      lb.showModal();
      $('#lbClose').focus();
    });
    $('#lbClose').addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => { img.removeAttribute('src'); if (opener) opener.focus(); opener = null; });
  }

  /* ---------- v1.1 sample filter for real figures ---------- */
  const ftabs = $$('.ftab');
  if (ftabs.length) {
    const figs = $$('.rfig'), groups = $$('.rgroup');
    const apply = f => {
      ftabs.forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f ? 'true' : 'false'));
      figs.forEach(el => { const s = el.dataset.samples.split(' '); el.hidden = !(f === 'all' || s.includes('all') || s.includes(f)); });
      let any = false;
      groups.forEach(g => { const vis = g.querySelectorAll('.rfig:not([hidden])').length; g.hidden = vis === 0; if (vis) any = true;
        const sm = g.querySelector('h3 small'); if (sm) sm.textContent = vis + ' 张'; });
      $('#fEmpty').hidden = any;
    };
    ftabs.forEach(b => b.addEventListener('click', () => apply(b.dataset.f)));
  }

  /* ---------- print ---------- */
  const pb = $('#printBtn');
  if (pb) pb.addEventListener('click', () => window.print());
})();
