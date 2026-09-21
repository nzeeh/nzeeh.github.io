# WaslPay 2.3.4 — install-tab and Arabic markup integrity fix

Revision: Monday, 21 September 2026 (Asia/Shanghai).
Baseline checked before editing: `main` commit `5236d932ab737ac65e4039860ecc6b12c06c5682`, WaslPay 2.3.3.

## Fixed
- Correct a malformed Apple install-tab attribute in `index.html` (`data-platform`), which prevented the iPhone/iPad tab from reliably passing `apple` to the existing install-help handler.
- Restore the corrupted Arabic messages notice to: `تحديث فوري داخل هذه المعاينة فقط`.
- Restore the missing closing tag on the family-requests header button so the header has valid, predictable interactive markup.
- Carry forward the 2.3.3 household-budget message summary unchanged in a 2.3.4 versioned script, and update the in-app “What’s new?” badge/note to this release.
- Bump the visible preview and PWA shell to 2.3.4. Replace only the versioned household-message script in the public cache list; no payment, family, gift, rafd, savings, allowance, household-budget or storage rules are changed.
- All repository changes remain under `waslpay/`.

## Validation actually run
- 12 index/release integrity assertions passed: Arabic RTL, no Unicode replacement character, valid Android/Apple install-tab data attributes, correct Arabic messages notice, closed family-requests button, visible version/date, versioned household-message script selection, PWA cache version/asset selection, and current in-app release note.
- 19 mocked service-worker checks passed: exact 22 cached public assets, new 2.3.4 household-message asset availability offline, old-cache cleanup, explicit activation, network-first navigation, future/unversioned asset bypass, and isolation from other projects, API-like traffic, POST, cross-origin, authorization-bearing and no-store requests.
- JavaScript syntax checks passed for `household-message-summary-2.3.4.js` and `sw.js`.
- The 2.3.4 household-message module preserves the same snapshot/summary rules as 2.3.3; no business-state write path was added.

## Limits
No physical Android/iPhone/iPad or Safari/WebKit device was tested in this run. No APK or iOS binary was built. This remains a local Web/PWA preview: no real payments, banking, cross-device sync, push notifications, commercial advertising or public investment intake was enabled.
