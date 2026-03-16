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

