from pathlib import Path
import re

impl = Path(__file__).with_name("finish_v12_impl.py")
exec(compile(impl.read_text(encoding="utf-8"), str(impl), "exec"), globals())

p = Path.cwd() / "qitaf_app/lib/features/checkout/checkout_flow.dart"
s = p.read_text(encoding="utf-8")
pattern = re.compile(
    r"const ReadAloudButton\(\n(?P<body>\s+key: ValueKey\('address-audio-guide'\),[\s\S]*?\n\s+)\)",
    re.S,
)
matches = pattern.findall(s)
if len(matches) != 1:
    raise RuntimeError(f"address audio guide block: expected one, found {len(matches)}")

def wrap(match):
    return (
        "Expanded(\n"
        "                  child: ReadAloudButton(\n"
        + match.group("body")
        + "),\n"
        "                )"
    )

p.write_text(pattern.sub(wrap, s, count=1), encoding="utf-8")
print("Applied finite-width checkout audio layout fix.")
