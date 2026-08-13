from pathlib import Path

p = Path(__file__).with_name("generate_pickify_pdf.py")
t = p.read_text(encoding="utf-8")
repls = {
    "\u2022": "-",
    "\u2192": "->",
    "\u20b9": "Rs.",
    "\u2014": "-",
    "\u2013": "-",
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u2026": "...",
}
for a, b in repls.items():
    t = t.replace(a, b)
p.write_text(t, encoding="utf-8")
print("cleaned")
