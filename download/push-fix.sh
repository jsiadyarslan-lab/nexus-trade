#!/bin/bash
# سكريبت لإصلاح الشارت على الموبايل ورفع التغييرات إلى GitHub
# كيفية الاستخدام:
# 1. انسخ هذا السكريبت إلى مجلد المشروع المحلي
# 2. تشغيل: bash push-fix.sh

echo "🔧 إصلاح الشارت على الموبايل..."

# التأكد من أننا في مجلد المشروع الصحيح
if [ ! -f "package.json" ]; then
  echo "❌ يرجى تشغيل هذا السكريبت من داخل مجلد nexus-trade"
  exit 1
fi

# إضافة التغييرات
git add css/styles.css index.html nexus-trade-full.html

# التحقق من التغييرات
echo "📋 التغييرات المضافة:"
git diff --cached --stat

# تأكيد
read -p "هل تريد الرفع إلى GitHub؟ (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git commit -m "fix: mobile chart - sidebar hidden, trade panel becomes slide-over overlay, chart takes full width"
  git push origin main
  echo "✅ تم الرفع بنجاح!"
else
  echo "⏸️ تم الإلغاء"
fi
