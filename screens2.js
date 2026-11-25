'use strict';
/* ===== Buscar, Perfil / Artista, Álbum, Créditos, Novo, Rádio ===== */

/* ---------- BUSCAR (teclado na tela + resultados ao vivo) ---------- */
const SEARCH={q:'',
  add(c){this.q+=c;this.upd()},
  del(){this.q=this.q.slice(0,-1);this.upd()},
  clear(){this.q='';this.upd()},
  upd(){const s=$('#sq');if(!s)return;s.textContent=this.q||'Buscar músicas ou artistas';s.classList.toggle('ph',!this.q);this.draw()},
  draw(){
    const box=$('#sres');if(!box)return;
    if(!this.q.trim()){
      const cats=[['Hits','#e5b400'],['Pop','#e0658a'],['Hip-Hop','#5b8bef'],['Country','#d28a2e'],['Dance','#3dba7c'],['Rock','#ec5a38'],['R&B','#8d72e0'],['Ao Vivo','#555']];
      box.innerHTML=sec('Artistas Populares',DB.artists.length?row(DB.artists.slice(0,16).map(artCircle).join('')):empty('Nenhum artista ainda.'))
       +sec('Explorar por categoria',`<div class="cats">${cats.map((c,i)=>`<div class="cat f" style="--i:${i};background:${c[1]}" ${A(()=>{SEARCH.q=c[0];SEARCH.upd()})}><span>${c[0]}</span></div>`).join('')}</div>`);
      return;
    }
    const r=searchDB(this.q);
    if(!r.artists.length&&!r.tracks.length&&!r.rels.length){box.innerHTML=`<p class="mut pad big">Nenhum resultado para “${esc(this.q)}”.</p>`;return}
    box.innerHTML=(r.artists.length?sec('Artistas',row(r.artists.slice(0,14).map(artCircle).join(''))):'')
     +(r.tracks.length?sec('Músicas',`<div class="list">${r.tracks.map((t,i)=>srow(t,i,r.tracks,{rel:1})).join('')}</div>`):'')
     +(r.rels.length?sec('Álbuns e lançamentos',row(r.rels.map(relCard).join(''))):'');
    UI.rows();
  }
};
SCREENS.search=()=>{
  SEARCH.q='';
  const keys='abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  return{html:`<div class="srch">
    <div class="skb">
      <h1>Buscar</h1>
      <div class="sbar"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span id="sq" class="ph">Buscar músicas ou artistas</span><i class="caret"></i></div>
      <div class="keys">${keys.map((c,i)=>`<button class="f key" style="--i:${i}" ${i===0?'data-first="1"':''} ${A(()=>SEARCH.add(c))}>${c}</button>`).join('')}</div>
      <div class="keyx">
        <button class="f key wide" ${A(()=>SEARCH.add(' '))}>espaço</button>
        <button class="f key wide" ${A(()=>SEARCH.del())}>apagar</button>
        <button class="f key wide" ${A(()=>SEARCH.clear())}>limpar</button>
      </div>
    </div>
    <div class="sres" id="sres" data-vs="1" data-pad="30"></div></div>`,
    after(){SEARCH.draw()}};
};

/* ---------- PERFIL / ARTISTA ---------- */
function toggleGlass(){LG.set(!LG.on);toast('Liquid Glass: '+(LG.on?'refração (como no site)':'simples'));LG.refresh();rerender()}
async function logout(){await signOut();toast('Você saiu da conta');tab('profile')}
async function doLogin(){
  const em=($('#em')||{}).value||'',pw=($('#pw')||{}).value||'',m=$('#lmsg'),b=$('#lbtn');
  if(!em||!pw){m.textContent='Digite e-mail e senha.';m.className='msg bad';return}
  b.disabled=true;m.textContent='Entrando…';m.className='msg';
  try{await signIn(em.trim(),pw);toast('Bem-vindo de volta!');tab('profile')}
  catch(e){b.disabled=false;m.textContent=(e&&e.message==='Invalid login credentials')?'E-mail ou senha incorretos.':((e&&e.message)||'Não foi possível entrar.');m.className='msg bad'}
}
function loginView(){
  return{html:`<div class="login">
    <div class="lcard glass">
      <div class="lic">${ICON.user}</div>
      <h1>Entrar na beats</h1>
      <p class="mut">Use a mesma conta do site para ver seu perfil e salvar o que você ouve.</p>
      <input class="f inp" id="em" type="email" placeholder="E-mail" autocomplete="email" data-first="1" data-next="#pw">
      <input class="f inp" id="pw" type="password" placeholder="Senha" autocomplete="current-password" data-submit="#lbtn">
      <p class="msg" id="lmsg"></p>
      <button class="f pbtn white wide" id="lbtn" ${A(doLogin)}>Entrar</button>
      <p class="mut sm">Ainda não tem conta? Crie no site da beats e volte aqui.</p>
    </div>
    <div class="lset"><button class="f chip" ${A(toggleGlass)}>${ICON.info}Liquid Glass: ${LG.on?'refração':'simples'}</button></div>
  </div>`};
}
function profileView(p,own){
  const u=photo(p),art=p.role==='artist',tr=tracksOfArtist(p.id),rl=relsOfArtist(p.id),nm=nameOf(p);
  const acts=own
    ?`<button class="f pbtn white" data-first="1" ${A(logout)}>Sair</button><button class="f pbtn" ${A(toggleGlass)}>Liquid Glass: ${LG.on?'refração':'simples'}</button>`
    :`<button class="f pbtn white" data-first="1" ${A(()=>tr.length?playQ(tr,0):toast('Nenhuma música publicada'))}>${ICON.play}Tocar</button><button class="f pbtn" ${A(()=>tr.length?playQ(tr,0,{shuffle:true}):toast('Nenhuma música publicada'))}>${ICON.shuffle}Aleatório</button>`;
  return{html:`<div class="hero">
    <div class="hbg" style="${u?bgImg(u):gradBg(4)}"></div><div class="hshade"></div>
    <div class="hav" style="${u?bgImg(u):gradBg(4)}">${u?'':esc(initial(nm))}</div>
    <div class="hn"><h1>${esc(nm)}${p.claimed?`<span class="vf">${ICON.check}</span>`:''}</h1>
      <p class="hsub">${p.username?'@'+esc(p.username)+' · ':''}${art?'Artista':'Ouvinte'}${p.artist_category?' · '+esc(p.artist_category):''}</p>
      <div class="hacts">${acts}</div></div></div>
    ${p.bio?sec('Sobre',`<div class="bio glass">${esc(p.bio)}</div>`):''}
    ${own&&!art?sec('Reproduções Recentes',`<div class="row" data-hs="1" id="rec">${empty('Carregando…')}</div>`):''}
    ${tr.length?sec('Músicas',`<div class="list two">${tr.slice(0,12).map((t,i)=>srow(t,i,tr,{rel:1})).join('')}</div>`):(art?sec('Músicas',empty('Nenhuma música publicada ainda.')):'')}
    ${rl.length?sec('Lançamentos',row(rl.map(relCard).join(''))):''}
    <div class="endpad"></div>`,
    after(){
      if(own&&!art)loadRecents().then(l=>{const r=$('#rec');if(!r)return;
        if(!l||!l.length){r.innerHTML=empty('Suas reproduções vão aparecer aqui.');return}
        r.innerHTML=l.map((t,i)=>sqCard(t,i,l)).join('');
      });
      UI.rows();
    }};
}
SCREENS.profile=()=>{
  if(!DB.user)return loginView();
  return profileView(DB.prof||{id:DB.user.id,display_name:(DB.user.email||'').split('@')[0]},true);
};
SCREENS.user=id=>{
  const p=DB.AM[id];
  if(!p)return{html:`<p class="mut pad big" style="padding-top:220px">Carregando artista…</p>`,after(){
    fetchProfile(id).then(x=>{const n=NAV[NAV.length-1];if(!n||n.s!=='user'||n.p!==id)return;if(x)render();else $('#view .pg').innerHTML=`<p class="mut pad big" style="padding-top:220px">Artista não encontrado.</p>`})}};
  return profileView(p,false);
};

/* ---------- ÁLBUM ---------- */
SCREENS.rel=id=>{
  const r=DB.RM[id];if(!r)return`<p class="mut pad big" style="padding-top:220px">Lançamento não encontrado.</p>`;
  const tr=DB.byRel[id]||[],ap=r.artistP;
  return{html:`<div class="relw">
    <div class="rl"><i class="rbig" style="${coverStyle(r.cover_url,3)}"></i></div>
    <div class="rr">
      <h1>${esc(r.title)}${r.explicit?'<s class="e">E</s>':''}</h1>
      <p class="rart f" data-tint="#555" ${A(()=>r.artist_id?go('user',r.artist_id):0)}>${esc(r.artist)}${ap&&ap.claimed?`<span class="vf">${ICON.check}</span>`:''}</p>
      <p class="mut">${fmtDate(r.created_at)} · ${tr.length} ${tr.length===1?'faixa':'faixas'}</p>
      <div class="hacts">
        <button class="f pbtn white" data-first="1" ${A(()=>tr.length?playQ(tr,0):toast('Sem faixas'))}>${ICON.play}Tocar</button>
        <button class="f pbtn" ${A(()=>tr.length?playQ(tr,0,{shuffle:true}):toast('Sem faixas'))}>${ICON.shuffle}Aleatório</button>
        <button class="f pbtn" ${A(()=>tr[0]?go('credits',tr[0].id):0)}>${ICON.info}Créditos</button>
      </div>
      <div class="list">${tr.map((t,i)=>srow(t,i,tr,{num:t.num||i+1})).join('')||empty('Nenhuma faixa neste lançamento.')}</div>
    </div></div><div class="endpad"></div>`,after(){UI.rows()}};
};

/* ---------- CRÉDITOS DA MÚSICA ---------- */
function creditsFor(t){
  const R=t.rawRel||{},X=t.raw||{},P0=DB.AM[t.artistId]||{};
  const pick=(...ks)=>{for(const o of [X,R])for(const k of ks){const v=o[k];if(v==null||v==='')continue;if(Array.isArray(v))return v.join(', ');if(typeof v==='object')continue;return String(v)}return''};
  const rows=[],add=(l,v,s)=>{if(v)rows.push([l,v,s||''])};
  add('Intérprete',t.artist,P0.username?'@'+P0.username:'');
  add('Participações',pick('featuring','feat','featured','participacoes','participações'));
  add('Compositores',pick('composer','composers','songwriter','songwriters','writers','writer','compositor','compositores'));
  add('Letra',pick('lyricist','lyricists','letrista','letristas'));
  add('Produção',pick('producer','producers','produtor','produtores'));
  add('Engenharia de som',pick('engineer','engineers','mixing','mix','mixagem'));
  add('Masterização',pick('mastering','mastered_by','masterizacao'));
  add('Gravadora',pick('label','gravadora','publisher'));
  add('Gênero',pick('genre','genero','gênero')||P0.artist_category);
  add('Álbum',t.rel);
  add('Faixa',t.num?`${t.num} de ${(DB.byRel[t.rid]||[]).length}`:'');
  add('Lançamento',fmtDate(R.created_at));
  add('Classificação',t.ex?'Explícito':'Livre');
  add('ISRC',pick('isrc','ISRC'));
  const y=R.created_at?new Date(R.created_at).getFullYear():'';
  add('Direitos',pick('copyright','p_line','c_line')||(y?`℗ ${y} ${t.artist}`:''));
  add('Publicado na beats por',nameOf(P0)+(P0.claimed?' ✓':''));
  const pl=playsOf(t);if(pl)add('Reproduções',pl.toLocaleString('pt-BR'));
  return rows;
}
SCREENS.credits=id=>{
  const t=DB.TM[id];if(!t)return`<p class="mut pad big" style="padding-top:220px">Música não encontrada.</p>`;
  const rows=creditsFor(t),q=DB.byRel[t.rid]||[t],i=Math.max(0,q.indexOf(t));
  return{html:`<div class="crw">
    <div class="cl">
      <i class="cbig" style="${coverStyle(t.cover,2)}"></i>
      <h1>${esc(t.title)}${t.ex?'<s class="e">E</s>':''}</h1>
      <p class="cart">${esc(t.artist)}</p>
      <button class="f pbtn white" data-first="1" ${A(()=>playQ(q,i))}>${ICON.play}Tocar</button>
    </div>
    <div class="cr glass"><h2>Créditos</h2>
      ${rows.map((r,k)=>`<div class="crow f" style="--i:${k}"><span>${esc(r[0])}</span><b>${esc(r[1])}</b>${r[2]?`<small>${esc(r[2])}</small>`:''}</div>`).join('')}
    </div></div><div class="endpad"></div>`};
};

/* ---------- NOVO ---------- */
SCREENS.new=()=>{
  const r0=DB.rels[0],T=DB.tracks,hot=byPlays(T).slice(0,10),fresh=T.slice(0,10);
  const ban=r0?`<div class="ban f" data-first="1" data-tint="#7a3a2e" ${A(()=>go('rel',r0.id))}><div class="bbg" style="${coverStyle(r0.cover_url,1)}"></div><div class="bsh"></div><i class="bcv" style="${coverStyle(r0.cover_url,1)}"></i><div class="btx"><small>Novo lançamento</small><b>${esc(r0.title)}</b><span>${esc(r0.artist)}</span></div></div>`:'';
  return{html:`<div class="pt"></div>${errBar()}${ban?sec('',ban,'first'):''}
   ${sec('Melhores Músicas Novas',fresh.length?`<div class="list two">${fresh.map((t,i)=>srow(t,i,fresh,{rel:1})).join('')}</div>`:empty('Nenhuma música publicada ainda.'))}
   ${sec('Lançamentos',DB.rels.length?row(DB.rels.slice(0,24).map(relCard).join('')):empty('Sem lançamentos.'))}
   ${hot.some(t=>playsOf(t)>0)?sec('Mais Tocadas',`<div class="list two">${hot.map((t,i)=>srow(t,i,hot,{rel:1,num:i+1})).join('')}</div>`):''}
   <div class="endpad"></div>`,after(){UI.rows()}};
};

/* ---------- RÁDIO ---------- */
SCREENS.radio=()=>{
  const tiles=[['Hits','#e8112d'],['Pop','#e0307a'],['Chill','#1e90ff'],['Club','#6a2bd8'],['Country','#d28a2e'],['Ao vivo','#18a874']];
  const mix=()=>shuffleArr(DB.tracks.slice()).slice(0,40);
  return{html:`<div class="pt"></div>
   ${sec('Ouça Rádio ao Vivo de Graça',row(tiles.map((t,i)=>`<div class="tile f" style="--i:${i};background:linear-gradient(160deg,${t[1]},#111 140%)" ${i===0?'data-first="1"':''} data-tint="${t[1]}" ${A(()=>playQ(mix(),0))}><b>${t[0]}</b><span>${LOGO} rádio</span><i class="pulse"></i></div>`).join('')),'first')}
   ${sec('Artistas',DB.artists.length?row(DB.artists.slice(0,24).map(artCircle).join('')):empty('Nenhum artista cadastrado.'))}
   <div class="endpad"></div>`};
};
