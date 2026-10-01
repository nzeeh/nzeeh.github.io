# Masarra Pro v0.4.18 — staging status

Date: 2026-10-01 (Asia/Shanghai)

- This branch is a release marker/staging record only; the authoritative full v0.4.18 source is the conversation-delivered source archive, not this GitHub branch.
- Core fix: client-side future-date gates now use Yemen day (UTC+03:00) rather than device-local calendar day.
- Release identity preserved: `masarra.pro.v2`, `com.masarra.yemen.preview`; version 0.4.18, build 22.
- Today's tests: 61/61 Node, 3/3 dedicated Yemen-date Chromium, 14/14 value/privacy Chromium, 13/13 wedding regression Chromium, 2/2 owner planner; 14/14 `www` parity.
- No APK/AAB/IPA was produced: offline npm is missing `yauzl-2.10.0.tgz`, and the Gradle wrapper cannot obtain `gradle-8.14.3-all.zip` in the build environment.
- No payments, ad network, investment collection, store publication, or force-push/main change was performed.
