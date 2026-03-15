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
    const d=dp(pair);
    if(pair.includes('BTC')||pair.includes('ETH')) return val.toFixed(0);
    if(pair.includes('XAU')||pair.includes('XAG')) return val.toFixed(2);
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
    el.textContent=info.p>=1000?info.p.toFixed(0):info.p.toFixed(info.d);
  });
  // Topbar
  document.getElementById('tb0').textContent=S.prices['EUR/USD'].p.toFixed(5);
  document.getElementById('tb1').textContent=S.prices['GBP/USD'].p.toFixed(5);
  document.getElementById('tb2').textContent=S.prices['XAU/USD'].p.toFixed(2);
  document.getElementById('tb3').textContent=S.prices['BTC/USD'].p.toFixed(0);
  // Active pair price
  const cp=S.prices[S.pair];
  const cpDp=S.prices[S.pair]?.d||5;
  document.getElementById('chPrice').textContent=cp.p.toFixed(cpDp);
  document.getElementById('tradePriceLive').textContent=cp.p.toFixed(cpDp);
}

