import {useEffect,useMemo,useRef,useState} from 'react';
import {
  ArrowDown,ArrowRight,BookOpenText,Brain,CheckCircle,DownloadSimple,EnvelopeSimple,
  FirstAidKit,Funnel,GithubLogo,GraduationCap,Heartbeat,LinkedinLogo,List,Lock,
  MapPin,Moon,ShieldCheck,Stethoscope,Sun,Trophy,X
} from '@phosphor-icons/react';

const honors=[
  {id:'A06',year:'2026',type:'数据科学竞赛',title:'The Pokémon Company－PTCG AI Battle Challenge Simulation 竞赛银牌（第253名／6,807支队伍）',meta:'Kaggle · 2026年9月1日',href:'https://www.kaggle.com/certification/competitions/bruceding123/pokemon-tcg-ai-battle'},
  {id:'A01',year:'2025',type:'创伤病例大赛',title:'第四届“王正国创伤医学菁英杯”江苏省青年医师创伤病例大赛一等奖',meta:'江苏省 · 一等奖'},
  {id:'A02',year:'2024',type:'青年教师竞赛',title:'江南大学附属医院青年教师“教学会讲竞赛”第一名',meta:'院级 · 第一名'},
  {id:'A03',year:'2024',type:'青年教师竞赛',title:'江南大学医学院、附属医院系统青年教师“教学会讲竞赛”二等奖',meta:'校院系统 · 二等奖'},
  {id:'A04',year:'2024',type:'创伤病例大赛',title:'第三届“王正国创伤医学菁英杯”江苏省二等奖；华东地区半决赛优秀奖',meta:'江苏赛区与华东半决赛'},
  {id:'A05',year:'2024',type:'学术会议论文',title:'江苏省医学会第十次创伤医学学术会议优秀论文二等奖（第三名）',meta:'现场汇报 · 二等奖'}
];

const publications=[
  {id:'P01',year:'2025',type:'英文论文',title:'Clinical characteristics and mortality risk factors in polytrauma patients with pelvic fractures',meta:'International Journal of Emergency Medicine · 18(1):192',href:'https://doi.org/10.1186/s12245-025-00990-5'},
  {id:'P02',year:'2025',type:'英文论文',title:'Multidisciplinary management of severe open pelvic fracture with multiple organ injuries',meta:'Medicine (Baltimore) · 104(31):e43551',href:'https://doi.org/10.1097/MD.0000000000043551'},
  {id:'P03',year:'2020',type:'英文论文',title:'Comparison of modified medial arc and traditional straight incisions for old Achilles tendon rupture',meta:'Pakistan Journal of Pharmaceutical Sciences · PMID 33191233',href:'https://pubmed.ncbi.nlm.nih.gov/33191233/'}
];

const allEvidence=[...publications,...honors];

