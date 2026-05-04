---
Task ID: 1
Agent: main
Task: Add native browser push notifications for both mobile and desktop versions

Work Log:
- Explored existing notification system: useNotificationStore, NotificationEngine, MobileToastOverlay, NotificationCenter, ServiceWorkerRegistrar, sw.js
- Identified gap: notifications only showed as in-app toasts, no native browser push notifications
- Modified useNotificationStore.ts: Added browserNotifications setting, integrated native Notification API into addNotification()
- Created NotificationPermissionBanner.tsx: iOS-style banner requesting notification permission from user
- Created PushNotificationManager.tsx: Background component that monitors permission state and auto-requests on interaction
- Integrated both components into mobile layout and desktop layout
- Added browserNotifications toggle to NotificationCenter settings (desktop) and mobile notifications page settings
- Built successfully, committed, and pushed to GitHub

Stage Summary:
- Native browser notifications now fire on both mobile and desktop when a notification is added to the store
- Permission banner appears asking user to enable device notifications
- PushNotificationManager handles auto-request and permission monitoring
- Notifications include RTL Arabic, vibration patterns, priority-based behavior
- Clicking a notification navigates to the relevant page (chart, bot, AI, scanner)
- Commit: d733a8a pushed to main on GitHub
