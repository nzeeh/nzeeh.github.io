# Masarra Pro v0.4.10 — staging status

Date: 2026-09-23 (Asia/Shanghai)

This branch records the verified staging status only. It does **not** claim that the complete v0.4.10 source package has been uploaded to GitHub.

## Change verified in this release
- Provider booking views are least-privilege: a provider sees only their own service items in a multi-provider booking.
- Provider responses omit `customerId`, `requestKey`, `requestFingerprint`, top-level wallet preference, and `payment.wallet`.
- The customer still sees the complete booking in their own account.
- Local preview and staging API apply the same booking-view policy.
- Release metadata: v0.4.10, build 14; storage key `masarra.pro.v2` and app ID `com.masarra.yemen.preview` are unchanged.

## Verification completed on 2026-09-23
- Node unit/API suite: 51/51 passed.
- Chromium value/privacy scenarios: 12/12 passed.
- Chromium wedding regression scenarios: 13/13 passed.
- Embedded `www` assets: 12/12 matched by SHA-256 across source, Android and iOS copies.
- Owner planning calculator: 5/5 Node tests passed; it adds a booking-gap-to-break-even planning metric without counting investor capital as operating revenue.

## Native build status
No v0.4.10 APK, AAB or IPA was produced. `npm ci --offline` stopped before compilation because `yauzl-2.10.0.tgz` was absent from the local cache. Gradle also stopped before compilation because the wrapper could not obtain `gradle-8.14.3-all.zip` from `services.gradle.org` in the restricted build environment. No older binary was renamed.

## Delivered source package
`Masarra-Pro-v0.4.10-Source-Android-iOS.zip`
SHA-256: `0934af6a8811f0ad569d4d27d5d491a85c2ac2eeab65b17f6a43eac6325c6904`

No real payments, external ad network, store publishing, or investment collection were enabled.