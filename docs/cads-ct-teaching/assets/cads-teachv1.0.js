/* CADS 全身 CT 解剖分割教学 · cads-teachv1.0.js
   Code: PolyForm Noncommercial 1.0.0 · Copyright (c) 2026 Haixiang Ding */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var J=function(id){var el=document.getElementById(id);return el?JSON.parse(el.textContent):null};
var LANG=document.documentElement.getAttribute('data-lang')||'zh';
function t(zh,en){return LANG==='zh'?zh:en}

/* ---------- language toggle ---------- */
function setLang(l){
  LANG=l;document.documentElement.setAttribute('data-lang',l);document.documentElement.lang=l==='zh'?'zh-CN':'en';
  try{localStorage.setItem('cads-lang',l)}catch(e){}
  $$('[data-zh-title]').forEach(function(el){el.title=el.getAttribute(l==='zh'?'data-zh-title':'data-en-title')});
  $$('[data-ph-zh]').forEach(function(el){el.placeholder=el.getAttribute(l==='zh'?'data-ph-zh':'data-ph-en')});
  document.title=l==='zh'?'CADS 全身 CT 解剖分割 · 双语教学课件':'CADS whole-body CT anatomy segmentation · bilingual teaching module';
  renderChips();renderLabels();renderReadout();if(cv&&CASE&&ctx)draw();
}
var stored=null;try{stored=localStorage.getItem('cads-lang')}catch(e){}
var qp=(location.search.match(/[?&]lang=(zh|en)/)||[])[1];
$('#langBtn').addEventListener('click',function(){setLang(LANG==='zh'?'en':'zh')});

/* ---------- lightbox ---------- */
var lbx=$('#lbx');
$$('[data-full]').forEach(function(b){b.addEventListener('click',function(){
  $('#lbxImg').src=b.getAttribute('data-full');$('#lbxImg').alt=b.querySelector('img').alt;
  $('#lbxCap').textContent=b.getAttribute(LANG==='zh'?'data-cap-zh':'data-cap-en')||'';
  lbx.classList.add('show');$('#lbxClose').focus();
})});
function closeLbx(){lbx.classList.remove('show');$('#lbxImg').removeAttribute('src')}
$('#lbxClose').addEventListener('click',closeLbx);
lbx.addEventListener('click',function(e){if(e.target===lbx)closeLbx()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLbx()});

