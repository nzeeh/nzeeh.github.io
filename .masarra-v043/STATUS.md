# Masarra Pro 0.4.3 build staging

Date: 2026-09-16 (Asia/Shanghai)

This branch is reserved for Masarra Pro 0.4.3 only. The validated 0.4.3 source is not yet fully reconstructed in this branch, so no workflow on this branch should be treated as an Android/iOS delivery.

Validated local release facts before staging:
- Version: 0.4.3
- Storage key preserved: `masarra.pro.v2`
- Package ID preserved: `com.masarra.yemen.preview`
- Production payments: disabled
- Node/domain/API tests: 37 passed
- Budget/value UI scenarios: 11 passed
- Wedding/regression UI scenarios: 13 passed
- Authoritative `www` hashes matched Android and iOS embedded copies
- Android local build attempt stopped before compilation because the Gradle distribution host could not be resolved
- iOS signed IPA was not produced

Primary change: checkout now displays each service's written cancellation/refund terms before the customer can confirm review. If an offer has no written policy, the UI explicitly says so instead of inventing terms. The API/store require a separate cancellation-terms review acknowledgement and record a server/local-generated review timestamp.

Do not put the private owner sustainability planner in this public repository.
