import {useEffect,useMemo,useRef,useState} from 'react';
import {
  ArrowDown,ArrowRight,BookOpenText,Brain,CalendarBlank,ChalkboardTeacher,
  DownloadSimple,EnvelopeSimple,FirstAidKit,Funnel,GithubLogo,GraduationCap,LinkedinLogo,
  Feather,Heartbeat,List,Lock,Medal,Microscope,ShieldCheck,Trophy,User,X,Radioactive,Dna,Flask
} from '@phosphor-icons/react';

const papers=[
  {id:'P04',year:'2026',title:'Intraoperative hypotension and in-hospital outcomes in older adults undergoing procedure-defined hip or femoral surgery with a same-admission S72 diagnosis: a retrospective cohort study using INSPIRE',journal:'BMC Anesthesiology · 2026',href:'https://doi.org/10.1186/s12871-026-04284-y'},
  {id:'P01',year:'2025',title:'Clinical characteristics and mortality risk factors in polytrauma patients with pelvic fractures',journal:'International Journal of Emergency Medicine · 18(1):192',href:'https://doi.org/10.1186/s12245-025-00990-5'},
  {id:'P02',year:'2025',title:'Multidisciplinary management of severe open pelvic fracture with multiple organ injuries',journal:'Medicine (Baltimore) · 104(31):e43551',href:'https://doi.org/10.1097/MD.0000000000043551'},
  {id:'P03',year:'2020',title:'Comparison of the curative effect of modified medial arc incision and traditional straight incision in old Achilles tendon rupture',journal:'Pakistan Journal of Pharmaceutical Sciences · PMID 33191233',href:'https://pubmed.ncbi.nlm.nih.gov/33191233/'}
];

const honors=[
  {id:'A06',year:'2026',title:{zh:'The Pokémon Company－PTCG AI Battle Challenge Simulation 竞赛银牌（第253名／6,807支队伍）',en:'Competition Silver Medal, The Pokémon Company – PTCG AI Battle Challenge Simulation (253rd of 6,807 teams)'},meta:{zh:'Kaggle · 2026年9月1日',en:'Kaggle · Awarded September 1, 2026'},href:'https://www.kaggle.com/certification/competitions/bruceding123/pokemon-tcg-ai-battle'},
  {id:'A01',year:'2025',title:{zh:'第四届“王正国创伤医学菁英杯”江苏省青年医师创伤病例大赛一等奖',en:'First Prize, 4th Wang Zhengguo Trauma Medicine Elite Cup — Jiangsu Young Physicians Trauma Case Competition'},meta:{zh:'创伤病例大赛 · 一等奖',en:'Trauma Case Competition · First Prize'}},
  {id:'A02',year:'2024',title:{zh:'江南大学附属医院青年教师“教学会讲竞赛”第一名',en:'First Place, Young Faculty Teaching Competition — Affiliated Hospital of Jiangnan University'},meta:{zh:'青年教师竞赛 · 第一名',en:'Young Faculty Competition · First Place'}},
  {id:'A03',year:'2024',title:{zh:'江南大学医学院、附属医院系统青年教师“教学会讲竞赛”二等奖',en:'Second Prize, Young Faculty Teaching Competition — Jiangnan University School of Medicine and Affiliated Hospital System'},meta:{zh:'青年教师竞赛 · 二等奖',en:'Young Faculty Competition · Second Prize'}},
  {id:'A04',year:'2024',title:{zh:'第三届“王正国创伤医学菁英杯”江苏省二等奖；华东地区半决赛优秀奖',en:'Second Prize, Jiangsu Division, 3rd Wang Zhengguo Trauma Medicine Elite Cup; Excellence Award, East China Semifinal'},meta:{zh:'江苏赛区与华东半决赛',en:'Jiangsu Division · East China Semifinal'}},
  {id:'A05',year:'2024',title:{zh:'江苏省医学会第十次创伤医学学术会议优秀论文二等奖（第三名）',en:'Second Prize (3rd Place), Outstanding Paper Award — 10th Trauma Medicine Academic Conference of Jiangsu Medical Association'},meta:{zh:'优秀论文 · 现场汇报',en:'Outstanding Paper · Oral Presentation'}}
];

