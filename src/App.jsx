import {useEffect,useMemo,useRef,useState} from 'react';
import {
  ArrowDown,ArrowRight,BookOpenText,Brain,CheckCircle,Code,DownloadSimple,
  EnvelopeSimple,FirstAidKit,Funnel,GitBranch,GithubLogo,GraduationCap,Heartbeat,
  LinkedinLogo,List,Lock,MagnifyingGlass,Moon,ShieldCheck,Stethoscope,Sun,Trophy,X
} from '@phosphor-icons/react';

const githubProfile='https://github.com/TUANZIDING';

const publications=[
  {id:'P01',year:'2025',title:'Clinical characteristics and mortality risk factors in polytrauma patients with pelvic fractures: a retrospective study based on an integrated multidisciplinary treatment approach.',meta:'International Journal of Emergency Medicine · 18(1):192',href:'https://doi.org/10.1186/s12245-025-00990-5'},
  {id:'P02',year:'2025',title:'Multidisciplinary management of severe open pelvic fracture with multiple organ injuries: A case report.',meta:'Medicine (Baltimore) · 104(31):e43551',href:'https://doi.org/10.1097/MD.0000000000043551'},
  {id:'P03',year:'2020',title:'Comparison of the curative effect of modified medial arc incision of Achilles tendon and traditional straight incision in the treatment of old Achilles tendon rupture.',meta:'Pakistan Journal of Pharmaceutical Sciences · 33(3):1087–1093 · PMID 33191233',href:'https://pubmed.ncbi.nlm.nih.gov/33191233/'}
];

const honors=[
  {id:'A06',year:'2026',category:'honors',typeZh:'数据科学竞赛',typeEn:'Data science competition',titleZh:'The Pokémon Company－PTCG AI Battle Challenge Simulation 竞赛银牌（第253名／6,807支队伍）',titleEn:'Competition Silver Medal, The Pokémon Company – PTCG AI Battle Challenge Simulation (253rd of 6,807 teams)',roleZh:'Kaggle · 2026年9月1日',roleEn:'Kaggle · Awarded September 1, 2026',statusZh:'银牌',statusEn:'Silver Medal',href:'https://www.kaggle.com/certification/competitions/bruceding123/pokemon-tcg-ai-battle'},
  {id:'A01',year:'2025',category:'honors',typeZh:'创伤病例大赛',typeEn:'Trauma case competition',titleZh:'第四届“王正国创伤医学菁英杯”江苏省青年医师创伤病例大赛一等奖',titleEn:'First Prize, 4th Wang Zhengguo Trauma Medicine Elite Cup, Jiangsu Young Physician Trauma Case Competition',roleZh:'江苏省创伤救治质量控制大会',roleEn:'Jiangsu Trauma Care Quality Control Conference',statusZh:'一等奖',statusEn:'First Prize'},
  {id:'A02',year:'2024',category:'honors',typeZh:'青年教师竞赛',typeEn:'Young faculty competition',titleZh:'江南大学附属医院青年教师“教学会讲竞赛”第一名',titleEn:'First Place, Young Faculty Teaching Competition, Affiliated Hospital of Jiangnan University',roleZh:'江南大学附属医院',roleEn:'Affiliated Hospital of Jiangnan University',statusZh:'第一名',statusEn:'First Place'},
  {id:'A03',year:'2024',category:'honors',typeZh:'青年教师竞赛',typeEn:'Young faculty competition',titleZh:'江南大学医学院、附属医院系统青年教师“教学会讲竞赛”二等奖',titleEn:'Second Prize, Young Faculty Teaching Competition, Jiangnan University Medical School and Affiliated Hospital System',roleZh:'江南大学医学院、附属医院系统',roleEn:'Jiangnan University Medical School and Affiliated Hospital System',statusZh:'二等奖',statusEn:'Second Prize'},
  {id:'A04',year:'2024',category:'honors',typeZh:'创伤病例大赛',typeEn:'Trauma case competition',titleZh:'第三届“王正国创伤医学菁英杯”江苏省二等奖；华东地区半决赛优秀奖',titleEn:'Second Prize in Jiangsu and Excellence Award in the East China semifinal, 3rd Wang Zhengguo Trauma Medicine Elite Cup',roleZh:'江苏省青年医师创伤病例大赛',roleEn:'Jiangsu Young Physician Trauma Case Competition',statusZh:'二等奖 · 优秀奖',statusEn:'Second Prize · Excellence'},
  {id:'A05',year:'2024',category:'honors',typeZh:'学术会议优秀论文',typeEn:'Conference paper award',titleZh:'江苏省医学会第十次创伤医学学术会议优秀论文二等奖（第三名）',titleEn:'Second Prize (Third Place), Outstanding Paper, 10th Trauma Medicine Academic Conference of Jiangsu Medical Association',roleZh:'论文入选优秀论文并完成现场汇报',roleEn:'Selected outstanding paper with on-site presentation',statusZh:'二等奖 · 第三名',statusEn:'Second Prize · Third Place'}
];

