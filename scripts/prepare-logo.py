"""Turn the black-on-grey logo source into web assets with a transparent background.

Usage: python3 scripts/prepare-logo.py [assets/logo-source.png]

The source is black artwork on a flat grey background. Each pixel is "un-blended":
for black ink over a grey of luminance G, a pixel of luminance L has ink coverage
alpha = 1 - L / G. That keeps anti-aliased edges and the fine spiral strokes intact.

Writes:
  public/logo.png    cropped wordmark, black on transparent (inverted with CSS in dark mode)
  src/app/icon.png   square browser-tab icon built from the "b" mark
"""

import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read_png(path):
    data = Path(path).read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos, idat = 8, b""
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        kind, chunk = data[pos + 4 : pos + 8], data[pos + 8 : pos + 8 + length]
        if kind == b"IHDR":
            w, h, depth, ctype = struct.unpack(">IIBB", chunk[:10])
            assert depth == 8 and ctype in (2, 6), "expected 8-bit RGB/RGBA"
        elif kind == b"IDAT":
            idat += chunk
        pos += 12 + length
    bpp = 4 if ctype == 6 else 3
    raw, stride = zlib.decompress(idat), w * bpp
    rows, prev, i = [], bytearray(stride), 0
    for _ in range(h):
        f = raw[i]
        i += 1
        line = bytearray(raw[i : i + stride])
        i += stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line
    return w, h, [[tuple(r[x * bpp : x * bpp + 3]) for x in range(w)] for r in rows]


def write_png(path, w, h, rgba_rows):
    raw = b"".join(b"\x00" + bytes(v for px in row for v in px) for row in rgba_rows)
    chunk = lambda k, d: struct.pack(">I", len(d)) + k + d + struct.pack(">I", zlib.crc32(k + d) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(png)


def luminance(px):
    return 0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2]


def main(src):
    w, h, px = read_png(src)
    bg = luminance(px[0][0])
    alpha = [[max(0, min(255, round(255 * (1 - luminance(p) / bg)))) for p in row] for row in px]

    # Crop to the artwork, ignoring faint noise.
    ys = [y for y in range(h) if any(a > 24 for a in alpha[y])]
    xs = [x for x in range(w) if any(alpha[y][x] > 24 for y in range(h))]
    x0, x1, y0, y1 = xs[0], xs[-1] + 1, ys[0], ys[-1] + 1
    pad = 6
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)
    logo = [[(0, 0, 0, alpha[y][x]) for x in range(x0, x1)] for y in range(y0, y1)]
    write_png(ROOT / "public/logo.png", x1 - x0, y1 - y0, logo)
    print(f"public/logo.png  {x1 - x0}x{y1 - y0}")

    # Tab icon: the third letter ("b" with the spiral) on a white square.
    columns = [x for x in range(x0, x1) if any(alpha[y][x] > 24 for y in range(y0, y1))]
    letters, start = [], columns[0]
    for a, b in zip(columns, columns[1:]):
        if b != a + 1:
            letters.append((start, a + 1))
            start = b
    letters.append((start, columns[-1] + 1))
    bx0, bx1 = letters[2] if len(letters) > 2 else (x0, x1)
    # The spiral touches the following "l", so split the run at its thinnest column.
    ink = lambda x: sum(1 for y in range(y0, y1) if alpha[y][x] > 24)
    right = range(bx0 + (bx1 - bx0) // 2, bx1 - 4)
    if len(right) > 0:
        bx1 = min(right, key=ink)
    bys = [y for y in range(y0, y1) if any(alpha[y][x] > 24 for x in range(bx0, bx1))]
    by0, by1 = bys[0], bys[-1] + 1
    side = int(max(bx1 - bx0, by1 - by0) * 1.3)
    cx, cy = (bx0 + bx1) // 2, (by0 + by1) // 2
    icon = []
    for y in range(cy - side // 2, cy - side // 2 + side):
        row = []
        for x in range(cx - side // 2, cx - side // 2 + side):
            a = alpha[y][x] if 0 <= y < h and bx0 - 2 <= x < bx1 else 0
            v = 255 - a  # black ink composited onto white
            row.append((v, v, v, 255))
        icon.append(row)
    write_png(ROOT / "src/app/icon.png", side, side, icon)
    print(f"src/app/icon.png {side}x{side}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ROOT / "assets/logo-source.png")