const content={
  zh:{
    nav:['首页','临床与研究','学术成果','教学与服务','诗画长卷','Haixiang OS'],
    rail:['概览','证据','教学','诗画','系统','联系'],homeLabel:'丁海祥首页',menuOpen:'打开菜单',menuClose:'关闭菜单',mainNav:'主导航',sectionNav:'章节导航',
    focus:'放射性骨骼肌损伤与修复 × 创伤急救 × 医学 AI',role:'主治医师 · 苏州大学临床医学博士专业学位在读',hospital:'江南大学附属医院 · 无锡，中国',download:'下载公开简历',
    stats:[['English Publications','同行评议 · 英文期刊'],['Honors','学术荣誉与表彰'],['Kaggle Silver','6,807 支队伍中第 253 名'],['Invited Lecture Cohorts','连续三届受邀授课']],
    medal:{kicker:'Kaggle 竞赛银牌',title:'PTCG AI Battle Challenge',meta:'第 253 名 / 6,807 支队伍 · 前 3.7%',cta:'查看证书'},
    labels:['电离辐射','纤维化 · FAP','卫星细胞 MuSC','细胞外囊泡','证据网络'],figNote:'示意图 · AI 辅助绘制',zoom:[['辐射打击','射线穿透，肌纤维膜撕裂'],['纤维化 · FAP','FAP 过度活化，胶原沉积'],['卫星细胞','MuSC 被唤醒，沿肌纤维修复'],['细胞外囊泡','囊泡携带信号，调节修复'],['证据网络','把文献证据连成机制图']],
    atlas:[['放射性骨骼肌损伤证据图谱','分子通路按 A/B/C 证据分层，可交互浏览','v0.7'],['细胞外囊泡干预证据图谱','141 项纳入研究，标出体内证据的空白','v0.2']],earlier:'早期方向：糖尿病骨质疏松机制 · 创伤骨科临床研究',
    tagline:['从急救床旁的问题出发，','让受损的肌肉，','重新学会修复。'],
    imageAlt:'放射性骨骼肌损伤与修复示意图：电离辐射照射肌束，纤维化与卫星细胞、细胞外囊泡和证据网络',
    inquiry:'From Radiation Injury to Integrated Repair',inquiryLead:'电离辐射之后，肌肉为什么修不好？我从急救创伤一线出发，研究辐射如何打乱卫星细胞、成纤维脂肪祖细胞、血管与细胞外基质之间的修复协作，并用分级证据图谱和实验检验干预思路。',
    steps:[['损伤触发','DNA 损伤、氧化应激与微血管受损，启动辐射后的级联反应。'],['修复失衡','卫星细胞耗竭、FAP 持续活化与基质沉积，修复滑向纤维化。'],['干预与验证','以细胞外囊泡等策略为切入点，用分级证据和实验检验整合修复。']],
    evidence:'公开证据与荣誉档案',evidenceType:'证据类型',publicationsFilter:'04 English Publications',honorsFilter:'06 Honors',verify:'核验',publicSummary:'公开摘要',
    teaching:'连续三届受邀授课',lectureTitle:'创伤伤口治疗与管理原则',lectureCohorts:['第5届','第6届','第7届'],lectureProgram:'无锡市伤口造口专科护士培训班',lectureLabel:'受邀授课',
    culture:'诗画长卷',cultureLead:'以水墨动态长卷读中国古典诗词：不说“我想你”，只写杨柳、孤城与烟雨。临床之外，这是我理解“含蓄”的方式。',cultureOpen:'展卷',cultureSource:'GitHub 源码',
    scrolls:[['杨柳依依 · 折柳含蓄','昔我往矣，杨柳依依','从《采薇》到灞桥折柳：柳条如挥别的手臂，不舍放手，慢慢摆手。'],['边塞诗歌集','黄河远上白云间','大漠、孤城、关山月：四卷十八首，看豪情与乡愁如何同在一幅画里。'],['江南水乡诗歌集','日出江花红胜火','烟雨水巷、乌篷船与拱桥：四卷十六首，读江南的明媚与烟愁。']],
    os:'个人临床研究操作系统',osLead:'观察事实、核验证据、明确推断、保护边界。',domains:[['临床','创伤病例 → 风险识别 → MDT救治路径'],['科研','辐射损伤 → 修复机制 → 可检验干预'],['教学','病例复盘 → 关键节点 → 课程反馈'],['安全AI','证据分层 → 人工复核 → 隐私脱敏']],
    profileLabel:'专业联系',contact:'临床、科研与医学 AI 合作',contactLead:'关注放射性骨骼肌损伤修复、创伤急救、创伤伤口管理、临床决策支持与医学教育，并探索大语言模型、生物医学数据分析和智能工作流在真实医疗场景中的安全应用。',contactRole:'主治医师｜AI 医学与临床研究',contactNote:'优先通过电子邮件或 LinkedIn 联系',linkedin:'LinkedIn 专业主页',email:'发送电子邮件',github:'查看 GitHub',compare:'对比深色版本',backTop:'返回顶部'
  },
  en:{
    nav:['Home','Clinical & Research','Evidence','Teaching & Service','Poetry Scrolls','Haixiang OS'],
    rail:['PROFILE','EVIDENCE','TEACHING','POETRY','OS','CONTACT'],homeLabel:'Haixiang Ding home',menuOpen:'Open menu',menuClose:'Close menu',mainNav:'Main navigation',sectionNav:'Section navigation',
    focus:'Radiation-Induced Skeletal Muscle Injury & Repair × Trauma Care × Medical AI',role:'Attending Physician · Professional Doctoral Student in Clinical Medicine, Soochow University',hospital:'Affiliated Hospital of Jiangnan University · Wuxi, China',download:'Download public CV',
    stats:[['English Publications','Peer-reviewed English journals'],['Honors','Academic awards and recognition'],['Kaggle Silver','253rd of 6,807 teams'],['Invited Lecture Cohorts','Three consecutive invited cohorts']],
    medal:{kicker:'Kaggle competition silver',title:'PTCG AI Battle Challenge',meta:'253rd of 6,807 teams · top 3.7%',cta:'View certificate'},
    labels:['Ionizing radiation','Fibrosis · FAPs','Satellite cells','Extracellular vesicles','Evidence graph'],figNote:'Illustration · AI assisted',zoom:[['Radiation hit','Rays pierce, fiber membranes tear'],['Fibrosis · FAPs','Overactive FAPs lay down collagen'],['Satellite cells','MuSCs wake and rebuild along fibers'],['Extracellular vesicles','Vesicles carry repair signals'],['Evidence graph','Literature linked into a mechanism map']],
    atlas:[['Radiation muscle injury evidence atlas','Molecular pathways graded A/B/C, fully interactive','v0.7'],['Extracellular vesicle intervention atlas','141 included studies, with the in vivo gap marked','v0.2']],earlier:'Earlier work: diabetic osteoporosis mechanisms · orthopaedic trauma outcomes',
    tagline:['Start from questions at the trauma bedside.','Help irradiated muscle','learn to repair again.'],
    imageAlt:'Illustration of radiation-induced skeletal muscle injury and repair: radiation beams, fibrosis, satellite cells, extracellular vesicles and an evidence network',
    inquiry:'From Radiation Injury to Integrated Repair',inquiryLead:'Why does muscle fail to heal after ionizing radiation? Starting from frontline trauma care, I study how radiation disrupts the repair partnership between satellite cells, fibro-adipogenic progenitors, vessels and matrix, and test interventions with graded evidence maps and experiments.',
    steps:[['Injury trigger','DNA damage, oxidative stress and microvascular injury start the post-radiation cascade.'],['Repair imbalance','Satellite cell loss, persistent FAP activation and matrix build-up push repair toward fibrosis.'],['Intervention & testing','Extracellular vesicles and related strategies, tested against graded evidence and experiments.']],
    evidence:'Public Evidence & Honors',evidenceType:'Evidence type',publicationsFilter:'04 English Publications',honorsFilter:'06 Honors',verify:'Verify',publicSummary:'Public summary',
    teaching:'Three Consecutive Invited Lectures',lectureTitle:'Principles of Treatment and Management for Traumatic Wounds',lectureCohorts:['5th Cohort','6th Cohort','7th Cohort'],lectureProgram:'Wuxi Specialist Nurse Training Program for Wound and Stoma Care',lectureLabel:'Invited Lecture',
    culture:'Poetry Scrolls',cultureLead:'Classical Chinese poetry as living ink-painting scrolls: instead of saying “I miss you,” the poets paint willows, lone fortresses and misty rain.',cultureOpen:'Open scroll',cultureSource:'Source on GitHub',
    scrolls:[['Willows Swaying · Farewell Unspoken','When I left, the willows swayed','From the Book of Songs to the willow-breaking farewell at Baqiao: branches like a hand slowly waving goodbye.'],['Frontier Poems','The Yellow River climbs into the clouds','Deserts, lone forts and the moon over the passes: eighteen poems where valor and homesickness share one painting.'],['Jiangnan Water-Town Poems','Sunrise turns river flowers redder than flame','Misty canals, awning boats and arched bridges: sixteen poems of Jiangnan in bright spring and soft rain.']],
    os:'Personal Clinical Research OS',osLead:'Observe facts, verify evidence, label inference and protect boundaries.',domains:[['Clinical','Trauma case → Risk recognition → MDT care pathway'],['Research','Radiation injury → Repair mechanism → Testable intervention'],['Teaching','Case review → Decision points → Course feedback'],['Safe AI','Evidence grading → Human review → Privacy protection']],
    profileLabel:'Professional Contact',contact:'Clinical, Research & Medical AI Collaboration',contactLead:'Focused on radiation-induced skeletal muscle injury repair, trauma care, wound management, clinical decision support and medical education, with an interest in safely applying large language models, biomedical data analysis and intelligent workflows to real-world healthcare.',contactRole:'Attending Physician | AI in Medicine & Clinical Research',contactNote:'Email or LinkedIn is preferred for professional enquiries',linkedin:'LinkedIn Profile',email:'Send Email',github:'View GitHub',compare:'Compare dark version',backTop:'Back to top'
  }
};

