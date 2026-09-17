# WaslPay 2.2.1 — family allowance warnings

Revision: Thursday, 17 September 2026 (Asia/Shanghai).
Baseline checked on `main`: WaslPay 2.2.0 files remain unchanged while unrelated repository projects advanced independently.

## Delivered
- Add a read-only spending guard to successful family-payment messages. When a payment leaves 20% or less of that member's allowance, the live in-app message and message card show a warning; when the allowance reaches zero, the message clearly says it is exhausted.
- Store the member's allowance total inside new receipt snapshots before the existing state persistence, so the warning percentage remains tied to the allowance at the time of the transaction rather than later settings.
- Do not retrofit guessed percentages into old receipts. Legacy receipts only show an exhaustion warning when their saved remaining amount is exactly zero.
- Keep gift spending separate: gift payments do not trigger family-allowance warnings and do not change allowance totals.
- No balance, debit, budget-limit, gift, savings, request, or reset rule is changed. The existing local-storage state key/schema is preserved.
- Add the read-only warning assets to the versioned PWA shell and bump the preview/cache version to 2.2.1. Other repository projects and API-like traffic remain outside the service-worker cache.

## Tests actually executed in this run
- 22 existing wallet/domain tests passed.
- 18 existing message-domain tests passed.
- 9 focused spending-guard tests passed: non-family isolation, exhausted allowance, 20% threshold, above-threshold behavior, legacy receipts, snapshot stamping, immutable prior totals, and gift-payment isolation.
- 25 mocked service-worker checks passed: exact 15 cached public assets, offline shell, new JS/CSS offline availability, old-cache cleanup, future/unversioned asset bypass, cross-project/API isolation, authorization/no-store bypass, network-first navigation, and explicit update activation.
- Full Chromium touch/viewport regression rerun passed on 12 layouts from 320 to 1440 px, portrait and landscape, with the existing 14 transaction/message/request flows plus focused low-allowance UI checks at 20% and 0% remaining.
- JavaScript syntax checks passed for the new warning script and service worker.

## Limits
No physical Android/iPhone/iPad or Safari/WebKit device was available in this run. Chromium tests use in-memory pages with mocked localStorage because local navigation is blocked in the test environment. This remains a local web/PWA demo: no server, real-time cross-device delivery, push notification, bank connection, real money, APK rebuild, iOS binary, App Store release, or Google Play release.