const evidence=[
  ...honors,
  ...publications.map((item)=>({...item,category:'publications',typeZh:'英文论文',typeEn:'Publication',roleZh:'作者 · 同行评议期刊',roleEn:'Author · peer-reviewed journal',statusZh:'外部核验',statusEn:'External record'})),
  {id:'R01',year:'2026',category:'clinical',typeZh:'博士研究',typeEn:'Doctoral research',titleZh:'糖尿病骨质疏松的机制相关研究',titleEn:'Mechanistic research on diabetic osteoporosis',roleZh:'苏州大学临床医学博士专业学位在读',roleEn:'Professional Doctoral Student in Clinical Medicine, Soochow University',statusZh:'公开履历',statusEn:'Public CV'},
  {id:'T01',year:'2024—2026',category:'teaching',typeZh:'特邀授课',typeEn:'Invited lecture',title:'Principles of Treatment and Management for Traumatic Wounds',roleZh:'无锡市伤口造口专科护士培训班 · 第5—7届',roleEn:'Wuxi Specialist Nurse Training Program · 5th–7th cohorts',statusZh:'连续三届',statusEn:'Three cohorts'},
  {id:'S01',year:'2024—',category:'service',typeZh:'学术服务',typeEn:'Academic service',titleZh:'期刊审稿工作',titleEn:'Journal peer-review service',roleZh:'《数字医学与健康》审稿人；Journal of Trauma and Injury reviewer',roleEn:'Reviewer for Digital Medicine and Health and Journal of Trauma and Injury',statusZh:'公开履历',statusEn:'Public CV'},
  {id:'D01',year:'2026',category:'digital',typeZh:'医学教育AI',typeEn:'Medical education AI',title:'TraumaMaster-AI-ETM',roleZh:'基于ETM/ATLS XABCDE框架的创伤救治交互训练项目',roleEn:'Interactive trauma training based on the ETM/ATLS XABCDE framework',statusZh:'GitHub仓库',statusEn:'GitHub repository',href:'https://github.com/TUANZIDING/TraumaMaster-AI-ETM'},
  {id:'D02',year:'2026',category:'digital',typeZh:'科研工作流',typeEn:'Research workflow',title:'medical-paper-pipeline',roleZh:'临床研究论文流程：数据清理、统计、写作与投稿响应',roleEn:'Clinical research workflow from data cleaning to manuscript and review response',statusZh:'GitHub仓库',statusEn:'GitHub repository',href:'https://github.com/TUANZIDING/medical-paper-pipeline'},
  {id:'Q01',year:'ONGOING',category:'training',typeZh:'专业训练',typeEn:'Professional training',title:'CTCT · ETM Course · GCP · AO Trauma',roleZh:'创伤救治、临床研究规范与骨科创伤相关训练',roleEn:'Training in trauma care, clinical research practice and orthopaedic trauma',statusZh:'公开摘要',statusEn:'Public summary'}
];

const filters=[
  ['all','全部','All'],['honors','荣誉奖项','Honors'],['publications','英文论文','Publications'],['clinical','临床与科研','Clinical & Research'],
  ['teaching','教学授课','Teaching'],['service','学术服务','Service'],['digital','AI与数字医学','Digital Health'],['training','专业训练','Training']
];

