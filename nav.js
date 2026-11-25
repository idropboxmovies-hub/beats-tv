'use strict';
/* Navegação espacial por controle remoto (D-pad), roteador de telas e utilitários de foco. */
const NAV=[];let CUR=null,ACT={},actN=0,K=1,npOpen=false;
const A=(fn,keep)=>{const k=(keep?'p':'a')+(++actN);ACT[k]=fn;return `data-a="${k}"`};
const resetActs=()=>{for(const k in ACT)if(k[0]==='a')delete ACT[k]};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&ACT[t.dataset.a]){e.preventDefault();ACT[t.dataset.a](t)}});

function fit(){
  K=Math.min(innerWidth/1920,innerHeight/1080);
  const s=$('#stage');s.style.transform=`translate(${(innerWidth-1920*K)/2}px,${(innerHeight-1080*K)/2}px) scale(${K})`;
}
addEventListener('resize',fit);

let tT=0;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),2200)}

const vis=e=>e.offsetWidth>0&&e.offsetHeight>0&&!e.closest('[hidden]');
function setFocus(el){
  if(CUR&&CUR!==el)CUR.classList.remove('foc');
  CUR=el||null;if(!el)return;
  el.classList.add('foc');reveal(el);
  const c=el.dataset.tint;if(c)document.documentElement.style.setProperty('--t1',c);
}
function reveal(el){
  const vs=el.closest('[data-vs]');
  if(vs){
    const cr=vs.getBoundingClientRect(),r=el.getBoundingClientRect(),H=vs.clientHeight,pad=+(vs.dataset.pad||150);
    const top=(r.top-cr.top)/K,bot=(r.bottom-cr.top)/K;
    if(top<pad||bot>H-70){
      const sec=el.closest('.sec'),st=sec&&vs.contains(sec)?(sec.getBoundingClientRect().top-cr.top)/K:top;
      const wanted=(sec&&sec.offsetHeight<H-pad)?st:top;
      vs.scrollTo({top:Math.max(0,vs.scrollTop+wanted-pad),behavior:'smooth'});
    }
  }
  const hs=el.closest('[data-hs]');
  if(hs){
    const cr=hs.getBoundingClientRect(),r=el.getBoundingClientRect();
    const l=(r.left-cr.left)/K,rt=(r.right-cr.left)/K,W=hs.clientWidth;
    if(l<80)hs.scrollTo({left:Math.max(0,hs.scrollLeft+l-80),behavior:'smooth'});
    else if(rt>W-80)hs.scrollTo({left:hs.scrollLeft+rt-W+80,behavior:'smooth'});
  }
}
function roots(){return npOpen?[$('#np')]:[$('#top'),$('#view'),$('#mini')]}
function move(dir){
  const all=[].concat(...roots().map(r=>$$('.f',r))).filter(vis);
  if(!all.length)return;
  if(!CUR||!all.includes(CUR)||!vis(CUR)){setFocus(all.find(e=>e.closest('#view,#np'))||all[0]);return}
  const c=CUR.getBoundingClientRect(),cx=c.left+c.width/2,cy=c.top+c.height/2,vert=dir==='up'||dir==='down';
  const L=[];
  for(const e of all){
    if(e===CUR)continue;
    const r=e.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;
    let p,s;
    if(dir==='right'){if(dx<=6||r.left<c.left+4)continue;p=dx;s=Math.abs(dy)}
    else if(dir==='left'){if(dx>=-6||r.right>c.right-4)continue;p=-dx;s=Math.abs(dy)}
    else if(dir==='down'){if(dy<=6)continue;p=dy;s=Math.abs(dx)}
    else{if(dy>=-6)continue;p=-dy;s=Math.abs(dx)}
    L.push({e,p,s});
  }
  if(!L.length)return;
  let best;
  if(vert){
    const m=Math.min(...L.map(x=>x.p)),band=L.filter(x=>x.p<=m+Math.max(140,c.height*.6));
    best=band.reduce((a,b)=>b.s<a.s?b:a);
  }else best=L.reduce((a,b)=>(b.p+b.s*2.6)<(a.p+a.s*2.6)?b:a);
  setFocus(best.e);
}
function focusFirst(sel){
  const e=(sel&&$(sel))||$('#view [data-first]')||$('#view .f');
  if(e)setFocus(e);else CUR=null;
}
function activate(){
  if(!CUR)return;
  if(CUR.matches('input,textarea')){CUR.focus();return}
  CUR.click();
}

