# WaslPay 2.3.2 — accessibility labels for key actions

Revision: Saturday, 19 September 2026 (Asia/Shanghai).
Baseline checked before editing: current `main` WaslPay 2.3.1 files and release notes.

## Delivered
- Add a small additive accessibility layer for the local web preview: explicit Arabic labels for opening wallet messages, family requests, web-app installation, and the latest-payment details action.
- Preserve the existing family, household-budget, gift, rafd, Eid-gift, savings, message, and allowance-warning logic unchanged.
- Keep the existing storage key, demo data, and local-only behavior unchanged; no reset or deletion migration was added.
- Update the visible preview version/date and the PWA shell to `waslpay-demo-shell-2.3.2`; add the new script to the explicit cache list.
- All changes remain under `waslpay/`.

## Validation
- JavaScript syntax checked for `accessibility-2.3.2.js` and `sw.js`.
- Static checks confirm Arabic RTL, visible version/date, script load order, and exact cache inclusion of the new asset.
- Service-worker behavior remains scoped to the WaslPay shell and continues to bypass POST, API-like, authorization-bearing, no-store, future-version, and unrelated-project requests.

## Limits
No physical Android/iPhone/iPad or Safari/WebKit device test was available in this run. No APK rebuild, iOS binary, store publication, real payments, banking, cross-device sync, push notification, fundraising, or commercial advertising was added.
