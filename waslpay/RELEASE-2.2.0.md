# WaslPay 2.2.0 — in-app payment messages

Revision: Wednesday, 16 September 2026 (Asia/Shanghai).
Baseline: live main commit 84688f294692fc84dac13f48c41173906eac1f5f; WaslPay 2.1.2.

## Delivered
- Add a visible Arabic Messages button, unread badge, live in-app transaction banner, and a responsive message center with all / my activity / family / unread filters and older-message pagination.
- New successful transactions carry a receipt snapshot in the existing transaction entry: payer, merchant/detail, amount, type, local-demo status, transaction ID, Yemen timestamp to the second, funding source, owner wallet after the operation, and member budget/gift balance where applicable. Withdrawal fees are broken out.
- Receipts are attached before the existing state persistence; no new payment posting is performed. Snapshot values do not change when later operations occur. Receipt links use the same transaction ID as the message.
- Show legacy transaction history without inventing missing historical balances. Keep the existing schema/key and all family/gift/goal data. Read flags are separately stored per preview viewer.
- Owner preview sees all activity; member preview sees that member's messages, not the owner's total balance. This is UI filtering, NOT authentication or a security boundary.
- Keep family budget requests separately accessible. Distinguish gift holds, zero-debit gift opening, gift spending and savings from ordinary payments.
- De-duplicate displayed messages and repeated storage-event announcements by transaction ID. Rejected payments do not create success messages.
- Version the message assets in the PWA shell; keep all other project paths untouched.

## Tests actually executed
- 22 existing domain tests passed; the original family-v2.js is byte-identical (blob 41eabcf91a8c03d013a71b91b2009e1c793cc326).
- 18 new message-domain tests passed, including snapshots, rejected payments, gift accounting, per-viewer read state and legacy records.
- 21 mocked service-worker checks passed, including the exact 13 cached assets, offline fallback, explicit activation, no stale future-version substitution, and isolation from other projects/API traffic.
- 12 Chromium touch/viewport layouts (320–1440 px, portrait and landscape) and 14 UI regression flows passed. Screenshots inspected. UI tests used real rendered DOM with in-memory pages, mocked localStorage and synthetic storage events because environment policy blocks localhost navigation.
- JavaScript syntax checks passed.

## Not delivered / limits
No remote server, bank connection, real money, push notification, background delivery, actual multi-device account or cross-device sync. Local demo messages are shown after simulated operations in the open preview; same-browser storage-event handling is not a production delivery guarantee. No physical Android/iPhone/iPad, Safari/WebKit, real PWA installation or production payment system was tested. No APK rebuilt; no iOS binary or store release. Historical receipts missing snapshot data are explicitly labeled rather than reconstructed.
