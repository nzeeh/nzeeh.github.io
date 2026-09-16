#!/usr/bin/env python3
from __future__ import annotations

import math
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

W, H, FPS, DURATION = 360, 640, 24, 8
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "athar-health" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

THEMES = {
    "demo_pediatrics": {
        "top": (12, 137, 112), "bottom": (4, 35, 32), "scrub": (57, 191, 157),
        "skin": (208, 148, 106), "hair": (25, 83, 72), "female": True, "symbol": "teddy"
    },
    "demo_obgyn": {
        "top": (137, 77, 154), "bottom": (39, 21, 53), "scrub": (184, 108, 173),
        "skin": (226, 168, 126), "hair": (76, 42, 93), "female": True, "symbol": "baby"
    },
    "demo_cardiology": {
        "top": (151, 48, 72), "bottom": (43, 13, 24), "scrub": (76, 157, 165),
        "skin": (192, 129, 91), "hair": (42, 31, 28), "female": False, "symbol": "heart"
    },
}


def gradient(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> np.ndarray:
    a = np.asarray(top, dtype=float)
    b = np.asarray(bottom, dtype=float)
    rows = np.linspace(0, 1, H)[:, None, None]
    image = a * (1 - rows) + b * rows
    return np.repeat(image, W, axis=1).astype(np.uint8)


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def heart(draw: ImageDraw.ImageDraw, cx, cy, scale, fill):
    pts = []
    for i in range(100):
        t = 2 * math.pi * i / 100
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t)
        pts.append((cx + x * scale, cy - y * scale))
    draw.polygon(pts, fill=fill)