const navIds=['profile','research','evidence','teaching','culture','os'];
const railIds=['profile','evidence','teaching','culture','os','contact'];
const railIcons=[User,BookOpenText,ChalkboardTeacher,Feather,Microscope,EnvelopeSimple];
const stepIcons=[Radioactive,Dna,Flask];
const domainIcons=[FirstAidKit,Brain,ChalkboardTeacher,ShieldCheck];
const statIcons=[BookOpenText,Trophy,Medal,ChalkboardTeacher];
const scrollMeta=[{slug:'yangliu-yiyi',img:'/assets/shihua-yangliu.jpg',seal:'柳'},{slug:'biansai',img:'/assets/shihua-biansai.jpg',seal:'关'},{slug:'jiangnan',img:'/assets/shihua-jiangnan.jpg',seal:'梦'}];
const statValues=[{to:4,pad:2},{to:6,pad:2},{to:3.7,dec:1,pre:'Top ',suf:'%'},{to:3,pad:2}];
const atlasLinks=['https://tuanziding.github.io/radiation-muscle-pathway/','https://tuanziding.github.io/radiation-muscle-pathway/ev-intervention.html'];
const labelPos=[[16,12],[30,47],[73,30],[76,74],[12,66]];
const KAGGLE='https://www.kaggle.com/certification/competitions/bruceding123/pokemon-tcg-ai-battle';
const reduced=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion:reduce)').matches;

