'use strict';
/* ===== UI global: topo, mini player, tela da música ===== */
const TABS=[['home','Início','home'],['new','Novo','star'],['radio','Rádio','radio'],['search','Buscar','search'],['profile','Perfil','user']];
const UI={};
const playQ=(q,i,o)=>{P.play(q,i,o);UI.openNP()};

UI.buildTop=()=>{
  $('#top').innerHTML=`<button class="f back" id="bk" aria-label="voltar" ${A(()=>tvBack(),1)}>${ICON.chevL}</button>
  <nav class="tabs" id="tabs">${TABS.map(t=>`<button class="f tab" data-t="${t[0]}" ${A(()=>tab(t[0]),1)}>${ICON[t[2]]}<span>${t[1]}</span></button>`).join('')}</nav>
  <div class="ttl" id="ttl"></div>`;
};
UI.tabs=()=>{
  const r=NAV[0]?NAV[0].s:'home';
  $$('#tabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.t===r));
  $('#top').classList.toggle('sub',NAV.length>1);
};
UI.buildMini=()=>{
  $('#mini').innerHTML=`<div class="f mini" id="minib" ${A(()=>UI.openNP(),1)}><i class="mart" id="mart"></i><div class="mtx"><b id="mt1"></b><small id="mt2"></small></div><span class="mpp" id="mpp"></span><div class="mprog"><i id="mfill"></i></div></div>`;
};
UI.miniVis=()=>{$('#mini').classList.toggle('on',!!P.t&&!npOpen)};

UI.buildNP=()=>{
  const eq=Array.from({length:22},(_,i)=>`<s style="--b:${i}"></s>`).join('');
  $('#np').innerHTML=`<div class="npbg" id="npbg"></div><div class="npshade"></div>
  <button class="f npx" id="npx" ${A(()=>UI.closeNP(),1)}>${ICON.chevD}<span>Fechar</span></button>
  <div class="npgrid">
    <div class="npl"><div class="npcover" id="npcv"><div class="npeq">${eq}</div></div></div>
    <div class="npm">
      <div class="npt" id="npt"></div>
      <div class="npa" id="npa"></div>
      <div class="npbar"><span id="np1">0:00</span><div class="f tr" id="nptr" data-seek="1" ${A(()=>P.toggle(),1)}><i id="npfill"></i></div><span id="np2">0:00</span></div>
      <div class="npctl">
        <button class="f cb sm" id="bsh" ${A(()=>P.toggleShuffle(),1)}>${ICON.shuffle}</button>
        <button class="f cb" id="bpv" ${A(()=>P.prev(),1)}>${ICON.prev}</button>
        <button class="f cb big" id="bpp" ${A(()=>P.toggle(),1)}>${ICON.play}</button>
        <button class="f cb" id="bnx" ${A(()=>P.next(),1)}>${ICON.next}</button>
        <button class="f cb sm" id="brp" ${A(()=>P.cycleRepeat(),1)}>${ICON.repeat}</button>
      </div>
      <div class="npchips">
        <button class="f chip" id="bcr" ${A(()=>{const t=P.t;if(!t)return;UI.closeNP(true);go('credits',t.id)},1)}>${ICON.info}Créditos</button>
        <button class="f chip" id="bar" ${A(()=>{const t=P.t;if(!t||!t.artistId)return toast('Artista indisponível');UI.closeNP(true);go('user',t.artistId)},1)}>${ICON.user}Ver artista</button>
        <button class="f chip" id="bal" ${A(()=>{const t=P.t;if(!t)return;UI.closeNP(true);go('rel',t.rid)},1)}>${ICON.list}Ver álbum</button>
      </div>
    </div>
    <div class="npq"><h3>A seguir</h3><div class="npql" id="npql" data-vs="1" data-pad="10"></div></div>
  </div>`;
};
UI.openNP=()=>{
  if(!P.t)return;npOpen=true;saveState();
  const n=$('#np');n.classList.add('open');UI.track();UI.miniVis();
  setFocus($('#bpp'));
};
UI.closeNP=keep=>{
  npOpen=false;$('#np').classList.remove('open');UI.miniVis();
  if(!keep){const l=$$('#view .f'),n=NAV[NAV.length-1];setFocus(l[n&&n.f>=0?n.f:0]||$('#minib'))}
  else CUR=null;
};
UI.track=()=>{
  const t=P.t;if(!t)return;
  $('#mt1').textContent=t.title;$('#mt2').textContent=t.artist;
  $('#mart').style.cssText=t.cover?bgImg(t.cover):gradBg(1);
  $('#npt').innerHTML=esc(t.title)+(t.ex?'<s class="e">E</s>':'');
  $('#npa').innerHTML=`${esc(t.artist)}<em>${esc(t.rel||'')}</em>`;
  $('#npbg').style.cssText=t.cover?bgImg(t.cover):gradBg(4);
  $('#npcv').style.cssText=t.cover?bgImg(t.cover):gradBg(2);
  $('#bsh').classList.toggle('act',P.shuffle);
  $('#brp').classList.toggle('act',P.rep>0);$('#brp').dataset.r=P.rep;
  const c=$('#npcv');c.classList.remove('swap');void c.offsetWidth;c.classList.add('swap');
  const q=P.q.map((x,i)=>[x,i]).filter(([x,i])=>i>=P.i).slice(0,40);
  $('#npql').innerHTML=q.map(([x,i],k)=>`<div class="f qrow ${i===P.i?'cur':''}" ${A(()=>P.jump(i))} data-i="${i}"><i class="cv" style="${coverStyle(x.cover,i)}"></i><div class="tx"><b>${esc(x.title)}</b><small>${esc(x.artist)}</small></div>${i===P.i?'<i class="eqm"><s></s><s></s><s></s></i>':''}</div>`).join('')||'<p class="mut">Fim da fila</p>';
  $('#npql').scrollTop=0;
  UI.rows();UI.state();UI.progress();UI.miniVis();
};
UI.rows=()=>{
  const t=P.t;
  $$('#view [data-tid]').forEach(e=>e.classList.toggle('on',!!t&&e.dataset.tid===String(t.id)));
};
UI.state=()=>{
  const pl=P.playing;
  document.body.classList.toggle('pl',pl);
  $('#bpp').innerHTML=pl?ICON.pause:ICON.play;
  $('#mpp').innerHTML=pl?ICON.pause:ICON.play;
  $('#mini').classList.toggle('playing',pl);
};
UI.progress=()=>{
  const d=P.au.duration,c=P.au.currentTime,p=d>0?Math.min(1,c/d):0;
  $('#npfill').style.transform=`scaleX(${p})`;$('#mfill').style.transform=`scaleX(${p})`;
  $('#np1').textContent=fmtTime(c);$('#np2').textContent=d>0?'-'+fmtTime(d-c):'0:00';
};
/* liquid glass nos mesmos elementos do site: topo, botão, mini player, barra, controles */
UI.glassAll=()=>{
  LG.apply($('#tabs'),'lg-tabs',30,8);
  LG.apply($('#bk'),'lg-back',26,10);
  LG.apply($('#minib'),'lg-mini',34,12);
  LG.apply($('#nptr'),'lg-bar',8,6);
  LG.apply($('#npx'),'lg-close',18,10);
  LG.apply($('#bpv'),'lg-prev',34,18);
  LG.apply($('#bpp'),'lg-play',46,22);
  LG.apply($('#bnx'),'lg-next',34,18);
  LG.apply($('#bsh'),'lg-sh',28,14);
  LG.apply($('#brp'),'lg-rp',28,14);
};

/* ===== componentes ===== */
function srow(t,i,q,o){
  o=o||{};
  return `<div class="srow f" style="--i:${i}" data-tid="${esc(t.id)}" ${A(()=>playQ(q,i))}><span class="rk">${o.num!=null?o.num:''}</span><i class="cv" style="${coverStyle(t.cover,i)}"></i><div class="tx"><b>${esc(t.title)}${t.ex?'<s class="e">E</s>':''}</b><small>${esc(t.artist)}${o.rel?' · '+esc(t.rel):''}</small></div><i class="eqm"><s></s><s></s><s></s></i></div>`;
}
function relCard(r,i){
  return `<div class="rel f" style="--i:${i}" ${A(()=>go('rel',r.id))}><i class="rc" style="${coverStyle(r.cover_url,i+2)}"></i><b>${esc(r.title)}${r.explicit?'<s class="e">E</s>':''}</b><small>${esc(r.artist)}</small></div>`;
}
function artCircle(a,i){
  const u=photo(a);
  return `<div class="ac f" style="--i:${i}" data-tint="#444" ${A(()=>go('user',a.id))}><i class="ci" style="${u?bgImg(u):gradBg(i)}">${u?'':esc(initial(nameOf(a)))}</i><b>${esc(nameOf(a))}${a.claimed?'<span class="vf">'+ICON.check+'</span>':''}</b></div>`;
}
function sqCard(t,i,q){
  return `<div class="sq f" style="--i:${i}" data-tid="${esc(t.id)}" ${A(()=>playQ(q,i))}><i style="${coverStyle(t.cover,i)}"></i><span><b>${esc(t.title)}</b>${esc(t.artist)}</span></div>`;
}
const sec=(title,inner,cls)=>`<section class="sec ${cls||''}">${title?`<h2>${title}</h2>`:''}${inner}</section>`;
const row=items=>`<div class="row" data-hs="1">${items}</div>`;
const empty=m=>`<p class="mut pad">${m}</p>`;
const errBar=()=>DB.err?`<p class="mut bad pad">Não foi possível carregar do Supabase: ${esc(DB.err)}</p>`:'';

/* cards “Mais relevantes pra você” (idênticos ao Apple Music TV) */
const THEMES=[['#5f5300','#d3b61a'],['#6d0a00','#ff2a05'],['#6b0a49','#ff3e8c'],['#0b3f6b','#27b0d6'],['#3a0f6e','#b24cf0'],['#00513e','#35d6a0']];
function fanSvg(){
  let p='';const ys=[0,16,32,48,64,80,96,112,133];
  for(let k=0;k<ys.length-1;k++)p+=`<polygon points="100,66.5 0,${ys[k]} 0,${ys[k+1]}" fill="#fff" opacity="${k%2?0.07:0.0}"/>`;
  for(let k=0;k<5;k++)p+=`<polygon points="100,66.5 ${k*22},0 ${k*22+22},0" fill="#000" opacity="${k%2?0.10:0.0}"/><polygon points="100,66.5 ${k*22},133 ${k*22+22},133" fill="#fff" opacity="${k%2?0.0:0.09}"/>`;
  return `<svg class="fan" viewBox="0 0 100 133" preserveAspectRatio="none"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="0.15"><stop offset="0" stop-color="#3a1ca6"/><stop offset=".55" stop-color="#3d5bd4"/><stop offset="1" stop-color="#1f9fa6"/></linearGradient></defs><rect width="100" height="133" fill="url(#fg)"/>${p}</svg>`;
}
function stationCard(a,i){
  const th=THEMES[i%THEMES.length],others=DB.artists.filter(x=>x.id!==a.id);
  const o1=others[(i*2)%Math.max(1,others.length)],o2=others[(i*2+1)%Math.max(1,others.length)];
  const circ=(p,cls,k)=>{const u=photo(p);return `<i class="cc ${cls}" style="${u?bgImg(u):gradBg(k)}">${u?'':esc(initial(nameOf(p)))}</i>`};
  const q=()=>{const mine=tracksOfArtist(a.id),rest=shuffleArr(DB.tracks.filter(t=>t.artistId!==a.id)).slice(0,25);return mine.concat(rest)};
  return `<div class="card f station" style="--i:${i+2};background:linear-gradient(170deg,${th[0]},${th[1]})" data-tint="${th[1]}" ${A(()=>playQ(q(),0))}>
    <div class="logo">${LOGO}</div>
    ${circ(a,'c1',i)}${o1?circ(o1,'c2',i+1):''}${o2?circ(o2,'c3',i+3):''}
    <div class="ctext"><small>Com participação de ${esc(nameOf(a))}</small><b>${esc(nameOf(a))} &amp; Similar<br>Artists Station</b></div></div>`;
}

SCREENS.home=()=>{
  const T=DB.tracks;
  const energy=()=>{const l=byPlays(T).slice(0,30);return l.length?l:T};
  const disc=()=>shuffleArr(T.slice()).slice(0,30);
  const news=()=>T.slice(0,30);
  const cards=[
   `<div class="card f green" style="--i:0" data-first="1" data-tint="#12a82b" ${A(()=>playQ(energy(),0))}><div class="logo">${LOGO}</div><div class="bolt">${ICON.bolt}</div><div class="ctext"><small>Na vibe de…</small><b>Energia</b><b class="w">Não pare nunca com estas faixas cheias de energia.</b></div></div>`,
   `<div class="card f purple" style="--i:1" data-tint="#3a2bb0" ${A(()=>playQ(disc(),0))}>${fanSvg()}<div class="logo">${LOGO}</div><div class="ctext"><small class="lav">Feito para Você</small><b>Descobertas</b></div></div>`
  ];
  const feat=DB.artists.slice(0,10);
  feat.forEach((a,i)=>{
    cards.push(stationCard(a,i));
    if(i===1)cards.push(`<div class="card f pink" style="--i:5" data-tint="#d6336c" ${A(()=>playQ(news(),0))}><div class="fan2"></div><div class="logo">${LOGO}</div><div class="ctext"><small class="lav">Feito para Você</small><b>Novidades</b></div></div>`);
  });
  const rec=T.slice(0,14);
  return{html:`
   ${errBar()}
   ${sec('Mais relevantes pra você',row(cards.join('')),'first')}
   ${sec('Reproduções Recentes',`<div class="row" data-hs="1" id="rec">${rec.length?rec.map((t,i)=>sqCard(t,i,rec)).join(''):empty('Nenhuma música publicada ainda.')}</div>`)}
   ${sec('Adicionados Recentemente',DB.rels.length?row(DB.rels.slice(0,20).map(relCard).join('')):empty('Nenhum lançamento ainda.'))}
   ${sec('Artistas',DB.artists.length?row(DB.artists.slice(0,24).map(artCircle).join('')):empty('Nenhum artista cadastrado.'))}
   <div class="endpad"></div>`,
   after(){
    if(!DB.user)return;
    loadRecents().then(l=>{
      if(!l||!l.length||!$('#rec'))return;
      resetActsKeepHome();$('#rec').innerHTML=l.map((t,i)=>sqCard(t,i,l)).join('');
      $$('#view .f').forEach((e,i)=>{e.dataset.k=i});
    });
   }};
};
function resetActsKeepHome(){/* as ações da tela atual continuam válidas; novas são adicionadas com chaves novas */}
