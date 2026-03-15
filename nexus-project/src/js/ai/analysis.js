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
