'use strict';
/* Mesmo backend do site: Supabase (releases, release_tracks, profiles, streams). */
const SB_URL='https://qimhsxuvuqpsybcbpuwq.supabase.co',SB_KEY='sb_publishable_cW0GTnKr50A4pYrbEtlhmg_HDthwwy7';
const sb=window.supabase?window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'beats-tv-auth'}}):null;
const PF='id,display_name,username,avatar_url,photo_url,bio,role,claimed,artist_category';
const LIMIT=200; // quantos lançamentos carregar para o catálogo
const DB={ready:false,err:'',rels:[],tracks:[],artists:[],plays:{},RM:{},AM:{},TM:{},byRel:{},user:null,prof:null};

async function loadDB(){
  try{
    if(!sb)throw Error('biblioteca do Supabase não carregou');
    let r=await sb.from('releases').select('*').order('created_at',{ascending:false}).limit(LIMIT);
    if(r.error)r=await sb.from('releases').select('id,artist_id,title,cover_url,explicit,created_at').order('created_at',{ascending:false}).limit(LIMIT);
    if(r.error)throw r.error;
    const rels=r.data||[],ids=rels.map(x=>x.id),aids=[...new Set(rels.map(x=>x.artist_id).filter(Boolean))];
    const getT=async c=>{let q=await sb.from('release_tracks').select('*').in('release_id',c).order('track_number');
      if(q.error)q=await sb.from('release_tracks').select('id,release_id,track_number,title,audio_url,explicit').in('release_id',c).order('track_number');
      return q.data||[]};
    const getP=async c=>{const q=await sb.from('profiles').select(PF).in('id',c);return q.data||[]};
    const [tt,pp,ar]=await Promise.all([
      Promise.all(chunk(ids).map(getT)),
      Promise.all(chunk(aids).map(getP)),
      sb.from('profiles').select(PF).eq('role','artist').limit(80)
    ]);
    const prof={};[].concat(...pp,(ar.data||[])).forEach(p=>prof[p.id]=p);
    DB.AM=prof;
    const rows=[].concat(...tt);
    const vs=new Set(rows.filter(x=>isVid(x.audio_url)).map(x=>x.release_id));
    DB.rels=rels.filter(x=>!vs.has(x.id)).map(x=>({...x,artist:nameOf(prof[x.artist_id]),artistP:prof[x.artist_id]||null}));
    DB.RM={};DB.rels.forEach(x=>DB.RM[x.id]=x);
    DB.byRel={};
    DB.tracks=rows.filter(x=>DB.RM[x.release_id]&&x.audio_url&&!isVid(x.audio_url)).map(x=>{
      const R=DB.RM[x.release_id];
      return{id:x.id,rid:R.id,title:x.title,artist:R.artist,artistId:R.artist_id,cover:R.cover_url,audio:x.audio_url,
        ex:!!(x.explicit||R.explicit),rel:R.title,at:R.created_at,num:x.track_number,raw:x,rawRel:R}
    }).sort((a,b)=>(b.at>a.at)-(b.at<a.at));
    DB.TM={};DB.tracks.forEach(t=>{DB.TM[t.id]=t;(DB.byRel[t.rid]=DB.byRel[t.rid]||[]).push(t)});
    Object.values(DB.byRel).forEach(l=>l.sort((a,b)=>(a.num||0)-(b.num||0)));
    const seen={};
    DB.artists=Object.values(prof).filter(p=>(p.role==='artist'||aids.includes(p.id))&&!seen[p.id]&&(seen[p.id]=1))
      .sort((a,b)=>(!!photo(b))-(!!photo(a)));
  }catch(e){DB.err=(e&&e.message)||String(e)}
  try{ // reproduções (ranking). Opcional.
    const r=await sb.rpc('track_plays');
    if(!r.error&&Array.isArray(r.data))r.data.forEach(x=>{DB.plays[x.track_key]=Number(x.plays)||0});
  }catch(e){}
  DB.ready=true;
}
const playsOf=t=>DB.plays['rt:'+t.id]||0;
const byPlays=l=>l.slice().sort((a,b)=>playsOf(b)-playsOf(a));
const tracksOfArtist=id=>DB.tracks.filter(t=>t.artistId===id);
const relsOfArtist=id=>DB.rels.filter(r=>r.artist_id===id);

async function loadUser(){
  if(!sb)return;
  try{
    const s=await sb.auth.getSession();
    DB.user=s&&s.data&&s.data.session?s.data.session.user:null;DB.prof=null;
    if(DB.user){
      const q=await sb.from('profiles').select('*').eq('id',DB.user.id).maybeSingle();
      DB.prof=q.data||{id:DB.user.id,display_name:(DB.user.email||'').split('@')[0]};
      DB.AM[DB.prof.id]=Object.assign(DB.AM[DB.prof.id]||{},DB.prof);
    }
  }catch(e){}
}
async function signIn(email,password){
  if(!sb)throw Error('Supabase não carregou');
  const r=await sb.auth.signInWithPassword({email,password});
  if(r.error)throw r.error;
  await loadUser();
}
async function signOut(){try{await sb.auth.signOut()}catch(e){}DB.user=null;DB.prof=null}
async function fetchProfile(id){
  if(DB.AM[id])return DB.AM[id];
  try{const q=await sb.from('profiles').select(PF).eq('id',id).maybeSingle();if(q.data){DB.AM[id]=q.data;return q.data}}catch(e){}
  return null;
}
/* reproduções recentes do usuário logado (tabela streams) */
async function loadRecents(){
  if(!DB.user)return null;
  try{
    const q=await sb.from('streams').select('track_name,artist,art,release_track_id').eq('user_id',DB.user.id).order('created_at',{ascending:false}).limit(40);
    if(q.error)return null;
    const seen={},out=[];
    (q.data||[]).forEach(s=>{
      const t=s.release_track_id&&DB.TM[s.release_track_id];
      if(t&&!seen[t.id]){seen[t.id]=1;out.push(t)}
    });
    return out.slice(0,14);
  }catch(e){return null}
}
function logStream(t){
  if(!DB.user||!sb||!t)return;
  DB.plays['rt:'+t.id]=(DB.plays['rt:'+t.id]||0)+1;
  sb.from('streams').insert({user_id:DB.user.id,track_key:'rt:'+t.id,track_name:t.title,artist:t.artist,art:t.cover,release_track_id:t.id,artist_uid:t.artistId}).then(()=>{},()=>{});
}
/* busca local no catálogo carregado */
function searchDB(q){
  q=q.trim().toLowerCase();if(!q)return{artists:[],tracks:[],rels:[]};
  const has=s=>String(s||'').toLowerCase().includes(q);
  return{
    artists:DB.artists.filter(a=>has(a.display_name)||has(a.username)||has(a.artist_category)),
    tracks:DB.tracks.filter(t=>has(t.title)||has(t.artist)||has(t.rel)).slice(0,24),
    rels:DB.rels.filter(r=>has(r.title)||has(r.artist)).slice(0,16)
  };
}
