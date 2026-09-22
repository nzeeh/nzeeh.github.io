# WaslPay 2.3.5 — household-budget warning integrity

Revision: Tuesday, 22 September 2026 (Asia/Shanghai).
Baseline checked before editing: `main` commit `07114a43b880efa258696b4cf2b4ef9cc1421cac`, WaslPay 2.3.4.

## Fixed / improved
- Fix a read-only receipt-integrity edge case in the 2.3.4 household-message summary: a malformed negative `householdLeft` value was clamped to zero and could therefore be displayed as if the daily household budget were exhausted. The 2.3.5 reader now accepts only safe-integer snapshots with `0 <= householdLeft <= householdLimit` and `householdLimit > 0`; malformed historical data is ignored rather than guessed.
- Add an explicit low-household-budget warning to successful household-payment messages when 20% or less of the saved daily budget remains. At zero, the existing clear exhausted wording remains.
- Show the same saved snapshot context on the message card, transaction detail and live in-app transaction notice. The warning is derived only from the receipt snapshot saved at the time of the operation; later settings do not rewrite old messages.
- Add restrained visual emphasis for low/exhausted household-budget messages. No child screen, payment-confirmation form, advertisement, investment flow or bank integration is changed.
- Update the in-app “What’s new?” note, visible preview version and PWA shell to 2.3.5. All changes are confined to `waslpay/`.

## Preserved
- No wallet debit, shared-balance, family allowance, per-payment limit, category, request, pause, gift, rafd, Eid-gift, savings-goal, household authorization, storage-key or reset rule is changed.
- Gift/rafd payments remain separate from reserved Eid-gift envelopes, and household spending remains separate from personal allowances.
- Existing demo data is not reset or migrated.

## Validation actually run
- JavaScript syntax checks passed for `household-message-summary-2.3.5.js` and `sw.js`.
- 13 focused household-message tests passed: transaction isolation, missing snapshot handling, rejection of negative/invalid snapshots, limit consistency, 20% threshold, percentage rounding, zero-budget exhaustion and Arabic summary text.
- 12 index/PWA integrity assertions passed: Arabic RTL, visible version/date, Android/Apple install attributes, intact Arabic messages notice, new CSS/JS selection, exact cache version and cache-safety guards.
- 18 mocked service-worker checks passed: exact 23 public assets, offline shell and new JS/CSS availability, old-cache cleanup, future/unversioned asset bypass, cross-project/API/POST/cross-origin/auth/no-store isolation and explicit update activation.
- HTML was parsed with an HTML5 parser and checked for unique application/dialog IDs and expected script/style ordering.
- A local headless-Chromium viewport probe was attempted, but this runtime did not return a stable DOM result; it is not counted as a passed device/layout test.

## Limits
No physical Android phone/tablet, iPhone, iPad or Safari/WebKit device was tested in this run. No APK or iOS binary was built. This remains a local Web/PWA preview: no real payments, banking, cross-device sync, push notifications, commercial advertising or public investment intake was enabled.
