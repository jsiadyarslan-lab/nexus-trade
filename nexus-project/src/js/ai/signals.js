// ===== SIGNALS (SMALLER) =====
const sigsData=[
  {pair:'EUR/USD',dir:'buy',entry:'1.08350',tp:'1.08720',sl:'1.08140',conf:87,reason:'EMA تقاطع صاعد + RSI=58'},
  {pair:'XAU/USD',dir:'buy',entry:'2940.00',tp:'2980.00',sl:'2920.00',conf:82,reason:'دعم قوي + MACD إيجابي'},
  {pair:'GBP/USD',dir:'sell',entry:'1.27300',tp:'1.26850',sl:'1.27550',conf:78,reason:'مقاومة 1.2740 + RSI تباعد'},
  {pair:'USD/JPY',dir:'buy',entry:'149.750',tp:'150.500',sl:'149.350',conf:74,reason:'دعم + بيانات اقتصادية قوية'},
  {pair:'BTC/USD',dir:'buy',entry:'83800',tp:'87500',sl:'82000',conf:71,reason:'اختراق 84000 + حجم مرتفع'},
];
function renderSignals(){
  document.getElementById('sigContainer').innerHTML=sigsData.map(s=>{
    const cc=s.conf>=85?'var(--green)':s.conf>=70?'var(--gold)':'var(--red)';
    const dirBg=s.dir==='buy'?'rgba(0,255,136,.12)':'rgba(255,51,102,.12)';
    const dirCol=s.dir==='buy'?'var(--green)':'var(--red)';
    return `<div class="signal-mini ${s.dir==='buy'?'sig-buy-line':'sig-sell-line'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-family:var(--font-hud);font-size:11px;font-weight:700;color:var(--text)">${s.pair}</span>
        <span style="padding:2px 8px;border-radius:3px;font-size:9px;font-weight:900;font-family:var(--font-hud);background:${dirBg};color:${dirCol};border:1px solid ${dirCol}40">${s.dir==='buy'?'▲ BUY':'▼ SELL'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;font-family:var(--font-mono);margin-bottom:4px">
        <span style="color:var(--text3)">E:<b style="color:var(--text)">${s.entry}</b></span>
        <span class="sm-tp">TP:${s.tp}</span>
        <span class="sm-sl">SL:${s.sl}</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px">
        <div style="flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden"><div style="height:100%;width:${s.conf}%;background:${cc};border-radius:2px"></div></div>
        <span style="font-size:9px;font-family:var(--font-mono);font-weight:700;color:${cc}">${s.conf}%</span>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-top:4px;line-height:1.4">${s.reason}</div>
    </div>`;}).join('');
}
function refreshSigs(){document.getElementById('sigContainer').innerHTML=`<div class="ai-loading"><div class="think-dots"><span></span><span></span><span></span></div><span>${LANG==='ar'?'تحديث الإشارات...':'Refreshing signals...'}</span></div>`;setTimeout(renderSignals,1500);}

// ===== BOT =====
function switchBotTab(tab,el){
  ['config','strategy','log','botperf'].forEach(t=>{
    const el2=document.getElementById('bot-'+t);
    if(el2) el2.style.display=t===tab?'block':'none';
  });
  document.querySelectorAll('.bst').forEach(b=>b.classList.remove('act'));
  el.classList.add('act');
  if(tab==='botperf') initBotPerfChart();
  if(tab==='log') renderBotLog();
}
function selectStrat(el){document.querySelectorAll('.strat-card').forEach(c=>c.classList.remove('selected'));el.classList.add('selected');}
function addBotLog(msg,type='info'){
  const now=new Date();
  S.botLogs.unshift({time:now.getHours()+':'+(now.getMinutes()<10?'0':'')+now.getMinutes()+':'+(now.getSeconds()<10?'0':'')+now.getSeconds(),msg,type});
  if(S.botLogs.length>50) S.botLogs.pop();
  if(document.getElementById('bot-log').style.display!=='none') renderBotLog();
}
function renderBotLog(){
  document.getElementById('botLogBox').innerHTML=S.botLogs.map(l=>`
    <div class="log-entry"><span class="log-time">${l.time}</span><span class="log-${l.type}">${l.msg}</span></div>`).join('');
}
let botPerfInited=false;
function initBotPerfChart(){
  if(botPerfInited) return; botPerfInited=true;
  const existing=Chart.getChart('botPerfChart');if(existing)existing.destroy();
  const ctx=document.getElementById('botPerfChart')?.getContext('2d');
  if(!ctx) return;
  const labels=['W1','W2','W3','W4','W5','W6','W7','W8'];
  const data=[320,580,420,790,650,1020,880,1240];
  new Chart(ctx,{type:'line',data:{labels,datasets:[{data,borderColor:'rgba(0,212,255,.8)',borderWidth:1.5,fill:true,backgroundColor:'rgba(0,212,255,.08)',pointRadius:3,pointBackgroundColor:'rgba(0,212,255,.8)',tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(5,10,16,.95)',borderColor:'rgba(0,212,255,.3)',borderWidth:1}},scales:{x:{grid:{color:'rgba(0,212,255,.05)'},ticks:{color:'#5a8299',font:{size:9}}},y:{grid:{color:'rgba(0,212,255,.05)'},ticks:{color:'#5a8299',font:{size:9},callback:v=>'$'+v}}}}});
}
function toggleBot(el){
  S.botOn=el.checked;
  const lbl=document.getElementById('botStateLbl');
  if(S.botOn){
    lbl.textContent=LANG==='ar'?'● يعمل':'● RUNNING';
    lbl.className='bot-state bot-running';
    showToast('🤖 '+(LANG==='ar'?'بوت NEXUS بدأ العمل':'NEXUS BOT Started'),'t-buy');
    addBotLog('Bot started — scanning markets...','info');
    S.botInterval=setInterval(()=>{
      const pairs=['EUR/USD','GBP/USD','XAU/USD','BTC/USD','USD/JPY'];
      const pair=pairs[Math.floor(Math.random()*pairs.length)];
      const dir=Math.random()>.5?'buy':'sell';
      const pnl=((Math.random()-.35)*250).toFixed(2);
      addBotLog(`${dir.toUpperCase()} ${pair} @ ${S.prices[pair]?.p.toFixed(S.prices[pair]?.d||5)} | PnL: ${pnl>0?'+':''}$${pnl}`,parseFloat(pnl)>0?'buy':'sell');
      if(Math.random()>.5) showToast(`🤖 ${dir.toUpperCase()} ${pair} ${pnl>0?'+':''}$${pnl}`,parseFloat(pnl)>0?'t-buy':'t-sell');
    },7000);
  } else {
    lbl.textContent=LANG==='ar'?'● متوقف':'● STOPPED';
    lbl.className='bot-state bot-stopped';
    clearInterval(S.botInterval);
    addBotLog('Bot stopped','warn');
    showToast('🤖 '+(LANG==='ar'?'البوت توقف':'Bot Stopped'));
  }
}

