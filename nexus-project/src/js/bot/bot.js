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

// ===== AI ANALYSIS =====
let anPair='EUR/USD';
function setAnPair(pair,el){anPair=pair;document.querySelectorAll('#anPairBtns .ct-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');}
async function runAnalysis(){
  const btn=document.getElementById('anBtn');
  btn.disabled=true;
  const out=document.getElementById('analysisOutput');
  out.innerHTML=`<div class="ai-loading" style="padding:30px;justify-content:center"><div class="think-dots"><span></span><span></span><span></span></div><span>${LANG==='ar'?'يحلل الذكاء الاصطناعي...':'AI is analyzing...'}</span></div>`;
  const info=S.prices[anPair]||{p:1.0843,d:5};
  const isUp=Math.random()>.4;
  try{
    const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are a professional forex analyst. Respond in Arabic if the language is Arabic, English otherwise. Be concise and professional.",messages:[{role:"user",content:`Analyze ${anPair} at price ${info.p.toFixed(info.d)}. RSI: ${isUp?62:38}, MACD: ${isUp?'bullish':'bearish'}, EMA: ${isUp?'golden cross':'death cross'}. Provide: 1) Market outlook 2) Key levels 3) Trade recommendation with entry/SL/TP 4) Risk factors. Language: ${LANG==='ar'?'Arabic':'English'}`}]})});
    const data=await resp.json();
    const text=data.content?.[0]?.text||'';
    out.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
        <div class="stat-card sc-cyan"><div class="stat-label">SIGNAL</div><div class="stat-val ${isUp?'up':'dn'}">${isUp?'BUY':'SELL'}</div></div>
        <div class="stat-card sc-gold"><div class="stat-label">CONFIDENCE</div><div class="stat-val" style="color:var(--gold)">${(72+Math.random()*18).toFixed(0)}%</div></div>
        <div class="stat-card sc-green"><div class="stat-label">R:R</div><div class="stat-val up">1:${(1.5+Math.random()).toFixed(1)}</div></div>
      </div>
      <div style="background:var(--bg4);border:1px solid var(--border2);border-radius:10px;padding:20px">
        <div style="font-size:9px;letter-spacing:1.5px;color:var(--cyan);font-family:var(--font-hud);margin-bottom:14px">🧠 AI FULL ANALYSIS — ${anPair}</div>
        <div style="font-size:13px;line-height:2;color:var(--text2)">${text.split('\n').filter(l=>l.trim()).map(l=>`<p style="margin-bottom:10px">${l}</p>`).join('')}</div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button onclick="navigator.clipboard.writeText(document.querySelector('#analysisOutput').innerText).then(()=>showToast('Copied!'))" style="padding:8px 14px;background:var(--bg3);border:1px solid var(--border);color:var(--text3);border-radius:5px;font-size:11px;cursor:pointer;font-family:var(--font-ui)">📋 ${LANG==='ar'?'نسخ':'Copy'}</button>
          <button onclick="switchPage('dashboard')" style="padding:8px 14px;background:var(--cyan3);border:1px solid var(--border2);color:var(--cyan);border-radius:5px;font-size:11px;cursor:pointer;font-family:var(--font-ui)">📈 ${LANG==='ar'?'تداول':'Trade'}</button>
        </div>
      </div>`;
  }catch(e){out.innerHTML=`<div style="color:var(--red);padding:20px;text-align:center">⚠️ ${LANG==='ar'?'خطأ في الاتصال':'Connection error'}</div>`;}
  btn.disabled=false;
}

