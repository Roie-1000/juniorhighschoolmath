"""把題庫和模板組成一個獨立的 index.html（放在 repo 根目錄給 GitHub Pages 用）。
用法：python3 src/build.py
"""
import pathlib
src = pathlib.Path(__file__).parent
root = src.parent
data = "\n".join((src / f).read_text(encoding="utf-8") for f in ["data1.js", "data2.js", "data3.js", "extra.js", "extra2.js", "bank7a.js", "bank7b.js", "bank8a.js", "bank8b.js", "bank9.js", "formulas.js", "figs.js", "gifted.js", "firebase-config.js"])
body = (src / "template.html").read_text(encoding="utf-8").replace("/*DATA*/", data)
page = ('<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
        '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
(root / "index.html").write_text(page, encoding="utf-8")
print("index.html", len(page))
# 教師後台：同一份程式，以教師模式啟動
tpage = page.replace("<title>會考數學總複習</title>", "<title>會考數學・教師後台</title>", 1).replace(
    "<body>\n", '<body>\n<script>var APP_MODE="teacher";</script>\n', 1)
assert 'APP_MODE="teacher"' in tpage
(root / "teacher.html").write_text(tpage, encoding="utf-8")
print("teacher.html", len(tpage))
