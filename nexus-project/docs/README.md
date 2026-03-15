# NEXUS TRADE — AI Trading Platform

## هيكل المشروع | Project Structure

```
nexus-project/
├── index.html                    ← نقطة الدخول الرئيسية
├── nexus-trade-full.html         ← النسخة الأحادية الكاملة (للمرجع)
├── start.bat                     ← تشغيل على Windows
├── start.sh                      ← تشغيل على Mac/Linux
│
├── src/
│   ├── css/
│   │   └── main.css              ← كل التصميم
│   │
│   └── js/
│       ├── chart/
│       │   └── chart.js          ← محرك الشارت (TradingView-grade)
│       │
│       ├── core/
│       │   ├── state.js          ← الحالة العامة والأسعار واللغة
│       │   ├── navigation.js     ← التنقل بين الصفحات والتبويبات
│       │   ├── ticker.js         ← تحديث الأسعار الحية
│       │   ├── trade.js          ← لوحة التنفيذ والرافعة
│       │   ├── positions.js      ← الصفقات المفتوحة
│       │   ├── riskCalc.js       ← حاسبة حجم العقد والمخاطر
│       │   ├── alerts.js         ← التنبيهات الذكية الصوتية
│       │   ├── clock.js          ← الساعة الحية
│       │   └── toast.js          ← إشعارات الشاشة
│       │
│       ├── ai/
│       │   ├── signals.js        ← إشارات AI للتداول
│       │   └── analysis.js       ← التحليل الفني بالذكاء الاصطناعي
│       │
│       ├── bot/
│       │   └── bot.js            ← بوت التداول الآلي
│       │
│       └── pages/
│           ├── portfolio.js      ← صفحة المحفظة
│           ├── performance.js    ← صفحة الأداء والتصدير
│           ├── calendar.js       ← الأجندة الاقتصادية
│           └── settings.js       ← صفحة الإعدادات
│
└── docs/
    ├── BUGS.md                   ← قائمة الأخطاء المعروفة
    └── CHANGELOG.md              ← سجل التغييرات
```

---

## التشغيل السريع | Quick Start

### Windows
```
انقر مرتين على: start.bat
```
أو افتح `index.html` مباشرة في المتصفح.

### Mac / Linux
```bash
./start.sh
```

### متطلبات | Requirements
- متصفح حديث: Chrome 90+ / Firefox 88+ / Edge 90+
- لا يحتاج Node.js أو أي خادم (يعمل كـ static files)
- اتصال إنترنت للخطوط و Chart.js CDN فقط

---

## المميزات | Features

| الميزة | الحالة |
|--------|--------|
| شارت TradingView-grade (Canvas) | ✅ يعمل |
| 6 أنواع شارت (Candle/HA/Bar/Line/Area/Hollow) | ✅ |
| سحب وتكبير بالماوس | ✅ |
| RSI / MACD / Stochastic | ✅ |
| MA(20/50) / BB / VWAP | ✅ |
| أدوات رسم (HLine/Trend/Fib/Rect) | ✅ |
| حاسبة حجم العقد | ✅ |
| تنبيهات ذكية صوتية | ✅ |
| بوت تداول آلي | ✅ |
| تحليل AI (يحتاج API key) | ✅ |
| تصدير CSV/PDF/JSON | ✅ |
| عربي/إنجليزي RTL/LTR | ✅ |

---

## الأخطاء المعروفة | Known Bugs

انظر `docs/BUGS.md` للقائمة الكاملة.

### عاجل (يؤثر على الاستخدام):
1. **أسعار الشارت تنجرف** — بعد وقت طويل، الشمعات الحية تبتعد عن السعر الحقيقي
2. **خطوط الرسم لا تثبت بعد السكرول** — Fib/Trend تتحرك عند التمرير
3. **صفحات خارج لوحة التحكم فارغة** — تحتاج ربط بـ `all.js` أو الملف الكامل

### ثانوي:
4. RSI يرسم بألوان منفصلة لكل نقطة (يسبب تأخراً طفيفاً)
5. لا يوجد حفظ للرسومات (تختفي عند تحديث الصفحة)
6. الشارت لا يستجيب لتغيير حجم النافذة فوراً (يحتاج ثانية)

---

## للتطوير | Development Notes

### إضافة مؤشر جديد:
```javascript
// في chart.js، أضف في دالة CH_drawMain():
if (ST.inds.newIndicator) {
  const vals = CH_newIndicator(cls, period).slice(ST.startIdx, ST.startIdx + bars.length);
  // ارسم الخط ...
}
```

### تغيير مصدر البيانات:
```javascript
// في state.js، عدّل S.prices أو استبدل CH_gen() بـ API حقيقي:
async function CH_fetchLive(pair) {
  const res = await fetch(`https://api.yourbroker.com/price/${pair}`);
  const data = await res.json();
  // بناء ST.candles من data...
}
```

### ربط Anthropic AI:
```javascript
// في ai/analysis.js، استبدل mock response بـ:
const response = await fetch("https://api.anthropic.com/v1/messages", {
  headers: { "x-api-key": YOUR_API_KEY, ... }
});
```

---

## الإصدارات | Versions

- **v2.0** — الإصدار الحالي (مقسّم إلى وحدات)
- **nexus-trade-full.html** — الملف الأحادي الكامل (للمرجع والنشر السريع)
