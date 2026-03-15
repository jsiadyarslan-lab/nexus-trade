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
  const vol=parseFloat(document.getElementById('fVol').value)||0.1;
  const risk=(vol*10000*0.008).toFixed(2);
  const reward=(risk*1.5).toFixed(2);
  document.getElementById('rbRisk').textContent='-$'+risk;
  document.getElementById('rbReward').textContent='+$'+reward;
  document.getElementById('rbRR').textContent='1:'+(reward/risk).toFixed(1);
  document.getElementById('rbMargin').textContent='$'+(vol*S.prices[S.pair]?.p*1000/100).toFixed(2);
}
function execTrade(){
  const pair=S.pair,mode=S.mode,price=S.prices[S.pair]?.p.toFixed(5),vol=document.getElementById('fVol').value;
  showToast(`✅ ${LANG==='ar'?(mode==='buy'?'شراء':'بيع'):(mode==='buy'?'BUY':'SELL')} ${pair} @ ${price} — ${vol} Lot`,mode==='buy'?'t-buy':'t-sell');
  if(S.botOn) addBotLog(`Trade executed: ${mode.toUpperCase()} ${pair} @ ${price}`,'info');
}

