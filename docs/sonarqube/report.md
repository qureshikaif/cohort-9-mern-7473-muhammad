# SonarQube report

Notes App, scanned on 28 August 2026 at commit 8bc1f76.
Run locally with SonarQube Community 26.8 in Docker. Steps to reproduce are in
README.md next to this file.

## Quality gate: passed

| Condition | Value | Required |
|---|---|---|
| Coverage on new code | 91.2% | 80% or more |
| Duplicated lines on new code | 0.0% | under 3% |
| New issues | 0 | 0 |

## Results

| Measure | Value |
|---|---|
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security hotspots | 0 |
| Code smells | 26 |
| Reliability | A |
| Security | A |
| Maintainability | A |
| Coverage | 77.9% |
| Duplication | 0.0% |
| Lines of code | 3847 |
| Tests | 241, all passing |
| Technical debt | 1.5 hours |

## Coverage

| Project | Tests | Lines covered |
|---|---|---|
| Backend | 152 | 94.8% |
| Frontend | 89 | 54.4% |
| Whole project | 241 | 81.0% |

Backend coverage comes from c8 over the unit and integration suites, and the
integration tests run against a real PostgreSQL. Frontend coverage comes from Jest.
The frontend number is the weak spot. The note editor, the shared note page and the
profile page still have no tests.

## What was fixed

The first scan did not pass. Coverage on new code was 56.7% against a threshold of 80%,
and there were 16 new issues.

Four Jest suites were added for the notes page, the overview page, the transfer buttons
and the app shell. Frontend coverage went from 27.1% to 54.4% and coverage on new code
to 91.2%.

All 16 new issues were fixed. Most were small: `replaceAll` instead of `replace`, a
`TypeError` instead of a plain `Error`, two nested template literals. The rest were
regular expressions that backtrack badly on long input, in the HTML to Markdown
conversion and the import parser. Those were rewritten as single pass helpers.

Two other things were cleared along the way. Eight uses of React's deprecated
`FormEvent` type, and the only critical issue, a cognitive complexity of 18 in
`NotesPage` against a limit of 15.

Code smells went from 62 to 26 and the debt from 8.2 hours to 1.5.

## Remaining issues

All 26 are maintainability smells and none of them are in new code, so the gate is not
affected.

| Count | Rule |
|---|---|
| 10 | Use a more specific chai assertion |
| 8 | Mark React props as read only |
| 4 | Prefer an HTML tag over an ARIA role |
| 4 | Four unrelated single issues |

One of the ARIA ones is arguable. `NoteCard` puts `role="button"` on the delete control
because the card itself is already a button, and a button inside a button is not valid
HTML.

## Notes

The first attempt used the `sonarqube:lts-community` image. Its bundled TypeScript could
not read the frontend tsconfig, so it skipped the whole React source and reported 1020
lines instead of 3847. The current `sonarqube:community` image reads it correctly. Worth
knowing before reproducing this with the LTS tag.

## Screenshots

In the `screenshots` folder.

| File | Page |
|---|---|
| overview-overall.png | Overview, Overall Code |
| overview.png | Overview, New Code |
| issues.png | Issues list |
| measures.png | Measures, coverage per file |
| activity.png | Analysis history |
