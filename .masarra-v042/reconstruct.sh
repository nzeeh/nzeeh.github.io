#!/usr/bin/env bash
set -euo pipefail

python3 .masarra-v03/restore.py

cat \
  .masarra-v042/fixed/part01a.b64 \
  .masarra-v042/fixed/part01b.b64 \
  .masarra-v042/fixed/part01c.b64 \
  .masarra-v042/parts/part02.b64 \
  .masarra-v042/parts/part03.b64 \
  .masarra-v042/fixed/part04a.b64 \
  .masarra-v042/fixed/part04b.b64 \
  .masarra-v042/fixed/part04c.b64 \
  .masarra-v042/parts/part05.b64 \
  > /tmp/v042.patch.b64

printf '%s  %s\n' '1e488233fcf622571d57cefe42b65c821449f18e73bd818847635a869a26f1ae' '/tmp/v042.patch.b64' | sha256sum -c -
base64 -d /tmp/v042.patch.b64 > /tmp/v042.patch.xz
printf '%s  %s\n' '640bde85a38861979091ca17de7cfaf1ac2899cf967caa7259693a25256c05ac' '/tmp/v042.patch.xz' | sha256sum -c -
xz -t /tmp/v042.patch.xz
xz -dc /tmp/v042.patch.xz > /tmp/v042.patch
patch -p2 -d Masarra-Pro-v0.3.0 --batch --forward < /tmp/v042.patch
mv Masarra-Pro-v0.3.0 Masarra-Pro-v0.4.2

grep -q '"version": "0.4.2"' Masarra-Pro-v0.4.2/package.json
grep -q 'الأربعاء 16 سبتمبر 2026' Masarra-Pro-v0.4.2/CHANGELOG_AR.md
printf '%s\n' 'Verified Masarra Pro 0.4.2 source reconstructed.'