function CountUp({to,pad=0,dec=0,pre='',suf=''}){
  const ref=useRef(null);const fmt=v=>pre+(dec?v.toFixed(dec):String(Math.round(v)).padStart(pad,'0'))+suf;
  useEffect(()=>{const el=ref.current;if(reduced()){el.textContent=fmt(to);return}let raf=0;const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();const t0=performance.now(),d=1400;const tick=now=>{const k=Math.min(1,(now-t0)/d),ease=1-Math.pow(1-k,4);el.textContent=fmt(to*ease);if(k<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)},{threshold:.6});io.observe(el);return()=>{io.disconnect();cancelAnimationFrame(raf)}},[to]);
  return <b ref={ref}>{fmt(0)}</b>;
}

const heroSrc='/assets/light4-radiation-muscle-repair.webp';
// target point on the image (%), lens centre (%), zoom
const zoomSpots=[[43,55,24,82,3.2],[40,45,79,20,3],[70,40,79,20,3.4],[74,63,24,82,2.6],[45,27,79,20,2.6]];
let zoomListeners=new Set();let zoomStep=-1;
function useZoomStep(){const [s,setS]=useState(zoomStep);useEffect(()=>{zoomListeners.add(setS);return()=>zoomListeners.delete(setS)},[]);return s}
function ZoomAtlas({t}){
  const [step,setStep]=useState(-1);const [hold,setHold]=useState(false);
  useEffect(()=>{zoomStep=step;zoomListeners.forEach(f=>f(step))},[step]);
  useEffect(()=>{if(reduced())return;if(hold)return;const id=setTimeout(()=>setStep(v=>v===-1?0:v>=4?-1:v+1),step===-1?1800:3600);return()=>clearTimeout(id)},[step,hold]);
  const L=34;
  return <div className="l3Sq" data-step={step} onMouseLeave={()=>setHold(false)}>
    <img className="l3HeroImg" src={heroSrc} alt={t.imageAlt} fetchPriority="high"/>
    <span className="l3Beam" key={'b'+step} aria-hidden="true"/>
    <span className="l3Motes" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{left:(64+(i*37)%26)+'%',top:(52+(i*23)%22)+'%',animationDelay:(i*0.37)+'s'}}/>)}</span>
    {zoomSpots.map(([tx,ty],i)=><button key={i} className={'l3Hot'+(i===step?' on':'')} style={{left:tx+'%',top:ty+'%'}} aria-label={t.zoom[i][0]} onMouseEnter={()=>{setHold(true);setStep(i)}} onFocus={()=>{setHold(true);setStep(i)}} onClick={()=>{setHold(true);setStep(i)}}/>)}
    {zoomSpots.map(([tx,ty,lx,ly,z],i)=>{const on=i===step;const w=z/(L/100)*100;
      return <div key={'z'+i} className={'l3ZoomWrap'+(on?' on':'')} aria-hidden={!on}>
        <svg className="l3Leader" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1={tx} y1={ty} x2={lx} y2={ly} pathLength="1"/></svg>
        <div className="l3Lens" style={{left:lx+'%',top:ly+'%',width:L+'%','--ox':(tx-lx)+'%','--oy':(ty-ly)+'%'}}>
          <div className="l3LensIn"><img src={heroSrc} alt="" style={{width:w+'%',left:`calc(50% - ${tx*w/100}%)`,top:`calc(50% - ${ty*w/100}%)`}}/></div>
          <p><b>{t.zoom[i][0]}</b><span>{t.zoom[i][1]}</span></p>
        </div>
      </div>})}
  </div>;
}

