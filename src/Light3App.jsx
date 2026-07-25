import {useEffect,useMemo,useRef,useState} from 'react';
import {
  ArrowDown,ArrowRight,BookOpenText,Brain,CalendarBlank,ChalkboardTeacher,
  DownloadSimple,EnvelopeSimple,FirstAidKit,Funnel,GithubLogo,GraduationCap,LinkedinLogo,
  Heartbeat,List,Lock,Microscope,ShieldCheck,Trophy,User,X
} from '@phosphor-icons/react';

const papers=[
  {id:'P01',year:'2025',title:'Clinical characteristics and mortality risk factors in polytrauma patients with pelvic fractures',journal:'International Journal of Emergency Medicine · 18(1):192',href:'https://doi.org/10.1186/s12245-025-00990-5'},
  {id:'P02',year:'2025',title:'Multidisciplinary management of severe open pelvic fracture with multiple organ injuries',journal:'Medicine (Baltimore) · 104(31):e43551',href:'https://doi.org/10.1097/MD.0000000000043551'},
  {id:'P03',year:'2020',title:'Comparison of the curative effect of modified medial arc incision and traditional straight incision in old Achilles tendon rupture',journal:'Pakistan Journal of Pharmaceutical Sciences · PMID 33191233',href:'https://pubmed.ncbi.nlm.nih.gov/33191233/'}
];

const honors=[
  {id:'A01',year:'2025',title:{zh:'第四届“王正国创伤医学菁英杯”江苏省青年医师创伤病例大赛一等奖',en:'First Prize, 4th Wang Zhengguo Trauma Medicine Elite Cup — Jiangsu Young Physicians Trauma Case Competition'},meta:{zh:'创伤病例大赛 · 一等奖',en:'Trauma Case Competition · First Prize'}},
  {id:'A02',year:'2024',title:{zh:'江南大学附属医院青年教师“教学会讲竞赛”第一名',en:'First Place, Young Faculty Teaching Competition — Affiliated Hospital of Jiangnan University'},meta:{zh:'青年教师竞赛 · 第一名',en:'Young Faculty Competition · First Place'}},
  {id:'A03',year:'2024',title:{zh:'江南大学医学院、附属医院系统青年教师“教学会讲竞赛”二等奖',en:'Second Prize, Young Faculty Teaching Competition — Jiangnan University School of Medicine and Affiliated Hospital System'},meta:{zh:'青年教师竞赛 · 二等奖',en:'Young Faculty Competition · Second Prize'}},
  {id:'A04',year:'2024',title:{zh:'第三届“王正国创伤医学菁英杯”江苏省二等奖；华东地区半决赛优秀奖',en:'Second Prize, Jiangsu Division, 3rd Wang Zhengguo Trauma Medicine Elite Cup; Excellence Award, East China Semifinal'},meta:{zh:'江苏赛区与华东半决赛',en:'Jiangsu Division · East China Semifinal'}},
  {id:'A05',year:'2024',title:{zh:'江苏省医学会第十次创伤医学学术会议优秀论文二等奖（第三名）',en:'Second Prize (3rd Place), Outstanding Paper Award — 10th Trauma Medicine Academic Conference of Jiangsu Medical Association'},meta:{zh:'优秀论文 · 现场汇报',en:'Outstanding Paper · Oral Presentation'}}
];

