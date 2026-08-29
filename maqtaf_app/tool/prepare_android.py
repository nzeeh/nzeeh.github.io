from __future__ import annotations

import math
import re
import shutil
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ANDROID = ROOT / "android"

manifest = ANDROID / "app/src/main/AndroidManifest.xml"
text = manifest.read_text(encoding="utf-8")
text = re.sub(r'android:label="[^"]*"', 'android:label="مَقْطَف"', text, count=1)
permissions = (
    '<uses-permission android:name="android.permission.INTERNET" />\n'
    '    <uses-permission android:name="android.permission.CAMERA" />\n'
    '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n'
)
if "android.permission.CAMERA" not in text:
    text = text.replace("<application", permissions + "    <application", 1)
manifest.write_text(text, encoding="utf-8")

W = H = 512
pixels = bytearray(W * H * 4)

def color(hex_value: str):
    value = hex_value.lstrip("#")
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4)) + (255,)

AQEEQ = color("#7B2334")
INDIGO = color("#173B55")
GOLD = color("#D9A441")
IVORY = color("#F6F0E4")

for y in range(H):
    for x in range(W):
        t = (x + y) / (W + H)
        base = tuple(int(AQEEQ[i] * (1 - .24 * t)) for i in range(3)) + (255,)
        p = (y * W + x) * 4
        pixels[p:p+4] = bytes(base)

def put(x, y, c):
    if 0 <= x < W and 0 <= y < H:
        p = (y * W + x) * 4
        pixels[p:p+4] = bytes(c)

def circle(cx, cy, r, c):
    r2 = r * r
    for y in range(max(0, cy-r), min(H, cy+r+1)):
        dy = y-cy
        for x in range(max(0, cx-r), min(W, cx+r+1)):
            dx = x-cx
            if dx*dx + dy*dy <= r2:
                put(x, y, c)

def line(x1, y1, x2, y2, width, c):
    minx, maxx = max(0, min(x1,x2)-width), min(W-1, max(x1,x2)+width)
    miny, maxy = max(0, min(y1,y2)-width), min(H-1, max(y1,y2)+width)
    vx, vy = x2-x1, y2-y1
    den = vx*vx + vy*vy or 1
    radius2 = (width/2)**2
    for y in range(miny, maxy+1):
        for x in range(minx, maxx+1):
            t = max(0.0, min(1.0, ((x-x1)*vx + (y-y1)*vy)/den))
            dx, dy = x-(x1+t*vx), y-(y1+t*vy)
            if dx*dx + dy*dy <= radius2:
                put(x,y,c)

def polygon(points, c):
    miny = max(0, min(y for _,y in points)); maxy = min(H-1, max(y for _,y in points))
    for y in range(miny, maxy+1):
        hits=[]
        j=len(points)-1
        for i,(xi,yi) in enumerate(points):
            xj,yj=points[j]
            if (yi>y)!=(yj>y):
                hits.append(int(xi+(y-yi)*(xj-xi)/(yj-yi)))
            j=i
        hits.sort()
        for k in range(0,len(hits)-1,2):
            for x in range(max(0,hits[k]),min(W,hits[k+1]+1)):
                put(x,y,c)

def arc(cx, cy, rx, ry, start, end, width, c):
    steps=240
    last=None
    for i in range(steps+1):
        a=start+(end-start)*i/steps
        point=(int(cx+rx*math.cos(a)),int(cy+ry*math.sin(a)))
        if last is not None:
            line(last[0],last[1],point[0],point[1],width,c)
        last=point

# Sun and terrace motif.
circle(370, 145, 48, GOLD)
arc(250, 320, 205, 125, math.pi, math.tau, 16, IVORY)
arc(250, 345, 182, 105, math.pi, math.tau, 15, GOLD)
arc(250, 370, 155, 82, math.pi, math.tau, 14, IVORY)

# Basket and handle.
polygon([(140,255),(372,255),(340,420),(172,420)], INDIGO)
arc(256,258,72,82,math.pi,math.tau,14,IVORY)
for y in (305,350): line(168,y,344,y,9,GOLD)
for x in (205,256,307): line(x,270,x,410,8,GOLD)

# Textile diamonds at top.
for x in range(-20, 540, 58):
    line(x,92,x+29,63,8,IVORY)
    line(x+29,63,x+58,92,8,IVORY)
    line(x+58,92,x+29,121,8,GOLD)
    line(x+29,121,x,92,8,GOLD)

raw = bytearray()
for y in range(H):
    raw.append(0)
    row = y * W * 4
    raw.extend(pixels[row:row+W*4])

def chunk(name: bytes, data: bytes):
    return struct.pack(">I", len(data)) + name + data + struct.pack(">I", zlib.crc32(name + data) & 0xffffffff)

png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", W,H,8,6,0,0,0)) + chunk(b"IDAT", zlib.compress(bytes(raw),9)) + chunk(b"IEND", b"")

for density in ("mdpi","hdpi","xhdpi","xxhdpi","xxxhdpi"):
    target = ANDROID / f"app/src/main/res/mipmap-{density}/ic_launcher.png"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(png)

print("Prepared Android manifest and Maqtaf launcher icon")
