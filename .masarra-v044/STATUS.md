# Masarra Pro 0.4.4 validated staging status

Date: 2026-09-17 (Asia/Shanghai)

This branch is reserved for Masarra Pro 0.4.4 only. The authoritative full 0.4.4 source is delivered as `Masarra-Pro-v0.4.4-Source-Android-iOS.zip` in the project conversation and is not reconstructed in this public repository. Do not treat this branch alone as an Android/iOS delivery.

Validated release facts:
- Version: 0.4.4
- Storage key preserved: `masarra.pro.v2`
- Package ID preserved: `com.masarra.yemen.preview`
- Production payments: disabled
- Node/domain/API tests: 39 passed
- Budget/value UI scenarios: 11 passed, no JavaScript errors
- Wedding/regression UI scenarios: 13 passed, no JavaScript errors
- Authoritative `www` hashes matched Android and iOS embedded copies
- Source ZIP SHA-256: `91fb515afd0d2eaf536805d907e32325bdd0bd887a16dbbb6037a8d9940dc966`
- Local native build preflight stopped before compilation because the offline npm cache did not contain `yauzl-2.10.0.tgz`
- No new signed APK, AAB, or signed IPA is claimed for 0.4.4

Primary change: booking and planning dates now use Yemen civil time (UTC+03:00) instead of the device timezone, avoiding false rejection of still-future Yemen bookings for customers abroad. Booking validation now also rejects impossible calendar dates (for example 30 February) and invalid clock times such as 24:00.

The private owner sustainability planner is intentionally excluded from this public repository.
