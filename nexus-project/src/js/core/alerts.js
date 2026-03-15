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

// ===== LIVE CLOCK =====
function startClock(){
  function update(){
    const now=new Date();
    const hms=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const dateStr=now.toLocaleDateString(LANG==='ar'?'ar-SA':'en-US',{month:'short',day:'numeric'});
    const el=document.getElementById('newsClock');
    const del=document.getElementById('newsDate');
    if(el) el.textContent=hms;
    if(del) del.textContent=dateStr;
  }
  update();
  setInterval(update,1000);
}

