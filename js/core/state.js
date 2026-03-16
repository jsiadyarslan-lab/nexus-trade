// ===== LANG =====
let LANG='ar';
function setLang(l){
  LANG=l;
  document.getElementById('htmlRoot').lang=l;
  document.getElementById('htmlRoot').dir=l==='ar'?'rtl':'ltr';
  document.getElementById('htmlRoot').style.direction=l==='ar'?'rtl':'ltr';
  document.getElementById('btnAR').classList.toggle('active',l==='ar');
  document.getElementById('btnEN').classList.toggle('active',l==='en');
  document.getElementById('liveLabel').textContent=l==='ar'?'مباشر':'LIVE';
  document.getElementById('ntLabel').textContent=l==='ar'?'أخبار':'NEWS';
  // Update all data-ar/data-en elements
  document.querySelectorAll('[data-ar]').forEach(el=>{
    const val=el.getAttribute('data-'+l);
    if(val) el.textContent=val;
  });
  showToast(l==='ar'?'تم التبديل إلى العربية 🇸🇦':'Switched to English 🇺🇸');
}

// ===== STATE =====
const S={
  pair:'EUR/USD', mode:'buy', lev:'1:10', anPair:'EUR/USD',
  botOn:false, botInterval:null, botLogs:[], settingsTab:'api',
  prices:{
    'EUR/USD':{p:1.08432,d:5},'GBP/USD':{p:1.27184,d:5},'USD/JPY':{p:149.820,d:3},
    'USD/CHF':{p:0.88920,d:5},'AUD/USD':{p:0.65441,d:5},'USD/CAD':{p:1.36280,d:5},
    'NZD/USD':{p:0.60180,d:5},'EUR/GBP':{p:0.85310,d:5},
    'XAU/USD':{p:2944.20,d:2},'XAG/USD':{p:32.44,d:2},'XPT/USD':{p:985.60,d:2},
    'BTC/USD':{p:84120,d:0},'ETH/USD':{p:3280,d:0},'SOL/USD':{p:142.5,d:2},'XRP/USD':{p:0.5840,d:4},
    'SPX500':{p:5842,d:0},'NAS100':{p:20140,d:0},'GER40':{p:18240,d:0}
  },
  chartData:[],chartType:'candle',activeChart:null,portChart:null,allocChart:null
};

// ===== PAGE SWITCHING =====
function switchPage(id,el){
  document.getElementById('page-dashboard').style.display='none';
  document.querySelectorAll('.full-page').forEach(p=>{p.classList.remove('active');p.style.display='none'});
  if(id==='dashboard'){
    document.getElementById('page-dashboard').style.display='flex';
    setTimeout(()=>drawTVChart(),50);
  } else {
    const pg=document.getElementById('page-'+id);
    if(pg){pg.style.display='flex';pg.classList.add('active');}
    if(id==='portfolio') setTimeout(initPortCharts,80);
    if(id==='performance') setTimeout(()=>{ initPerfCharts(); renderTradeHistory('all'); },80);
    if(id==='risk') setTimeout(initRiskCharts,80);
    if(id==='settings') renderSettings(S.settingsTab);
    if(id==='calendar') renderCalendar();
    if(id==='risk') renderRiskContent();
  }
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  else{ const tabs=document.querySelectorAll('.nav-tab'); tabs.forEach(t=>{if(t.onclick&&t.onclick.toString().includes("'"+id+"'"))t.classList.add('active')}); }
}

// ===== MARKET DROPDOWNS =====
function toggleMarket(id){
  const body=document.getElementById('mg-'+id);
  const arr=document.getElementById('arr-'+id);
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  if(arr) arr.classList.toggle('open',!isOpen);
}
function toggleSection(id){
  const body=document.getElementById(id+'Body');
  const arrow=document.getElementById(id+'Arrow');
  const isOpen=body.style.maxHeight!=='0px'&&body.style.maxHeight!=='';
  body.style.maxHeight=isOpen?'0px':'300px';
  if(arrow) arrow.textContent=isOpen?'▶':'▼';
}
function toggleOPP(){
  const t=document.querySelector('.opp-table');
  t.style.display=t.style.display==='none'?'block':'none';
}

// ===== PAIR SWITCHING =====
function setPair(pair,price,el){
  S.pair=pair;
  document.querySelectorAll('.pair-row').forEach(r=>r.classList.remove('active'));
  el.classList.add('active');
  const info=S.prices[pair]||{p:price,d:5};
  const dp=info.d;
  document.getElementById('chPair').textContent=pair;
  document.getElementById('chPrice').textContent=info.p.toFixed(dp);
  document.getElementById('tradePriceLive').textContent=info.p.toFixed(dp);
  const sl=(info.p-info.p*0.003).toFixed(dp),tp=(info.p+info.p*0.0045).toFixed(dp);
  document.getElementById('fSL').value=sl;
  document.getElementById('fTP').value=tp;
  calcRisk();
  CH_gen(pair);
}
function setActivePair(pair){
  const el=document.querySelector(`.pair-row[onclick*="'${pair}'"]`);
  if(el) setPair(pair,S.prices[pair]?.p||1,el);
}

