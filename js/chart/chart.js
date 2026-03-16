// ═══════════════════════════════════════════════════════════
// NEXUS CHART ENGINE — tested standalone, now integrated
// ═══════════════════════════════════════════════════════════
const CFG = {
  UP:'#26a69a', DN:'#ef5350',
  GRID:'rgba(255,255,255,0.04)',
  TEXT:'rgba(100,140,170,0.8)',
  CROSS:'rgba(160,200,220,0.3)',
  PW:62, TH:20, SUB:0, VOL:0.12   // SUB=0: main chart fills full height, sub is separate canvas
};
const ST = {
  candles:[], ha:[], type:'candle', sub:'rsi', tf:15,
  inds:{ma20:false,ma50:false,bb:false,vwap:false},
  tool:'cursor', drawings:[], drawStart:null,
  rightOffset:0, barsVis:80,
  mx:-1, my:-1, drag:false, dragX0:0, dragOff0:0,
  W:0, H:0, mH:0, pMin:0, pMax:1,
  barsData:[], startIdx:0, barW:0, barSpacing:0,
};
let CH_ctx, CH_subCtx, CH_dirty=true, CH_DPR=1;

// ── DATA ──────────────────────────────────────────────────
function CH_gen(pair) {
  const info=S.prices[pair]||{p:1.0843,d:5};
  const dp=info.d;
  const targetPrice=info.p;
  const vol=targetPrice*0.0018;
  ST.candles=[]; const now=Date.now();
  // Start from ~3% below target, trend toward it over 400 candles
  let p=targetPrice*(0.97+Math.random()*0.02);
  for(let i=400;i>=0;i--){
    // slight drift toward target price
    const drift=(targetPrice-p)*0.004;
    const bias=(Math.random()-0.47)*0.25+drift/vol;
    const o=p+(Math.random()-0.5)*vol*0.3;
    const c=o+bias*vol+(Math.random()-0.5)*vol*0.5;
    const sw=Math.abs(c-o)+Math.random()*vol*0.3;
    const h=Math.max(o,c)+Math.random()*sw*0.5;
    const l=Math.min(o,c)-Math.random()*sw*0.5;
    ST.candles.push({o:+o.toFixed(dp),h:+h.toFixed(dp),l:+l.toFixed(dp),c:+c.toFixed(dp),v:Math.floor(80+Math.random()*800),t:now-i*ST.tf*60000});
    p=c;
  }
  // Force last candle close to match real price
  if(ST.candles.length){
    const last=ST.candles[ST.candles.length-1];
    last.c=+targetPrice.toFixed(dp);
    last.h=Math.max(last.h,last.c);
    last.l=Math.min(last.l,last.c);
  }
  CH_buildHA(); ST.rightOffset=0; ST.barsVis=80; CH_dirty=true;
}
function CH_buildHA(){
  ST.ha=[];
  ST.candles.forEach((d,i)=>{
    const hC=(d.o+d.h+d.l+d.c)/4;
    const hO=i===0?(d.o+d.c)/2:(ST.ha[i-1].o+ST.ha[i-1].c)/2;
    ST.ha.push({o:hO,h:Math.max(d.h,hO,hC),l:Math.min(d.l,hO,hC),c:hC,v:d.v,t:d.t});
  });
}
function CH_data(){ return ST.type==='heikin'?ST.ha:ST.candles; }

// ── INDICATORS ────────────────────────────────────────────
function CH_sma(arr,p){ return arr.map((_,i)=>i<p-1?null:arr.slice(i-p+1,i+1).reduce((s,v)=>s+v,0)/p); }
function CH_ema(arr,p){ const k=2/(p+1);let e=arr[0];return arr.map((v,i)=>{e=i===0?v:v*k+e*(1-k);return e;}); }
function CH_bb(cls,p=20){ const ma=CH_sma(cls,p);return cls.map((_,i)=>{if(i<p-1)return null;const sl=cls.slice(i-p+1,i+1),m=ma[i],sd=Math.sqrt(sl.reduce((a,v)=>a+(v-m)**2,0)/p);return{u:m+2*sd,m,l:m-2*sd};}); }
function CH_rsi(cls,p=14){ const out=[];let ag=0,al=0;for(let i=1;i<cls.length;i++){const d=cls[i]-cls[i-1],g=d>0?d:0,l=d<0?-d:0;if(i<=p){ag+=g/p;al+=l/p;out.push(null);continue;}ag=(ag*(p-1)+g)/p;al=(al*(p-1)+l)/p;out.push(al===0?100:100-100/(1+ag/al));}return out; }
function CH_macd(cls){ const k12=2/13,k26=2/27,k9=2/10;let e12=cls[0],e26=cls[0],sg=0;const m=[],s=[],h=[];cls.forEach((v,i)=>{e12=i===0?v:v*k12+e12*(1-k12);e26=i===0?v:v*k26+e26*(1-k26);const mc=e12-e26;sg=i===0?mc:mc*k9+sg*(1-k9);m.push(mc);s.push(sg);h.push(mc-sg);});return{m,s,h}; }
function CH_stoch(bars,p=14){ return bars.map((_,i)=>{if(i<p-1)return null;const sl=bars.slice(i-p+1,i+1),lo=Math.min(...sl.map(b=>b.l)),hi=Math.max(...sl.map(b=>b.h));return hi===lo?50:(bars[i].c-lo)/(hi-lo)*100;}); }
function CH_vwap(bars){ let cv=0,cw=0;return bars.map(b=>{const tp=(b.h+b.l+b.c)/3;cv+=tp*b.v;cw+=b.v;return cv/cw;}); }

