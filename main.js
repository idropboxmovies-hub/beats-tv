'use strict';
(async function(){
  fit();
  UI.buildTop();UI.buildMini();UI.buildNP();
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  await Promise.all([loadDB(),loadUser(),wait(1500)]);
  NAV.push({s:'home'});
  render();
  const sp=$('#splash');sp.classList.add('out');setTimeout(()=>sp.remove(),900);
  UI.glassAll();
  UI.state();UI.progress();
  if(sb)sb.auth.onAuthStateChange((ev)=>{if(ev==='SIGNED_OUT'){DB.user=null;DB.prof=null}});
})();
