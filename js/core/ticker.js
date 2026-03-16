// ===== OPEN POSITIONS =====
const openPos=[
  {pair:'EUR/USD',dir:'buy',vol:'0.50',entry:1.08210,sl:1.0771,tp:1.0921,pnl:112.40},
  {pair:'XAU/USD',dir:'buy',vol:'0.20',entry:2930.50,sl:2910,tp:2980,pnl:274.00},
  {pair:'GBP/USD',dir:'sell',vol:'0.30',entry:1.27440,sl:1.2794,tp:1.2644,pnl:78.60},
  {pair:'BTC/USD',dir:'buy',vol:'0.01',entry:83200,sl:81500,tp:87000,pnl:920.00},
  {pair:'USD/JPY',dir:'buy',vol:'0.40',entry:149.55,sl:148.8,tp:150.8,pnl:-144.80},
];
function renderOPP(){
  const dp=(pair)=>S.prices[pair]?.d||5;
  // For pairs with many decimals (XAU, BTC), abbreviate entry/SL/TP display
  const fmt=(val,pair)=>{
    if(pair.includes('BTC')||pair.includes('ETH')||pair.includes('SPX')||pair.includes('NAS')||pair.includes('GER'))
      return Math.round(val).toLocaleString();
    if(pair.includes('XAU')||pair.includes('XAG')||pair.includes('XPT')) return val.toFixed(2);
    if(pair.includes('JPY')) return val.toFixed(3);
    return val.toFixed(5);
  };
  document.getElementById('oppRows').innerHTML=openPos.map(p=>`
    <div class="opp-row">
      <span class="opp-pair">${p.pair}</span>
      <span class="${p.dir==='buy'?'opp-dir-buy':'opp-dir-sell'}" style="font-size:9px">${p.dir==='buy'?'▲':'▼'}</span>
      <span class="opp-num">${p.vol}</span>
      <span class="opp-num" style="font-size:9px">${fmt(p.entry,p.pair)}</span>
      <span class="opp-num" style="color:var(--cyan);font-size:9px">${fmt(S.prices[p.pair]?.p||p.entry,p.pair)}</span>
      <span class="opp-num" style="color:var(--red);font-size:9px">${fmt(p.sl,p.pair)}</span>
      <span class="opp-num" style="color:var(--green);font-size:9px">${fmt(p.tp,p.pair)}</span>
      <span class="opp-pnl ${p.pnl>0?'up':'dn'}" style="font-size:10px;font-weight:700">${p.pnl>0?'+':''}$${p.pnl.toFixed(2)}</span>
    </div>`).join('');
}

// ===== TICKER =====
function tickPrices(){
  Object.keys(S.prices).forEach(pair=>{
    const info=S.prices[pair];
    const vol=pair.includes('BTC')||pair.includes('ETH')||pair.includes('SPX')||pair.includes('NAS')||pair.includes('GER')?30:pair.includes('XAU')||pair.includes('XAG')?0.3:pair.includes('JPY')?0.015:0.0004;
    info.p+=((Math.random()-.49)*vol);
    info.p=Math.max(0.001,info.p);
  });
  // Update watchlist
  const pws=['EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','USD/CAD','NZD/USD','EUR/GBP','XAU/USD','XAG/USD','XPT/USD','BTC/USD','ETH/USD','SOL/USD','XRP/USD','SPX500','NAS100','GER40'];
  pws.forEach((pair,i)=>{
    const el=document.getElementById('pw'+i);
    if(!el) return;
    const info=S.prices[pair];
    el.textContent=info.p>=1000?Math.round(info.p).toLocaleString():info.p.toFixed(info.d);
  });
  // Topbar
  document.getElementById('tb0').textContent=S.prices['EUR/USD'].p.toFixed(5);
  document.getElementById('tb1').textContent=S.prices['GBP/USD'].p.toFixed(5);
  document.getElementById('tb2').textContent=S.prices['XAU/USD'].p.toFixed(2);
  document.getElementById('tb3').textContent=Math.round(S.prices['BTC/USD'].p).toLocaleString();
  // Active pair price
  const cp=S.prices[S.pair];
  const cpDp=S.prices[S.pair]?.d||5;
  document.getElementById('chPrice').textContent=cp.p.toFixed(cpDp);
  document.getElementById('tradePriceLive').textContent=cp.p.toFixed(cpDp);
}