function MedalBadge({t}){
  return <a className="l3Medal" href={KAGGLE} target="_blank" rel="noreferrer">
    <svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="l3mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f5f7"/><stop offset=".5" stopColor="#b9bec7"/><stop offset="1" stopColor="#8a909b"/></linearGradient><clipPath id="l3mc"><circle cx="32" cy="38" r="18"/></clipPath></defs><path d="M20 4h10l6 16h-10z" fill="#20beff"/><path d="M44 4H34l-6 16h10z" fill="#1a8fc4"/><circle cx="32" cy="38" r="18" fill="url(#l3mg)" stroke="#7d838e" strokeWidth="1.5"/><circle cx="32" cy="38" r="13" fill="none" stroke="#fff" strokeOpacity=".7"/><text x="32" y="43" textAnchor="middle" fontSize="14" fontWeight="600" fill="#5b616b">2</text><g clipPath="url(#l3mc)"><rect className="l3Shine" x="-30" y="10" width="12" height="60" fill="#fff" opacity=".75" transform="rotate(20 32 38)"/></g></svg>
    <span><small>{t.medal.kicker}</small><b>{t.medal.title}</b><em>{t.medal.meta}</em></span><i>{t.medal.cta}<ArrowRight/></i>
  </a>;
}

function Tagline({lines}){
  const ref=useRef(null);
  useEffect(()=>{const root=ref.current,words=[...root.querySelectorAll('span')];if(reduced()){words.forEach(w=>w.classList.add('on'));return}let raf=0;const update=()=>{raf=0;const r=root.getBoundingClientRect(),vh=innerHeight;const p=Math.min(1,Math.max(0,(vh*.85-r.top)/(r.height+vh*.35)));const n=Math.round(p*words.length);words.forEach((w,i)=>w.classList.toggle('on',i<n))};const on=()=>{if(!raf)raf=requestAnimationFrame(update)};addEventListener('scroll',on,{passive:true});update();return()=>{removeEventListener('scroll',on);cancelAnimationFrame(raf)}},[lines]);
  const split=line=>/[\u4e00-\u9fff]/.test(line)?[...line]:line.split(' ').map((w,i,a)=>i<a.length-1?w+' ':w);
  return <p ref={ref} className="l3TaglineText">{lines.map((line,li)=><span className="l3Line" key={li}>{split(line).map((w,i)=><span key={i}>{w}</span>)}</span>)}</p>;
}

