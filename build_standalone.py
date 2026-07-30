#!/usr/bin/env python3
"""Build the party photo wall as one offline HTML file."""

from __future__ import annotations

import base64
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
HTML_PATH = ROOT / "index.html"
CSS_PATH = ROOT / "css/style.css"
JS_PATH = ROOT / "js/main.js"
IMAGE_PATHS = tuple(
    ROOT / f"assets/images/{number:02d}_party.png" for number in range(1, 5)
)
OUTPUT_PATH = ROOT / "dist/party-photo-wall.html"
SOURCE_PATHS = (HTML_PATH, CSS_PATH, JS_PATH, *IMAGE_PATHS)


def fail(message: str) -> "NoReturn":
    print(f"构建失败：{message}", file=sys.stderr)
    raise SystemExit(1)


def check_sources() -> None:
    missing = [path.relative_to(ROOT).as_posix() for path in SOURCE_PATHS if not path.is_file()]
    if missing:
        fail("缺少以下源文件：\n  - " + "\n  - ".join(missing))


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError as error:
        fail(f"{path.relative_to(ROOT)} 不是有效的 UTF-8 文件：{error}")


def replace_once(source: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, lambda _match: replacement, source, count=1, flags=re.I | re.S)
    if count != 1:
        fail(f"index.html 中未找到 {label} 引用")
    return result


def image_data_url(path: Path) -> str:
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def build_html() -> str:
    html = read_text(HTML_PATH)
    css = read_text(CSS_PATH).replace("</style", "<\\/style")
    javascript = read_text(JS_PATH).replace("</script", "<\\/script")

    html = replace_once(
        html,
        r'<link\b(?=[^>]*\bhref\s*=\s*["\'](?:\./)?css/style\.css["\'])[^>]*>',
        f"<style>\n{css}\n</style>",
        "css/style.css",
    )
    html = replace_once(
        html,
        r'''<script\b(?=[^>]*\bsrc\s*=\s*["'](?:\./)?js/main\.js["'])[^>]*>\s*</script\s*>''',
        f"<script>\n{javascript}\n</script>",
        "js/main.js",
    )

    for path in IMAGE_PATHS:
        relative_path = path.relative_to(ROOT).as_posix()
        pattern = rf"(?<![\w/])(?:\./)?{re.escape(relative_path)}(?![\w/])"
        html, count = re.subn(pattern, lambda _match, p=path: image_data_url(p), html)
        if count == 0:
            fail(f"index.html、CSS 和 JavaScript 中未找到 {relative_path} 引用")

    return html


def external_references(html: str) -> list[str]:
    """Return resource URLs that would require a file or network request."""
    candidates: list[str] = []
    attribute_pattern = r'''\b(?:src|href|poster)\s*=\s*["']([^"']+)["']'''
    css_pattern = r'''(?:url\(\s*["']?([^"')]+)|@import\s+["']([^"']+))'''
    candidates.extend(re.findall(attribute_pattern, html, flags=re.I))
    for first, second in re.findall(css_pattern, html, flags=re.I):
        candidates.append(first or second)

    ignored_prefixes = ("data:", "#", "mailto:", "tel:", "javascript:")
    return sorted({url for url in candidates if not url.lower().startswith(ignored_prefixes)})


def main() -> None:
    check_sources()
    html = build_html()
    references = external_references(html)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = OUTPUT_PATH.with_suffix(".tmp")
    temporary_path.write_text(html, encoding="utf-8")
    temporary_path.replace(OUTPUT_PATH)

    size = OUTPUT_PATH.stat().st_size
    print(f"最终文件路径：{OUTPUT_PATH}")
    print(f"文件大小：{size:,} 字节（{size / 1024 / 1024:.2f} MiB）")
    print(f"是否仍存在外部资源引用：{'是' if references else '否'}")
    if references:
        for reference in references:
            print(f"  - {reference}")


if __name__ == "__main__":
    main()
