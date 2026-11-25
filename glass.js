'use strict';
/* Liquid glass: mesmo método do site (mapa de deslocamento em canvas -> filtro SVG com aberração cromática
   aplicado via backdrop-filter:url(#id)). Se o WebView não suportar, cai no vidro simples (blur + saturação). */
const LG={
  ns:'http://www.w3.org/2000/svg',
  get on(){try{return localStorage.getItem('beats-lg')!=='off'}catch(e){return true}},
  set(v){try{localStorage.setItem('beats-lg',v?'on':'off')}catch(e){}},
  reg:{},
  apply(el,id,bevel,maxd,rad,ca){
    if(!el||!LG.on)return;
    const svg=document.getElementById('lg-svg');
    if(!svg)return;
    if(LG.reg[id]){LG.reg[id].ro&&LG.reg[id].ro.disconnect();const old=svg.querySelector('#'+id);if(old)old.remove()}
    ca=ca==null?.1:ca;
    const f=document.createElementNS(LG.ns,'filter');
    f.setAttribute('id',id);f.setAttribute('filterUnits','userSpaceOnUse');f.setAttribute('primitiveUnits','userSpaceOnUse');
    f.setAttribute('x','0');f.setAttribute('y','0');f.setAttribute('color-interpolation-filters','sRGB');
    const S=maxd*2,ch=(k,m)=>`<feColorMatrix in="${k}" type="matrix" values="${m}" result="${k}c"/>`;
    f.innerHTML=`<feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="b"/>
<feImage class="m" x="0" y="0" preserveAspectRatio="none" result="map"/>
<feDisplacementMap in="b" in2="map" scale="${S*(1+ca)}" xChannelSelector="R" yChannelSelector="G" result="dr"/>`
    +ch('dr','1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0')
    +`<feDisplacementMap in="b" in2="map" scale="${S}" xChannelSelector="R" yChannelSelector="G" result="dg"/>`
    +ch('dg','0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0')
    +`<feDisplacementMap in="b" in2="map" scale="${S*(1-ca)}" xChannelSelector="R" yChannelSelector="G" result="db"/>`
    +ch('db','0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0')
    +`<feBlend in="drc" in2="dgc" mode="screen" result="rg"/><feBlend in="rg" in2="dbc" mode="screen"/>`;
    svg.appendChild(f);
    const M=f.querySelector('.m');let lw=0,lh=0;
    const build=()=>{
      const w=el.offsetWidth,h=el.offsetHeight;
      if(!w||!h||(w===lw&&h===lh))return;lw=w;lh=h;
      const k=2,cw=w*k,chh=h*k,c=document.createElement('canvas');c.width=cw;c.height=chh;
      const x=c.getContext('2d'),img=x.createImageData(cw,chh),d=img.data;
      const R=Math.min(rad||1e9,w/2,h/2),hx=w/2-R,hy=h/2-R,bv=Math.min(bevel,R);
      for(let j=0;j<chh;j++)for(let i=0;i<cw;i++){
        const px=(i+.5)/k-w/2,py=(j+.5)/k-h/2,qx=Math.abs(px)-hx,qy=Math.abs(py)-hy;
        const ox=Math.max(qx,0),oy=Math.max(qy,0),len=Math.hypot(ox,oy);
        const depth=-(len+Math.min(Math.max(qx,qy),0)-R);let m=0,nx=0,ny=0;
        if(depth<bv){
          const t=Math.min(1,Math.max(0,1-depth/bv));m=1-Math.sqrt(1-t*t);
          if(qx>0&&qy>0){nx=ox/len*Math.sign(px);ny=oy/len*Math.sign(py)}
          else if(qx>qy){nx=Math.sign(px)}else{ny=Math.sign(py)}
        }
        const o=(j*cw+i)*4;d[o]=128-127*nx*m;d[o+1]=128-127*ny*m;d[o+2]=128;d[o+3]=255;
      }
      x.putImageData(img,0,0);const u=c.toDataURL('image/png');
      M.setAttribute('href',u);M.setAttributeNS('http://www.w3.org/1999/xlink','href',u);
      [f,M].forEach(n=>{n.setAttribute('width',w);n.setAttribute('height',h)});
      const v=`url(#${id}) saturate(1.6) brightness(1.1)`;
      el.style.webkitBackdropFilter=v;el.style.backdropFilter=v;el.classList.add('lg-on');
    };
    build();
    const ro=window.ResizeObserver?new ResizeObserver(build):null;
    if(ro)ro.observe(el);
    LG.reg[id]={ro};
  },
  /* liga/desliga tudo (usado pelo seletor nas configurações do perfil) */
  refresh(){
    $$('.lg-on').forEach(e=>{e.style.webkitBackdropFilter='';e.style.backdropFilter='';e.classList.remove('lg-on')});
    const s=document.getElementById('lg-svg');if(s)s.innerHTML='';LG.reg={};
    if(window.UI&&UI.glassAll)UI.glassAll();
  }
};
