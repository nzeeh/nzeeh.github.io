# WaslPay 2.1.2 — whole-rial mobile amount entry

Revision: Tuesday, 15 September 2026 (Asia/Shanghai).

## Fixed
- The family/payment forms only accept whole Yemeni-rial amounts, but mobile fields were advertising a decimal keypad. That mismatch encouraged users to enter fractions that the domain validator always rejects.
- Add a small compatibility patch that normalizes all current and dynamically-created money fields from `inputmode="decimal"` to `inputmode="numeric"` on phones and tablets, including modal forms for allowances, gifts, goals and owner-wallet operations.
- Keep phone/text fields unchanged and do not change the amount parser, limits, family budgets, gift accounting, savings, local-storage schema or stored demo data.
- Bump the visible web-preview version and service-worker shell to 2.1.2 so installed/home-screen copies can receive the fix without stale asset substitution.

## Validation
- JavaScript syntax checks passed for `money-input-2.1.2.js` and `sw.js`.
- 4 focused input/version assertions passed: existing decimal money field becomes numeric, dynamically-targetable root input becomes numeric, and unrelated telephone input remains unchanged.
- 20 mocked service-worker checks passed: exact-version precache, offline shell, update activation, old-cache cleanup, cross-project isolation, no-store/auth bypass, and no stale substitution for future/unversioned assets.
- `family-v2.js`, its local-storage key/schema and all family/gift/savings business rules were not changed in this release.

Limits: no physical Android/iPhone/iPad or Safari/WebKit device was available in this run. This is a web/PWA preview update only; no APK was rebuilt and nothing was published to App Store or Google Play. No real bank, payment or personal-data integration was added.
