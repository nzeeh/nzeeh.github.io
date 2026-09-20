# Masarra Pro 0.4.7 — Delivery Status

Date: Sunday, 20 September 2026 (Asia/Shanghai)

This branch is a **staging status branch only**. The complete verified source is delivered separately as `Masarra-Pro-v0.4.7-Source-Android-iOS.zip`; it is not reconstructed or claimed to be fully committed here.

Verified source ZIP SHA-256: `a25a7c60dd2b30877e0ded8debe7b30e9e61d6ab468829dbfdee47c8f2446284`

Today’s verified changes:
- Native release metadata aligned to 0.4.7: Android `versionName 0.4.7`, `versionCode 11`; iOS `MARKETING_VERSION 0.4.7`, `CURRENT_PROJECT_VERSION 11`; web/API release metadata also 0.4.7.
- Sponsored-placement fairness: maximum two sponsored cards per placement and at most one card per provider in the same placement; organic order is unchanged.
- Owner-only planning tool adds advertising contribution margin and warns when direct advertising cost exceeds earned advertising revenue. The owner tool is not committed to this public repository.
- Historical changelog label corrected for 0.4.5 to Friday, 18 September 2026.

Verification performed on the delivered source:
- 47/47 Node logic/server tests passed.
- 12/12 Chromium budget/privacy/terms/ad scenarios passed with zero JavaScript errors.
- 13/13 Chromium regression scenarios passed with zero JavaScript errors.
- 12/12 `www` files matched Android and iOS embedded copies by SHA-256.
- Owner tool: 3/3 focused Chromium checks passed.

Native build status:
- No new APK/AAB/IPA was produced.
- `npm ci --offline` stopped before native compilation because `yauzl-2.10.0.tgz` is not present in the local npm cache.
- No old binary has been renamed as 0.4.7.

Safety/status:
- Real payments remain disabled.
- No advertising network, external tracking, paid boost purchase, public investment offer, or collection of investor funds has been enabled.
- `main` and other projects are unchanged by this status commit.