const content={
  zh:{
    nav:['首页','临床与研究','学术成果','教学与服务','Haixiang OS'],
    rail:['概览','证据','教学','系统','联系'],homeLabel:'丁海祥首页',menuOpen:'打开菜单',menuClose:'关闭菜单',mainNav:'主导航',sectionNav:'章节导航',
    focus:'创伤急救 × 骨科创伤 × 糖尿病骨质疏松机制',role:'主治医师 · 苏州大学临床医学博士专业学位在读',hospital:'江南大学附属医院 · 无锡，中国',download:'下载公开简历',
    stats:[['English Publications','同行评议 · 英文期刊'],['Honors','学术荣誉与表彰'],['Invited Lecture Cohorts','连续三届受邀授课'],['Doctoral Trainee','2026级临床医学博士学员']],
    imageAlt:'糖尿病骨质疏松研究视觉：骨小梁微结构、AGE-RAGE、ROS、Wnt/β-catenin、RANKL/OPG与AI分析网络',
    inquiry:'From Trauma Care to Testable Mechanism',inquiryLead:'以临床问题为起点，构建可验证的机制假设，推动创伤骨科与代谢性骨病研究的交叉进展。',
    steps:[['观察与临床问题','来自急救与创伤一线的真实问题，形成可研究的科学假设。'],['机制与证据','整合临床队列、影像、生物力学与分子机制证据。'],['转化与影响','面向严重创伤MDT决策、风险评估与教学改进。']],
    evidence:'公开证据与荣誉档案',evidenceType:'证据类型',publicationsFilter:'03 English Publications',honorsFilter:'05 Honors',verify:'核验',publicSummary:'公开摘要',
    teaching:'连续三届受邀授课',lectureTitle:'创伤伤口治疗与管理原则',lectureCohorts:['第5届','第6届','第7届'],lectureProgram:'无锡市伤口造口专科护士培训班',lectureLabel:'受邀授课',
    os:'个人临床研究操作系统',osLead:'观察事实、核验证据、明确推断、保护边界。',domains:[['临床','创伤病例 → 风险识别 → MDT救治路径'],['科研','临床问题 → 机制假设 → 可检验方案'],['教学','病例复盘 → 关键节点 → 课程反馈'],['安全AI','证据分层 → 人工复核 → 隐私脱敏']],
    profileLabel:'专业联系',contact:'临床、科研与医学 AI 合作',contactLead:'关注创伤急救、创伤伤口管理、糖尿病骨质疏松机制、临床决策支持与医学教育，并探索大语言模型、生物医学数据分析和智能工作流在真实医疗场景中的安全应用。',contactRole:'主治医师｜AI 医学与临床研究',contactNote:'优先通过电子邮件或 LinkedIn 联系',linkedin:'LinkedIn 专业主页',email:'发送电子邮件',github:'查看 GitHub',compare:'对比深色版本',backTop:'返回顶部'
  },
  en:{
    nav:['Home','Clinical & Research','Evidence','Teaching & Service','Haixiang OS'],
    rail:['PROFILE','EVIDENCE','TEACHING','OS','CONTACT'],homeLabel:'Haixiang Ding home',menuOpen:'Open menu',menuClose:'Close menu',mainNav:'Main navigation',sectionNav:'Section navigation',
    focus:'Trauma Care × Orthopaedic Trauma × Diabetic Osteoporosis',role:'Attending Physician · Professional Doctoral Student in Clinical Medicine, Soochow University',hospital:'Affiliated Hospital of Jiangnan University · Wuxi, China',download:'Download public CV',
    stats:[['English Publications','Peer-reviewed English journals'],['Honors','Academic awards and recognition'],['Invited Lecture Cohorts','Three consecutive invited cohorts'],['Doctoral Trainee','Clinical Medicine · Class of 2026']],
    imageAlt:'Diabetic osteoporosis research visualization combining trabecular microarchitecture, AGE-RAGE, ROS, Wnt/β-catenin, RANKL/OPG and an AI analysis network',
    inquiry:'From Trauma Care to Testable Mechanism',inquiryLead:'Starting with clinical questions, building testable mechanisms, and connecting trauma care with metabolic bone research.',
    steps:[['Observation & Clinical Question','Questions from frontline trauma care become researchable hypotheses.'],['Mechanism & Evidence','Combine cohorts, imaging, biomechanics and mechanistic evidence.'],['Translation & Impact','Support MDT decisions, risk assessment and education.']],
    evidence:'Public Evidence & Honors',evidenceType:'Evidence type',publicationsFilter:'03 English Publications',honorsFilter:'05 Honors',verify:'Verify',publicSummary:'Public summary',
    teaching:'Three Consecutive Invited Lectures',lectureTitle:'Principles of Treatment and Management for Traumatic Wounds',lectureCohorts:['5th Cohort','6th Cohort','7th Cohort'],lectureProgram:'Wuxi Specialist Nurse Training Program for Wound and Stoma Care',lectureLabel:'Invited Lecture',
    os:'Personal Clinical Research OS',osLead:'Observe facts, verify evidence, label inference and protect boundaries.',domains:[['Clinical','Trauma case → Risk recognition → MDT care pathway'],['Research','Clinical question → Mechanistic hypothesis → Testable protocol'],['Teaching','Case review → Decision points → Course feedback'],['Safe AI','Evidence grading → Human review → Privacy protection']],
    profileLabel:'Professional Contact',contact:'Clinical, Research & Medical AI Collaboration',contactLead:'Focused on trauma care, wound management, diabetic osteoporosis mechanisms, clinical decision support and medical education, with an interest in safely applying large language models, biomedical data analysis and intelligent workflows to real-world healthcare.',contactRole:'Attending Physician | AI in Medicine & Clinical Research',contactNote:'Email or LinkedIn is preferred for professional enquiries',linkedin:'LinkedIn Profile',email:'Send Email',github:'View GitHub',compare:'Compare dark version',backTop:'Back to top'
  }
};