const osDomains=[
  {id:'01',key:'clinical',icon:FirstAidKit,titleZh:'临床',titleEn:'Clinical',subtitleZh:'从真实创伤问题开始',subtitleEn:'Start with real trauma problems',stepsZh:['输入｜严重创伤与骨盆骨折病例','方法｜风险识别 · MDT协同 · 围术期决策','输出｜结构化问题与可追溯救治路径','证据｜病例、临床队列与公开论文'],stepsEn:['Input | severe trauma and pelvic fracture cases','Method | risk recognition, MDT and perioperative decisions','Output | structured questions and traceable care paths','Evidence | cases, cohorts and publications']},
  {id:'02',key:'research',icon:Brain,titleZh:'科研',titleEn:'Research',subtitleZh:'从临床信号追到机制',subtitleEn:'Trace clinical signals to mechanisms',stepsZh:['输入｜糖尿病骨质疏松临床问题','方法｜文献核验 · 机制假设 · 研究设计','输出｜可检验的骨—肌代谢研究路径','证据｜预定义方案与同行评议成果'],stepsEn:['Input | diabetic osteoporosis questions','Method | evidence review, hypothesis and study design','Output | testable bone–muscle metabolism pathway','Evidence | predefined protocols and peer review']},
  {id:'03',key:'teaching',icon:GraduationCap,titleZh:'教学',titleEn:'Teaching',subtitleZh:'把复盘变成可重复课程',subtitleEn:'Turn review into reusable teaching',stepsZh:['输入｜创伤伤口与急诊教学场景','方法｜病例拆解 · 关键节点 · 反馈复盘','输出｜专科护士与住院医师课程','证据｜2024—2026连续三届授课'],stepsEn:['Input | trauma wound and emergency teaching','Method | case analysis, checkpoints and feedback','Output | nurse and resident education','Evidence | invited lectures from 2024 to 2026']},
  {id:'04',key:'safety',icon:ShieldCheck,titleZh:'安全AI',titleEn:'Safe AI',subtitleZh:'验证优先，隐私优先',subtitleEn:'Verification and privacy first',stepsZh:['输入｜临床知识与研究任务','方法｜证据分层 · 人工复核 · 脱敏','输出｜可审计的教学与研究产物','证据｜来源、版本、边界与变更记录'],stepsEn:['Input | clinical knowledge and research tasks','Method | evidence grading, human review and de-identification','Output | auditable teaching and research artifacts','Evidence | sources, versions, boundaries and change logs']}
];