function SignalCursor(){
  const ref=useRef(null);
  useEffect(()=>{
    if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const c=ref.current,ctx=c.getContext('2d'),dots=[];let raf=0,x=-40,y=-40;
    const resize=()=>{const d=Math.min(devicePixelRatio||1,2);c.width=innerWidth*d;c.height=innerHeight*d;c.style.width=`${innerWidth}px`;c.style.height=`${innerHeight}px`;ctx.setTransform(d,0,0,d,0,0)};
    const move=e=>{x=e.clientX;y=e.clientY;dots.push({x,y,a:1});if(dots.length>30)dots.shift()};
    const draw=()=>{ctx.clearRect(0,0,innerWidth,innerHeight);for(let i=dots.length-1;i>=0;i--){const d=dots[i];d.a-=.045;if(d.a<=0){dots.splice(i,1);continue}ctx.globalAlpha=d.a*.45;ctx.fillStyle='#65c5d2';ctx.beginPath();ctx.arc(d.x,d.y,2.2*d.a,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=.8;ctx.strokeStyle='#d7a23f';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;raf=requestAnimationFrame(draw)};
    resize();addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('pointermove',move)};
  },[]);
  return <canvas className="v3Cursor" ref={ref} aria-hidden="true"/>;
}

function EvidenceCard({item}){
  return <article className={`v3EvidenceCard ${item.id.startsWith('A')?'award':''}`}>
    <header><span>{item.id}</span><time>{item.year}</time></header>
    <small>{item.type}</small><h3>{item.title}</h3><p>{item.meta}</p>
    <footer><span><CheckCircle/>公开摘要</span>{item.href?<a href={item.href} target="_blank" rel="noreferrer" aria-label={`核验 ${item.title}`}><ArrowRight/></a>:<Lock/>}</footer>
  </article>;
}

export function V3App(){
  const [lang,setLang]=useState('zh');
  const [light,setLight]=useState(false);
  const [menu,setMenu]=useState(false);
  const [filter,setFilter]=useState('all');
  const evidence=useMemo(()=>filter==='all'?allEvidence:filter==='papers'?publications:honors,[filter]);
  useEffect(()=>{document.documentElement.dataset.v3theme=light?'light':'dark';return()=>delete document.documentElement.dataset.v3theme},[light]);
  return <div className="v3">
    <SignalCursor/>
    <header className="v3Header">
      <a className="v3Brand" href="#v3-home"><b>H<span>D</span></b></a>
      <button className="v3Menu" aria-label={menu?'关闭菜单':'打开菜单'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<List/>}</button>
      <nav className={menu?'open':''} aria-label="第三版网站导航">
        {[['首页','v3-home'],['临床与研究','v3-inquiry'],['学术成果','v3-evidence'],['教学与服务','v3-teaching'],['Haixiang OS','v3-os'],['联系','v3-contact']].map(([label,id])=><a href={'#'+id} key={id} onClick={()=>setMenu(false)}>{label}</a>)}
      </nav>
      <div className="v3Tools"><button onClick={()=>setLang(lang==='zh'?'en':'zh')}>{lang==='zh'?'中文 / English':'English / 中文'}</button><button aria-label="切换明暗主题" onClick={()=>setLight(!light)}>{light?<Sun/>:<Moon/>}</button></div>
    </header>

    <main>
      <section className="v3Hero" id="v3-home">
        <div className="v3HeroCopy">
          <small>PUBLIC CLINICAL PROFILE · 2026</small>
          <h1><span>丁海祥</span>Haixiang Ding, M.D.</h1>
          <p className="v3Role">主治医师 · 苏州大学临床医学博士专业学位在读</p>
          <i/>
          <p className="v3Intro">{lang==='zh'?'专注急诊创伤与骨科创伤的临床救治和转化研究，参与严重创伤MDT协同救治，聚焦糖尿病骨质疏松的机制研究。':'Attending physician focused on trauma care, multidisciplinary treatment and mechanistic research in diabetic osteoporosis.'}</p>
          <div className="v3Actions"><a className="primary" href="#v3-evidence"><BookOpenText/>查看学术档案<ArrowRight/></a><a href="/downloads/haixiang-ding-public-cv-2026.docx" download><DownloadSimple/>下载公开简历</a></div>
          <p className="v3Place"><MapPin/>江南大学附属医院 · 无锡，中国</p>
        </div>

        <div className="v3Workstation" aria-label="去标识化虚构骨盆影像研究面板">
          <figure><img src="/assets/v3-pelvis-panel.png" alt="虚构且去标识化的骨盆影像研究面板"/><figcaption>DE-IDENTIFIED EDUCATIONAL VISUAL · NON-DIAGNOSTIC</figcaption></figure>
          <div className="v3Readout evidence"><span>EVIDENCE</span><dl><div><dt>Focus</dt><dd>Trauma · Pelvis</dd></div><div><dt>Method</dt><dd>MDT · Cohort</dd></div><div><dt>Output</dt><dd>03 Papers</dd></div></dl></div>
          <a className="v3Readout question" href="#v3-inquiry"><span>NEXT QUESTION</span><p>How does diabetes-related bone microarchitecture affect fracture risk and healing?</p><ArrowRight/></a>
        </div>
        <ol className="v3Years" style={{position:'absolute',right:'2vw',top:'50%',zIndex:3,margin:0,transform:'translateY(-43%)'}}><li>2010</li><li>2016</li><li>2020</li><li className="active">2026</li></ol>
      </section>

      <section className="v3Band"><strong>Clinical Evidence <span>/ 临床证据</span></strong><i/><b>03</b><span>English Publications</span><a href="#v3-evidence"><ArrowRight/></a></section>

      <section className="v3Inquiry" id="v3-inquiry">
        <div className="v3SectionHead"><small>PATH OF INQUIRY</small><h2>问题如何变成证据</h2><p>从临床风险识别开始，追到机制，并把结果带回患者获益与医学教育。</p></div>
        <div className="v3Path">
          <article><b>01</b><FirstAidKit/><h3>Clinical Question</h3><p>严重创伤、骨盆骨折与围术期风险识别。</p></article>
          <article><b>02</b><Brain/><h3>Mechanism</h3><p>糖尿病骨质疏松与骨—肌代谢机制。</p></article>
          <article><b>03</b><Heartbeat/><h3>Translation</h3><p>风险分层、MDT协作与可复用教学路径。</p></article>
        </div>
      </section>

      <section className="v3Evidence" id="v3-evidence">
        <div className="v3SectionHead"><small>PUBLIC EVIDENCE ARCHIVE</small><h2>英文论文与荣誉记录</h2><p>只呈现适合公开的信息，不展示证书扫描件、证书编号或个人敏感资料。</p></div>
        <div className="v3Filters" role="group" aria-label="证据筛选"><Funnel/>{[['all','全部'],['papers','英文论文'],['honors','荣誉奖项']].map(([key,label])=><button key={key} aria-pressed={filter===key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label}</button>)}</div>
        <div className="v3EvidenceGrid">{evidence.map(item=><EvidenceCard item={item} key={item.id}/>)}</div>
      </section>

      <section className="v3Teaching" id="v3-teaching">
        <div className="v3SectionHead"><small>TEACHING & SERVICE</small><h2>连续三届受邀授课</h2><p>Principles of Treatment and Management for Traumatic Wounds</p></div>
        <div className="v3Timeline">{[['2024','第5届'],['2025','第6届'],['2026','第7届']].map(([year,cohort])=><article key={year}><time>{year}</time><i/><h3>{cohort}</h3><p>无锡市伤口造口专科护士培训班</p><span>INVITED LECTURE</span></article>)}</div>
      </section>

      <section className="v3OS" id="v3-os">
        <div className="v3SectionHead"><small>HAIXIANG OS</small><h2>临床研究工作台</h2><p>观察事实、核验证据、明确推断、保护边界。</p></div>
        <div className="v3OSGrid">
          <article><FirstAidKit/><b>01</b><h3>临床</h3><p>创伤病例 → 风险识别 → MDT救治路径</p></article>
          <article><Brain/><b>02</b><h3>科研</h3><p>临床问题 → 机制假设 → 可检验方案</p></article>
          <article><GraduationCap/><b>03</b><h3>教学</h3><p>病例复盘 → 关键节点 → 课程反馈</p></article>
          <article><ShieldCheck/><b>04</b><h3>安全AI</h3><p>证据分层 → 人工复核 → 隐私脱敏</p></article>
        </div>
      </section>

      <section className="v3Contact" id="v3-contact">
        <div><small>PROFESSIONAL CONTACT</small><h2>临床、科研与医学 AI 合作</h2><p>关注创伤急救、创伤伤口管理、糖尿病骨质疏松机制、临床决策支持与医学教育，并探索医学 AI 在真实医疗场景中的安全应用。</p></div>
        <div className="v3Actions"><a className="primary" href="https://www.linkedin.com/in/haixiang-ding-a1a646411/" target="_blank" rel="noreferrer"><LinkedinLogo/>LinkedIn 专业主页</a><a href="mailto:haixiangding001@gmail.com"><EnvelopeSimple/>发送电子邮件</a><a href="https://github.com/TUANZIDING" target="_blank" rel="noreferrer"><GithubLogo/>查看 GitHub</a><a href="/downloads/haixiang-ding-public-cv-2026.docx" download><DownloadSimple/>下载公开简历</a><a href="?design=current">查看当前版本<ArrowRight/></a></div>
      </section>
    </main>
    <footer className="v3Footer"><b>HD</b><span>Haixiang Ding · Clinical Evidence Workstation · 2026</span><a href="#v3-home">Back to top <ArrowDown/></a></footer>
  </div>;
}