/* ---------- label browser ---------- */
var LD=J('labels-data'),SYS=J('teach-systems');
var mode='teach',filt='all',q='',selId=null;
function lname(l){return LANG==='zh'?l.zh:l.en}
function groupKey(l){return mode==='teach'?l.teach:String(l.group)}
function groupTitle(k){
  if(mode==='teach'){var s=SYS[k];return t(s.zh,s.en)}
  var g=LD.groups[k];return 'T'+k+' · '+t(g.zh,g.en)+' · Slicer: '+g.slicer;
}
function renderChips(){
  var box=$('#lbChips');if(!box)return;box.innerHTML='';
  var keys=mode==='teach'?Object.keys(SYS):Object.keys(LD.groups);
  var mk=function(k,label,color){var b=document.createElement('button');b.type='button';b.className='chip'+(filt===k?' on':'');
    b.innerHTML=(color?'<i style="background:'+color+'"></i>':'')+label;b.onclick=function(){filt=k;renderChips();renderLabels()};box.appendChild(b)};
  mk('all',t('全部','All'));
  keys.forEach(function(k){var n=LD.labels.filter(function(l){return groupKey(l)===k}).length;if(!n)return;
    mk(k,(mode==='teach'?t(SYS[k].zh,SYS[k].en):'T'+k)+' · '+n,mode==='teach'?SYS[k].color:null)});
}
function renderLabels(){
  var box=$('#lbList');if(!box||!LD)return;box.innerHTML='';
  var qq=q.trim().toLowerCase(),shown=0;
  var keys=mode==='teach'?Object.keys(SYS):Object.keys(LD.groups);
  keys.forEach(function(k){
    if(filt!=='all'&&filt!==k)return;
    var items=LD.labels.filter(function(l){return groupKey(l)===k&&(!qq||(l.en+' '+l.zh+' '+l.snomed+' T'+l.group).toLowerCase().indexOf(qq)>=0)});
    if(!items.length)return;shown+=items.length;
    var h=document.createElement('div');h.className='lbgroup';h.innerHTML='<span>'+groupTitle(k)+'</span><span>'+items.length+'</span>';box.appendChild(h);
    var g=document.createElement('div');g.className='lbgrid';
    items.forEach(function(l){var b=document.createElement('button');b.type='button';b.className='lb'+(selId===l.id?' sel':'');
      b.innerHTML='<b>'+lname(l)+'</b><span>'+(LANG==='zh'?l.en:l.zh)+' · T'+l.group+' · '+l.cases.toLocaleString('en-US')+t(' 例',' vols')+'</span>';
      b.onclick=function(){selId=l.id;showDetail(l);$$('.lb.sel').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel')};g.appendChild(b)});
    box.appendChild(g);
  });
  $('#lbCount').textContent=t('显示 ','Showing ')+shown+' / 167';
  if(selId){var l=LD.labels.filter(function(x){return x.id===selId})[0];if(l)showDetail(l)}
}
function showDetail(l){
  var d=$('#lbDetail'),g=LD.groups[l.group];
  d.innerHTML='<button class="x" type="button" aria-label="close">×</button><b style="font-size:17px">'+lname(l)+'</b> <span style="color:var(--muted)">'+(LANG==='zh'?l.en:l.zh)+'</span>'+
   '<dl><dt>'+t('模型组','Model group')+'</dt><dd>T'+l.group+' · '+t(g.zh,g.en)+' (#'+l.index+')</dd>'+
   '<dt>SNOMED CT</dt><dd>'+l.snomed+(l.snomed_lat?' | '+l.snomed_lat:'')+'</dd>'+
   '<dt>'+t('上级系统（补充表 1）','Parent system (Suppl. Table 1)')+'</dt><dd>'+(l.systems.length?l.systems.join(', '):'–')+'</dd>'+
   '<dt>'+t('出现于','Present in')+'</dt><dd>'+l.cases.toLocaleString('en-US')+' / 22,022 '+t('个 CT（表 2）','CT volumes (Table 2)')+'</dd>'+
   '<dt>'+t('中位大小','Median size')+'</dt><dd>'+l.median_voxels.toLocaleString('en-US')+t(' 体素（1.5 mm 各向同性，表 2）',' voxels at 1.5 mm isotropic (Table 2)')+' ≈ '+l.median_ml+' mL <span class="tag derived">'+t('作者换算','derived')+'</span></dd></dl>';
  d.classList.add('show');d.querySelector('.x').onclick=function(){d.classList.remove('show');selId=null;$$('.lb.sel').forEach(function(x){x.classList.remove('sel')})};
}
if($('#lbSearch')){
  $('#lbSearch').addEventListener('input',function(e){q=e.target.value;renderLabels()});
  $$('#lbMode button').forEach(function(b){b.addEventListener('click',function(){mode=b.getAttribute('data-m');filt='all';
    $$('#lbMode button').forEach(function(x){x.classList.toggle('on',x===b)});renderChips();renderLabels()})});
}

/* ---------- real CT viewer ---------- */
var CASE=J('case-data'),cv=$('#ctCanvas'),ctx=cv?cv.getContext('2d'):null;
var N=CASE?CASE.zs.length:0,k=0,win='soft',ov='ref',alpha=0.45,cache={},hoverXY=null,sysOn=null;
var W=CASE?CASE.shape[0]:272,H=CASE?CASE.shape[1]:272;
var lut=[];if(CASE){CASE.labels.forEach(function(d,i){lut[i+1]=d.rgb})}
var predSet={};if(CASE&&CASE.cads_inference){CASE.cads_inference.viewer_slices.forEach(function(i){predSet[i]=1})}
function pad(n){return ('00'+n).slice(-3)}
function load(src){if(cache[src])return cache[src];var im=new Image();im.decoding='async';var p=new Promise(function(res,rej){im.onload=function(){res(im)};im.onerror=rej});im.src=src;cache[src]=p;return p}
function pix(im){var c=document.createElement('canvas');c.width=im.width;c.height=im.height;var x=c.getContext('2d');x.drawImage(im,0,0);return x.getImageData(0,0,c.width,c.height)}
var labPix=null,widePix=null;
function draw(){
  if(!ctx)return;var kk=k,base='assets/ct/ax-'+pad(kk);
  var need=[load(base+(win==='soft'?'-soft.webp':'-wide.webp'))];
  var lsrc=ov==='cads'?(predSet[kk]?base+'-cads.png':null):(ov==='ref'?base+'-lab.png':null);
  need.push(load(base+'-lab.png'));if(lsrc&&lsrc!==base+'-lab.png')need.push(load(lsrc));
  Promise.all(need).then(function(ims){
    if(kk!==k)return;
    cv.width=W;cv.height=H;var img;
    if(win==='soft'){ctx.drawImage(ims[0],0,0);img=ctx.getImageData(0,0,W,H)}
    else{img=pix(ims[0]);var lo=win==='lung'?-1350:-500,hi=win==='lung'?150:1300,d=img.data;
      for(var i=0;i<d.length;i+=4){var hu=-1024+d[i]*2424/255,v=Math.max(0,Math.min(255,(hu-lo)/(hi-lo)*255));d[i]=d[i+1]=d[i+2]=v}}
    try{labPix=pix(ims[1]);}catch(e){labPix=null}
    var ol=null;try{ol=lsrc?(lsrc===base+'-lab.png'?labPix:pix(ims[2])):null}catch(e){ol=null;$('#ctNote').style.display='block'}
    if(ol){var d2=img.data,L=ol.data;
      for(var j=0;j<L.length;j+=4){var id=L[j];if(!id)continue;var d=CASE.labels[id-1];if(sysOn&&d.sys!==sysOn)continue;var c=lut[id];
        var edge=(j>=4&&L[j-4]!==id)||(j+4<L.length&&L[j+4]!==id)||(j>=W*4&&L[j-W*4]!==id)||(j+W*4<L.length&&L[j+W*4]!==id);
        var a=edge?Math.min(1,alpha+0.4):alpha;
        d2[j]=d2[j]*(1-a)+c[0]*a;d2[j+1]=d2[j+1]*(1-a)+c[1]*a;d2[j+2]=d2[j+2]*(1-a)+c[2]*a}}
    ctx.putImageData(img,0,0);
    try{widePix=win==='soft'?null:pix(ims[0])}catch(e){widePix=null}
    renderReadout();
  }).catch(function(){});
  var z=CASE.zs[kk];$('#ctZ').textContent='z '+z+'/'+(CASE.shape[2]-1)+' · '+(z*CASE.spacing_mm[2]).toFixed(1)+' mm';
  $('#ctSlider').value=kk;
  var top=(1-(z+0.5)/CASE.shape[2])*100;$('#corLine').style.top=top+'%';
  $('#ctOv').textContent=ov==='cads'?(predSet[kk]?t('CADS 推理（T554）','CADS inference (T554)'):t('此层无 CADS 推理','no CADS inference on this slice')):(ov==='ref'?t('参考掩膜（TotalSegmentator 数据集）','Reference masks (TotalSegmentator dataset)'):t('无叠加','No overlay'));
}
function renderReadout(){
  var r=$('#ctRead');if(!r||!CASE)return;
  if(!hoverXY||!labPix){r.innerHTML='<em>'+t('把鼠标移到图像上（手机：点按）查看结构名','Hover over the image (tap on mobile) to identify a structure')+'</em>';return}
  var x=hoverXY[0],y=hoverXY[1],i=(y*W+x)*4,id=labPix.data[i],s='';
  if(id){var d=CASE.labels[id-1];s='<b>'+(LANG==='zh'?d.zh:d.ts)+'</b><br><em>'+(LANG==='zh'?'TotalSegmentator: '+d.ts:'zh: '+d.zh)+'</em><br>'+
    (d.cads?t('对应 CADS 结构：','CADS label: ')+d.cads:t('CADS 167 类中无同名结构','No same-named CADS label'))}
  else s='<em>'+t('背景 / 未标注','background / unlabelled')+'</em>';
  r.innerHTML=s;
}
if(cv&&CASE){
  $('#ctSlider').max=N-1;
  k=CASE.zs.indexOf(CASE.zs.reduce(function(a,b){return Math.abs(b-CASE.z_l3)<Math.abs(a-CASE.z_l3)?b:a}));
  $('#ctSlider').addEventListener('input',function(e){k=+e.target.value;draw()});
  $$('#ctWin button').forEach(function(b){b.addEventListener('click',function(){win=b.getAttribute('data-w');$$('#ctWin button').forEach(function(x){x.classList.toggle('on',x===b)});draw()})});
  $$('#ctOvBtns button').forEach(function(b){b.addEventListener('click',function(){ov=b.getAttribute('data-o');$$('#ctOvBtns button').forEach(function(x){x.classList.toggle('on',x===b)});draw()})});
  $('#ctAlpha').addEventListener('input',function(e){alpha=+e.target.value;draw()});
  $$('#ctJump button').forEach(function(b){b.addEventListener('click',function(){var z=CASE[b.getAttribute('data-j')];
    k=CASE.zs.indexOf(CASE.zs.reduce(function(a,c){return Math.abs(c-z)<Math.abs(a-z)?c:a}));draw()})});
  $$('#ctSys button').forEach(function(b){b.addEventListener('click',function(){var s=b.getAttribute('data-s');sysOn=(s==='all'?null:s);
    $$('#ctSys button').forEach(function(x){x.classList.toggle('on',x===b)});draw()})});
  var pos=function(e){var r=cv.getBoundingClientRect(),p=e.touches?e.touches[0]:e;
    return [Math.max(0,Math.min(W-1,Math.floor((p.clientX-r.left)/r.width*W))),Math.max(0,Math.min(H-1,Math.floor((p.clientY-r.top)/r.height*H)))]};
  cv.addEventListener('mousemove',function(e){hoverXY=pos(e);renderReadout()});
  cv.addEventListener('click',function(e){hoverXY=pos(e);renderReadout()});
  cv.addEventListener('wheel',function(e){if(!e.shiftKey&&!e.altKey)return;e.preventDefault();k=Math.max(0,Math.min(N-1,k+(e.deltaY>0?-1:1)));draw()},{passive:false});
  cv.setAttribute('tabindex','0');
  cv.addEventListener('keydown',function(e){if(e.key==='ArrowUp'||e.key==='ArrowRight'){k=Math.min(N-1,k+1);draw();e.preventDefault()}
    if(e.key==='ArrowDown'||e.key==='ArrowLeft'){k=Math.max(0,k-1);draw();e.preventDefault()}});
  $('#cor').addEventListener('click',function(e){var r=this.getBoundingClientRect(),f=1-(e.clientY-r.top)/r.height,z=f*CASE.shape[2];
    k=CASE.zs.indexOf(CASE.zs.reduce(function(a,c){return Math.abs(c-z)<Math.abs(a-z)?c:a}));draw()});
  if(!CASE.cads_inference){$$('#ctOvBtns button[data-o=cads]').forEach(function(b){b.disabled=true})}
}

/* ---------- quiz ---------- */
var answered=0,correct=0;
$$('.q').forEach(function(qq){var ok=qq.getAttribute('data-a');
  $$('button.o',qq).forEach(function(b){b.addEventListener('click',function(){if(qq.classList.contains('done'))return;qq.classList.add('done');answered++;
    if(b.getAttribute('data-k')===ok){b.classList.add('ok');correct++}else{b.classList.add('bad');$('button.o[data-k="'+ok+'"]',qq).classList.add('ok')}
    $('#qScore').textContent=correct+' / '+answered})})});
$('#qReset')&&$('#qReset').addEventListener('click',function(){answered=0;correct=0;$('#qScore').textContent='0 / 0';
  $$('.q').forEach(function(qq){qq.classList.remove('done');$$('button.o',qq).forEach(function(b){b.classList.remove('ok','bad')})})});

setLang(qp||stored||'zh');
})();