function useReveal(dep){
  useEffect(()=>{const els=[...document.querySelectorAll('.light3 .l3SectionHead,.light3 .l3Steps,.light3 .l3Atlas,.light3 .l3Ledger,.light3 .l3Timeline,.light3 .l3Scrolls,.light3 .l3Domains,.light3 .l3ContactIntro,.light3 .l3ContactPanel,.light3 .l3TaglineText')];if(reduced())return;els.forEach(el=>el.classList.add('l3Reveal'));const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px'});els.forEach(el=>io.observe(el));return()=>io.disconnect()},[dep]);
}

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
  const zoomStep=useZoomStep();
  const [lang,setLang]=useState('zh');
  const [menu,setMenu]=useState(false);
  const [filter,setFilter]=useState('papers');
  const [active,setActive]=useState('profile');
  const t=content[lang];
  const records=useMemo(()=>filter==='papers'?papers:honors,[filter]);
  useReveal(lang);

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
      <div className="l3Meta"><span><CalendarBlank/>2026-10-26</span><button aria-label={lang==='zh'?'Switch to English':'切换至中文'} onClick={()=>setLang(lang==='zh'?'en':'zh')}>{lang==='zh'?'中文 / English':'English / 中文'}</button></div>
    </header>

    <aside className="l3Rail" aria-label={t.sectionNav}>{railIds.map((id,index)=>{const Icon=railIcons[index];return <a key={id} href={'#'+id} className={active===id?'active':''}><Icon/><span>{t.rail[index]}</span></a>})}</aside>

    <main>
      <section id="profile" className="l3Hero">
        <div className="l3Identity">
          <h1><span>丁海祥</span>Haixiang Ding, M.D.</h1>
          <h2>{t.focus}</h2>
          <p>{t.role}</p><p className="l3Hospital">{t.hospital}</p>
          <MedalBadge t={t}/>
        </div>
        <figure className="l3Mechanism l3Muscle"><div className="l3Float"><ZoomAtlas t={t}/>{t.labels.map((label,i)=><span key={label} className={'l3Tag'+(i===zoomStep?' on':'')} style={{left:labelPos[i][0]+'%',top:labelPos[i][1]+'%',animationDelay:(0.5+i*0.18)+'s'}}><i/>{label}</span>)}</div><figcaption>{t.figNote}</figcaption></figure>
        <div className="l3Stats">{t.stats.map(([label,detail],index)=>{const Icon=statIcons[index];return <div key={label}><Icon/><CountUp {...statValues[index]}/><span>{label}<small>{detail}</small></span></div>})}</div>
      </section>

      <section id="research" className="l3Inquiry">
        <div className="l3SectionHead"><h2>{t.inquiry}</h2><p>{t.inquiryLead}</p></div>
        <div className="l3Steps">{t.steps.map(([title,body],index)=>{const Icon=stepIcons[index];return <article key={title}><b>0{index+1}</b><Icon/><div><h3>{title}</h3><p>{body}</p></div></article>})}</div>
        <div className="l3Atlas">{t.atlas.map(([title,body,ver],index)=><a key={title} href={atlasLinks[index]} target="_blank" rel="noreferrer"><small>{ver}</small><h3>{title}</h3><p>{body}</p><ArrowRight/></a>)}</div>
        <p className="l3Earlier">{t.earlier}</p>
      </section>

      <section className="l3Tagline" aria-label={t.tagline.join('')}><Tagline lines={t.tagline}/></section>

      <section id="evidence" className="l3Evidence">
        <div className="l3SectionHead"><h2>{t.evidence}</h2></div>
        <div className="l3Filters" role="group" aria-label={t.evidenceType}><Funnel/><button className={filter==='papers'?'active':''} aria-pressed={filter==='papers'} onClick={()=>setFilter('papers')}>{t.publicationsFilter}</button><button className={filter==='honors'?'active':''} aria-pressed={filter==='honors'} onClick={()=>setFilter('honors')}>{t.honorsFilter}</button></div>
        <div className="l3Ledger">{records.map(item=>{const title=typeof item.title==='string'?item.title:item.title[lang];const meta=item.journal||(typeof item.meta==='string'?item.meta:item.meta[lang]);return <article key={item.id}><span>{item.id}</span><time>{item.year}</time><div><h3>{title}</h3><p>{meta}</p></div>{item.href?<a href={item.href} target="_blank" rel="noreferrer" aria-label={`${t.verify}: ${title}`}><ArrowRight/></a>:<Lock aria-label={t.publicSummary}/>}</article>})}</div>
      </section>

      <section id="teaching" className="l3Teaching">
        <div className="l3SectionHead"><h2>{t.teaching}</h2><p>{t.lectureTitle}</p></div>
        <div className="l3Timeline">{['2024','2025','2026'].map((year,index)=><article key={year}><span>0{index+1}</span><time>{year}</time><h3>{t.lectureCohorts[index]}</h3><p>{t.lectureProgram}</p><small>{t.lectureLabel}</small></article>)}</div>
      </section>

      <section id="culture" className="l3Culture">
        <div className="l3SectionHead"><h2>{t.culture}</h2><p>{t.cultureLead}</p></div>
        <div className="l3Scrolls">{t.scrolls.map(([title,line,body],index)=>{const m=scrollMeta[index];return <a key={m.slug} className="l3Scroll" href={`/shihua/${m.slug}/`}><figure><img src={m.img} alt={title} loading="lazy"/><i aria-hidden="true">{m.seal}</i></figure><div><b>0{index+1}</b><h3>{title}</h3><q>{line}</q><p>{body}</p><span>{t.cultureOpen}<ArrowRight/></span></div></a>})}</div>
        <a className="l3ScrollSource" href="https://github.com/TUANZIDING/shihua-scrolls" target="_blank" rel="noreferrer"><GithubLogo/>{t.cultureSource}</a>
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