// ── LAYOUT ────────────────────────────────────────────────
function CH_niceStep(range,count){ const raw=range/count,mag=Math.pow(10,Math.floor(Math.log10(raw)));for(const s of[1,2,2.5,5,10])if(s*mag>=raw)return s*mag;return mag*10; }
function CH_layout(){
  const all=CH_data(),n=all.length;
  const bv=Math.max(5,Math.min(ST.barsVis,n));
  const end=Math.max(bv,n-ST.rightOffset);
  const start=Math.max(0,end-bv);
  ST.barsData=all.slice(start,end); ST.startIdx=start;
  const prices=ST.barsData.flatMap(b=>[b.h,b.l]);
  let pMin=Math.min(...prices),pMax=Math.max(...prices);
  const r=pMax-pMin||pMin*0.01;
  ST.pMin=pMin-r*0.18; ST.pMax=pMax+r*0.18;
  const cW=ST.W-CFG.PW;
  ST.mH=ST.H-CFG.TH-CFG.SUB-1;
  ST.barSpacing=cW/Math.max(1,ST.barsData.length);
  ST.barW=Math.max(1,ST.barSpacing*0.72);
}
const pToY=p=>CFG.SUB+ST.mH*(1-(p-ST.pMin)/(ST.pMax-ST.pMin));
const xOfBar=i=>(i+0.5)*ST.barSpacing;
const barAtX=x=>Math.round(x/ST.barSpacing-0.5);

// ── RESIZE ────────────────────────────────────────────────
function CH_resize(){
  const area=document.getElementById('mainChartArea');
  const subPanel=document.getElementById('subChartPanel')||document.querySelector('.sub-chart-panel');
  const mc=document.getElementById('tvCanvas');
  const sc=document.getElementById('subCanvas');
  if(!area||!mc) return;
  CH_DPR=window.devicePixelRatio||1;
  const W=area.clientWidth, H=area.clientHeight;
  if(!W||!H) return;
  mc.width=W*CH_DPR; mc.height=H*CH_DPR;
  mc.style.width=W+'px'; mc.style.height=H+'px';
  CH_ctx=mc.getContext('2d'); CH_ctx.scale(CH_DPR,CH_DPR);
  ST.W=W; ST.H=H;
  if(subPanel&&sc){
    const sW=subPanel.clientWidth,sH=subPanel.clientHeight;
    sc.width=sW*CH_DPR; sc.height=sH*CH_DPR;
    sc.style.width=sW+'px'; sc.style.height=sH+'px';
    CH_subCtx=sc.getContext('2d'); CH_subCtx.scale(CH_DPR,CH_DPR);
  }
}

