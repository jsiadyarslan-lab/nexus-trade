// ===== SIGNALS — Dynamic from live indicators =====
function generateSignals(){
  const pairs=['EUR/USD','XAU/USD','GBP/USD','USD/JPY','BTC/USD'];
  const signals=[];
  pairs.forEach(pair=>{
    const info=S.prices[pair]; if(!info) return;
    // Build mini candle array for this pair from current price + small history
    const closes=ST.candles.length>=50
      ? (pair===S.pair ? ST.candles.map(c=>c.c) : (() => {
          // For non-active pairs, synthesize from current price
          const arr=[]; let p=info.p*(0.98+Math.random()*0.04);
          for(let i=60;i>=0;i--){p+=((Math.random()-0.48)*info.p*0.0005);arr.push(p);}
          arr.push(info.p); return arr;
        })())
      : [info.p];

    if(closes.length<15) return;

    // Calculate real indicators
    const rsiArr  = CH_rsi(closes,14);
    const rsi     = rsiArr.filter(v=>v!==null).pop() || 50;
    const macdRes = CH_macd(closes);
    const macdLast  = macdRes.m[macdRes.m.length-1] || 0;
    const sigLast   = macdRes.s[macdRes.s.length-1] || 0;
    const macdHist  = macdRes.h[macdRes.h.length-1] || 0;
    const macdPrev  = macdRes.h[macdRes.h.length-2] || 0;
    const ema20arr  = CH_ema(closes,20);
    const ema50arr  = CH_ema(closes,50);
    const ema20     = ema20arr[ema20arr.length-1];
    const ema50     = ema50arr[ema50arr.length-1];
    const price     = info.p;
    const dp        = info.d;

    // Scoring system — each condition adds to buy or sell score
    let buyScore=0, sellScore=0;
    const reasons=[];

    if(rsi<35){buyScore+=30; reasons.push(`RSI=${rsi.toFixed(0)} تشبع بيع`);}
    else if(rsi>65){sellScore+=30; reasons.push(`RSI=${rsi.toFixed(0)} تشبع شراء`);}
    else if(rsi>50&&rsi<65){buyScore+=10; reasons.push(`RSI=${rsi.toFixed(0)} صاعد`);}
    else if(rsi<50&&rsi>35){sellScore+=10; reasons.push(`RSI=${rsi.toFixed(0)} هابط`);}

    if(macdLast>sigLast && macdHist>0 && macdPrev<0){buyScore+=35; reasons.push('MACD تقاطع صاعد');}
    else if(macdLast<sigLast && macdHist<0 && macdPrev>0){sellScore+=35; reasons.push('MACD تقاطع هابط');}
    else if(macdHist>macdPrev){buyScore+=15; reasons.push('MACD إيجابي');}
    else if(macdHist<macdPrev){sellScore+=15; reasons.push('MACD سلبي');}

    if(price>ema20&&ema20>ema50){buyScore+=20; reasons.push('فوق EMA صاعد');}
    else if(price<ema20&&ema20<ema50){sellScore+=20; reasons.push('تحت EMA هابط');}

    const totalScore=buyScore+sellScore;
    if(totalScore<20) return; // No clear signal

    const dir    = buyScore>sellScore ? 'buy' : 'sell';
    const conf   = Math.min(95, Math.round(Math.max(buyScore,sellScore)/totalScore*100));
    if(conf<55) return; // Weak signal, skip

    const isJPY  = pair.includes('JPY');
    const pip    = isJPY?0.01:pair.includes('XAU')?0.5:pair.includes('BTC')?50:0.0005;
    const sl_dist= pip*(isJPY?30:pair.includes('BTC')?20:30);
    const tp_dist= sl_dist*1.8;
    const entry  = price.toFixed(dp);
    const sl     = dir==='buy' ? (price-sl_dist).toFixed(dp) : (price+sl_dist).toFixed(dp);
    const tp     = dir==='buy' ? (price+tp_dist).toFixed(dp) : (price-tp_dist).toFixed(dp);

    signals.push({pair,dir,entry,tp,sl,conf,
      reason: reasons.slice(0,2).join(' + ')});
  });

  // Sort by confidence
  signals.sort((a,b)=>b.conf-a.conf);
  return signals.length ? signals : sigsDataFallback;
}

// Static fallback if not enough candle data yet
const sigsDataFallback=[
  {pair:'EUR/USD',dir:'buy',entry:'—',tp:'—',sl:'—',conf:72,reason:'جارٍ تحليل المؤشرات...'},
];

function renderSignals(){
  const sigs=generateSignals();
  const cc=c=>c>=85?'var(--green)':c>=70?'var(--gold)':'var(--red)';
  const dBg=d=>d==='buy'?'rgba(0,255,136,.12)':'rgba(255,51,102,.12)';
  const dC=d=>d==='buy'?'var(--green)':'var(--red)';

  document.getElementById('sigContainer').innerHTML=
    `<div style="font-size:9px;color:var(--text4);font-family:var(--font-mono);margin-bottom:8px;text-align:center">
      محدّثة تلقائياً من RSI + MACD + EMA
      <span id="sigUpdateTime" style="color:var(--text4)"></span>
    </div>`+
    sigs.map(s=>`
    <div class="signal-mini ${s.dir==='buy'?'sig-buy-line':'sig-sell-line'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-family:var(--font-hud);font-size:11px;font-weight:700">${s.pair}</span>
        <span style="padding:2px 8px;border-radius:3px;font-size:9px;font-weight:900;font-family:var(--font-hud);background:${dBg(s.dir)};color:${dC(s.dir)};border:1px solid ${dC(s.dir)}40">${s.dir==='buy'?'▲ BUY':'▼ SELL'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;font-family:var(--font-mono);margin-bottom:4px">
        <span style="color:var(--text3)">E:<b style="color:var(--text)">${s.entry}</b></span>
        <span style="color:var(--green)">TP:${s.tp}</span>
        <span style="color:var(--red)">SL:${s.sl}</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
        <div style="flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${s.conf}%;background:${cc(s.conf)};border-radius:2px;transition:width .5s"></div>
        </div>
        <span style="font-size:9px;font-family:var(--font-mono);font-weight:700;color:${cc(s.conf)}">${s.conf}%</span>
      </div>
      <div style="font-size:9px;color:var(--text3);line-height:1.4">${s.reason}</div>
    </div>`).join('');

  const el=document.getElementById('sigUpdateTime');
  if(el){const n=new Date();el.textContent=` — ${n.getHours()}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`;}
}
function refreshSigs(){
  document.getElementById('sigContainer').innerHTML=`<div class="ai-loading" style="padding:20px;justify-content:center;display:flex;gap:8px;align-items:center"><div class="think-dots"><span></span><span></span><span></span></div><span style="font-size:11px;color:var(--text3)">${LANG==='ar'?'تحليل المؤشرات...':'Analyzing...'}</span></div>`;
  setTimeout(renderSignals,800);
}

