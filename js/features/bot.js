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

