# Masarra Pro 0.4.8 — staging status

Date: 2026-09-21 (China time)

This branch is a release-status branch only; it does **not** claim to contain the complete v0.4.8 source tree. The complete verified source was delivered separately as `Masarra-Pro-v0.4.8-Source-Android-iOS.zip`.

## Verified change
- Added a per-checkout opaque `requestKey` so retrying the same booking request after a lost response returns the existing booking instead of creating a duplicate.
- Local preview stores the request key with the booking; staging API replays the same booking for the same customer/request key.
- No change to `masarra.pro.v2`, package id `com.masarra.yemen.preview`, payments, commissions, or store publication.

## Verification
- Node/domain/API tests: 48/48 passed.
- Chromium UI scenarios: 25/25 passed (12 value/checkout + 13 regression), zero reported JavaScript page errors.
- `www` copies in source, Android and iOS matched by SHA-256.
- Owner planning tool check: 2/2 passed for capital-runway planning while keeping investor capital excluded from operating revenue and break-even.

## Delivery checksum
`Masarra-Pro-v0.4.8-Source-Android-iOS.zip`
SHA-256: `3fb52a07732104eec5e2837e231879160dcd6b183f01eaa67c6255e887c5b75b`

## Native build status
No new APK/AAB/IPA was produced. `npm ci --offline --ignore-scripts` stopped before compilation because `yauzl-2.10.0.tgz` was not present in the local npm cache. No old APK was renamed.