const navIds=['profile','research','evidence','teaching','os'];
const railIds=['profile','evidence','teaching','os','contact'];
const railIcons=[User,BookOpenText,ChalkboardTeacher,Microscope,EnvelopeSimple];
const stepIcons=[FirstAidKit,Brain,Heartbeat];
const domainIcons=[FirstAidKit,Brain,ChalkboardTeacher,ShieldCheck];
const statIcons=[BookOpenText,Trophy,ChalkboardTeacher,GraduationCap];
const statValues=['03','05','03','2026'];

function ArchiveCursor(){
  const ref=useRef(null);
  useEffect(()=>{
    if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const canvas=ref.current,ctx=canvas.getContext('2d'),dots=[];let raf=0,x=-30,y=-30,active=false;
    const resize=()=>{const density=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*density;canvas.height=innerHeight*density;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(density,0,0,density,0,0)};
    const move=event=>{x=event.clientX;y=event.clientY;active=true;dots.push({x,y,a:1});if(dots.length>24)dots.shift()};
    const leave=()=>{active=false};
    const draw=()=>{ctx.clearRect(0,0,innerWidth,innerHeight);for(let i=dots.length-1;i>=0;i--){const dot=dots[i];dot.a-=.05;if(dot.a<=0){dots.splice(i,1);continue}ctx.globalAlpha=dot.a*.28;ctx.fillStyle='#667b62';ctx.beginPath();ctx.arc(dot.x,dot.y,1.8*dot.a,0,Math.PI*2);ctx.fill()}if(active){ctx.globalAlpha=.65;ctx.strokeStyle='#9e2028';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1;raf=requestAnimationFrame(draw)};
    resize();addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});addEventListener('pointerleave',leave);raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('pointermove',move);removeEventListener('pointerleave',leave)};
  },[]);
  return <canvas ref={ref} className="l3Cursor" aria-hidden="true"/>;
}