// ===== TRADE =====
function setMode(mode){
  S.mode=mode;
  document.getElementById('btnBuy').classList.toggle('act',mode==='buy');
  document.getElementById('btnSell').classList.toggle('act',mode==='sell');
  const btn=document.getElementById('execBtn');
  btn.className='exec-btn '+(mode==='buy'?'exec-buy':'exec-sell');
  document.getElementById('execLabel').textContent=LANG==='ar'?(mode==='buy'?'تنفيذ شراء':'تنفيذ بيع'):(mode==='buy'?'EXECUTE BUY':'EXECUTE SELL');
}
function setLev(lev,el){S.lev=lev;document.querySelectorAll('.lev-btn').forEach(b=>b.classList.remove('act'));el.classList.add('act');}
function calcRisk(){
  const vol   = parseFloat(document.getElementById('fVol')?.value) || 0.1;
  const price = S.prices[S.pair]?.p || 1.0843;
  const sl    = parseFloat(document.getElementById('fSL')?.value)  || 0;
  const tp    = parseFloat(document.getElementById('fTP')?.value)  || 0;
  const pair  = S.pair;

  // Pip value per lot (standard lot = 100,000 units)
  const isJPY = pair.includes('JPY');
  const isXAU = pair.includes('XAU') || pair.includes('XAG');
  const isCrypto = pair.includes('BTC') || pair.includes('ETH') || pair.includes('SOL');
  const isIndex  = pair.includes('SPX') || pair.includes('NAS') || pair.includes('GER');

  let pipSize, pipValuePerLot;
  if (isJPY)    { pipSize = 0.01;   pipValuePerLot = 1000; }
  else if (isXAU){ pipSize = 0.1;   pipValuePerLot = 100;  }
  else if (isCrypto){ pipSize = 1;  pipValuePerLot = 1;    }
  else if (isIndex) { pipSize = 1;  pipValuePerLot = 1;    }
  else           { pipSize = 0.0001; pipValuePerLot = 10;  }

  // Calculate actual risk/reward in dollars
  const slDist = sl > 0 ? Math.abs(price - sl) : price * 0.003;
  const tpDist = tp > 0 ? Math.abs(tp - price) : price * 0.006;

  const riskDollar   = (slDist / pipSize) * pipValuePerLot * vol;
  const rewardDollar = (tpDist / pipSize) * pipValuePerLot * vol;
  const rr           = riskDollar > 0 ? rewardDollar / riskDollar : 0;

  // Margin = (vol * contract_size * price) / leverage
  const levNum   = parseInt((S.lev || '1:100').split(':')[1]) || 100;
  const contractSize = isCrypto ? 1 : isIndex ? 1 : 100000;
  const margin   = (vol * contractSize * price) / levNum;

  document.getElementById('rbRisk').textContent    = '-$' + riskDollar.toFixed(2);
  document.getElementById('rbReward').textContent  = '+$' + rewardDollar.toFixed(2);
  document.getElementById('rbRR').textContent      = '1:' + rr.toFixed(2);
  document.getElementById('rbMargin').textContent  = '$' + margin.toFixed(2);

  // Color code R:R
  const rrEl = document.getElementById('rbRR');
  if (rrEl) rrEl.style.color = rr >= 2 ? 'var(--green)' : rr >= 1.5 ? 'var(--gold)' : 'var(--red)';
}
function execTrade(){
  const pair=S.pair,mode=S.mode,price=S.prices[S.pair]?.p.toFixed(5),vol=document.getElementById('fVol').value;
  showToast(`✅ ${LANG==='ar'?(mode==='buy'?'شراء':'بيع'):(mode==='buy'?'BUY':'SELL')} ${pair} @ ${price} — ${vol} Lot`,mode==='buy'?'t-buy':'t-sell');
  if(S.botOn) addBotLog(`Trade executed: ${mode.toUpperCase()} ${pair} @ ${price}`,'info');
}

// ===== RIGHT TABS =====
function switchRT(tab,el){
  ['trade','signals','bot'].forEach(t=>{document.getElementById('rt-'+t).style.display=t===tab?'block':'none';});
  document.querySelectorAll('.rp-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  if(tab==='signals') renderSignals();
  if(tab==='bot') initBotPerfChart();
}

