// ===== PORTFOLIO CHARTS =====
function initPortCharts(){
  renderPortPositions();
  ['portChart','allocChart'].forEach(id=>{const c=Chart.getChart(id);if(c)c.destroy();});
  const ctx1=document.getElementById('portChart')?.getContext('2d');
  const ctx2=document.getElementById('allocChart')?.getContext('2d');
  if(!ctx1||!ctx2) return;
  const perf=[23000,23800,22900,24200,25100,24600,26000,25400,27200,27800,28100,28470];
  S.portChart=new Chart(ctx1,{type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],datasets:[{data:perf,borderColor:'rgba(0,212,255,.8)',borderWidth:1.5,fill:true,backgroundColor:(c)=>{const g=c.chart.ctx.createLinearGradient(0,0,0,180);g.addColorStop(0,'rgba(0,212,255,.15)');g.addColorStop(1,'rgba(0,212,255,.01)');return g;},pointRadius:3,pointBackgroundColor:'rgba(0,212,255,.8)',tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(5,10,16,.95)',borderColor:'rgba(0,212,255,.3)',borderWidth:1,titleColor:'#00d4ff',bodyColor:'#a0c4d8'}},scales:{x:{grid:{color:'rgba(0,212,255,.06)'},ticks:{color:'#5a8299',font:{size:9}}},y:{grid:{color:'rgba(0,212,255,.06)'},ticks:{color:'#5a8299',font:{size:9},callback:v=>'$'+v.toLocaleString()}}}}});
  S.allocChart=new Chart(ctx2,{type:'doughnut',data:{labels:['EUR/USD','XAU/USD','BTC/USD','GBP/USD','Other'],datasets:[{data:[35,25,20,12,8],backgroundColor:['rgba(0,212,255,.75)','rgba(245,197,24,.75)','rgba(255,107,43,.75)','rgba(0,255,136,.65)','rgba(139,92,246,.65)'],borderColor:'rgba(8,14,24,.4)',borderWidth:2,hoverBorderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#a0c4d8',font:{size:9},padding:8,boxWidth:10}}}}});
}
function renderPortPositions(){
  document.getElementById('portPositions').innerHTML=openPos.map(p=>{
    const dp=S.prices[p.pair]?.d||5;
    return `<div class="dt-row" style="display:grid;grid-template-columns:100px 55px 60px 90px 90px 70px 70px 70px 60px">
      <span style="font-family:var(--font-mono);font-weight:700">${p.pair}</span>
      <span class="${p.dir==='buy'?'opp-dir-buy':'opp-dir-sell'}">${p.dir==='buy'?'▲':'▼'}</span>
      <span style="font-family:var(--font-mono)">${p.vol}</span>
      <span style="font-family:var(--font-mono)">${p.entry.toFixed(dp)}</span>
      <span style="font-family:var(--font-mono);color:var(--cyan)">${(S.prices[p.pair]?.p||p.entry).toFixed(dp)}</span>
      <span style="font-family:var(--font-mono);color:var(--red)">${p.sl.toFixed(dp)}</span>
      <span style="font-family:var(--font-mono);color:var(--green)">${p.tp.toFixed(dp)}</span>
      <span style="font-family:var(--font-mono);font-weight:700" class="${p.pnl>0?'up':'dn'}">${p.pnl>0?'+':''}$${p.pnl.toFixed(2)}</span>
      <button class="close-btn" onclick="showToast('Closed ${p.pair}')">✕</button></div>`;}).join('');
}

// ===== PERFORMANCE CHARTS =====
let perfInited=false;
function initPerfCharts(){
  if(perfInited) return; perfInited=true;
  ['perfCurveChart','perfDistChart'].forEach(id=>{const c=Chart.getChart(id);if(c)c.destroy();});
  const ctx1=document.getElementById('perfCurveChart')?.getContext('2d');
  const ctx2=document.getElementById('perfDistChart')?.getContext('2d');
  if(ctx1){
    const d=[0,120,280,210,440,390,620,570,830,780,1020,960,1240,1180,1490,1420,1680,1600,1920,1840,2100,2050,2340,2280,2560,2480,2780,2700,3040,2960,3470];
    new Chart(ctx1,{type:'line',data:{labels:Array.from({length:31},(_,i)=>'D'+i),datasets:[{data:d,borderColor:'rgba(0,255,136,.8)',borderWidth:1.5,fill:true,backgroundColor:'rgba(0,255,136,.08)',pointRadius:0,tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(5,10,16,.95)',borderColor:'rgba(0,255,136,.3)',borderWidth:1,titleColor:'#00ff88',bodyColor:'#a0c4d8'}},scales:{x:{grid:{color:'rgba(0,212,255,.05)'},ticks:{color:'#5a8299',font:{size:9},maxTicksLimit:8}},y:{grid:{color:'rgba(0,212,255,.05)'},ticks:{color:'#5a8299',font:{size:9},callback:v=>'$'+v}}}}});
  }
  if(ctx2){
    new Chart(ctx2,{type:'bar',data:{labels:['<-100','<-50','<0','<50','<100','>100'],datasets:[{data:[8,14,26,32,18,54],backgroundColor:['rgba(255,51,102,.6)','rgba(255,51,102,.5)','rgba(255,107,43,.5)','rgba(0,212,255,.4)','rgba(0,255,136,.4)','rgba(0,255,136,.7)'],borderRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(0,212,255,.05)'},ticks:{color:'#5a8299',font:{size:9}}},y:{grid:{color:'rgba(0,212,255,.05)'},ticks:{color:'#5a8299',font:{size:9}}}}}});
  }
}
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

