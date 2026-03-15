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

// ===== RIGHT TABS =====
function switchRT(tab,el){
  ['trade','signals','bot'].forEach(t=>{document.getElementById('rt-'+t).style.display=t===tab?'block':'none';});
  document.querySelectorAll('.rp-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  if(tab==='signals') renderSignals();
  if(tab==='bot') initBotPerfChart();
}

