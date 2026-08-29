from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ANDROID = ROOT / "android"
MANIFEST = ANDROID / "app/src/main/AndroidManifest.xml"
DRAWABLE = ANDROID / "app/src/main/res/drawable/maqtaf_launcher.xml"

if not MANIFEST.exists():
    raise SystemExit("Android platform files are missing. Run flutter create first.")

text = MANIFEST.read_text(encoding="utf-8")
text = re.sub(r'android:label="[^"]*"', 'android:label="مَقْطَف"', text, count=1)
text = re.sub(r'android:icon="[^"]*"', 'android:icon="@drawable/maqtaf_launcher"', text, count=1)
if 'android:roundIcon=' in text:
    text = re.sub(r'android:roundIcon="[^"]*"', 'android:roundIcon="@drawable/maqtaf_launcher"', text, count=1)
else:
    text = text.replace(
        'android:icon="@drawable/maqtaf_launcher"',
        'android:icon="@drawable/maqtaf_launcher"\n        android:roundIcon="@drawable/maqtaf_launcher"',
        1,
    )

permissions = [
    "android.permission.INTERNET",
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
]
for permission in reversed(permissions):
    if permission not in text:
        text = text.replace(
            "<application",
            f'<uses-permission android:name="{permission}" />\n    <application',
            1,
        )

MANIFEST.write_text(text, encoding="utf-8")
DRAWABLE.parent.mkdir(parents=True, exist_ok=True)
DRAWABLE.write_text(
    '''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path android:fillColor="#7B2334" android:pathData="M0,0h108v108h-108z" />
    <path android:fillColor="#D9A441" android:pathData="M76,18a10,10 0,1 0,0.1 0z" />
    <path android:fillColor="#173B55" android:pathData="M25,48h58l-7,38h-44z" />
    <path android:fillColor="#00000000" android:strokeColor="#F6F0E4"
        android:strokeWidth="4" android:strokeLineCap="round"
        android:pathData="M38,49c0,-14 7,-23 16,-23s16,9 16,23" />
    <path android:fillColor="#00000000" android:strokeColor="#D9A441"
        android:strokeWidth="3" android:pathData="M29,59h50M28,69h52M38,50l3,34M54,49v36M70,50l-3,34" />
    <path android:fillColor="#00000000" android:strokeColor="#F6F0E4"
        android:strokeWidth="3" android:strokeLineCap="round"
        android:pathData="M12,27l8,-7 8,7 8,-7 8,7 8,-7 8,7 8,-7 8,7 8,-7 8,7" />
</vector>
''',
    encoding="utf-8",
)

print("Prepared Maqtaf Android label, permissions, and launcher icon")