/* ===== roteador ===== */
const SCREENS={};let AFTER=null;
function saveState(){
  const n=NAV[NAV.length-1];if(!n)return;
  if(!CUR||!CUR.closest('#view'))return;const l=$$('#view .f');n.f=l.indexOf(CUR);n.sc=$('#view').scrollTop;
}
function go(s,p){saveState();NAV.push({s,p});render()}
function tab(s){saveState();NAV.length=0;NAV.push({s});render()}
function back(){if(NAV.length>1){NAV.pop();render(true);return true}return false}
function render(restore){
  const n=NAV[NAV.length-1],v=$('#view');
  resetActs();AFTER=null;
  const r=SCREENS[n.s](n.p);
  const html=typeof r==='string'?r:r.html;
  v.innerHTML=`<div class="pg">${html}</div>`;
  v.scrollTop=0;CUR=null;
  $$('#view .f').forEach((e,i)=>{e.dataset.k=i});
  if(restore&&n.f>=0){
    v.scrollTop=n.sc||0;
    const l=$$('#view .f');setFocus(l[n.f]||l[0]);
  }else focusFirst();
  UI.tabs();UI.miniVis();
  if(r&&r.after)r.after();
}
/* re-renderiza a tela atual mantendo o foco (ex.: depois de carregar dados) */
function rerender(){saveState();render(true)}

/* ===== teclado / controle ===== */
const DIR={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
addEventListener('keydown',e=>{
  const k=e.key,ae=document.activeElement,typing=ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName);
  if(typing){
    if(k==='Enter'){e.preventDefault();if(ae.dataset.next){const n=$(ae.dataset.next);if(n){setFocus(n);n.focus()}return}ae.blur();if(ae.dataset.submit){const b=$(ae.dataset.submit);if(b)b.click()}return}
    if(k==='Escape'||k==='GoBack'){e.preventDefault();ae.blur();return}
    if(k==='ArrowUp'||k==='ArrowDown'){ae.blur()}else return;
  }
  if(DIR[k]){
    e.preventDefault();
    if(CUR&&CUR.dataset.seek&&(k==='ArrowLeft'||k==='ArrowRight')){P.seek(k==='ArrowRight'?10:-10);return}
    move(DIR[k]);return;
  }
  if(k==='Enter'||k==='NumpadEnter'){e.preventDefault();activate();return}
  if(k==='MediaPlayPause'||k==='MediaPlay'||k==='MediaPause'){e.preventDefault();P.toggle();return}
  if(k==='MediaTrackNext'||k==='MediaFastForward'){e.preventDefault();P.next();return}
  if(k==='MediaTrackPrevious'||k==='MediaRewind'){e.preventDefault();P.prev();return}
  const sr=NAV.length&&NAV[NAV.length-1].s==='search'&&!npOpen;
  if(sr&&window.SEARCH){
    if(k==='Backspace'){e.preventDefault();SEARCH.del();return}
    if(k.length===1&&/[\p{L}\p{N} ]/u.test(k)){e.preventDefault();SEARCH.add(k);return}
  }
  if(k==='Escape'||k==='Backspace'||k==='GoBack'||k==='BrowserBack'){e.preventDefault();tvBack();return}
  if(k===' '){e.preventDefault();P.toggle()}
});
/* chamado pela Activity (botão Voltar do controle). true = tratado; false = sair do app */
window.tvBack=function(){
  const ae=document.activeElement;
  if(ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)){ae.blur();return true}
  if(npOpen){UI.closeNP();return true}
  if(back())return true;
  if(NAV[0]&&NAV[0].s!=='home'){tab('home');return true}
  return false;
};
