// ===== RIGHT TABS =====
function switchRT(tab,el){
  ['trade','signals','bot'].forEach(t=>{document.getElementById('rt-'+t).style.display=t===tab?'block':'none';});
  document.querySelectorAll('.rp-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  if(tab==='signals') renderSignals();
  if(tab==='bot') initBotPerfChart();
}

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

