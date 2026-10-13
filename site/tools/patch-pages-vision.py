#!/usr/bin/env python3
"""
Одноразовый (идемпотентный) патчер страниц: переводит сайт на новый режим для слабовидящих.

  • удаляет старую разметку режима (ссылка-«глаз» + модальное окно #openModal);
  • удаляет старый скрипт twentyeleven-child/js/vision.js;
  • перед </head> подключает css/vision-layout.css, css/vision.css и js/vision.js
    (относительные пути считаются от глубины страницы).

Запуск из корня репозитория:  python3 site/tools/patch-pages-vision.py [--dry]
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE = os.path.join(ROOT, "site")
DRY = "--dry" in sys.argv

OLD_BLOCK = re.compile(r"[ \t]*<!--\s*=+\s*Версия для слабовидящих\s*-->.*?(?=[ \t]*<!--\s*=+\s*Подвал\s*-->)", re.S)
OLD_SCRIPT = re.compile(r"[ \t]*<script[^>]+twentyeleven-child/js/vision\.js[^>]*></script>[ \t]*\n?")
CSS_HREF = re.compile(r'href=["\']([^"\']*?)css/style\.css["\']')

def targets():
    for dp, dn, fn in os.walk(SITE):
        dn[:] = [d for d in dn if d not in (".git", "node_modules", ".web-uplift", "wp-content", "wp-includes", "tools")]
        for f in fn:
            if f.endswith(".html") and dp != os.path.join(SITE, "partials") or (f.endswith(".html") and False):
                yield os.path.join(dp, f)
    yield os.path.join(ROOT, "index.html")
    yield os.path.join(SITE, "partials", "footer.html")

stats = dict(files=0, changed=0, block=0, script=0, head=0, skipped=0)
problems = []
for path in targets():
    if not os.path.exists(path):
        continue
    stats["files"] += 1
    s = open(path, encoding="utf-8").read()
    o = s
    isPartial = path.endswith(os.path.join("partials", "footer.html"))

    s, n = OLD_BLOCK.subn("", s)
    stats["block"] += n
    if isPartial:
        # в partials/footer.html после удаления остаётся только подвал
        pass
    s, n2 = OLD_SCRIPT.subn("", s)
    stats["script"] += n2

    if not isPartial:
        if "js/vision.js" not in s.split("</head>")[0]:
            m = CSS_HREF.search(s)
            if not m:
                problems.append((path, "no css/style.css link"))
                continue
            p = m.group(1)
            inject = (
                '<link rel="stylesheet" type="text/css" media="all" href="%scss/vision-layout.css" />\n'
                '<link rel="stylesheet" type="text/css" media="all" href="%scss/vision.css" />\n'
                '<script src="%sjs/vision.js"></script>\n' % (p, p, p)
            )
            if "</head>" not in s:
                problems.append((path, "no </head>"))
                continue
            s = s.replace("</head>", inject + "</head>", 1)
            stats["head"] += 1
        if n == 0 and "bvi-ui" not in s and "Версия для слабовидящих" in s and "openModal" in s:
            problems.append((path, "old block not removed"))
    if s != o:
        stats["changed"] += 1
        if not DRY:
            open(path, "w", encoding="utf-8", newline="").write(s)
    else:
        stats["skipped"] += 1

print(stats)
for p in problems:
    print("PROBLEM", p)
