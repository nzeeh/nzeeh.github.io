# WaslPay 2.1.1 — reliable web-preview updates

Revision: Tuesday, 15 September 2026 (Asia/Shanghai).

## Fixed
- Reproduced a stale-version cache defect in 2.1.0: a request for a future CSS or JavaScript query version could receive the previous cached file because ignoreSearch was enabled.
- Match cached assets by exact URL/version. Requests for other versions fall through to the network, never to a stale substitute.
- Keep demo-shell navigation available offline; limit interception to explicit public WaslPay assets. Authorization-bearing and no-store requests bypass the cache.
- Check for a new release on app resume, page show and reconnection, with a one-minute throttle. Activation remains user-initiated; no form is automatically reloaded.
- Use a new platform script filename so the previous service worker cannot intercept the new script under its old version-insensitive rule.
- Refresh the visible revision date and version without changing family budgets, gift balances, savings logic or local-storage keys.

## Validation
- Reproduced the old stale-cache behavior using a mocked cache/network harness.
- 19 service-worker unit checks passed; 7 mocked app-resume/update-check assertions passed.
- 22 existing family/gift/savings domain tests passed.
- 12 Chromium viewport/touch simulations passed, including gift and allowance interaction flows; no page errors reported.
- JavaScript syntax checks passed.

Limits: these are unit tests and browser emulation, not physical Android/iPhone/iPad testing or Safari/WebKit certification. Home-screen installation and real device offline/update transitions still need device testing. No APK rebuild or App Store/Google Play publication. This remains a local demo with no bank integration or real money.
