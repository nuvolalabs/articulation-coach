#!/usr/bin/env python3
"""Generate the PWA PNG icons with the standard library only (no Pillow).

Renders the same waveform mark as public/favicon.svg: five rounded bars in a
blue -> green gradient on a dark rounded-square, maskable-safe padding.

Usage:  python3 scripts/gen_icons.py
"""
import os
import struct
import zlib

BG = (11, 17, 32)          # #0b1120
TOP = (91, 140, 255)       # #5b8cff
BOT = (110, 231, 183)      # #6ee7b7
BAR_HEIGHTS = (0.24, 0.50, 0.74, 0.44, 0.20)   # kept inside the maskable safe zone

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(os.path.dirname(HERE), "public")


def lerp(a, b, t):
    return (round(a[0] + (b[0] - a[0]) * t),
            round(a[1] + (b[1] - a[1]) * t),
            round(a[2] + (b[2] - a[2]) * t))


def render(size):
    n = len(BAR_HEIGHTS)
    bar_w = size * 0.070
    gap = size * 0.052
    total = n * bar_w + (n - 1) * gap
    x0 = (size - total) / 2.0
    heights = [h * size for h in BAR_HEIGHTS]
    cy = size / 2.0
    radius = bar_w / 2.0
    corner = size * 0.22

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # PNG filter byte (None) per scanline
        for x in range(size):
            # rounded-square background
            if not _in_round_rect(x, y, size, corner):
                raw += b"\x00\x00\x00\x00"
                continue

            col = BG
            for i in range(n):
                bx = x0 + i * (bar_w + gap)
                if bx <= x <= bx + bar_w:
                    h = heights[i]
                    top, bot = cy - h / 2.0, cy + h / 2.0
                    if top <= y <= bot and _in_bar_cap(x, y, bx, top, bot, radius):
                        t = min(1.0, max(0.0, (x - x0) / total))
                        col = lerp(TOP, BOT, t)
                        break
            raw += bytes((col[0], col[1], col[2], 255))
    return bytes(raw)


def _in_round_rect(x, y, size, corner):
    dx = min(x, size - 1 - x)
    dy = min(y, size - 1 - y)
    if dx >= corner or dy >= corner:
        return True
    cx = corner if x < corner else size - 1 - corner
    cy = corner if y < corner else size - 1 - corner
    return (x - cx) ** 2 + (y - cy) ** 2 <= corner * corner


def _in_bar_cap(x, y, bx, top, bot, radius):
    if y < top + radius:
        ccy = top + radius
    elif y > bot - radius:
        ccy = bot - radius
    else:
        return True
    ccx = bx + radius
    return (x - ccx) ** 2 + (y - ccy) ** 2 <= radius * radius


def write_png(path, size):
    def chunk(typ, data):
        return (struct.pack(">I", len(data)) + typ + data
                + struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF))

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(render(size), 9)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", idat))
        f.write(chunk(b"IEND", b""))


def main():
    os.makedirs(PUBLIC, exist_ok=True)
    for size, name in ((192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")):
        out = os.path.join(PUBLIC, name)
        write_png(out, size)
        print(f"wrote {out} ({os.path.getsize(out)} bytes)")


if __name__ == "__main__":
    main()
