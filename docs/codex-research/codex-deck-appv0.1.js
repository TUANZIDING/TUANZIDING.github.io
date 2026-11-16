// aiai · 用 Codex 做科研 · deck controller v0.1
(() => {
  const stage = document.getElementById('stage');
  const S = [...document.querySelectorAll('.s')];
  const N = S.length;
  const SEC = ['封面', '任务型 Agent', 'Skill = SOP', '论文搜索', '综述写作', '数据分析', '答辩 PPT', '课堂练习'];
  const SECCOL = ['#4f4ff0', '#4f4ff0', '#7a5cf5', '#1596d4', '#7a5cf5', '#0f9e74', '#c4840c', '#4f4ff0'];
  let cur = 0;

  // fit 1600x900 stage
  const narrow = () => matchMedia('(max-width:860px),(max-aspect-ratio:1/1)').matches;
  function fit(){
    if (narrow()) { stage.style.transform = ''; return; }
    const k = Math.min(innerWidth / 1600, innerHeight / 900);
    stage.style.transform = `scale(${k})`;
  }
  addEventListener('resize', fit); fit();

  // stagger index per slide
  S.forEach(s => s.querySelectorAll('.a').forEach((el, i) => el.style.setProperty('--i', i)));

  // tree lines
  document.querySelectorAll('.tree.typed').forEach(t => {
    t.innerHTML = t.innerHTML.split('\n').map((l, i) => `<span class="ln" style="--l:${i}">${l || ' '}</span>`).join('');
  });

  // copy buttons
  document.querySelectorAll('.prompt').forEach(p => {
    const b = document.createElement('button'); b.className = 'copy'; b.type = 'button'; b.textContent = '复制';
    b.onclick = async e => {
      e.stopPropagation();
      const txt = p.querySelector('pre').innerText;
      try { await navigator.clipboard.writeText(txt); } catch { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      b.textContent = '已复制'; b.classList.add('ok'); setTimeout(() => { b.textContent = '复制'; b.classList.remove('ok'); }, 1400);
    };
    p.appendChild(b);
  });

  // step switchers
  document.querySelectorAll('[data-steps]').forEach(w => {
    const bs = [...w.querySelectorAll('.snav button')], ps = [...w.querySelectorAll('.spanes .prompt')];
    bs.forEach((b, i) => b.onclick = () => { bs.forEach(x => x.classList.toggle('on', x === b)); ps.forEach((p, j) => p.hidden = j !== i); });
  });

  // heatmap demo (deterministic, symmetric)
  const heat = document.getElementById('heat');
  if (heat) {
    const v = [[1,.62,-.41,.38,.12,.05],[.62,1,-.55,.47,.18,.09],[-.41,-.55,1,-.33,-.06,-.02],[.38,.47,-.33,1,.21,.11],[.12,.18,-.06,.21,1,.15],[.05,.09,-.02,.11,.15,1]];
    v.forEach((r, i) => r.forEach((x, j) => {
      const c = document.createElement('i'); c.style.setProperty('--k', i * 6 + j);
      c.style.background = x >= 0 ? `rgba(79,79,240,${0.12 + x * 0.85})` : `rgba(226,68,95,${0.12 - x * 0.9})`;
      c.title = x.toFixed(2); heat.appendChild(c);
    }));
  }

  // count-up
  function countUp(s){
    s.querySelectorAll('[data-count]').forEach(el => {
      const end = +el.dataset.count, t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  // section dots
  const dots = document.getElementById('secdots');
  SEC.forEach((name, i) => {
    const b = document.createElement('button'); b.title = name; b.setAttribute('aria-label', name);
    b.onclick = () => go(S.findIndex(s => +s.dataset.sec === i)); dots.appendChild(b);
  });

  const chip = document.getElementById('secchip');
  const pg = document.getElementById('pg'), pt = document.getElementById('pt'), fill = document.getElementById('progfill');
  const prev = document.getElementById('prev'), next = document.getElementById('next');
  pt.textContent = N;

  function go(i, instant){
    i = Math.max(0, Math.min(N - 1, i));
    if (i === cur && !instant) return;
    const fwd = i > cur;
    S[cur].classList.remove('on'); S[cur].classList.toggle('prev', fwd);
    S.forEach((s, k) => { if (k !== cur) s.classList.remove('prev'); });
    cur = i; const s = S[cur];
    s.classList.remove('prev'); s.classList.add('on');
    if (narrow()) s.scrollTop = 0;
    const sec = +s.dataset.sec;
    chip.querySelector('span').textContent = sec ? `${String(sec).padStart(2, '0')} ${SEC[sec]}` : SEC[0];
    chip.querySelector('i').style.background = SECCOL[sec];
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === sec));
    pg.textContent = cur + 1; fill.style.width = ((cur + 1) / N * 100) + '%';
    prev.disabled = cur === 0; next.disabled = cur === N - 1;
    document.body.dataset.scene = s.dataset.scene;
    document.title = `${s.dataset.t} · 用 Codex 做科研 | aiai`;
    history.replaceState(null, '', '#' + (cur + 1));
    countUp(s);
    dispatchEvent(new CustomEvent('slide', { detail: { scene: s.dataset.scene, index: cur } }));
  }
  window.__go = go;

  prev.onclick = () => go(cur - 1); next.onclick = () => go(cur + 1);
  document.querySelectorAll('[data-next]').forEach(b => b.onclick = () => go(cur + 1));
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(+b.dataset.go));
  addEventListener('keydown', e => {
    if (e.target.closest('input,textarea')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') go(0); else if (e.key === 'End') go(N - 1);
  });
  // swipe
  let sx = 0, sy = 0, st = 0;
  addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); }, { passive: true });
  addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - st < 700) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
  // wheel (desktop, debounced)
  let wl = 0;
  addEventListener('wheel', e => {
    if (narrow()) return;
    const now = Date.now(); if (now - wl < 700 || Math.abs(e.deltaY) < 30) return;
    wl = now; go(cur + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  // order game
  const order = document.getElementById('order'), out = document.getElementById('orderout');
  const NAMES = ['读真实论文', '做主题矩阵', '写综述大纲', '写正文初稿']; let seq = [];
  order.querySelectorAll('button').forEach(b => b.onclick = () => {
    b.classList.add('used'); seq.push(+b.dataset.k);
    out.innerHTML = seq.map(k => `<span>${NAMES[k]}</span>`).join('<em>→</em>');
    if (seq.length === 4) {
      const ok = seq.every((k, i) => k === i);
      out.innerHTML += ok ? ' <b class="ok">✓ 顺序正确</b>' : ' <b class="no">✕ 再想想：先读、再矩阵、再大纲、最后正文</b>';
      const r = document.createElement('button'); r.textContent = '重来'; r.onclick = () => { seq = []; out.innerHTML = ''; order.querySelectorAll('button').forEach(x => x.classList.remove('used')); };
      out.appendChild(r);
    }
  });

  // quiz, one question at a time
  const Q = [
    ['给 Codex 的第一条指令，最好是哪一句？', ['“帮我做科研。”', '“先读当前文件夹和 AGENTS.md，复述目标、已有材料、缺失材料和下一步建议，先不要出结果。”', '“直接生成最终报告。”'], 1, '先让它进入任务上下文，而不是直接开始自由发挥。'],
    ['Skill 和提示词的关系是？', ['Skill 就是更长的提示词', '提示词解决“这一次怎么问”，Skill 是以后每次都按它走的成熟 SOP', '两者没有区别'], 1, '好的 Skill 写清：何时用、要什么输入、什么步骤、调用哪些脚本、输出什么、不能做什么。'],
    ['装好一个很火的 Skill，第一步该做什么？', ['马上用它写论文', '让 Codex 先读 SKILL.md，总结适用范围、输入输出、限制和与我课题的适配度', '再去找一个更火的'], 1, '热度不等于适配，学科不匹配就修改流程或自建 Skill。'],
    ['下面哪种找文献的方式最危险？', ['让 AI 直接“推荐 20 篇相关论文”', '先拆概念矩阵再生成检索式', '用 Skill 调 PubMed / Scholar 真实检索并导出元数据'], 0, '模型可能凭记忆列出看似真实的文献，没有 DOI、PMID 或链接可核查。'],
    ['论文里的统计图应该怎么得到？', ['用图片生成模型直接画', '由 Python 或 R 代码基于真实数据生成并保留代码', '从相似论文里截图修改'], 1, '代码和数据可追溯；美化图表时也只改样式，不改统计结果。'],
    ['把论文变成答辩 PPT，核心是什么？', ['把论文段落复制进去', '重新组织答辩逻辑，每页只讲一个核心信息', '每页尽量多放文字以免遗漏'], 1, '先拆逻辑、再出大纲并确认，最后才生成 PPT 和逐页讲稿。']
  ];
  const qn = document.getElementById('qn'), qt = document.getElementById('qtitle'), qo = document.getElementById('qopts'), qw = document.getElementById('qwhy'), qs = document.getElementById('qscore'), qx = document.getElementById('qnext');
  let qi = 0, score = 0;
  function showQ(){
    const q = Q[qi]; qn.textContent = `${qi + 1} / ${Q.length}`; qt.textContent = q[0]; qw.textContent = ''; qx.disabled = true;
    qx.textContent = qi === Q.length - 1 ? '看结果 →' : '下一题 →';
    qo.innerHTML = '';
    q[1].forEach((o, oi) => {
      const b = document.createElement('button'); b.innerHTML = `<b>${'ABC'[oi]}</b><span>${o}</span>`;
      b.onclick = () => {
        [...qo.children].forEach(x => x.disabled = true);
        b.classList.add(oi === q[2] ? 'right' : 'wrong'); qo.children[q[2]].classList.add('right');
        if (oi === q[2]) score++;
        qs.textContent = `得分 ${score}`; qw.textContent = q[3]; qx.disabled = false;
      };
      qo.appendChild(b);
    });
  }
  qx.onclick = () => {
    if (qi < Q.length - 1) { qi++; showQ(); }
    else {
      qt.textContent = `得分 ${score} / ${Q.length}` + (score === Q.length ? ' · 全对，可以上手了' : ' · 回看对应章节再试试');
      qo.innerHTML = ''; qw.textContent = ''; qx.textContent = '再测一次 ↺'; qx.disabled = false;
      qx.onclick = () => { qi = 0; score = 0; qs.textContent = '得分 0'; qx.onclick = qnextDefault; showQ(); };
    }
  };
  const qnextDefault = qx.onclick;
  showQ();

  const h = parseInt(location.hash.slice(1), 10);
  cur = 0; go(h >= 1 && h <= N ? h - 1 : 0, true);
})();
