'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enc=u=>esc(encodeURI(String(u)).replace(/'/g,'%27'));
const bgImg=u=>`background-image:url('${enc(u)}');background-size:cover;background-position:center`;
const GR=[['#5b3a2e','#c9864a'],['#8a0f1c','#e3323f'],['#444','#aaa'],['#2b2b2b','#d9a76a'],['#1c3b5a','#5aa0d8'],['#4a2a5e','#c06ad0'],['#6a5a3a','#d8c9a8'],['#222','#7a1a3a']];
const gradBg=i=>`background:linear-gradient(135deg,${GR[Math.abs(i)%GR.length][0]},${GR[Math.abs(i)%GR.length][1]})`;
const coverStyle=(u,i)=>u?bgImg(u):gradBg(i||0);
const photo=a=>(a&&(a.photo_url||a.avatar_url))||'';
const nameOf=a=>(a&&(a.display_name||a.username))||'Artista';
const initial=s=>String(s||'?').trim().charAt(0).toUpperCase()||'?';
const shuffleArr=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const chunk=(a,n=50)=>{const o=[];for(let k=0;k<a.length;k+=n)o.push(a.slice(k,k+n));return o};
const isVid=u=>/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u||'');
const fmtDate=d=>{try{return new Date(d).toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}catch(e){return ''}};
const fmtTime=s=>{if(!isFinite(s)||s<0)s=0;const m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+(x<10?'0':'')+x};
const ICON={
 home:'<svg viewBox="0 0 24 24"><path d="M3 11.2 12 3l9 8.2V21h-6v-6H9v6H3z"/></svg>',
 star:'<svg viewBox="0 0 24 24"><path d="M12 2.8l2.7 5.7 6.2.8-4.6 4.3 1.2 6.2L12 16.7 6.5 19.8l1.2-6.2L3.1 9.3l6.2-.8z"/></svg>',
 radio:'<svg viewBox="0 0 24 24"><path d="M5 9a9 9 0 0 0 0 6M19 9a9 9 0 0 1 0 6M8.2 10.6a4.6 4.6 0 0 0 0 2.8M15.8 10.6a4.6 4.6 0 0 1 0 2.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="2.1"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
 user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.2"/><path d="M3.8 21c.6-4.4 3.6-6.6 8.2-6.6s7.6 2.2 8.2 6.6z"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
 pause:'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>',
 next:'<svg viewBox="0 0 24 24"><path d="M5 5v14l10-7zM17 5h2.4v14H17z"/></svg>',
 prev:'<svg viewBox="0 0 24 24"><path d="M19 5v14L9 12zM4.6 5H7v14H4.6z"/></svg>',
 shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3.5c5 0 6 10 11 10H21M3 17h3.5c1.8 0 3-1.4 4-3M14 8.6C15 7.6 16 7 17.5 7H21M18.5 4 21 7l-2.5 3M18.5 14 21 17l-2.5 3"/></svg>',
 repeat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V9a3 3 0 0 1 3-3h13M17 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H4M7 21l-3-3 3-3"/></svg>',
 chevL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4 7 12l8 8"/></svg>',
 chevD:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>',
 info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
 note:'<svg viewBox="0 0 24 24"><path d="M9 3v11.3A3.5 3.5 0 1 0 11 17.5V8l8-1.8v6.1A3.5 3.5 0 1 0 21 15.5V3z"/></svg>',
 bolt:'<svg viewBox="0 0 100 130" fill="none" stroke-linejoin="round"><path d="M64 6 12 66h38L36 124 94 54H54z" stroke="#c8f7b0" stroke-width="3.2"/><path d="M62 18 26 62h34l-10 46 36-44H52z" stroke="#c8f7b0" stroke-width="1.6" opacity=".7"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="M12 2l2.4 1.8 3-.1 1 2.8 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-1 2.8-3-.1L12 22l-2.4-1.8-3 .1-1-2.8-2.5-1.7.9-2.9-.9-2.9 2.5-1.7 1-2.8 3 .1z" fill="currentColor"/><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const LOGO=`<span class="lgo">${ICON.note}beats</span>`;
