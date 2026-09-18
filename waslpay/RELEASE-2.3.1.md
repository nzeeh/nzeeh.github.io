# WaslPay 2.3.1 — delegated household access guard

Revision: Friday, 18 September 2026 (Asia/Shanghai).
Baseline checked before editing: `main` commit `e9b145be83cf2b15a07bca55a3df7f17c21fd447`, WaslPay 2.3.0.

## Fixed
- The household-budget overview displayed the “شراء من مصروف البيت” button to every member preview whenever the household budget was enabled. Children, paused adults, and adults who were not delegated could therefore enter purchase details only to be rejected by the domain rule at confirmation.
- Add a read-only UI access guard: the owner keeps access when the household budget is enabled; a member preview gets the purchase button only when that member is an active adult explicitly delegated in the existing household settings.
- Block stale/accidental clicks as defense in depth and show a clear Arabic explanation instead of a late payment-form rejection.
- Keep the server-equivalent/domain authorization rule unchanged. No wallet, allowance, household, gift, rafd, Eid gift, savings, request, transaction, or local-storage accounting rule was modified.
- Update the in-app “ما الجديد” panel and visible preview version to 2.3.1.
- Add the guard to the versioned PWA shell; cache version becomes `waslpay-demo-shell-2.3.1` with 20 explicit public demo assets. Other projects and API-like traffic remain outside this cache.

## Tests actually executed
- JavaScript syntax check passed for `household-access-2.3.1.js` and `sw.js`.
- 8 focused authorization checks passed: owner, delegated active adult, paused adult, child, undelegated adult, missing member, disabled household budget, and release version.
- 22 mocked service-worker checks passed: exact new asset caching, offline availability, old-cache cleanup, future/unversioned bypass, cross-project/API isolation, authorization/no-store bypass, network-first navigation, and explicit activation.
- 5 static HTML assertions passed for Arabic RTL, visible version/date, exact guard script version, and load order after the existing community UI.

## Limits
No physical Android/iPhone/iPad or Safari/WebKit device was tested in this run. A local headless Chromium DOM harness was attempted but did not return usable rendered output in the execution environment, so it is not counted as a browser-layout test. This remains a local Web/PWA simulation: no banking, real payments, cross-device sync, push notifications, fundraising, commercial advertising, APK rebuild, iOS binary, App Store, or Google Play publication.
