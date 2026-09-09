# WaslPay 2.1.0 — phones and tablets
Revision: Thursday, 10 September 2026.

Responsive Arabic/RTL web preview for modern Android, iPhone and iPad browsers. Fluid tablet dashboards and family cards, portrait/landscape layouts, safe-area padding, 16px form fields, larger touch targets, PWA manifest/icons, platform-specific home-screen installation help, and an offline demo shell restricted to /waslpay/.

All family budgets, gifts and savings remain local simulations. Existing v2 local-storage data is preserved. No bank calls, real payments, cross-device accounts, push notifications or payment queues. The previous APK has NOT been rebuilt. No App Store or Google Play release is claimed.

Validation: 12 Chromium viewport/touch emulations passed (320–1440px), 22 existing domain tests passed, 8 service-worker handler unit checks passed using mocked network/cache. No physical devices or Safari/WebKit engine were tested. Actual home-screen installation still needs device testing. UI tests used an in-memory document and mocked localStorage because local navigation is blocked in the test environment.
