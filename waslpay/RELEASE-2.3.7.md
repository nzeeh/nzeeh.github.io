# WaslPay 2.3.7 — safe-area correction for edge-to-edge displays

Revision: Thursday, 24 September 2026 (Asia/Shanghai).
Baseline checked before editing: `main` commit `2290828bae8090cf314fc2d87d79b083da49baf0`, WaslPay 2.3.6.

## Fixed
- Fix a verified edge-to-edge layout defect in the top demo ribbon. The existing responsive rule used `env(safe-area-inset-right)` for both horizontal sides, so in a landscape orientation where the obstructed/notched side is the physical left edge, the left padding could remain too small.
- Add `safe-area-2.3.7.css` so the ribbon now uses `safe-area-inset-left` for physical left padding and `safe-area-inset-right` for physical right padding, each with the existing 12px minimum.
- Preserve `viewport-fit=cover`, Arabic RTL, Android/iPhone/iPad install affordances, and the existing bottom-navigation safe-area behavior.
- Update the visible preview version and in-app “What’s new?” note to 2.3.7.

## Preserved
- No wallet debit, shared balance, daily/weekly/monthly allowance, per-payment limit, spending category, increase request, pause, savings, household authorization, gift, rafd, or Eid-gift rule changed.
- Household spending remains separate from personal allowances and is still debited once. Gift/rafd remains separate from reserved Eid-gift envelopes; opening a reserved Eid gift does not create a second debit.
- Existing local-storage key/schema and demo data are unchanged; no reset, migration, member deletion, or balance rewrite is introduced.
- No bank, real payment, remote sync, push notification, commercial ad network, public investment intake, APK, or iOS binary was added.

## Validation actually run before publication
- 14 household-message regression tests passed, preserving snapshot validation, the 20% household-budget warning, exhausted-budget wording, and idempotent rendering.
- 4 focused safe-area tests passed, verifying independent physical left/right inset usage and rejecting accidental cross-use of the opposite inset.
- 18 mocked service-worker tests passed, including an exact 24-asset public precache, offline shell, 2.3.7 JS/CSS availability, old-cache cleanup, future/unversioned bypass, and isolation from other projects, API-like paths, POST, cross-origin, Authorization, and `no-store` traffic.
- 10 index-integrity tests passed: Arabic RTL, `viewport-fit=cover`, 2.3.7 version/date, new CSS/JS selection, Android/Apple install attributes, no old 2.3.6 household JS reference, and no Unicode replacement characters.
- JavaScript syntax checks passed for `household-message-summary-2.3.7.js` and `sw.js`.

## Technical basis
WebKit documents that sites using `viewport-fit=cover` should respect `safe-area-inset-left`, `safe-area-inset-right`, `safe-area-inset-top`, and `safe-area-inset-bottom` independently so important content is not obscured on edge-to-edge displays.

## Limits
No physical Android phone/tablet, iPhone, iPad, Safari/WebKit device, installed PWA, APK, or iOS binary was tested or built in this run. The safe-area correction was validated statically and by automated local tests, not by claiming a real-device result. This remains a local Web/PWA demo with no real money or cross-device delivery.
