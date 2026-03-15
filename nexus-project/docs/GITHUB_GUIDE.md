# دليل رفع NEXUS TRADE على GitHub

## ما ستحتاجه
- حساب GitHub مجاني على: https://github.com
- المتصفح فقط (لا تحتاج تثبيت أي برنامج)

---

## الطريقة الأولى: رفع مباشر من المتصفح (أسهل)

### الخطوة 1: إنشاء حساب GitHub
1. اذهب إلى **https://github.com**
2. انقر **Sign up** وأكمل التسجيل

### الخطوة 2: إنشاء Repository جديد
1. بعد تسجيل الدخول، انقر زر **+** في أعلى اليمين
2. اختر **New repository**
3. اكتب اسماً مثل: `nexus-trade`
4. اختر **Public** (مجاني ويمكن نشره)
5. ✅ ضع علامة على **Add a README file**
6. انقر **Create repository**

### الخطوة 3: رفع الملفات
1. في صفحة الـ repository، انقر **Add file**
2. اختر **Upload files**
3. اسحب هذه الملفات من مجلد `nexus-project`:
   - `nexus-trade-full.html` ← **الأهم**
   - `start.bat`
   - `index.html`
   - مجلد `src/` بالكامل
   - مجلد `docs/` بالكامل
4. في خانة **Commit changes** اكتب: `Initial upload`
5. انقر **Commit changes**

### الخطوة 4: تفعيل GitHub Pages (نشر الموقع)
1. انقر **Settings** في أعلى الـ repository
2. من القائمة اليسرى، انقر **Pages**
3. تحت **Source** اختر **Deploy from a branch**
4. اختر **main** ثم **/ (root)**
5. انقر **Save**
6. انتظر دقيقة، ستظهر رسالة:
   `Your site is live at: https://USERNAME.github.io/nexus-trade/`

---

## الطريقة الثانية: باستخدام Git (للمحترفين)

### تثبيت Git على Windows
1. حمّل من: **https://git-scm.com/download/win**
2. ثبّت بالإعدادات الافتراضية

### الخطوات
افتح **CMD** أو **PowerShell** داخل مجلد المشروع:

```bash
# 1. تهيئة Git
git init

# 2. إضافة remote (استبدل USERNAME باسم حسابك)
git remote add origin https://github.com/USERNAME/nexus-trade.git

# 3. إضافة الملفات
git add .

# 4. أول commit
git commit -m "Initial: NEXUS TRADE v2.0"

# 5. رفع للـ GitHub
git push -u origin main
```

---

## بعد الرفع: رابط الموقع المباشر

```
https://USERNAME.github.io/nexus-trade/nexus-trade-full.html
```

استبدل `USERNAME` باسم حساب GitHub الخاص بك.

---

## تحديث الملفات لاحقاً

### من المتصفح:
1. انقر على الملف في GitHub
2. انقر أيقونة **القلم** (Edit)
3. عدّل ثم انقر **Commit changes**

### من Git:
```bash
git add .
git commit -m "Fix: chart improvements"
git push
```

---

## نصائح مهمة

| ✅ افعل | ❌ لا تفعل |
|---------|-----------|
| ضع `nexus-trade-full.html` في root المجلد | تغيير أسماء الملفات |
| استخدم Public repository للنشر المجاني | وضع API keys في الكود |
| فعّل GitHub Pages لرابط مباشر | رفع ملفات كبيرة جداً (+100MB) |

---

## في حال وجود مشكلة

**المشكلة:** الصفحة تظهر فارغة بعد النشر  
**الحل:** تأكد أن `nexus-trade-full.html` في المجلد الرئيسي مباشرةً

**المشكلة:** رابط Pages لا يعمل  
**الحل:** انتظر 5 دقائق بعد تفعيل Pages ثم حاول

**المشكلة:** Git يطلب username/password  
**الحل:** استخدم **Personal Access Token** من GitHub Settings → Developer Settings
