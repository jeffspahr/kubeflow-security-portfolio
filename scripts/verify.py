"""Validate portfolio evidence and static-site publication boundaries."""
import json
import re
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parents[1]
load = lambda name: json.loads((root / 'data' / name).read_text())
prs = load('prs.json')['prs']
assert len(prs) == len({p['number'] for p in prs}) == 468
assert Counter(p['state'] for p in prs) == {'MERGED': 406, 'OPEN': 17, 'CLOSED': 45}
assert len({p['category'] for p in prs}) == 7
assert all(p['url'] == f"https://github.com/kubeflow/pipelines/pull/{p['number']}" for p in prs)
assert all(len(p['files']) == len(set(p['files'])) for p in prs)
assert len({f for p in prs for f in p['files']}) == 3493
advisories = load('advisories.json')['advisories']
assert len(advisories) == len({a['id'] for a in advisories}) == 23
published = [a for a in advisories if a['publisher'] == 'jeffspahr']
assert len(published) == 22
assert sum(bool(a['cve']) for a in published) == 15
assert sum((a['cve'] or '').startswith('CVE-2023-') for a in published) == 2
assert sum('2.18.0' in a['patchedVersions'] for a in published) == 15
analysis = load('advisory-analysis.json')
linked = analysis['metrics']['linkedJeffPrNumbers']
assert len(linked) == len(set(linked)) == 10 and 15044 not in linked
assert all(any(p['number'] == n and p['state'] == 'MERGED' for p in prs) for n in linked)
# Public export is allowlisted: raw discussions, raw bodies, and private records are absent.
for path in (root / 'data').glob('*.json'):
    text = path.read_text()
    assert not re.search(r'"(?:body|description|comments|private_fork|collaborating_users)"\s*:', text), path
    assert not re.search(r'gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]+', text), path
html = (root / 'index.html').read_text()
for match in re.finditer(r'(?:src|href)=["\']([^"\']+)', html):
    target = match.group(1)
    if target.startswith(('https:', 'http:', '#', 'mailto:')):
        continue
    assert (root / target.split('#')[0].split('?')[0]).exists(), target
assert '<title>' in html and 'lang="en"' in html
assert not (root / 'data' / 'triage-summary.json').exists()
assert '75 identify' not in html and '28 records' not in html and 'Across 95' not in html
print('PASS: 468 PRs, complete file coverage, 22 published advisories, CVE/release/PR counts, public-only data, and local assets.')
