# Jeff Spahr: Kubeflow Pipelines

My work on Kubeflow Pipelines, using GitHub data collected on November 4, 2026.

The site lists my 468 PRs and 22 published security advisories, with charts of the work by month and repository area.

## Run locally

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. No build step, package installation, external scripts, or API credentials are required.

## Verify

```sh
python3 scripts/verify.py
node --check app.js
```

## Evidence and interpretation

- PR categories represent editorial primary purpose. Backports, follow-ups, and closed alternatives count separately.
- Directory coverage overlaps and includes generated code, dependency files, tests, and documentation.
- This repository contains public evidence only. Private advisory records, comments, and aggregate activity counts are excluded. Public publication outcomes do not establish the full private triage workload.
- The 22-advisory publication count uses `publisher.login == jeffspahr`. Fifteen carry CVE IDs, including two pre-existing CVE-2023 IDs. This is not a claim of 15 newly requested assignments.
- Ten merged authored implementation/integration PRs are explicitly linked from eight public advisories. Original authors and reporters retain credit. Compatibility rollback #15044 is excluded.
- The zero-fixable-CVE result for 2.17.3 and 2.18.0 is scoped to KFP-built images and SDK packages on supported Python versions newer than 3.9, at release time. Python 3.9 compatibility and images built by other projects are outside that claim and remain covered by the release security records.
- The requested 2.18.1 retrospective treats that release as the closing milestone. The verified snapshot's latest release is 2.18.0; no unverified release date, final scan, new CVE assignment, or artifact inclusion is asserted.

## Data

- `data/prs.json`: complete categorized PR inventory and changed-file paths.
- `data/advisories.json`: public advisory metadata and reporter credit.
- `data/advisory-analysis.json`: public advisory-to-PR links, counts, attribution, and methodology.

GitHub Pages publishes the repository root from `main`; `.nojekyll` preserves the buildless static site.
