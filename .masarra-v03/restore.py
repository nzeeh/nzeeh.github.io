"""Restore hash-verified v0.2 source and apply the tested v0.3 text delta."""
from pathlib import Path
import base64, hashlib, json, shutil, tarfile, zlib

def digest(b):
    return hashlib.sha256(b).hexdigest()

old = Path('Masarra-Pro-v0.2.0')
root = Path('Masarra-Pro-v0.3.0')
assert not old.exists() and not root.exists(), 'Source directories must be absent before restore'
encoded = ''.join(p.read_text().strip() for p in sorted(Path('.masarra-pro-source').glob('part*.b64')))
archive = base64.b64decode(encoded, validate=True)
assert digest(archive) == '401bc5d9c353cd5fc37bda462167a31a85b930f813d3df791b0b167cce897090'
Path('masarra-pro-src.tar.xz').write_bytes(archive)
with tarfile.open('masarra-pro-src.tar.xz', 'r:xz') as tf:
    for item in tf.getmembers():
        p = Path(item.name)
        assert not p.is_absolute() and '..' not in p.parts and p.parts[0] == old.name
        assert item.isfile() or item.isdir(), 'Only regular source files and directories are permitted'
    tf.extractall('.')
old.rename(root)
encoded = ''.join(p.read_text().strip() for p in sorted(Path('.masarra-v03').glob('part*.b64')))
packed = base64.b64decode(encoded, validate=True)
assert digest(packed) == 'c2526aae20dd2f500c08b84aab3f05d4e94fbd36eaab7b5e6cf3817ea9f9a693', 'Delta SHA256 mismatch'
for relative, d in json.loads(zlib.decompress(packed)).items():
    rel = Path(relative)
    assert not rel.is_absolute() and '..' not in rel.parts
    p = root / rel
    before = p.read_text(encoding='utf-8') if p.exists() else ''
    assert digest(before.encode()) == d['base'], 'Baseline mismatch: ' + relative
    after = ''.join(before[x[0]:x[1]] if isinstance(x, list) else x for x in d['ops'])
    assert digest(after.encode()) == d['sha'], 'Output mismatch: ' + relative
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(after, encoding='utf-8')
    print('Verified:', relative)
shutil.copyfile(root / 'RELEASE_V03_AR.md', root / 'README_AR.md')
print('Verified Masarra Pro 0.3.0 source restored; production payments remain disabled.')
