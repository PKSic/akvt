#!/usr/bin/env python3
"""
Генератор css/vision-layout.css для режима «Версия для слабовидящих».

Зачем это нужно
---------------
В режиме для слабовидящих текст увеличивается (до 200 %), и раскладка должна
вести себя так же, как при увеличении масштаба в браузере: при 200 % на
экране 1280 px страница должна перестроиться как на экране 640 px
(бургер-меню, одна колонка и т. д.). Но @media-запросы смотрят на реальную
ширину окна и про наш масштаб ничего не знают.

Поэтому скрипт берёт все `@media (max-width: N)` из CSS сайта и выписывает те же
правила под селектором `html.bvi.bvi-mw-N …`. Класс `bvi-mw-N` на <html>
выставляет js/vision.js, когда «эффективная ширина» (ширина окна / масштаб)
не больше N. Так вся существующая адаптивная вёрстка (adaptive.css и
правила отдельных страниц) работает и при увеличении шрифта.

Дополнительно все `font-size: Npx` пересчитываются в rem, чтобы они тоже
масштабировались вместе с настройкой размера шрифта.

Запуск (из каталога site/):
    python3 tools/build-vision-layout.py

Файл css/vision-layout.css генерируется — руками его не правят.
Если меняется adaptive.css или другой CSS с @media — запустите скрипт заново.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, "css")

# Порядок = порядок подключения на страницах (важен для каскада).
SOURCES = [
    "style.css",
    "adaptive.css",
    "akvt-rasp.css",
    "global-styles.css",
    "global.css",
    "sitemap.css",
    "shema-proezda.css",
    "page-lukomore.css",
    "page-mify.css",
    "page-parta-geroya.css",
    "page-partnery.css",
]

MQ_RE = re.compile(r"^\(\s*max-width\s*:\s*(\d+)px\s*\)$")
# Эти правила нельзя сужать на «эффективную ширину»: они завязаны на реальное устройство.
SKIP_AT = ("@keyframes", "@-webkit-keyframes", "@font-face", "@import", "@charset", "@supports", "@page")


def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def split_blocks(css):
    """Разбирает CSS верхнего уровня на (prelude, body) с учётом вложенных скобок."""
    i, n = 0, len(css)
    out = []
    while i < n:
        # prelude до '{' или ';'
        j = i
        while j < n and css[j] not in "{;":
            j += 1
        if j >= n:
            break
        if css[j] == ";":
            out.append((css[i:j].strip(), None))
            i = j + 1
            continue
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == "{":
                depth += 1
            elif css[k] == "}":
                depth -= 1
            k += 1
        out.append((prelude, css[j + 1 : k - 1]))
        i = k
    return out


def split_selectors(sel):
    parts, depth, cur = [], 0, ""
    for ch in sel:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur.strip())
    return parts


def prefix_selector(sel, scope):
    sel = sel.strip()
    if not sel:
        return None
    # html.foo / html / :root — «встраиваем» scope в сам корневой элемент
    m = re.match(r"^(html|:root)(?![\w-])", sel)
    if m:
        return scope + sel[m.end():]
    return "%s %s" % (scope, sel)


def px_to_rem(body):
    def repl(m):
        px = float(m.group(2))
        rem = round(px / 16.0, 4)
        return "%s%srem" % (m.group(1), ("%g" % rem))

    return re.sub(r"(font-size\s*:\s*)(\d+(?:\.\d+)?)px", repl, body)


def emit_rules(blocks, scope_for, out, font_only=False):
    for prelude, body in blocks:
        if body is None:
            continue
        if prelude.startswith("@"):
            continue
        sels = [prefix_selector(s, scope_for) for s in split_selectors(prelude)]
        sels = [s for s in sels if s]
        if not sels:
            continue
        if font_only:
            m = re.findall(r"font-size\s*:\s*\d+(?:\.\d+)?px\s*(?:!important)?\s*(?:;|$)", body)
            if not m:
                continue
            decls = []
            for d in m:
                decls.append(px_to_rem(d.strip().rstrip(";")))
            body = ";".join(decls)
        body = px_to_rem(body)
        out.append("%s{%s}" % (",".join(sels), re.sub(r"\s+", " ", body).strip()))


def main():
    out = []
    skipped = set()
    for name in SOURCES:
        path = os.path.join(CSS, name)
        if not os.path.exists(path):
            continue
        css = strip_comments(open(path, encoding="utf-8").read())
        blocks = split_blocks(css)
        mq_chunks = []
        font_chunks = []
        for prelude, body in blocks:
            if body is None:
                continue
            if prelude.startswith("@media"):
                cond = prelude[len("@media"):].strip()
                m = MQ_RE.match(cond)
                if m:
                    n = int(m.group(1))
                    inner = split_blocks(body)
                    emit_rules(inner, "html.bvi.bvi-mw-%d" % n, mq_chunks)
                else:
                    skipped.add("%s: @media %s" % (name, cond))
                continue
            if prelude.startswith(SKIP_AT):
                continue
            if prelude.startswith("@"):
                skipped.add("%s: %s" % (name, prelude[:40]))
                continue
        # px → rem для font-size верхнего уровня
        emit_rules([b for b in blocks if not b[0].startswith("@")], "html.bvi", font_chunks, font_only=True)
        if font_chunks or mq_chunks:
            out.append("/* ---- %s ---- */" % name)
            if font_chunks:
                out.append("/* font-size: px → rem */")
                out.extend(font_chunks)
            if mq_chunks:
                out.append("/* @media (max-width) → эффективная ширина */")
                out.extend(mq_chunks)

    header = (
        "/* АВТОГЕНЕРАЦИЯ: tools/build-vision-layout.py — не править вручную.\n"
        "   Адаптивные правила сайта для режима «Версия для слабовидящих»\n"
        "   (раскладка следует за эффективной шириной = ширина окна / масштаб шрифта). */\n"
    )
    dest = os.path.join(CSS, "vision-layout.css")
    with open(dest, "w", encoding="utf-8", newline="\n") as f:
        f.write(header + "\n".join(out) + "\n")
    print("written", dest, os.path.getsize(dest), "bytes")
    if skipped:
        print("пропущено (не max-width / не обрабатывается):")
        for s in sorted(skipped):
            print("  -", s)


if __name__ == "__main__":
    sys.exit(main())
