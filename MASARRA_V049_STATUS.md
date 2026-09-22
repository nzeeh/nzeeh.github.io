# Masarra Pro 0.4.9 — staging status

Date: Tuesday, 22 September 2026 (China time)

This branch records the verified staging status only. The complete source is delivered separately as `Masarra-Pro-v0.4.9-Source-Android-iOS.zip`; do not infer that this branch contains the complete source tree.

Verified source ZIP SHA-256: `9072fce92110aec5e155d144d5d9156488d5be705608753fd78220a36a2b5125`
Test evidence ZIP SHA-256: `2c05a3d30ee9c5ef2515fb63571e0180f87986b41762efa5a9dc77e3d3921d87`

Core change: booking retry safety now binds each `requestKey` to a canonical SHA-256 booking-intent fingerprint. Replaying the same request returns the original booking; reusing the same key for a materially changed request returns a conflict instead of silently returning an old booking. The staging database migration preserves legacy booking rows, adds explicit retry-key/fingerprint columns, and adds a unique customer/key index.

Verification performed in the delivered source:
- 50/50 Node logic/API/migration tests passed.
- 12/12 value/privacy/checkout Chromium scenarios passed with zero JavaScript errors.
- 13/13 wedding regression Chromium scenarios passed with zero reported errors.
- 12/12 web asset files match the embedded Android and iOS copies by SHA-256.
- Owner-only planning tool: 3/3 calculation tests and 3/3 Chromium checks passed.

Build status: no APK/AAB/IPA is claimed for 0.4.9. `npm ci --offline` is blocked by a missing cached `yauzl-2.10.0.tgz`; the Gradle wrapper also cannot download `gradle-8.14.3-all.zip` in the current environment. No old binary was renamed.

Payments remain disabled. No real ad network, investment intake, app-store publication, or ownership change was activated.