# Masarra Pro v0.4.11 — staging status

**Date:** Thursday, 24 September 2026 (Asia/Shanghai)

This file is a staging record only. The complete v0.4.11 source is delivered as a separate conversation ZIP and is not claimed to be fully uploaded to this public repository branch.

## Verified source delivery
- File: `Masarra-Pro-v0.4.11-Source-Android-iOS.zip`
- SHA-256: `7477e88d2db1fa79566105c0decfc7385acf54c5f70a5838dba7ed92542df3bb`

## Change verified today
- Booking retry fingerprints are now stable when the same bundle contains the same services in a different item order.
- Replaying that reordered request with the same `requestKey` returns the same booking instead of a false conflict.
- Material booking edits remain fingerprint-sensitive.
- Release metadata is v0.4.11 / build 15; `masarra.pro.v2` and `com.masarra.yemen.preview` are unchanged.

## Tests run today
- Node unit/API: 52/52 passed.
- Chromium value/privacy: 12/12 passed, 0 JavaScript errors.
- Chromium wedding regression: 13/13 passed, 0 JavaScript errors.
- Embedded web assets: 12/12 matched across `www`, Android and iOS.
- Separate private owner-planning tool: 8/8 calculator/integrity tests passed; it is not included in app assets or this public branch.

## Native build status
No v0.4.11 APK, AAB or IPA was produced. `npm ci --offline` cannot find `yauzl-2.10.0.tgz`; Gradle offline build cannot obtain `gradle-8.14.3-all.zip`; `xcodebuild` is unavailable in the Linux environment. No older binary was renamed.

No store publishing, real payment, real advertising network, tracking SDK, or investment collection was enabled.
