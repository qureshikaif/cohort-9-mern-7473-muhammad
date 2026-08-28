# SonarQube report

| | |
|---|---|
| Project | notes-app |
| Scanner | sonar-scanner-cli (Docker) |
| Server | SonarQube Community 26.8 (Docker, localhost:9000) |
| Branch | develop |
| Commit | cd09235 |
| Date | 2026-08-28 |

## Quality gate: FAILED

The gate only looks at new code, and the new code period starts at the previous
analysis on 25 August, so everything merged since then is measured against it.

| Condition | Actual | Threshold | |
|---|---|---|---|
| Coverage on new code | 91.9% | at least 80% | pass |
| New issues | 5 | 0 | fail |
| Duplicated lines on new code | 0.0% | under 3% | pass |

Overall code is clean. The gate started out failing on both coverage and issues. The
coverage side is sorted, new code is at 91.9%, and 11 of the 16 issues are fixed, so
the only thing left is the five regular expressions listed below.

## Overall code

| Metric | Value |
|---|---|
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security hotspots | 0 |
| Code smells | 51 |
| Tests | 241 |
| Coverage | 77.8% |
| Line coverage | 80.7% |
| Branch coverage | 71.5% |
| Duplicated lines | 0.0% |
| Lines of code | 3797 |
| Reliability | A |
| Security | A |
| Maintainability | A |
| Technical debt | 7.2 hours |

## Tests and coverage

| Project | Tests | Lines | Branches | Tool |
|---|---|---|---|---|
| backend | 152 (91 unit, 61 integration) | 94.9% | 81.7% | mocha, coverage from c8 |
| frontend | 89 | 53.3% | 56.8% | jest |
| whole project | 241 | 80.7% | 71.5% | as SonarQube adds them up |

All 241 pass, nothing skipped, nothing failing. The integration suite runs against a
real PostgreSQL.

The frontend started at 42 tests and 27.1% of lines, which is what failed the coverage
condition. The four suites added in this branch cover the notes page, the overview
page, the transfer buttons and the shell, and take it to 89 tests and 53.3%. The screens
still without tests are the note editor, the shared note page and the profile page.

## New code issues

These five are what fails the issues condition. All of them are the same rule, a
quantifier inside a group that can backtrack.

| Severity | Location | Message |
|---|---|---|
| MAJOR | backend/src/utils/noteFormat.ts:24 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | backend/src/utils/noteFormat.ts:50 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | backend/src/utils/noteFormat.ts:63 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | backend/src/utils/noteFormat.ts:75 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | frontend/src/lib/importFile.ts:70 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |

### Already fixed in this branch

Coverage on new code went from 56.7% to 91.9% by adding four Jest suites:
`NotesPage.test.tsx`, `OverviewPage.test.tsx`, `TransferButtons.test.tsx` and
`AppShell.test.tsx`, 47 tests between them. `test/polyfills.ts` also gained a
`Blob.prototype.text` shim, because jsdom does not implement it and the import path
calls it.

The first run of this scan found 16 new issues. These 11 are done:

- eight `String#replace()` calls with a plain string pattern now use `replaceAll()`,
  four in `escapeHtml` in `noteFormat.ts`, three in `escapeHtml` in `importFile.ts`
  and the `</p>` one in `htmlToMarkdown`
- the `Array.isArray` guard in `importFile.ts` throws `TypeError` instead of `Error`
- two nested template literals in `htmlToMarkdown` pull the inner string into a
  variable first

That took code smells from 62 to 51 and the debt from 8.2 to 7.2 hours. All 241 tests
still pass.

## All 51 smells by rule

No bugs and no vulnerabilities, so every one of these is a maintainability smell:
31 minor, 19 major, 1 critical.

| Count | Rule |
|---|---|
| 13 | React props should be read-only |
| 10 | The most specific assertion should be used |
| 9 | Regular expressions should not cause non-linear backtracking |
| 8 | Deprecated APIs should not be used |
| 4 | Prefer tag over ARIA role |
| 1 | Ternary operators should not be nested |
| 1 | Top-level await should be preferred over promise chains |
| 1 | Template literals should not be nested |
| 1 | React Context Provider values should have stable identities |
| 1 | Test titles should be unique within the same suite |
| 1 | `<button>` elements should have an explicit `type` attribute |
| 1 | Cognitive Complexity of functions should not be too high |

The single critical one is the last: `NotesPage` has a cognitive complexity of 18
against a limit of 15.

## What it would take to pass the gate

Only one thing is left: rewrite the five backtracking regexes in `noteFormat.ts` and
`importFile.ts`. They are the `<tag>([\s\S]*?)</tag>` pairs in the HTML conversion, so
they change how the conversion works and want their own tests rather than being rushed
in here.

The coverage condition is already met at 91.9%.

## Notes on the run

The first attempt used the sonarqube:lts-community image (9.9). Its bundled TypeScript
could not read the frontend tsconfig, so none of the React source was analysed and the
line count came out at 1020 instead of the real figure. Moving to the current community
image fixed that. Worth knowing if anyone reproduces this with the LTS tag.

The scan itself finishes with no warnings. Declaration files are kept out of the c8
config, otherwise the lcov file names a `.d.ts` that Sonar does not index and the
scanner logs an unresolved path for it.
