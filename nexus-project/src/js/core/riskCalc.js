// ===== LOT SIZE CALCULATOR =====
function calcLot(){
  const balance=28470.55;
  const riskPct=parseFloat(document.getElementById('lcRisk')?.value)||2;
  const slPips=parseFloat(document.getElementById('lcSL')?.value)||20;
  const info=S.prices[S.pair]||{p:1.0843,d:5};
  const isJPY=S.pair.includes('JPY'), isXAU=S.pair.includes('XAU'), isBTC=S.pair.includes('BTC');
  const pipVal=isJPY?0.01:isXAU?0.1:isBTC?1:0.0001;
  const lotVal=isJPY?1000:isXAU?100:isBTC?1:10; // $ per pip per lot
  const riskDollars=balance*(riskPct/100);
  const slDollars=slPips*pipVal*lotVal;
  const suggestedLot=slDollars>0?Math.max(0.01,+(riskDollars/slDollars).toFixed(2)):0.01;
  const el1=document.getElementById('lcResult'), el2=document.getElementById('lcRiskDollar');
  if(el1) el1.textContent=suggestedLot.toFixed(2);
  if(el2) el2.textContent='$'+riskDollars.toFixed(0);
  // Auto-fill the volume input
  const fVol=document.getElementById('fVol');
  if(fVol) fVol.value=suggestedLot.toFixed(2);
  calcRisk();
}

// ===== SMART ALERTS =====
const activeAlerts={rsi:true, ma:true, loss:true, margin:true};
function toggleAlert(type, el){ activeAlerts[type]=el.checked; }
function testAlert(){
  const sound=document.getElementById('soundAlertToggle')?.checked;
  if(sound){
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880,ctx.currentTime);
      osc.frequency.setValueAtTime(1100,ctx.currentTime+0.1);
      gain.gain.setValueAtTime(0.3,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.4);
    }catch(e){}
  }
  showToast('🔔 '+(LANG==='ar'?'تنبيه تجريبي: RSI وصل 76.4!':'Test alert: RSI reached 76.4!'));
}
function checkAlerts(pair){
  // Called periodically — check RSI
  if(activeAlerts.rsi && ST.candles.length>=14){
    const closes=ST.candles.map(c=>c.c);
    const rsiArr=CH_rsi(closes);
    const lastRSI=rsiArr.filter(v=>v!==null).pop();
    if(lastRSI!=null){
      if(lastRSI>75){
        triggerAlert(`⚠️ ${pair} RSI=${lastRSI.toFixed(1)} — ${LANG==='ar'?'تشبع شراء':'Overbought'}`,'t-sell');
      } else if(lastRSI<25){
        triggerAlert(`⚠️ ${pair} RSI=${lastRSI.toFixed(1)} — ${LANG==='ar'?'تشبع بيع':'Oversold'}`,'t-buy');
      }
    }
  }
}
let lastAlertTime=0;
function triggerAlert(msg,cls=''){
  const now=Date.now();
  if(now-lastAlertTime<8000) return; // debounce 8s
  lastAlertTime=now;
  showToast(msg,cls);
  const sound=document.getElementById('soundAlertToggle')?.checked;
  if(sound){
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const osc=ctx.createOscillator(); const gain=ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value=660; gain.gain.setValueAtTime(0.2,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
      osc.start(); osc.stop(ctx.currentTime+0.5);
    }catch(e){}
  }
}