export function Light3App(){
  const [lang,setLang]=useState('zh');
  const [menu,setMenu]=useState(false);
  const [filter,setFilter]=useState('papers');
  const [active,setActive]=useState('profile');
  const t=content[lang];
  const records=useMemo(()=>filter==='papers'?papers:honors,[filter]);

  useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en'},[lang]);
  useEffect(()=>{
    const sections=[...document.querySelectorAll('.light3 main section[id]')];
    const observer=new IntersectionObserver(entries=>{const hit=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(hit)setActive(hit.target.id)},{rootMargin:'-20% 0px -65%',threshold:[0,.25,.6]});
    sections.forEach(section=>observer.observe(section));return()=>observer.disconnect();
  },[]);

  return <div className="light3" data-lang={lang}>
    <ArchiveCursor/>
    <header className="l3Header">
      <a className="l3Brand" href="#profile" aria-label={t.homeLabel}>D</a>
      <button className="l3Menu" aria-label={menu?t.menuClose:t.menuOpen} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<List/>}</button>
      <nav className={menu?'open':''} aria-label={t.mainNav}>{t.nav.map((label,index)=><a key={label} href={'#'+navIds[index]} onClick={()=>setMenu(false)}>{label}</a>)}</nav>
      <div className="l3Meta"><span><CalendarBlank/>2026-07-25</span><button aria-label={lang==='zh'?'Switch to English':'切换至中文'} onClick={()=>setLang(lang==='zh'?'en':'zh')}>{lang==='zh'?'中文 / English':'English / 中文'}</button></div>
    </header>

    <aside className="l3Rail" aria-label={t.sectionNav}>{railIds.map((id,index)=>{const Icon=railIcons[index];return <a key={id} href={'#'+id} className={active===id?'active':''}><Icon/><span>{t.rail[index]}</span></a>})}</aside>

    <main>
      <section id="profile" className="l3Hero">
        <div className="l3Identity">
          <h1><span>丁海祥</span>Haixiang Ding, M.D.</h1>
          <h2>{t.focus}</h2>
          <p>{t.role}</p><p className="l3Hospital">{t.hospital}</p>
        </div>
        <figure className="l3Mechanism"><img src="/assets/light3-trabecular-ai-mechanism-v2.png" alt={t.imageAlt} fetchPriority="high"/></figure>
        <div className="l3Stats">{t.stats.map(([label,detail],index)=>{const Icon=statIcons[index];return <div key={label}><Icon/><b>{statValues[index]}</b><span>{label}<small>{detail}</small></span></div>})}</div>
      </section>

      <section id="research" className="l3Inquiry">
        <div className="l3SectionHead"><h2>{t.inquiry}</h2><p>{t.inquiryLead}</p></div>
        <div className="l3Steps">{t.steps.map(([title,body],index)=>{const Icon=stepIcons[index];return <article key={title}><b>0{index+1}</b><Icon/><div><h3>{title}</h3><p>{body}</p></div></article>})}</div>
      </section>

      <section id="evidence" className="l3Evidence">
        <div className="l3SectionHead"><h2>{t.evidence}</h2></div>
        <div className="l3Filters" role="group" aria-label={t.evidenceType}><Funnel/><button className={filter==='papers'?'active':''} aria-pressed={filter==='papers'} onClick={()=>setFilter('papers')}>{t.publicationsFilter}</button><button className={filter==='honors'?'active':''} aria-pressed={filter==='honors'} onClick={()=>setFilter('honors')}>{t.honorsFilter}</button></div>
        <div className="l3Ledger">{records.map(item=>{const title=typeof item.title==='string'?item.title:item.title[lang];const meta=item.journal||(typeof item.meta==='string'?item.meta:item.meta[lang]);return <article key={item.id}><span>{item.id}</span><time>{item.year}</time><div><h3>{title}</h3><p>{meta}</p></div>{item.href?<a href={item.href} target="_blank" rel="noreferrer" aria-label={`${t.verify}: ${title}`}><ArrowRight/></a>:<Lock aria-label={t.publicSummary}/>}</article>})}</div>
      </section>

      <section id="teaching" className="l3Teaching">
        <div className="l3SectionHead"><h2>{t.teaching}</h2><p>{t.lectureTitle}</p></div>
        <div className="l3Timeline">{['2024','2025','2026'].map((year,index)=><article key={year}><span>0{index+1}</span><time>{year}</time><h3>{t.lectureCohorts[index]}</h3><p>{t.lectureProgram}</p><small>{t.lectureLabel}</small></article>)}</div>
      </section>

      <section id="os" className="l3OS">
        <div className="l3SectionHead"><h2>{t.os}</h2><p>{t.osLead}</p></div>
        <div className="l3Domains">{t.domains.map(([title,body],index)=>{const Icon=domainIcons[index];return <article key={title}><Icon/><b>0{index+1}</b><h3>{title}</h3><p>{body}</p></article>})}</div>
      </section>

      <section id="contact" className="l3Contact">
        <div className="l3ContactIntro"><small>{t.profileLabel}</small><h2>{t.contact}</h2><p>{t.contactLead}</p><div className="l3ContactIdentity"><b>{t.contactRole}</b><span>{t.contactNote}</span></div></div>
        <div className="l3ContactPanel">
          <a className="featured" href="https://www.linkedin.com/in/haixiang-ding-a1a646411/" target="_blank" rel="noreferrer"><LinkedinLogo/><span><b>{t.linkedin}</b><small>linkedin.com/in/haixiang-ding-a1a646411</small></span><ArrowRight/></a>
          <a href="mailto:haixiangding001@gmail.com"><EnvelopeSimple/><span><b>{t.email}</b><small>haixiangding001@gmail.com</small></span><ArrowRight/></a>
          <div className="l3ContactSecondary"><a href="https://github.com/TUANZIDING" target="_blank" rel="noreferrer"><GithubLogo/>{t.github}</a><a href="/downloads/haixiang-ding-public-cv-2026.docx" download><DownloadSimple/>{t.download}</a><a href="?design=v3">{t.compare}<ArrowRight/></a></div>
        </div>
      </section>
    </main>
    <footer className="l3Footer"><b>D</b><span>Haixiang Ding · Public Clinical Academic Profile · 2026</span><a href="#profile">{t.backTop}<ArrowDown/></a></footer>
  </div>;
}