const words={
  zh:{nav:[['首页','home'],['临床与研究','research'],['证据档案','evidence'],['教学与服务','teaching'],['Haixiang OS','os'],['联系','contact']],role:'主治医师 · 苏州大学临床医学博士专业学位在读',focus:'创伤急救 × 骨科创伤 × 糖尿病骨质疏松机制',thesis:'从急诊现场的问题，追到可验证的机制。',enter:'浏览证据档案',cv:'下载公开简历',hospital:'江南大学附属医院 · 急诊医学科 / 创伤外科 · 无锡，中国',case:'糖尿病骨质疏松',pub:'英文论文',lecture:'连续三届受邀授课',mdt:'严重创伤MDT救治',researchTitle:'临床问题如何进入研究',researchLead:'以创伤急救实践为起点，把风险识别、机制验证和临床转化组织成一条可追溯的研究路径。',evidenceTitle:'公开证据与荣誉档案',evidenceLead:'把获奖、论文、授课与专业服务按角色、时间、产出和核验路径组织起来。仅展示适合公开的信息，不公开证书扫描件或编号。',teachingTitle:'医学教育与学术服务',osTitle:'个人临床研究操作系统',osLead:'把临床观察、证据核验、教学复盘与安全AI应用连接成四个可以重复运行的工作域。',contactTitle:'以公开、必要、可核验为边界',contactLead:'不展示身份证号、证书编号、电话、私人邮箱、票据、报名材料、原始证书扫描件或含设备与GPS元数据的照片。',collab:'学术合作说明'},
  en:{nav:[['Home','home'],['Clinical & Research','research'],['Evidence','evidence'],['Teaching & Service','teaching'],['Haixiang OS','os'],['Contact','contact']],role:'Attending Physician · Professional Doctoral Student in Clinical Medicine, Soochow University',focus:'Trauma Care × Orthopaedic Trauma × Diabetic Osteoporosis',thesis:'Follow the question from the emergency room to a testable mechanism.',enter:'Browse evidence archive',cv:'Download public CV',hospital:'Affiliated Hospital of Jiangnan University · Wuxi, China',case:'Diabetic Osteoporosis',pub:'English publications',lecture:'Consecutive invited lectures',mdt:'Severe trauma MDT care',researchTitle:'Turning clinical questions into research',researchLead:'A traceable path from trauma practice to risk recognition, mechanism testing and clinical translation.',evidenceTitle:'Public Evidence & Honors',evidenceLead:'Awards, publications, lectures and professional service organized by role, date, output and verification route. Certificate scans and identifiers remain private.',teachingTitle:'Medical education and academic service',osTitle:'A personal clinical research operating system',osLead:'Four repeatable working domains connecting observation, verification, teaching review and safe medical AI.',contactTitle:'Public, necessary and verifiable by design',contactLead:'Identity numbers, licence numbers, phone, private email, receipts, application files, certificate scans and metadata-bearing photos are excluded.',collab:'Collaboration scope'}
};

function Intro({done}){
  useEffect(()=>{const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const timer=setTimeout(done,reduced?50:1900);return()=>clearTimeout(timer)},[done]);
  return <div className="intro" role="dialog" aria-label="Website introduction">
    <b>HD</b>
    <div className="bootLines"><span>$ boot clinical-research.workstation</span><p>&gt; whoami — Haixiang Ding, M.D.</p><p>&gt; trauma care + diabetic osteoporosis</p><p>&gt; open haixiang-os.app_</p></div>
    <button onClick={done}>Skip / 跳过</button>
  </div>
}

function CursorSignal(){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const finePointer=window.matchMedia('(pointer: fine)').matches;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!finePointer||reduced)return;
    const canvas=canvasRef.current;
    const ctx=canvas.getContext('2d');
    const particles=[];
    const cursor={x:-100,y:-100,active:false,interactive:false};
    let frame=0,lastX=-100,lastY=-100;
    const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(dpr,0,0,dpr,0,0)};
    const move=(event)=>{
      cursor.x=event.clientX;cursor.y=event.clientY;cursor.active=true;
      cursor.interactive=!!event.target.closest('a,button,summary,[role="button"]');
      const distance=Math.hypot(cursor.x-lastX,cursor.y-lastY);
      if(distance>5){
        const count=Math.min(3,Math.max(1,Math.floor(distance/16)));
        for(let i=0;i<count;i++)particles.push({x:cursor.x+(Math.random()-.5)*7,y:cursor.y+(Math.random()-.5)*7,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35-0.08,life:1,size:1.4+Math.random()*2.3});
        if(particles.length>42)particles.splice(0,particles.length-42);
        lastX=cursor.x;lastY=cursor.y;
      }
    };
    const leave=()=>{cursor.active=false};
    const draw=()=>{
      ctx.clearRect(0,0,innerWidth,innerHeight);
      const style=getComputedStyle(document.documentElement);
      const cyan=style.getPropertyValue('--cyan').trim()||'#6caab0';
      const red=style.getPropertyValue('--red').trim()||'#c55b4e';
      for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.life-=.035;if(p.life<=0){particles.splice(i,1);continue}ctx.globalAlpha=p.life*.62;ctx.fillStyle=cyan;ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill()}
      if(cursor.active){ctx.globalAlpha=cursor.interactive ? .78 : .34;ctx.strokeStyle=cursor.interactive?red:cyan;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cursor.x,cursor.y,cursor.interactive?13:8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.8;ctx.fillStyle=cursor.interactive?red:cyan;ctx.beginPath();ctx.arc(cursor.x,cursor.y,1.8,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1;frame=requestAnimationFrame(draw);
    };
    resize();addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});addEventListener('pointerleave',leave);frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);removeEventListener('pointermove',move);removeEventListener('pointerleave',leave)};
  },[]);
  return <canvas ref={canvasRef} className="cursorSignal" aria-hidden="true"/>;
}

