#!/usr/bin/env python3

# to execute: 
# % python3 subset_noto_sans_mono.py NotoSansMono-Regular-original.ttf ../../src/img/NotoSansMono-Regular.ttf
# % python3 subset_noto_sans_mono.py NotoSansMono-Bold-original.ttf ../../src/img/NotoSansMono-Bold.ttf 

import argparse
import os
import sys
from pathlib import Path

try:
    from fontTools.subset import Subsetter
    from fontTools.ttLib import TTFont
except ImportError as exc:
    sys.stderr.write(
        "fonttools is required. Install it with: pip install fonttools\n"
    )
    raise SystemExit(1) from exc


EXTRA_CHARS = [
    '▒', '█',
    '·', '⊞',
    '╵', '╶', '╰', '╷', '│', '╭', '├', '╴', '╯', '─', '┴', '╮', '┤', '┬', '┼',
    '└', '┘', '┌', '┐', '║', '═', '╚', '╝', '╔', '╗', '╠', '╣', '╦', '╩', '╬'
]


def build_char_set():
    chars = []

    # ASCII 32-255 inclusive
    for codepoint in range(32, 127):
        chars.append(chr(codepoint))

    # Box drawing wall characters referenced by the options UI.
    for ch in EXTRA_CHARS:
        if ch not in chars:
            chars.append(ch)

    return chars

def report_extra_char_presence(ttfont):
    cmap = ttfont.getBestCmap() or {}
    missing_chars = [ch for ch in EXTRA_CHARS if ord(ch) not in cmap]

    if not missing_chars:
        return

    print(f"Warning: Font missing extra characters:")
    for ch in missing_chars:
        print(f"{ch}\tmissing -- use .css to render fallback")

def main():
    parser = argparse.ArgumentParser(
        description="Subset Noto Sans Mono to keep ASCII 32-255 plus the box-drawing glyphs used by Larn."
    )
    parser.add_argument("input_font", help="Path to the source .ttf file")
    parser.add_argument("output_font", help="Path to write the subsetted .ttf file")
    args = parser.parse_args()

    input_path = Path(args.input_font)
    output_path = Path(args.output_font)

    if not input_path.exists():
        raise SystemExit(f"Input font not found: {input_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    chars = build_char_set()
    unicodes = [ord(ch) for ch in chars]

    ttfont = TTFont(input_path)
    subsetter = Subsetter()
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(ttfont)
    report_extra_char_presence(ttfont)

    # fontTools versions differ in the save API; use the lowest-common-denominator
    # TTFont.save call, which works on the installed version here.
    ttfont.save(str(output_path))

    print(f"Wrote {output_path} with {len(chars)} characters")


if __name__ == "__main__":
    main()
