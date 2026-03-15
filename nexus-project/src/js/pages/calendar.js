// ===== CALENDAR =====
const calEvents=[
  {time:'08:30',event:'Non-Farm Payrolls (NFP)',country:'🇺🇸 USD',impact:'high',prev:'243K',fore:'235K',actual:'248K'},
  {time:'10:00',event:'Fed Chair Speech',country:'🇺🇸 USD',impact:'high',prev:'—',fore:'—',actual:'—'},
  {time:'11:00',event:'ECB Interest Rate Decision',country:'🇪🇺 EUR',impact:'high',prev:'3.75%',fore:'3.50%',actual:'—'},
  {time:'13:30',event:'US CPI m/m',country:'🇺🇸 USD',impact:'high',prev:'0.3%',fore:'0.2%',actual:'—'},
  {time:'15:00',event:'BOE Governor Speech',country:'🇬🇧 GBP',impact:'med',prev:'—',fore:'—',actual:'—'},
  {time:'17:00',event:'US ISM Manufacturing PMI',country:'🇺🇸 USD',impact:'med',prev:'49.3',fore:'49.8',actual:'—'},
  {time:'23:50',event:'BoJ Monetary Policy Statement',country:'🇯🇵 JPY',impact:'high',prev:'—',fore:'Hawkish',actual:'—'},
];
function renderCalendar(){
  document.getElementById('calRows').innerHTML=calEvents.map(e=>`
    <div class="dt-row cal-table"><span class="cal-time">${e.time}</span><span class="cal-event">${e.event}</span><span class="cal-country"><span class="news-impact ${e.impact==='high'?'ni-high':'ni-med'}" style="margin-bottom:0">${e.impact==='high'?'H':'M'}</span>${e.country}</span><span class="cal-prev">${e.prev}</span><span class="cal-fore">${e.fore}</span><span class="cal-actual" style="color:${e.actual==='—'?'var(--text4)':'var(--green)'}">${e.actual}</span></div>`).join('');
}

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

