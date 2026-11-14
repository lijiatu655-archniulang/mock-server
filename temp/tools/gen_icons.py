# -*- coding: utf-8 -*-
"""生成小程序所需的轻量线性图标（PNG，透明底）。
运行：python temp/tools/gen_icons.py
"""
import math
import os
from PIL import Image, ImageDraw

S = 4  # 超采样倍数
BASE = 96
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "cilent", "assets", "icons")
OUT = os.path.abspath(OUT)


def canvas():
    img = Image.new("RGBA", (BASE * S, BASE * S), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def sc(p):
    return tuple(int(v * S) for v in p)


def line(d, pts, color, width=6.2):
    pts = [sc(p) for p in pts]
    d.line(pts, fill=color, width=int(width * S), joint="curve")
    r = width * S / 2
    for x, y in (pts[0], pts[-1]):
        d.ellipse((x - r, y - r, x + r, y + r), fill=color)


def circle(d, cx, cy, r, color, width=6.2, fill=None):
    d.ellipse((int((cx - r) * S), int((cy - r) * S),
               int((cx + r) * S), int((cy + r) * S)),
              outline=color, width=int(width * S), fill=fill)


def arc(d, box, start, end, color, width=6.2):
    d.arc(tuple(v * S for v in box), start=start, end=end, fill=color,
          width=int(width * S))


def rrect(d, box, radius, color, width=6.2, fill=None):
    d.rounded_rectangle(tuple(v * S for v in box), radius=radius * S,
                        outline=color, width=int(width * S), fill=fill)


def poly(d, pts, color, fill=False):
    d.polygon([sc(p) for p in pts], outline=color, fill=color if fill else None)


def dot(d, cx, cy, r, color):
    d.ellipse(tuple(v * S for v in (cx - r, cy - r, cx + r, cy + r)), fill=color)


def save(name, fn, color, size=96):
    img, d = canvas()
    fn(d, color)
    img = img.resize((size * S, size * S), Image.LANCZOS)
    img = img.resize((size, size), Image.LANCZOS)
    path = os.path.join(OUT, name + ".png")
    img.save(path)
    print("wrote", path)


# ---------- TabBar ----------
def icon_home(d, c):
    line(d, [(14, 46), (48, 20), (82, 46)], c, 6.4)
    rrect(d, (23, 44, 73, 82), 6, c, 6.4)
    rrect(d, (41, 60, 55, 82), 2, c, 5.4)


def icon_ai(d, c):
    rrect(d, (14, 22, 78, 64), 16, c, 6.2)
    line(d, [(35, 62), (31, 80), (49, 66)], c, 6.2)
    for x in (30, 46, 62):
        dot(d, x, 43, 3.6, c)


def icon_me(d, c):
    circle(d, 48, 32, 15, c, 6.4)
    arc(d, (18, 50, 78, 110), 180, 360, c, 6.4)
    line(d, [(18, 80), (18, 86)], c, 6.4)
    line(d, [(78, 80), (78, 86)], c, 6.4)


# ---------- 九宫格 ----------
def icon_consult(d, c):
    rrect(d, (12, 18, 82, 62), 15, c, 6.2)
    line(d, [(33, 61), (29, 80), (47, 64)], c, 6.2)
    for x in (30, 47, 64):
        dot(d, x, 40, 3.4, c)


def icon_advice(d, c):
    poly(d, [(18, 40), (55, 24), (55, 70), (18, 54)], c)
    line(d, [(33, 55), (37, 80)], c, 6.2)
    arc(d, (56, 28, 84, 66), -52, 52, c, 5.2)
    arc(d, (66, 34, 94, 60), -46, 46, c, 4.6)


def icon_tea(d, c):
    rrect(d, (22, 38, 62, 74), 8, c, 6.0)
    arc(d, (56, 42, 84, 66), -90, 90, c, 5.6)
    line(d, [(16, 80), (72, 80)], c, 6.0)
    line(d, [(33, 30), (33, 22)], c, 5.2)
    line(d, [(46, 32), (46, 20)], c, 5.2)
    line(d, [(59, 30), (59, 22)], c, 5.2)


def icon_directory(d, c):
    rrect(d, (20, 16, 74, 82), 6, c, 6.0)
    line(d, [(30, 16), (30, 82)], c, 6.0)
    line(d, [(40, 34), (64, 34)], c, 5.2)
    line(d, [(40, 48), (64, 48)], c, 5.2)
    line(d, [(40, 62), (56, 62)], c, 5.2)


def icon_gov(d, c):
    poly(d, [(12, 38), (48, 18), (84, 38)], c)
    line(d, [(18, 44), (78, 44)], c, 5.6)
    for x in (28, 48, 68):
        line(d, [(x, 48), (x, 70)], c, 5.6)
    line(d, [(20, 74), (76, 74)], c, 6.0)
    line(d, [(16, 82), (80, 82)], c, 6.0)


def icon_jobs(d, c):
    rrect(d, (14, 34, 82, 82), 8, c, 6.0)
    rrect(d, (36, 20, 60, 36), 4, c, 5.6)
    line(d, [(14, 50), (82, 50)], c, 5.2)
    rrect(d, (43, 46, 53, 56), 2, c, 4.6)


# ---------- 功能图标 ----------
def icon_clock(d, c):
    circle(d, 48, 48, 31, c, 6.0)
    line(d, [(48, 30), (48, 49), (62, 58)], c, 5.6)


def icon_pin(d, c):
    circle(d, 48, 38, 20, c, 6.0)
    line(d, [(31, 51), (48, 82), (65, 51)], c, 6.0)
    dot(d, 48, 38, 6.0, c)


def icon_search(d, c):
    circle(d, 41, 41, 20, c, 6.0)
    line(d, [(56, 56), (78, 78)], c, 6.6)


def icon_send(d, c):
    poly(d, [(14, 46), (84, 20), (58, 82), (44, 56)], c, fill=True)
    line(d, [(44, 56), (78, 24)], (255, 255, 255, 255), 3.0)


def icon_stop(d, c):
    rrect(d, (28, 28, 68, 68), 10, c, 0, fill=c)


def icon_doc(d, c):
    line(d, [(28, 14), (58, 14), (74, 30), (74, 84), (24, 84), (24, 14)], c, 5.6)
    line(d, [(57, 14), (57, 31), (74, 31)], c, 5.0)
    line(d, [(36, 46), (62, 46)], c, 4.8)
    line(d, [(36, 58), (62, 58)], c, 4.8)
    line(d, [(36, 70), (52, 70)], c, 4.8)


def icon_shield(d, c):
    poly(d, [(48, 12), (80, 24), (76, 56), (48, 84), (20, 56), (16, 24)], c)
    line(d, [(33, 48), (44, 60), (64, 37)], c, 5.8)


def icon_arrow(d, c):
    line(d, [(18, 48), (76, 48)], c, 6.0)
    line(d, [(58, 30), (78, 48), (58, 66)], c, 6.0)


def icon_close(d, c):
    line(d, [(26, 26), (70, 70)], c, 6.0)
    line(d, [(70, 26), (26, 70)], c, 6.0)


def icon_phone(d, c):
    # 听筒：弧形握柄 + 两端听筒，整体旋转 -40°
    layer = Image.new("RGBA", (BASE * S, BASE * S), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    w = int(6.0 * S)
    ld.arc(tuple(v * S for v in (-14, -66, 110, 58)), start=62, end=118,
           fill=c, width=w)
    ld.rounded_rectangle(tuple(v * S for v in (7, 30, 31, 72)), radius=10 * S,
                         outline=c, width=w)
    ld.rounded_rectangle(tuple(v * S for v in (65, 30, 89, 72)), radius=10 * S,
                         outline=c, width=w)
    layer = layer.rotate(40, resample=Image.BICUBIC)
    d._image.paste(layer, (0, 0), layer)


def main():
    os.makedirs(OUT, exist_ok=True)
    # TabBar 普通 / 选中
    for name, fn in (("tab-home", icon_home), ("tab-ai", icon_ai), ("tab-me", icon_me)):
        save(name, fn, (139, 143, 148, 255), 81)
        save(name + "-on", fn, (196, 22, 28, 255), 81)

    for name, fn, color in (
        ("grid-consult", icon_consult, (196, 22, 28, 255)),
        ("grid-advice", icon_advice, (232, 100, 27, 255)),
        ("grid-tea", icon_tea, (190, 132, 48, 255)),
        ("grid-directory", icon_directory, (179, 32, 42, 255)),
        ("grid-gov", icon_gov, (255, 255, 255, 255)),
        ("grid-jobs", icon_jobs, (209, 87, 59, 255)),
        ("icon-clock", icon_clock, (159, 108, 92, 255)),
        ("icon-pin", icon_pin, (196, 22, 28, 255)),
        ("icon-search", icon_search, (150, 146, 143, 255)),
        ("icon-send", icon_send, (255, 255, 255, 255)),
        ("icon-stop", icon_stop, (255, 255, 255, 255)),
        ("icon-doc", icon_doc, (196, 22, 28, 255)),
        ("icon-shield", icon_shield, (201, 148, 55, 255)),
        ("icon-arrow", icon_arrow, (120, 116, 113, 255)),
        ("icon-close", icon_close, (120, 116, 113, 255)),
        ("icon-phone", icon_phone, (196, 22, 28, 255)),
        ("icon-phone-white", icon_phone, (255, 255, 255, 255)),
    ):
        save(name, fn, color, 96)


if __name__ == "__main__":
    main()