// ── DRAW MAIN ─────────────────────────────────────────────
function CH_drawMain(){
  if(!CH_ctx) return;
  const ctx=CH_ctx, bars=ST.barsData, cW=ST.W-CFG.PW, mH=ST.mH, dp=S.prices[S.pair]?.d||5;
  ctx.fillStyle='#0b1017'; ctx.fillRect(0,0,ST.W,ST.H);
  // grid
  ctx.strokeStyle=CFG.GRID; ctx.lineWidth=0.5;
  const pStep=CH_niceStep(ST.pMax-ST.pMin,7);
  let pg=Math.ceil(ST.pMin/pStep)*pStep;
  ctx.font='9px JetBrains Mono'; ctx.textAlign='left';
  while(pg<=ST.pMax){
    const y=pToY(pg);
    if(y>CFG.SUB&&y<CFG.SUB+mH){
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cW,y);ctx.stroke();
      ctx.fillStyle=CFG.TEXT; ctx.fillText(pg.toFixed(dp),cW+4,y+3);
    }
    pg+=pStep;
  }
  const tStep=Math.max(1,Math.floor(bars.length/8));
  // ── Trading Sessions background ────────────────────────
  bars.forEach((b,i)=>{
    const hr=new Date(b.t).getUTCHours();
    let sessionColor=null;
    if(hr>=0&&hr<8)   sessionColor='rgba(139,92,246,0.04)';   // Tokyo — purple
    if(hr>=8&&hr<16)  sessionColor='rgba(0,212,255,0.05)';    // London — cyan
    if(hr>=13&&hr<21) sessionColor='rgba(245,197,24,0.04)';   // New York — gold
    if(sessionColor){
      const x=xOfBar(i)-ST.barSpacing/2;
      ctx.fillStyle=sessionColor;
      ctx.fillRect(x,0,ST.barSpacing,mH);
    }
  });
  // Session legend
  [['Tokyo','rgba(139,92,246,0.7)',0],['London','rgba(0,212,255,0.7)',55],['New York','rgba(245,197,24,0.7)',115]].forEach(([name,col,ox])=>{
    ctx.fillStyle=col; ctx.font='8px JetBrains Mono'; ctx.textAlign='left';
    ctx.fillText('■ '+name, ox+5, 14);
  });
  for(let i=0;i<bars.length;i+=tStep){
    const x=xOfBar(i);
    ctx.strokeStyle=CFG.GRID; ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(x,CFG.SUB);ctx.lineTo(x,CFG.SUB+mH);ctx.stroke();
    const d=new Date(bars[i].t);
    ctx.textAlign='center'; ctx.fillStyle=CFG.TEXT;
    ctx.fillText(`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,x,ST.H-4);
  }
  // volume
  const maxV=Math.max(...bars.map(b=>b.v),1);
  bars.forEach((b,i)=>{
    const x=xOfBar(i),vH=(b.v/maxV)*mH*CFG.VOL;
    ctx.fillStyle=b.c>=b.o?'rgba(38,166,154,0.45)':'rgba(239,83,80,0.45)';
    ctx.fillRect(x-ST.barW/2,CFG.SUB+mH-vH,ST.barW,vH);
  });
  // bollinger
  if(ST.inds.bb){
    const all=CH_data(),cls=all.map(b=>b.c);
    const bb=CH_bb(cls).slice(ST.startIdx,ST.startIdx+bars.length);
    ctx.beginPath();bb.forEach((v,i)=>{if(v)ctx.lineTo(xOfBar(i),pToY(v.u));});
    for(let i=bb.length-1;i>=0;i--)if(bb[i])ctx.lineTo(xOfBar(i),pToY(bb[i].l));
    ctx.fillStyle='rgba(0,200,255,0.03)';ctx.fill();
    ['u','l'].forEach(k=>{
      ctx.beginPath();ctx.strokeStyle='rgba(0,200,255,0.4)';ctx.lineWidth=1;ctx.setLineDash([5,4]);
      bb.forEach((v,i)=>{if(!v)return;const x=xOfBar(i),y=pToY(v[k]);i===0||!bb[i-1]?ctx.moveTo(x,y):ctx.lineTo(x,y);});
      ctx.stroke();ctx.setLineDash([]);
    });
    ctx.beginPath();ctx.strokeStyle='rgba(0,200,255,0.2)';ctx.lineWidth=0.8;
    bb.forEach((v,i)=>{if(!v)return;const x=xOfBar(i),y=pToY(v.m);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();
  }
  // MAs
  const all=CH_data(),cls=all.map(b=>b.c);
  [[ST.inds.ma20,20,'#f5c518'],[ST.inds.ma50,50,'#8b5cf6']].forEach(([on,p,col])=>{
    if(!on)return;
    const vals=CH_sma(cls,p).slice(ST.startIdx,ST.startIdx+bars.length);
    ctx.beginPath();ctx.strokeStyle=col;ctx.lineWidth=1.5;let s=false;
    vals.forEach((v,i)=>{if(v===null)return;const x=xOfBar(i),y=pToY(v);if(!s){ctx.moveTo(x,y);s=true;}else ctx.lineTo(x,y);});ctx.stroke();
  });
  // VWAP
  if(ST.inds.vwap){
    const vw=CH_vwap(all).slice(ST.startIdx,ST.startIdx+bars.length);
    ctx.beginPath();ctx.strokeStyle='#ff9500';ctx.lineWidth=1.5;ctx.setLineDash([6,3]);
    vw.forEach((v,i)=>{const x=xOfBar(i),y=pToY(v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();ctx.setLineDash([]);
  }
  // candles
  if(ST.type==='line'||ST.type==='area'){
    ctx.beginPath();ctx.strokeStyle=CFG.UP;ctx.lineWidth=2;
    bars.forEach((b,i)=>{const x=xOfBar(i),y=pToY(b.c);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    if(ST.type==='area'){
      ctx.lineTo(xOfBar(bars.length-1),CFG.SUB+mH);ctx.lineTo(xOfBar(0),CFG.SUB+mH);ctx.closePath();
      const g=ctx.createLinearGradient(0,CFG.SUB,0,CFG.SUB+mH);
      g.addColorStop(0,'rgba(38,166,154,0.28)');g.addColorStop(1,'rgba(38,166,154,0.01)');
      ctx.fillStyle=g;ctx.fill();
      ctx.beginPath();ctx.strokeStyle=CFG.UP;ctx.lineWidth=2;
      bars.forEach((b,i)=>{const x=xOfBar(i),y=pToY(b.c);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    }
    ctx.stroke();
  } else {
    bars.forEach((b,i)=>{
      const x=xOfBar(i),up=b.c>=b.o,uc=CFG.UP,dc=CFG.DN;
      const yH=pToY(b.h),yL=pToY(b.l),yO=pToY(b.o),yC=pToY(b.c);
      const bTop=Math.min(yO,yC),bH=Math.max(1,Math.abs(yO-yC)),hw=ST.barW/2;
      if(ST.type==='bar'){
        ctx.strokeStyle=up?uc:dc;ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(x,yH);ctx.lineTo(x,yL);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x-hw,yO);ctx.lineTo(x,yO);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x,yC);ctx.lineTo(x+hw,yC);ctx.stroke();
      } else {
        ctx.strokeStyle=up?'rgba(38,166,154,0.5)':'rgba(239,83,80,0.5)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x,yH);ctx.lineTo(x,bTop);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x,bTop+bH);ctx.lineTo(x,yL);ctx.stroke();
        if(ST.type==='hollow'){
          if(up){ctx.strokeStyle=uc;ctx.lineWidth=1.5;ctx.strokeRect(x-hw,bTop,ST.barW,bH);}
          else{ctx.fillStyle=dc;ctx.fillRect(x-hw,bTop,ST.barW,bH);}
        } else {
          ctx.fillStyle=up?'rgba(38,166,154,0.85)':'rgba(239,83,80,0.85)';
          ctx.fillRect(x-hw,bTop,ST.barW,bH);
          ctx.strokeStyle=up?'rgba(38,166,154,0.3)':'rgba(239,83,80,0.3)';ctx.lineWidth=0.5;
          ctx.strokeRect(x-hw,bTop,ST.barW,bH);
        }
      }
    });
  }
  // drawings
  CH_renderDrawings(ctx,cW,dp);
  // ── Last candle highlight + NOW line ──────────────────
  const last=bars[bars.length-1];
  if(last){
    const lx=xOfBar(bars.length-1);
    // Vertical "NOW" glow line on last candle
    ctx.strokeStyle='rgba(0,212,255,0.18)';ctx.lineWidth=ST.barW+2;
    ctx.beginPath();ctx.moveTo(lx,0);ctx.lineTo(lx,mH);ctx.stroke();
    // NOW label at top
    ctx.fillStyle='rgba(0,212,255,0.6)';ctx.font='bold 8px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText('NOW',lx,10);

    // Horizontal current price dashed line
    const ly=pToY(last.c);
    ctx.setLineDash([4,5]);ctx.strokeStyle='rgba(0,212,255,0.55)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,ly);ctx.lineTo(cW,ly);ctx.stroke();ctx.setLineDash([]);

    // Price badge on Y axis — green if up, red if down
    const prevC=bars.length>1?bars[bars.length-2].c:last.c;
    const isUp=last.c>=prevC;
    ctx.fillStyle=isUp?'rgba(38,166,154,0.95)':'rgba(239,83,80,0.95)';
    ctx.fillRect(cW,ly-9,CFG.PW,18);
    ctx.fillStyle='#fff';ctx.font='bold 9px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText(last.c.toFixed(dp),cW+CFG.PW/2,ly+3);

    // Update header
    const chP=document.getElementById('chPrice');
    const chChg=document.getElementById('chChange');
    if(chP) chP.textContent=last.c.toFixed(dp);
    if(chP) chP.className='ch-price '+(isUp?'up':'dn');
    if(chChg){
      const pct=((last.c-prevC)/prevC*100);
      chChg.textContent=(isUp?'▲ +':'▼ ')+pct.toFixed(2)+'%';
      chChg.className='ch-change '+(isUp?'up':'dn');
    }
    const tpl=document.getElementById('tradePriceLive');
    if(tpl) tpl.textContent=last.c.toFixed(dp);
  }
  // crosshair
  if(ST.mx>=0&&ST.mx<=cW&&ST.my>=CFG.SUB&&ST.my<=CFG.SUB+mH){
    ctx.strokeStyle=CFG.CROSS;ctx.lineWidth=0.8;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(ST.mx,CFG.SUB);ctx.lineTo(ST.mx,CFG.SUB+mH);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,ST.my);ctx.lineTo(cW,ST.my);ctx.stroke();ctx.setLineDash([]);
    const hp=ST.pMax-(ST.pMax-ST.pMin)*((ST.my-CFG.SUB)/mH);
    ctx.fillStyle='rgba(0,55,75,0.95)';ctx.fillRect(cW,ST.my-9,CFG.PW,18);
    ctx.fillStyle='#e0f4ff';ctx.font='9px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText(hp.toFixed(dp),cW+CFG.PW/2,ST.my+3);
    const bi=Math.max(0,Math.min(bars.length-1,barAtX(ST.mx)));
    if(bars[bi]){
      const d=new Date(bars[bi].t);
      const ts=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      const tw=ctx.measureText(ts).width+8;
      ctx.fillStyle='rgba(0,55,75,0.95)';ctx.fillRect(ST.mx-tw/2,ST.H-CFG.TH,tw,CFG.TH);
      ctx.fillStyle='#e0f4ff';ctx.textAlign='center';ctx.fillText(ts,ST.mx,ST.H-CFG.TH+13);
      const b=bars[bi];
      document.getElementById('chO').textContent=b.o.toFixed(dp);
      document.getElementById('chH').textContent=b.h.toFixed(dp);
      document.getElementById('chL').textContent=b.l.toFixed(dp);
      document.getElementById('chV').textContent=(b.v/1000).toFixed(1)+'K';
    }
  }
  // drawing preview
  if(ST.drawStart&&ST.mx>=0){
    const x1=xOfBar(ST.drawStart.b-ST.startIdx),y1=pToY(ST.drawStart.p);
    ctx.strokeStyle='rgba(255,200,0,0.5)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
    ctx.beginPath();
    if(ST.tool==='trend'||ST.tool==='fib'){ctx.moveTo(x1,y1);ctx.lineTo(ST.mx,ST.my);}
    else if(ST.tool==='rect'){ctx.rect(Math.min(x1,ST.mx),Math.min(y1,ST.my),Math.abs(ST.mx-x1),Math.abs(ST.my-y1));}
    ctx.stroke();ctx.setLineDash([]);
  }
}

// ── DRAW SUB ──────────────────────────────────────────────
function CH_drawSub(){
  if(!CH_subCtx) return;
  const ctx=CH_subCtx;
  const subPanel=document.getElementById('subChartPanel')||document.querySelector('.sub-chart-panel');
  if(!subPanel)return;
  const W=subPanel.clientWidth,H=subPanel.clientHeight;
  if(!W||!H)return;
  const cW=W-CFG.PW;
  ctx.fillStyle='#080d14';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(0,212,255,0.1)';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.stroke();
  const all=CH_data(),cls=all.map(b=>b.c);
  const bars=ST.barsData;
  const bSp=cW/Math.max(1,bars.length);
  const xB=i=>(i+0.5)*bSp;
  const lbl=document.getElementById('subLabel');
  if(ST.sub==='rsi'){
    const rsi=CH_rsi(cls).slice(ST.startIdx,ST.startIdx+bars.length);
    // Overbought/Oversold fill zones
    ctx.fillStyle='rgba(239,83,80,0.08)';
    ctx.fillRect(0,0,cW,H*0.3);           // above 70
    ctx.fillStyle='rgba(38,166,154,0.08)';
    ctx.fillRect(0,H*0.7,cW,H*0.3);       // below 30
    // Level lines
    [[30,'rgba(239,83,80,0.4)'],[50,'rgba(100,140,170,0.2)'],[70,'rgba(239,83,80,0.4)']].forEach(([lv,c])=>{
      const y=H*(1-lv/100);ctx.strokeStyle=c;ctx.lineWidth=0.8;ctx.setLineDash([3,4]);
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cW,y);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='rgba(160,180,200,0.7)';ctx.font='8px JetBrains Mono';ctx.textAlign='left';
      ctx.fillText(lv,cW+3,y+3);
    });
    // Single continuous RSI line (neutral color) — much faster
    let lastR=50;
    ctx.beginPath();ctx.strokeStyle='rgba(0,212,255,0.85)';ctx.lineWidth=1.4;
    let started=false;
    rsi.forEach((v,i)=>{
      if(v===null)return; lastR=v;
      const x=xB(i),y=H*(1-v/100);
      if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);
    });
    ctx.stroke();
    // Overbought segment overlay in red
    ctx.beginPath();ctx.strokeStyle='rgba(239,83,80,0.9)';ctx.lineWidth=1.8;
    started=false;
    rsi.forEach((v,i)=>{
      if(v===null||v<=70){started=false;return;}
      const x=xB(i),y=H*(1-v/100);
      if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);
    });
    ctx.stroke();
    // Oversold segment overlay in green
    ctx.beginPath();ctx.strokeStyle='rgba(38,166,154,0.9)';ctx.lineWidth=1.8;
    started=false;
    rsi.forEach((v,i)=>{
      if(v===null||v>=30){started=false;return;}
      const x=xB(i),y=H*(1-v/100);
      if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);
    });
    ctx.stroke();
    if(lbl)lbl.textContent=`RSI(14): ${lastR.toFixed(1)}`;
    const ry=H*(1-lastR/100);
    const rsiColor=lastR>70?CFG.DN:lastR<30?CFG.UP:'rgba(0,212,255,0.9)';
    ctx.fillStyle=rsiColor;ctx.fillRect(cW+2,ry-7,CFG.PW-4,14);
    ctx.fillStyle='#fff';ctx.font='bold 9px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText(lastR.toFixed(1),cW+CFG.PW/2,ry+3);
  } else if(ST.sub==='macd'){
    const {m,s,h}=CH_macd(cls);
    const mV=m.slice(ST.startIdx,ST.startIdx+bars.length);
    const sV=s.slice(ST.startIdx,ST.startIdx+bars.length);
    const hV=h.slice(ST.startIdx,ST.startIdx+bars.length);
    const mx=Math.max(...hV.map(Math.abs))||0.001;
    const mid=H/2,yV=v=>mid-(v/mx)*mid*0.88;
    ctx.strokeStyle='rgba(100,140,170,0.2)';ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(0,mid);ctx.lineTo(cW,mid);ctx.stroke();
    hV.forEach((v,i)=>{const x=xB(i),y=yV(v),w=Math.max(1,bSp*0.7);ctx.fillStyle=v>=0?'rgba(38,166,154,0.5)':'rgba(239,83,80,0.5)';ctx.fillRect(x-w/2,Math.min(y,mid),w,Math.abs(y-mid));});
    ctx.beginPath();ctx.strokeStyle='rgba(0,212,255,0.8)';ctx.lineWidth=1;
    mV.forEach((v,i)=>{const x=xB(i);i===0?ctx.moveTo(x,yV(v)):ctx.lineTo(x,yV(v));});ctx.stroke();
    ctx.beginPath();ctx.strokeStyle='rgba(255,107,43,0.8)';ctx.lineWidth=1;
    sV.forEach((v,i)=>{const x=xB(i);i===0?ctx.moveTo(x,yV(v)):ctx.lineTo(x,yV(v));});ctx.stroke();
    if(lbl)lbl.textContent='MACD(12,26,9)';
  } else if(ST.sub==='stoch'){
    const st=CH_stoch(all).slice(ST.startIdx,ST.startIdx+bars.length);
    [[20,'rgba(239,83,80,0.15)'],[80,'rgba(239,83,80,0.15)']].forEach(([lv,c])=>{
      const y=H*(1-lv/100);ctx.strokeStyle=c;ctx.lineWidth=0.8;ctx.setLineDash([3,4]);
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cW,y);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='rgba(80,120,150,0.6)';ctx.font='8px JetBrains Mono';ctx.textAlign='left';ctx.fillText(lv,cW+3,y+3);
    });
    ctx.beginPath();ctx.strokeStyle='rgba(139,92,246,0.85)';ctx.lineWidth=1.2;
    st.forEach((v,i)=>{if(v===null)return;const x=xB(i),y=H*(1-v/100);i===0||st[i-1]===null?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();
    const lastS=st.filter(v=>v!==null).pop()||50;
    if(lbl)lbl.textContent=`Stoch(14): ${lastS.toFixed(1)}`;
  }
}

// ── DRAWINGS ──────────────────────────────────────────────
function CH_renderDrawings(ctx,cW,dp){
  ST.drawings.forEach(d=>{
    ctx.strokeStyle=d.color||'rgba(255,200,0,0.8)';ctx.lineWidth=1.5;ctx.setLineDash([]);
    if(d.type==='hline'){
      const y=pToY(d.price);
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cW,y);ctx.stroke();
      ctx.fillStyle=d.color||'rgba(255,200,0,0.8)';ctx.font='9px JetBrains Mono';ctx.textAlign='right';
      ctx.fillText(d.price.toFixed(dp),cW-3,y-3);
    } else if(d.type==='trend'||d.type==='rect'){
      const x1=xOfBar(d.b1-ST.startIdx),y1=pToY(d.p1);
      const x2=xOfBar(d.b2-ST.startIdx),y2=pToY(d.p2);
      ctx.beginPath();
      if(d.type==='trend'){ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}
      else{ctx.rect(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));ctx.fillStyle='rgba(255,200,0,0.04)';ctx.fill();}
      ctx.stroke();
    } else if(d.type==='fib'){
      const x1=xOfBar(d.b1-ST.startIdx),x2=xOfBar(d.b2-ST.startIdx);
      const pR=d.p1-d.p2;
      [0,0.236,0.382,0.5,0.618,0.786,1].forEach((lv,fi)=>{
        const cols=['#ef5350','#ff9800','#f5c518','#26a69a','#2196f3','#9c27b0','#ef5350'];
        const fp=d.p2+pR*(1-lv),fy=pToY(fp);
        ctx.strokeStyle=cols[fi];ctx.lineWidth=1;ctx.setLineDash([4,4]);
        ctx.beginPath();ctx.moveTo(Math.min(x1,x2),fy);ctx.lineTo(Math.max(x1,x2),fy);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle=cols[fi];ctx.font='8px JetBrains Mono';ctx.textAlign='right';
        ctx.fillText(`${(lv*100).toFixed(1)}% ${fp.toFixed(dp)}`,Math.max(x1,x2)-2,fy-2);
      });
    }
  });
}

// ── RENDER LOOP ───────────────────────────────────────────
function CH_frame(){
  if(CH_dirty){
    CH_resize();
    CH_layout();
    CH_drawSub();
    CH_drawMain();
    CH_dirty=false;
  }
  requestAnimationFrame(CH_frame);
}

// ── LIVE TICK — synced with S.prices (single source of truth) ────
function CH_liveTick(){
  if(!ST.candles.length) return;
  const cp=S.prices[S.pair]; if(!cp) return;
  const dp=cp.d||5;
  const last=ST.candles[ST.candles.length-1];

  // Soft-follow S.prices so chart price never drifts far from watchlist price
  const drift=(cp.p-last.c)*0.15;
  const noise=last.c*(Math.random()-0.5)*0.0002;
  last.c=+(Math.max(0.0001,last.c+drift+noise)).toFixed(dp);
  last.h=Math.max(last.h,last.c);
  last.l=Math.min(last.l,last.c);

  // New candle ~every 20 ticks
  if(Math.random()<0.05){
    const o=last.c, move=o*0.0005;
    const c=+(o+(Math.random()-0.49)*move).toFixed(dp);
    ST.candles.push({o,c,
      h:Math.max(o,c)+Math.random()*Math.abs(c-o)*0.4,
      l:Math.min(o,c)-Math.random()*Math.abs(c-o)*0.4,
      v:Math.floor(100+Math.random()*600),t:Date.now()});
    if(ST.candles.length>500) ST.candles.shift();
    CH_buildHA();
  }
  CH_dirty=true;
}

// ── EVENTS ────────────────────────────────────────────────
function CH_bindEvents(){
  const area=document.getElementById('mainChartArea');if(!area)return;
  area.addEventListener('mousemove',e=>{
    const r=area.getBoundingClientRect();ST.mx=e.clientX-r.left;ST.my=e.clientY-r.top;
    if(ST.drag){const dx=e.clientX-ST.dragX0;const delta=Math.round(dx/(ST.barSpacing||8));const maxOff=ST.candles.length-5;ST.rightOffset=Math.max(0,Math.min(maxOff,ST.dragOff0-delta));}
    CH_dirty=true;
  });
  area.addEventListener('mouseleave',()=>{ST.mx=-1;ST.my=-1;CH_dirty=true;});
  area.addEventListener('mousedown',e=>{
    if(ST.tool==='cursor'){ST.drag=true;ST.dragX0=e.clientX;ST.dragOff0=ST.rightOffset;area.style.cursor='grabbing';}
    else{
      const r=area.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;
      const bi=ST.startIdx+Math.max(0,Math.min(ST.barsData.length-1,barAtX(mx)));
      const p=ST.pMax-(ST.pMax-ST.pMin)*((my-CFG.SUB)/ST.mH);
      if(ST.tool==='hline'){ST.drawings.push({type:'hline',price:p,color:'rgba(255,200,0,0.85)'});CH_dirty=true;}
      else{ST.drawStart={b:bi,p};}
    }
  });
  area.addEventListener('mouseup',e=>{
    if(ST.drag){ST.drag=false;area.style.cursor='default';}
    else if(ST.drawStart){
      const r=area.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;
      const bi=ST.startIdx+Math.max(0,Math.min(ST.barsData.length-1,barAtX(mx)));
      const p=ST.pMax-(ST.pMax-ST.pMin)*((my-CFG.SUB)/ST.mH);
      const cols={trend:'rgba(255,200,0,0.85)',rect:'rgba(0,200,255,0.7)',fib:'multi'};
      ST.drawings.push({type:ST.tool,b1:ST.drawStart.b,p1:ST.drawStart.p,b2:bi,p2:p,color:cols[ST.tool]||'rgba(255,200,0,0.85)'});
      ST.drawStart=null;CH_dirty=true;
    }
  });
  area.addEventListener('wheel',e=>{e.preventDefault();ST.barsVis=Math.max(5,Math.min(300,Math.round(ST.barsVis*(e.deltaY<0?0.82:1.22))));CH_dirty=true;},{passive:false});
  area.addEventListener('dblclick',()=>{ST.barsVis=80;ST.rightOffset=0;CH_dirty=true;});
  // close indicator panel on outside click
  document.addEventListener('click',e=>{
    const btn=document.getElementById('indBtn'),panel=document.getElementById('indPanel');
    if(panel&&btn&&!btn.contains(e.target)&&!panel.contains(e.target))panel.classList.remove('open');
  });
}

// ── PUBLIC API ────────────────────────────────────────────
function CH_setType(t,el){
  ST.type=t;if(t==='heikin')CH_buildHA();
  document.querySelectorAll('.ct-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');CH_dirty=true;
}
function CH_setTF(m,el){
  ST.tf=m;CH_gen(S.pair);
  document.querySelectorAll('.tf-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');
}
function CH_setSub(type,el){
  ST.sub=type;
  document.querySelectorAll('#subRSI,#subMACD,#subSTOCH').forEach(b=>b.classList.remove('active'));el.classList.add('active');CH_dirty=true;
}
function CH_setTool(t,el){
  ST.tool=t;ST.drawStart=null;
  document.querySelectorAll('.tool-btn').forEach(b=>b.classList.remove('act'));el.classList.add('act');
  const area=document.getElementById('mainChartArea');if(area)area.style.cursor=t==='cursor'?'default':'crosshair';
}
function CH_clearDrawings(){ST.drawings=[];CH_dirty=true;showToast('🗑 Cleared');}
function CH_zoom(f){ST.barsVis=Math.max(5,Math.min(300,Math.round(ST.barsVis*f)));CH_dirty=true;}
function CH_resetView(){ST.barsVis=80;ST.rightOffset=0;CH_dirty=true;}
function CH_screenshot(){const c=document.getElementById('tvCanvas');if(!c)return;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=`NEXUS-${S.pair.replace('/','_')}-${Date.now()}.png`;a.click();showToast('📷 Screenshot saved!');}

// indicator panel
const INDS=[{k:'ma20',l:'MA (20)',c:'#f5c518'},{k:'ma50',l:'MA (50)',c:'#8b5cf6'},{k:'bb',l:'Bollinger Bands',c:'rgba(0,200,255,0.6)'},{k:'vwap',l:'VWAP',c:'#ff9500'}];
function CH_initIndPanel(){
  const el=document.getElementById('indList');if(!el)return;
  el.innerHTML=INDS.map(ind=>`
    <div class="ind-row" onclick="CH_toggleInd('${ind.k}',this)">
      <div class="ind-box" style="border-color:${ind.c};background:${ST.inds[ind.k]?ind.c:'transparent'}" id="ib-${ind.k}"></div>
      <span class="ind-label">${ind.l}</span>
      <div style="flex:1"></div><div style="width:16px;height:2px;background:${ind.c};border-radius:1px"></div>
    </div>`).join('');
}
function CH_toggleInd(k){
  ST.inds[k]=!ST.inds[k];
  const box=document.getElementById('ib-'+k);const ind=INDS.find(i=>i.k===k);
  if(box&&ind)box.style.background=ST.inds[k]?ind.c:'transparent';
  CH_dirty=true;
}

// backward compat stubs
function buildChartData(){ CH_gen(S.pair); }
function drawTVChart(){ CH_dirty=true; }
function setChartType(t,el){ CH_setType(t,el); }
function setTF(tf,el){ const map={'1m':1,'5m':5,'15m':15,'1H':60,'4H':240,'يومي':1440}; CH_setTF(map[tf]||15,el); }

