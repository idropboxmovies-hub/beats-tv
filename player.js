'use strict';
const P={q:[],i:-1,playing:false,shuffle:false,rep:0,au:new Audio()};
P.au.preload='auto';
Object.defineProperty(P,'t',{get(){return P.q[P.i]||null}});
P.play=(q,i,o)=>{
  o=o||{};if(!q||!q.length)return toast('Nada para tocar ainda');
  let list=q.slice();i=i||0;
  if(o.shuffle){const cur=list[i];shuffleArr(list);if(o.first)list.unshift(list.splice(list.indexOf(o.first),1)[0]);i=0;P.shuffle=true}
  else if(o.shuffle===false)P.shuffle=false;
  P.q=list;P.i=Math.min(i,list.length-1);P.load();
};
P.load=()=>{
  const t=P.t;if(!t)return;
  P.au.src=t.audio;
  const pr=P.au.play();if(pr&&pr.catch)pr.catch(()=>{});
  logStream(t);UI.track();
};
P.toggle=()=>{if(!P.t)return;if(P.au.paused){const pr=P.au.play();if(pr&&pr.catch)pr.catch(()=>{})}else P.au.pause()};
P.next=auto=>{
  if(!P.q.length)return;
  if(auto&&P.rep===2){P.au.currentTime=0;P.au.play();return}
  if(P.i+1<P.q.length){P.i++;P.load()}
  else if(P.rep===1||!auto){P.i=0;P.load()}
  else{P.au.pause();P.au.currentTime=0}
};
P.prev=()=>{
  if(!P.q.length)return;
  if(P.au.currentTime>3){P.au.currentTime=0;return}
  P.i=P.i>0?P.i-1:P.q.length-1;P.load();
};
P.jump=i=>{if(i>=0&&i<P.q.length){P.i=i;P.load()}};
P.seek=d=>{if(!P.t)return;const x=Math.max(0,Math.min((P.au.duration||1e9)-.5,P.au.currentTime+d));P.au.currentTime=x;UI.progress()};
P.toggleShuffle=()=>{
  P.shuffle=!P.shuffle;
  if(P.t){const cur=P.t;if(P.shuffle){const rest=P.q.filter(x=>x!==cur);shuffleArr(rest);P.q=[cur].concat(rest);P.i=0}}
  UI.track();toast(P.shuffle?'Aleatório ligado':'Aleatório desligado');
};
P.cycleRepeat=()=>{P.rep=(P.rep+1)%3;UI.track();toast(['Repetir desligado','Repetir tudo','Repetir uma'][P.rep])};
P.au.addEventListener('play',()=>{P.playing=true;UI.state()});
P.au.addEventListener('pause',()=>{P.playing=false;UI.state()});
P.au.addEventListener('timeupdate',()=>UI.progress());
P.au.addEventListener('loadedmetadata',()=>UI.progress());
P.au.addEventListener('ended',()=>P.next(true));
P.au.addEventListener('error',()=>{if(!P.t)return;toast('Não foi possível tocar “'+P.t.title+'”');setTimeout(()=>{if(P.i+1<P.q.length)P.next(true)},1200)});
