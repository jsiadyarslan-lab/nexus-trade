// ===== EXPORT =====
let tradeHistory = [];
function buildTradeHistory(){
  tradeHistory = Array.from({length:20},(_,i)=>{
    const pairs=['EUR/USD','GBP/USD','XAU/USD','BTC/USD','USD/JPY','AUD/USD'];
    const pair=pairs[i%pairs.length];
    const dir=Math.random()>.5?'buy':'sell';
    const dp=S.prices[pair]?.d||5;
    const base=S.prices[pair]?.p||1.08;
    const entry=+(base*(0.994+Math.random()*.012)).toFixed(dp);
    const pnl=+((Math.random()-.32)*220).toFixed(2);
    const exit=+(entry+(pnl>0?0.001:-0.001)).toFixed(dp);
    const hr=Math.floor(Math.random()*23), mn=Math.floor(Math.random()*59);
    return {id:200-i, pair, dir, vol:(+(0.05+Math.random()*0.45)).toFixed(2), entry, exit, pnl, time:`${String(hr).padStart(2,'0')}:${String(mn).padStart(2,'0')}`, status:'CLOSED'};
  });
}
function renderTradeHistory(filter='all'){
  if(!tradeHistory.length) buildTradeHistory();
  const filtered=tradeHistory.filter(t=>{
    if(filter==='buy') return t.dir==='buy';
    if(filter==='sell') return t.dir==='sell';
    if(filter==='win') return t.pnl>0;
    if(filter==='loss') return t.pnl<=0;
    return true;
  });
  const el=document.getElementById('tradeHistRows'); if(!el) return;
  el.innerHTML=filtered.map(t=>`
    <div class="dt-row" style="display:grid;grid-template-columns:45px 100px 55px 60px 90px 90px 75px 70px 60px;align-items:center">
      <span style="color:var(--text4);font-family:var(--font-mono);font-size:10px">#${t.id}</span>
      <span style="font-family:var(--font-mono);font-weight:700;color:var(--text)">${t.pair}</span>
      <span class="${t.dir==='buy'?'opp-dir-buy':'opp-dir-sell'}">${t.dir==='buy'?'▲':'▼'}</span>
      <span style="font-family:var(--font-mono);color:var(--text2)">${t.vol}</span>
      <span style="font-family:var(--font-mono);color:var(--text2)">${t.entry}</span>
      <span style="font-family:var(--font-mono);color:var(--text2)">${t.exit}</span>
      <span style="font-family:var(--font-mono);font-weight:700;color:${t.pnl>0?'var(--green)':'var(--red)'}">${t.pnl>0?'+':''}$${Math.abs(t.pnl).toFixed(2)}</span>
      <span style="color:var(--text3);font-family:var(--font-mono);font-size:10px">${t.time}</span>
      <span style="font-size:9px;padding:2px 6px;background:${t.pnl>0?'rgba(0,255,136,.1)':'rgba(255,51,102,.1)'};color:${t.pnl>0?'var(--green)':'var(--red)'};border-radius:3px;font-family:var(--font-hud);border:1px solid ${t.pnl>0?'rgba(0,255,136,.2)':'rgba(255,51,102,.2)'}">CLOSED</span>
    </div>`).join('');
}
function filterTrades(f, el){
  document.querySelectorAll('.trade-filter-btn').forEach(b=>{
    b.style.background='none'; b.style.borderColor='var(--border)'; b.style.color='var(--text3)';
  });
  el.style.background='var(--cyan3)'; el.style.borderColor='var(--border2)'; el.style.color='var(--cyan)';
  renderTradeHistory(f);
}
function exportCSV(){
  if(!tradeHistory.length) buildTradeHistory();
  const headers=['#','Pair','Direction','Volume','Entry','Exit','P&L ($)','Time','Status'];
  const rows=[headers, ...tradeHistory.map(t=>[t.id,t.pair,t.dir.toUpperCase(),t.vol,t.entry,t.exit,(t.pnl>0?'+':'')+t.pnl,t.time,t.status])];
  const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`NEXUS-Trades-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  showToast('✅ '+(LANG==='ar'?'تم تصدير CSV بنجاح':'CSV exported successfully'),'t-buy');
}
function exportPDF(){
  showToast('📄 '+(LANG==='ar'?'جارٍ تحضير التقرير...':'Preparing report...'));
  // Build printable HTML
  if(!tradeHistory.length) buildTradeHistory();
  const printWin=window.open('','_blank');
  printWin.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>NEXUS Trade Report</title><style>
    body{font-family:monospace;background:#fff;color:#111;padding:20px;direction:rtl}
    h1{font-size:18px;margin-bottom:4px} h2{font-size:13px;color:#555;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:11px} th{background:#0b1017;color:#00d4ff;padding:6px 8px;text-align:right}
    td{padding:5px 8px;border-bottom:1px solid #eee;text-align:right}
    .up{color:green;font-weight:700} .dn{color:red;font-weight:700}
    .stats{display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap}
    .stat-box{border:1px solid #ddd;border-radius:6px;padding:12px;min-width:120px;text-align:center}
    .stat-lbl{font-size:10px;color:#888;letter-spacing:1px} .stat-val{font-size:18px;font-weight:700;margin-top:4px}
    @media print{body{padding:10px}}
  </style></head><body>
    <h1>NEXUS TRADE — ${LANG==='ar'?'تقرير الأداء':'Performance Report'}</h1>
    <h2>${new Date().toLocaleDateString(LANG==='ar'?'ar-SA':'en-US',{year:'numeric',month:'long',day:'numeric'})}</h2>
    <div class="stats">
      <div class="stat-box"><div class="stat-lbl">${LANG==='ar'?'صافي الربح':'NET PROFIT'}</div><div class="stat-val up">+$3,470</div></div>
      <div class="stat-box"><div class="stat-lbl">${LANG==='ar'?'نسبة الفوز':'WIN RATE'}</div><div class="stat-val" style="color:#8b5cf6">68.4%</div></div>
      <div class="stat-box"><div class="stat-lbl">${LANG==='ar'?'إجمالي الصفقات':'TOTAL TRADES'}</div><div class="stat-val">152</div></div>
      <div class="stat-box"><div class="stat-lbl">${LANG==='ar'?'أقصى سحب':'MAX DD'}</div><div class="stat-val dn">-8.2%</div></div>
    </div>
    <table><thead><tr><th>#</th><th>${LANG==='ar'?'الزوج':'Pair'}</th><th>${LANG==='ar'?'اتجاه':'Dir'}</th><th>${LANG==='ar'?'حجم':'Vol'}</th><th>${LANG==='ar'?'الدخول':'Entry'}</th><th>${LANG==='ar'?'الخروج':'Exit'}</th><th>P&L</th><th>${LANG==='ar'?'الوقت':'Time'}</th></tr></thead><tbody>
    ${tradeHistory.map(t=>`<tr><td>#${t.id}</td><td><b>${t.pair}</b></td><td style="color:${t.dir==='buy'?'green':'red'}">${t.dir==='buy'?'▲ BUY':'▼ SELL'}</td><td>${t.vol}</td><td>${t.entry}</td><td>${t.exit}</td><td class="${t.pnl>0?'up':'dn'}">${t.pnl>0?'+':''}$${Math.abs(t.pnl).toFixed(2)}</td><td>${t.time}</td></tr>`).join('')}
    </tbody></table></body></html>`);
  printWin.document.close();
  setTimeout(()=>{ printWin.focus(); printWin.print(); },400);
}
function exportJSON(){
  if(!tradeHistory.length) buildTradeHistory();
  const data={
    exportDate: new Date().toISOString(),
    account:{balance:28470.55, winRate:'68.4%', totalTrades:152, netProfit:3470},
    trades: tradeHistory
  };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`NEXUS-Data-${new Date().toISOString().slice(0,10)}.json`; a.click();
  showToast('✅ JSON exported');
}

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