function Head({eye,title,lead}){return <div className="head"><p>{eye}</p><h2>{title}</h2>{lead&&<div>{lead}</div>}</div>}

function EvidenceCard({item,lang}){
  const title=item.title||item[lang==='zh'?'titleZh':'titleEn'];
  const role=item.meta||item[lang==='zh'?'roleZh':'roleEn'];
  const type=item[lang==='zh'?'typeZh':'typeEn'];
  const status=item[lang==='zh'?'statusZh':'statusEn'];
  return <article className={`evidenceCard ${item.category}`}>
    <div className="evidenceMeta"><span>{item.id}</span><time>{item.year}</time></div>
    <p className="evidenceType">{type}</p><h3>{title}</h3><p className="evidenceRole">{role}</p>
    <div className="evidenceFoot"><span><CheckCircle/>{status}</span>{item.href?<a href={item.href} target="_blank" rel="noreferrer" aria-label={`${title} — ${status}`}><ArrowRight/></a>:<Lock aria-label="Public summary only"/>}</div>
  </article>
}

export function App(){
  const [lang,setLang]=useState('zh');
  const [theme,setTheme]=useState('dark');
  const [menu,setMenu]=useState(false);
  const [filter,setFilter]=useState('all');
  const [active,setActive]=useState('home');
  const [intro,setIntro]=useState(()=>{try{return sessionStorage.getItem('hd-intro-seen')!=='1'}catch{return true}});
  const t=words[lang];
  const visibleEvidence=useMemo(()=>filter==='all'?evidence:evidence.filter((item)=>item.category===filter),[filter]);

  useEffect(()=>{document.documentElement.dataset.theme=theme},[theme]);
  useEffect(()=>{
    const sections=[...document.querySelectorAll('main section[id]')];
    const observer=new IntersectionObserver((entries)=>{entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]&&setActive(entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0].target.id)},{rootMargin:'-25% 0px -60%',threshold:[0,.2,.6]});
    sections.forEach((section)=>observer.observe(section));return()=>observer.disconnect();
  },[]);
  const closeIntro=()=>{try{sessionStorage.setItem('hd-intro-seen','1')}catch{}setIntro(false)};

  return <>
    <a className="skipLink" href="#main">{lang==='zh'?'跳至主要内容':'Skip to main content'}</a>
    <CursorSignal/>
    {intro&&<Intro done={closeIntro}/>}<header className="siteHeader">
      <a className="brand" href="#home"><b>HD</b><span>HAIXIANG DING</span></a>
      <button className="menub" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<List/>}</button>
      <nav className={menu?'open':''} aria-label="Primary navigation">{t.nav.map(([label,id])=><a key={id} href={'#'+id} aria-current={active===id?'location':undefined} onClick={()=>setMenu(false)}>{label}</a>)}</nav>
      <div className="tools"><div><button className={lang==='zh'?'on':''} aria-pressed={lang==='zh'} onClick={()=>setLang('zh')}>中文</button><button className={lang==='en'?'on':''} aria-pressed={lang==='en'} onClick={()=>setLang('en')}>English</button></div><button aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Moon/>:<Sun/>}</button></div>
    </header>

    <main id="main"><section id="home" className="hero"><div className="shade"/><div className="heroGrid"><div className="heroText"><small>PUBLIC CLINICAL PROFILE · 2026</small><h1><span>丁海祥</span>Haixiang Ding, M.D.</h1><h3>{t.focus}</h3><p className="thesis">{t.thesis}</p><p>{t.role}</p><div className="actions"><a className="primary" href="#evidence">{t.enter}<ArrowRight/></a><a href="/downloads/haixiang-ding-public-cv-2026.docx" download>{t.cv}<DownloadSimple/></a></div><p className="place"><Stethoscope/>{t.hospital}</p></div><aside><p>CASE 2026</p><h2>{t.case}</h2><div className="signal"><Heartbeat/><span>RESEARCH THREAD</span></div><dl><div><dt>03</dt><dd>{t.pub}</dd></div><div><dt>03</dt><dd>{t.lecture}</dd></div><div><dt>MDT</dt><dd>{t.mdt}</dd></div></dl><a href="#research">Scroll / 向下浏览<ArrowDown/></a></aside><ol>{['PROFILE','RESEARCH','EVIDENCE','TEACHING','SYSTEM','CONTACT'].map((label,index)=><li className={active===['home','research','evidence','teaching','os','contact'][index]?'current':''} key={label}><b>0{index+1}</b>{label}</li>)}</ol></div></section>

      <section className="evidenceStrip" aria-label="Profile highlights"><div><b>03</b><span>{lang==='zh'?'篇英文论文':'English publications'}</span></div><div className="honorHighlight"><b><Trophy/>06</b><span>{lang==='zh'?'项荣誉与奖励':'Honors and awards'}</span></div><div><b>03</b><span>{lang==='zh'?'届特邀授课':'Invited lecture cohorts'}</span></div><div><b>2026</b><span>{lang==='zh'?'临床医学博士学员':'Clinical doctoral trainee'}</span></div><div><b>MDT</b><span>{lang==='zh'?'严重创伤救治':'Severe trauma care'}</span></div></section>

      <section id="research"><Head eye="Clinical → Mechanism" title={t.researchTitle} lead={t.researchLead}/><div className="path"><article><i>01</i><FirstAidKit/><h3>Clinical Question</h3><p>{lang==='zh'?'严重创伤与骨盆骨折救治中的风险识别、MDT协同与围术期决策。':'Risk recognition, MDT coordination and perioperative decisions in severe trauma.'}</p></article><article><i>02</i><Brain/><h3>Mechanism</h3><p>{lang==='zh'?'糖尿病骨质疏松的发病机制与骨—肌代谢机制。':'Mechanisms of diabetic osteoporosis and bone–muscle metabolism.'}</p></article><article><i>03</i><Heartbeat/><h3>Translation</h3><p>{lang==='zh'?'把可核验的证据转化为风险分层、教学与临床决策支持。':'Translate evidence into risk stratification, education and decision support.'}</p></article></div></section>

      <section id="evidence"><Head eye="Evidence Archive" title={t.evidenceTitle} lead={t.evidenceLead}/><div className="filters" role="group" aria-label="Evidence filters"><Funnel/>{filters.map(([key,zh,en])=><button key={key} className={filter===key?'active':''} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{lang==='zh'?zh:en}</button>)}</div><div className="evidenceGrid" aria-live="polite">{visibleEvidence.map((item)=><EvidenceCard key={item.id} item={item} lang={lang}/>)}</div></section>

      <section id="teaching"><Head eye="Teaching & Service" title={t.teachingTitle}/><div className="teach"><article className="lecture"><small>INVITED LECTURE · WUXI</small><h3>Principles of Treatment and Management for Traumatic Wounds</h3><p>{lang==='zh'?'创伤伤口的处理及治疗原则｜无锡市伤口造口专科护士培训班':'Wuxi Specialist Nurse Training Program for Wound and Stoma Care'}</p><div className="lectureTimeline">{[['2024','5th'],['2025','6th'],['2026','7th']].map(([year,cohort],index)=><span key={year}><i>0{index+1}</i><b>{year}</b><em>{cohort} COHORT</em><small>{lang==='zh'?'特邀授课':'Invited lecture'}</small></span>)}</div></article><div className="services"><article><BookOpenText/><div><h3>{lang==='zh'?'学术服务':'Academic service'}</h3><p>《数字医学与健康》审稿人（2024年起）<br/>Journal of Trauma and Injury reviewer (since 2024)</p></div></article><article><GraduationCap/><div><h3>{lang==='zh'?'临床教学':'Clinical teaching'}</h3><p>{lang==='zh'?'2024—2025年承担急诊见习带教；持续开展创伤伤口与住院医师教学。':'Emergency clinical teaching in 2024–2025 and ongoing trauma education.'}</p></div></article><article><FirstAidKit/><div><h3>{lang==='zh'?'专业训练':'Professional training'}</h3><p>CTCT · ETM Course · GCP · AO Trauma</p></div></article></div></div></section>

      <section id="os"><Head eye="Haixiang OS" title={t.osTitle} lead={t.osLead}/><div className="osShell"><aside className="osRail"><span>SYSTEM MAP · 2026</span><h3>{lang==='zh'?'从临床信号到可审计产出':'From clinical signals to auditable output'}</h3><p>{lang==='zh'?'四个工作域共享同一条原则：观察事实，核验证据，明确推断，保护边界。':'Four domains share one rule: observe facts, verify evidence, label inference and protect boundaries.'}</p><div className="osSequence"><span><MagnifyingGlass/>OBSERVE</span><i/><span><CheckCircle/>VERIFY</span><i/><span><GitBranch/>TRANSLATE</span><i/><span><ShieldCheck/>SAFEGUARD</span></div></aside><div className="osDomains">{osDomains.map((domain)=>{const Icon=domain.icon;const steps=lang==='zh'?domain.stepsZh:domain.stepsEn;return <article key={domain.id} className={`domain ${domain.key}`}><header><div><b>{domain.id}</b><Icon/></div><span>{lang==='zh'?domain.subtitleZh:domain.subtitleEn}</span></header><h3>{lang==='zh'?domain.titleZh:domain.titleEn}</h3><ol>{steps.map((step)=><li key={step}>{step}</li>)}</ol></article>})}</div></div><div className="osConsole"><span>haixiang@clinical-research ~ zsh</span><code>$ run loops --clinical --research --teaching --safe-ai</code><strong>verified-public-mode</strong></div></section>

      <section id="contact"><Head eye="Professional Contact" title={lang==='zh'?'临床、科研与医学 AI 合作':'Clinical, Research & Medical AI Collaboration'} lead={lang==='zh'?'关注创伤急救、创伤伤口管理、糖尿病骨质疏松机制、临床决策支持与医学教育，并探索医学 AI 在真实医疗场景中的安全应用。':'Focused on trauma care, wound management, diabetic osteoporosis mechanisms, clinical decision support, medical education and safe medical AI.'}/><div className="contactGrid"><div className="actions"><a className="primary" href="https://www.linkedin.com/in/haixiang-ding-a1a646411/" target="_blank" rel="noreferrer"><LinkedinLogo/>{lang==='zh'?'LinkedIn 专业主页':'LinkedIn Profile'}</a><a href="mailto:haixiangding001@gmail.com"><EnvelopeSimple/>{lang==='zh'?'发送电子邮件':'Send Email'}</a><a href="/downloads/haixiang-ding-public-cv-2026.docx" download><DownloadSimple/>{t.cv}</a><a href={githubProfile} target="_blank" rel="noreferrer"><GithubLogo/>{lang==='zh'?'查看GitHub':'View GitHub'}</a></div><details id="collaboration"><summary>{t.collab}<ArrowDown/></summary><p>{lang==='zh'?'适合公开沟通的方向包括：严重创伤与骨盆骨折研究、糖尿病骨质疏松机制、创伤伤口教学、临床决策支持，以及经过隐私与医学安全审查的数字医学项目。优先通过电子邮件或 LinkedIn 联系，请勿提交患者资料或个人敏感文件。':'Public collaboration areas include severe trauma, diabetic osteoporosis mechanisms, trauma-wound education, clinical decision support and privacy-reviewed digital medicine. Email or LinkedIn is preferred; please never submit patient data or sensitive personal files.'}</p></details></div></section>
    </main>

    <footer><div><b>HD</b><span>Haixiang Ding · Public Clinical Academic Profile · 2026</span></div><a href="#home">Back to top <ArrowRight/></a></footer>
  </>
}
