/**
 * NEXUS TRADE — Global State & Language
 * src/js/core/state.js
 */

// ─── LANGUAGE ────────────────────────────────────────────
let LANG = 'ar';

function setLang(l) {
  LANG = l;
  const root = document.getElementById('htmlRoot');
  root.lang = l;
  root.dir = l === 'ar' ? 'rtl' : 'ltr';
  root.style.direction = l === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('btnAR')?.classList.toggle('active', l === 'ar');
  document.getElementById('btnEN')?.classList.toggle('active', l === 'en');
  const liveLabel = document.getElementById('liveLabel');
  const ntLabel   = document.getElementById('ntLabel');
  if (liveLabel) liveLabel.textContent = l === 'ar' ? 'مباشر' : 'LIVE';
  if (ntLabel)   ntLabel.textContent   = l === 'ar' ? 'أخبار' : 'NEWS';
  document.querySelectorAll('[data-ar]').forEach(el => {
    const val = el.getAttribute('data-' + l);
    if (val) el.textContent = val;
  });
  showToast(l === 'ar' ? 'تم التبديل إلى العربية 🇸🇦' : 'Switched to English 🇺🇸');
}

// ─── PRICES ──────────────────────────────────────────────
const S = {
  pair:       'EUR/USD',
  mode:       'buy',
  lev:        '1:10',
  anPair:     'EUR/USD',
  botOn:      false,
  botInterval: null,
  botLogs:    [],
  settingsTab: 'api',
  chartData:  [],
  chartType:  'candle',
  activeChart: null,
  portChart:  null,
  allocChart: null,

  prices: {
    'EUR/USD': { p: 1.08432, d: 5 },
    'GBP/USD': { p: 1.27184, d: 5 },
    'USD/JPY': { p: 149.820, d: 3 },
    'USD/CHF': { p: 0.88920, d: 5 },
    'AUD/USD': { p: 0.65441, d: 5 },
    'USD/CAD': { p: 1.36280, d: 5 },
    'NZD/USD': { p: 0.60180, d: 5 },
    'EUR/GBP': { p: 0.85310, d: 5 },
    'XAU/USD': { p: 2944.20, d: 2 },
    'XAG/USD': { p: 32.44,   d: 2 },
    'XPT/USD': { p: 985.60,  d: 2 },
    'BTC/USD': { p: 84120,   d: 0 },
    'ETH/USD': { p: 3280,    d: 0 },
    'SOL/USD': { p: 142.5,   d: 2 },
    'XRP/USD': { p: 0.5840,  d: 4 },
    'SPX500':  { p: 5842,    d: 0 },
    'NAS100':  { p: 20140,   d: 0 },
    'GER40':   { p: 18240,   d: 0 },
  }
};
