// ===== SETTINGS =====
function switchSettings(tab,el){
  S.settingsTab=tab;
  document.querySelectorAll('.sn-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  renderSettings(tab);
}
function renderSettings(tab){
  const c=document.getElementById('settingsContent');
  if(tab==='api'){
    c.innerHTML=`<div class="s-section-title">API CONNECTIONS</div>
      ${[['🟡','Binance','binance','Disconnected'],['🔵','MetaTrader 5','mt5','Disconnected'],['🟠','Bybit','bybit','Disconnected'],['⚪','Interactive Brokers','ib','Disconnected'],['🟢','OANDA','oanda','Connected']].map(([icon,name,id,status])=>`
      <div class="api-key-row">
        <span class="api-exchange-icon">${icon}</span>
        <div style="flex:1">
          <div class="api-exchange-name">${name}</div>
          <div class="api-exchange-status ${status==='Connected'?'api-connected':'api-disconnected'}">● ${status}</div>
        </div>
        <input class="api-inp" placeholder="API Key" id="apiKey-${id}" style="max-width:140px">
        <input class="api-inp" placeholder="Secret" type="password" style="max-width:120px">
        <button class="api-connect-btn" onclick="connectAPI('${name}',this)">${LANG==='ar'?'ربط':'Connect'}</button>
      </div>`).join('')}`;
  } else if(tab==='customize'){
    c.innerHTML=`<div class="s-section-title">THEMES</div>
      <div class="theme-grid">
        <div class="theme-swatch selected" style="background:linear-gradient(135deg,#020408,#0c1520)" onclick="selectTheme(this)"><span style="color:var(--cyan)">Cyber</span></div>
        <div class="theme-swatch" style="background:linear-gradient(135deg,#080400,#201000)" onclick="selectTheme(this)"><span style="color:#f5c518">Gold</span></div>
        <div class="theme-swatch" style="background:linear-gradient(135deg,#000808,#001a10)" onclick="selectTheme(this)"><span style="color:#00ff88">Matrix</span></div>
        <div class="theme-swatch" style="background:linear-gradient(135deg,#0a0010,#1a0030)" onclick="selectTheme(this)"><span style="color:#8b5cf6">Purple</span></div>
      </div>
      <div class="s-section-title">LAYOUT</div>
      ${[['compact-mode','Compact Mode','Reduce spacing for more data'],['show-volume','Show Volume','Display volume bars on chart'],['show-indicators','Show Indicators','MA/RSI overlay on chart'],['dark-candles','Dark Candles','Use darker candle colors']].map(([id,label,sub])=>`
      <div class="s-toggle-row"><div><div class="s-toggle-label">${label}</div><div class="s-toggle-sub">${sub}</div></div><label class="toggle-sw"><input type="checkbox" ${id==='show-volume'||id==='show-indicators'?'checked':''}><div class="toggle-sl"></div></label></div>`).join('')}`;
  } else if(tab==='notif'){
    c.innerHTML=`<div class="s-section-title">NOTIFICATIONS</div>
      ${[['Price Alerts','Get notified when price hits target','checked'],['AI Signals','New AI trading signals','checked'],['Bot Trades','Bot execution notifications','checked'],['News Alerts','High-impact news events',''],['Risk Warnings','Margin & risk alerts','checked']].map(([l,s,ch])=>`
      <div class="s-toggle-row"><div><div class="s-toggle-label">${l}</div><div class="s-toggle-sub">${s}</div></div><label class="toggle-sw"><input type="checkbox" ${ch}><div class="toggle-sl"></div></label></div>`).join('')}`;
  } else if(tab==='security'){
    c.innerHTML=`<div class="s-section-title">SECURITY</div>
      <div class="f-grp" style="margin-bottom:16px"><div class="f-lbl">CURRENT PASSWORD</div><input class="f-inp" type="password" placeholder="••••••••"></div>
      <div class="f-grp" style="margin-bottom:16px"><div class="f-lbl">NEW PASSWORD</div><input class="f-inp" type="password" placeholder="••••••••"></div>
      <button onclick="showToast('✅ Password updated!')" style="padding:10px 20px;background:var(--cyan3);border:1px solid var(--border2);color:var(--cyan);border-radius:6px;cursor:pointer;font-family:var(--font-ui);font-weight:700">Update Password</button>
      <div class="s-divider"></div>
      <div class="s-section-title">2FA AUTHENTICATION</div>
      <div class="s-toggle-row"><div><div class="s-toggle-label">Two-Factor Auth</div><div class="s-toggle-sub">Secure login with authenticator app</div></div><label class="toggle-sw"><input type="checkbox"><div class="toggle-sl"></div></label></div>
      <div class="s-toggle-row"><div><div class="s-toggle-label">Login Notifications</div><div class="s-toggle-sub">Email on new login</div></div><label class="toggle-sw"><input type="checkbox" checked><div class="toggle-sl"></div></label></div>`;
  } else if(tab==='general'){
    c.innerHTML=`<div class="s-section-title">GENERAL SETTINGS</div>
      <div class="f-grp" style="margin-bottom:12px"><div class="f-lbl">DEFAULT CURRENCY</div><select class="f-inp" style="cursor:pointer"><option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option></select></div>
      <div class="f-grp" style="margin-bottom:12px"><div class="f-lbl">TIMEZONE</div><select class="f-inp" style="cursor:pointer"><option>UTC+3 (Riyadh)</option><option>UTC+4 (Dubai)</option><option>UTC+0 (London)</option><option>UTC-5 (New York)</option></select></div>
      <div class="f-grp" style="margin-bottom:12px"><div class="f-lbl">DATE FORMAT</div><select class="f-inp" style="cursor:pointer"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
      ${[['Sound Alerts','Play sound on trade execution','checked'],['Auto-Refresh','Auto refresh market data','checked'],['Confirm Trades','Confirm before executing','checked']].map(([l,s,ch])=>`
      <div class="s-toggle-row"><div><div class="s-toggle-label">${l}</div><div class="s-toggle-sub">${s}</div></div><label class="toggle-sw"><input type="checkbox" ${ch}><div class="toggle-sl"></div></label></div>`).join('')}`;
  }
}
function connectAPI(name,btn){
  btn.textContent=LANG==='ar'?'جارٍ الربط...':'Connecting...';
  setTimeout(()=>{btn.textContent=LANG==='ar'?'✓ متصل':'✓ Connected';btn.style.color='var(--green)';btn.style.borderColor='rgba(0,255,136,.3)';showToast(`✅ Connected to ${name}`);},1800);
}
function selectTheme(el){document.querySelectorAll('.theme-swatch').forEach(s=>s.classList.remove('selected'));el.classList.add('selected');showToast(LANG==='ar'?'تم تطبيق الثيم':'Theme Applied');}

// ===== TOAST =====
function showToast(msg,cls=''){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show '+(cls||'');
  setTimeout(()=>t.classList.remove('show'),3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
  // Init chart
  CH_gen('EUR/USD');
  setTimeout(()=>{ CH_bindEvents(); CH_initIndPanel(); requestAnimationFrame(CH_frame); },80);
  // live chart tick
  setInterval(CH_liveTick, 1500);

  renderOPP();
  renderSignals();
  calcRisk();
  renderSettings('api');
  const cp=S.prices['EUR/USD'];
  document.getElementById('fSL').value=(cp.p-0.005).toFixed(5);
  document.getElementById('fTP').value=(cp.p+0.0075).toFixed(5);
  // Live prices tick
  setInterval(()=>{tickPrices();renderOPP();},2000);
  // Portfolio balance
  setInterval(()=>{
    const b=28470+((Math.random()-.4)*50);
    const el=document.getElementById('pmBalance');
    if(el) el.textContent='$'+b.toFixed(2);
  },5000);
  // Resize
  window.addEventListener('resize',()=>{CH_dirty=true;});
  // Open forex by default
  const af=document.getElementById('arr-forex');
  if(af) af.classList.add('open');
});
</script>