def draw_scene(frame: int, theme: dict) -> Image.Image:
    seconds = frame / FPS
    img = Image.fromarray(gradient(theme["top"], theme["bottom"]), "RGB").convert("RGBA")
    d = ImageDraw.Draw(img, "RGBA")

    # Clinic background and animated health monitor.
    d.rectangle((0, 0, W, 150), fill=(255, 255, 255, 18))
    rounded(d, (22, 78, 140, 206), 18, (255, 255, 255, 30), (255, 255, 255, 48), 2)
    d.line((81, 78, 81, 206), fill=(255, 255, 255, 38), width=2)
    d.line((22, 142, 140, 142), fill=(255, 255, 255, 38), width=2)
    rounded(d, (242, 77, 340, 214), 16, (255, 255, 255, 26), (255, 255, 255, 45), 2)
    d.line((242, 120, 340, 120), fill=(255, 255, 255, 42), width=2)
    d.line((242, 164, 340, 164), fill=(255, 255, 255, 42), width=2)

    # Moving particles make motion obvious even on older video surfaces.
    for i in range(9):
        x = (i * 47 + seconds * (18 + i)) % (W + 40) - 20
        y = 72 + ((i * 83) % 460) + 8 * math.sin(seconds * 1.7 + i)
        r = 3 + (i % 3)
        d.ellipse((x-r, y-r, x+r, y+r), fill=(255, 255, 255, 40 + i*4))

    bob = 4 * math.sin(seconds * 2.1)
    skin = theme["skin"] + (255,)
    hair = theme["hair"] + (255,)
    scrub = theme["scrub"] + (255,)
    coat = (246, 249, 248, 255)

    # Doctor body.
    d.ellipse((87, 552, 273, 610), fill=(0, 0, 0, 55))
    rounded(d, (105, 357+bob, 255, 585+bob), 30, scrub)
    d.polygon([(105,380+bob),(158,350+bob),(180,405+bob),(126,590+bob),(98,566+bob)], fill=coat)
    d.polygon([(255,380+bob),(202,350+bob),(180,405+bob),(234,590+bob),(262,566+bob)], fill=coat)
    d.line((180,405+bob,180,585+bob), fill=(170,190,186,255), width=2)
    rounded(d, (161,306+bob,199,368+bob), 14, skin)

    # Head, hair/hijab, eyes and animated speaking mouth.
    if theme["female"]:
        d.ellipse((116,164+bob,244,329+bob), fill=hair)
        d.ellipse((128,184+bob,232,329+bob), fill=skin)
        d.polygon([(128,281+bob),(160,329+bob),(180,386+bob),(106,360+bob)], fill=hair)
        d.polygon([(232,281+bob),(200,329+bob),(180,386+bob),(254,360+bob)], fill=hair)
    else:
        d.ellipse((128,184+bob,232,329+bob), fill=skin)
        d.pieslice((120,160+bob,240,287+bob), 180, 360, fill=hair)
        d.pieslice((140,247+bob,220,339+bob), 0, 180, fill=hair)
        d.ellipse((149,253+bob,211,326+bob), fill=skin)

    blink = frame % (FPS * 4) < 3
    if blink:
        d.line((151,247+bob,165,247+bob), fill=(35,45,45,255), width=3)
        d.line((195,247+bob,209,247+bob), fill=(35,45,45,255), width=3)
    else:
        for x in (158, 202):
            d.ellipse((x-7, 240+bob, x+7, 255+bob), fill=(255,255,255,255))
            d.ellipse((x-2, 245+bob, x+4, 253+bob), fill=(25,45,45,255))
    mouth_h = 3 + int(7 * ((math.sin(seconds * 15) + 1) / 2))
    rounded(d, (167,289+bob-mouth_h/2,193,289+bob+mouth_h/2), 4, (125,45,57,255))

    # Stethoscope and moving arm.
    d.arc((140,365+bob,220,455+bob), 0, 180, fill=(30,55,61,255), width=5)
    d.line((141,410+bob,151,359+bob), fill=(30,55,61,255), width=5)
    d.line((219,410+bob,209,359+bob), fill=(30,55,61,255), width=5)
    d.ellipse((204,430+bob,227,453+bob), fill=(205,215,215,255), outline=(30,55,61,255), width=3)
    wave = 13 * math.sin(seconds * 2.7)
    d.line((238,426+bob,292+wave,378+bob), fill=coat, width=31)
    d.ellipse((278+wave,361+bob,314+wave,399+bob), fill=skin)
    d.line((120,426+bob,76,482+bob), fill=coat, width=31)
    d.ellipse((57,466+bob,88,500+bob), fill=skin)

    # Specialty prop.
    rounded(d, (39,425+bob,112,540+bob), 13, (255,255,255,45), (255,255,255,120), 2)
    if theme["symbol"] == "heart":
        heart(d, 76, 483+bob, 1.7, (255,255,255,225))
    elif theme["symbol"] == "teddy":
        d.ellipse((57,450+bob,95,490+bob), fill=(255,255,255,225))
        d.ellipse((48,444+bob,67,464+bob), fill=(255,255,255,225))
        d.ellipse((85,444+bob,104,464+bob), fill=(255,255,255,225))
        d.ellipse((50,482+bob,103,529+bob), fill=(255,255,255,225))
    else:
        d.arc((53,447+bob,102,503+bob), 25, 310, fill=(255,255,255,225), width=5)
        heart(d, 78, 515+bob, .65, (255,255,255,225))

    # Animated ECG / progress strip.
    rounded(d, (20, 548, 340, 625), 22, (0,0,0,52), (255,255,255,35), 1)
    pts=[]
    phase=(seconds*0.9)%1
    for px in range(292):
        p=((px/292)*3-phase)%1
        y=586
        if .43<p<.47: y-=22*(p-.43)/.04
        elif .47<=p<.51: y+=58*(p-.47)/.04
        elif .51<=p<.55: y-=75*(p-.51)/.04
        elif .55<=p<.59: y+=18*(p-.55)/.04
        pts.append((34+px,y))
    d.line(pts, fill=(255,255,255,205), width=3)

    # Gentle camera breathing/zoom.
    zoom = 1 + .018 * math.sin(seconds * math.pi / 4)
    nw, nh = int(W*zoom), int(H*zoom)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left, top = (nw-W)//2, (nh-H)//2
    return img.crop((left, top, left+W, top+H)).convert("RGB")


def encode(name: str, theme: dict) -> Path:
    path = OUT / f"{name}.mp4"
    command = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-f", "lavfi", "-i", f"anullsrc=channel_layout=mono:sample_rate=44100",
        "-map", "0:v:0", "-map", "1:a:0", "-shortest",
        "-c:v", "libx264", "-preset", "medium", "-crf", "21",
        "-profile:v", "baseline", "-level:v", "3.0", "-pix_fmt", "yuv420p",
        "-x264-params", "ref=1:bframes=0:keyint=48:min-keyint=48:scenecut=0",
        "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "32k", "-ar", "44100", "-ac", "1",
        "-t", str(DURATION), "-movflags", "+faststart", str(path)
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    for frame in range(FPS * DURATION):
        process.stdin.write(np.asarray(draw_scene(frame, theme), dtype=np.uint8).tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f"ffmpeg failed for {name}")
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"], check=True)
    return path


if __name__ == "__main__":
    for video_name, video_theme in THEMES.items():
        result = encode(video_name, video_theme)
        print(result.name, result.stat().st_size)
