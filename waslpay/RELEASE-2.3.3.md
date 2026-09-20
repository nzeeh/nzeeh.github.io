# WaslPay 2.3.3 — household budget context in wallet messages

Revision: Sunday, 20 September 2026 (Asia/Shanghai).
Baseline checked before editing: live `main` commit `49d808dfaa01aeb2cc6bc4f19352e7d9173b5266`, WaslPay 2.3.2.

## Delivered
- Add a read-only message enhancement for successful `householdPay` records. Wallet message cards and the immediate in-app payment banner now show the household budget remaining after that purchase, using the receipt snapshot already stored at transaction time.
- If the household daily budget is exhausted, show a concise Arabic message that it is exhausted for the day rather than displaying an ambiguous zero-only figure.
- Keep the detailed receipt behavior already present in 2.3.0; do not recalculate or guess missing historical household balances.
- Update the in-app “What’s new?” dialog to 2.3.3 with today’s improvement.
- Preserve all family allowances, per-payment limits, categories, requests, pauses, Eid gifts, social gifts/rafd, savings goals, household delegation and existing demo storage unchanged.
- Bump the visible web preview and PWA cache shell to 2.3.3 and cache the new additive script at its exact version.
- All repository changes remain under `waslpay/`.

## Validation actually run
- JavaScript syntax checks passed for `household-message-summary-2.3.3.js` and `sw.js`.
- 8 focused household-message summary checks passed: valid snapshot, formatted remaining amount, exhausted state, ordinary-payment isolation, legacy receipt isolation, invalid snapshot rejection and defensive negative handling.
- 19 mocked service-worker checks passed: 22 exact cached public assets, new 2.3.3 script offline availability, old-cache cleanup, explicit activation, network-first navigation, future/unversioned asset bypass, and isolation from other projects, API-like traffic, POST, cross-origin, authorization-bearing and no-store requests.
- 5 static HTML checks passed for Arabic RTL, visible 2.3.3 version, Sunday 20 September 2026 date, exact script inclusion and safe load order after the existing accessibility layer.

## Limits
No physical Android/iPhone/iPad or Safari/WebKit device was tested in this run. No APK or iOS binary was built. This remains a local Web/PWA preview: no real payments, banking, cross-device sync, push notifications, commercial advertising or public investment intake was enabled.
