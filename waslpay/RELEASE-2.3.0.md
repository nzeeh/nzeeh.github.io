# WaslPay 2.3.0 — home, gifts and community

Revision: Thursday, 17 September 2026 (Asia/Shanghai).
Baseline: main d67af2fc464093f6de30713cf146dbd0ba25fb3f, WaslPay 2.2.1.

## Delivered in the local web preview
- Optional family setup: choose whether to offer mother, father and spouse relationship fields. No question about bereavement is required. Only a brand-new local store starts with no assumed relatives; existing members, balances, transactions and gifts are preserved. Changing visibility never deletes an existing member. Existing explicit demo-reset behavior is unchanged.
- Separate daily household limit for produce, fruit, groceries, cleaning and household needs. Owner can delegate to active adult members. A simulated purchase debits the shared wallet once, records the payer and household remaining amount, and leaves personal allowances and Eid gift balances untouched. Daily rollover uses Yemen time; remaining allowance is not guaranteed funds and is not carried over.
- Separate Gift and Wedding Rafd icons, optional graduation/newborn/wellness greetings, colored envelopes, review before confirmation, transaction-ID-linked messages, and a private history. New gifts/rafd are simulated outward payments, not Eid holds; viewing the envelope again never posts another debit. No real recipient is contacted.
- Optional monthly gifts/rafd cap supports giving within one's means. No public contributor ranking, automatic debt, or pressure to reciprocate. Thank-you cards are explicitly previews, hide amounts, and are not represented as an actual recipient reply.
- Clearly labeled advertising placeholder and policy panel on owner views only; no ads on member previews, no ad SDK, no tracking or real advertiser contract. Company participation panel is informational: fundraising remains closed with no payment, share purchase or investor-data form.
- In-app What's New panel states the actual changes and intended competitive value. These are design hypotheses, not measured market outcomes or uniqueness claims.
- Additive optional metadata under the existing schema/key. Original family-v2.js and existing message/spending-guard scripts remain byte-identical. Cache version 2.3.0 contains 19 explicit public shell assets and retains isolation from other projects and API traffic.

## Tests actually executed
110 automated Node cases passed: 22 original wallet/domain, 18 messages, 9 allowance warning, 32 new community/household/domain cases, and 29 mocked service-worker checks. New JavaScript syntax checks passed.
Both original transaction/message regression flows and new family/household/gift/rafd flows passed on 12 Chromium touch/viewport layouts from 320 to 1440 pixels, portrait and landscape. Checks include legacy data preservation, Arabic amount input, single debit, delegated payer receipts, monthly limits, child-view isolation, repeated-envelope viewing, and non-collecting investment information. Screenshots were inspected.
Browser tests render actual DOM using in-memory pages, mocked localStorage and synthetic storage events. They do not establish real storage durability, cross-device delivery or production authorization.

## Limits
Local Web/PWA simulation only. No banking, real payments, real gift delivery, remote accounts, realtime cross-device sync, push notifications, fundraising or commercial ad campaign. No physical Android/iPhone/iPad, Safari/WebKit or real PWA installation test. No APK rebuild, iOS binary, App Store or Google Play publication. Production privacy, licensing, custody, advertising and any share offering require separate implementation and local legal/regulatory review.
