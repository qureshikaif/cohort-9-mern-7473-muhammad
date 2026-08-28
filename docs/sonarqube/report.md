# SonarQube report

| | |
|---|---|
| Project | notes-app |
| Scanner | sonar-scanner-cli (Docker) |
| Server | SonarQube Community 26.8 (Docker, localhost:9000) |
| Branch | develop |
| Commit | 5e44457 |
| Date | 2026-08-28 |

## Quality gate: FAILED

The gate only looks at new code, and the new code period starts at the previous
analysis on 25 August, so everything merged since then is measured against it.

| Condition | Actual | Threshold | |
|---|---|---|---|
| Coverage on new code | 56.6% | at least 80% | fail |
| New issues | 16 | 0 | fail |
| Duplicated lines on new code | 0.0% | under 3% | pass |

Overall code is clean, the two failures are both about the export and import files
that landed in the last merge. They are listed under New code issues below.

## Overall code

| Metric | Value |
|---|---|
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security hotspots | 0 |
| Code smells | 62 |
| Tests | 194 |
| Coverage | 67.5% |
| Line coverage | 70.9% |
| Branch coverage | 60.2% |
| Duplicated lines | 0.0% |
| Lines of code | 3795 |
| Reliability | A |
| Security | A |
| Maintainability | A |
| Technical debt | 8.2 hours |

## Tests and coverage

| Project | Tests | Lines | Branches | Tool |
|---|---|---|---|---|
| backend | 152 (91 unit, 61 integration) | 94.8% | 81.7% | mocha, coverage from c8 |
| frontend | 42 | 27.1% | 29.2% | jest |
| whole project | 194 | 70.9% | 60.2% | as SonarQube adds them up |

All 194 pass, nothing skipped, nothing failing. The integration suite runs against a
real PostgreSQL. The frontend number is the problem: 42 tests cover the API client,
form validation, the login and signup pages and the note card, and nothing else, so
the new dashboard screens pull the average down.

## New code issues

These 16 are what fails the gate. All of them are in the two files added by the
export and import feature.

| Severity | Location | Message |
|---|---|---|
| MAJOR | backend/src/utils/noteFormat.ts:24 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | backend/src/utils/noteFormat.ts:45 | Refactor this code to not use nested template literals. |
| MAJOR | backend/src/utils/noteFormat.ts:49 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | backend/src/utils/noteFormat.ts:50 | Refactor this code to not use nested template literals. |
| MAJOR | backend/src/utils/noteFormat.ts:61 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | backend/src/utils/noteFormat.ts:73 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | frontend/src/lib/importFile.ts:70 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MINOR | backend/src/utils/noteFormat.ts:60 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | backend/src/utils/noteFormat.ts:80 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | backend/src/utils/noteFormat.ts:81 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | backend/src/utils/noteFormat.ts:82 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | backend/src/utils/noteFormat.ts:83 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | frontend/src/lib/importFile.ts:8 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | frontend/src/lib/importFile.ts:9 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | frontend/src/lib/importFile.ts:10 | Prefer `String#replaceAll()` over `String#replace()`. |
| MINOR | frontend/src/lib/importFile.ts:36 | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. |

The nine `replaceAll` ones and the `TypeError` one are one line each. The five regex
warnings need the patterns rewritten so a nested quantifier cannot backtrack, which
is a real change to the HTML to Markdown conversion and wants its own branch.

## All 62 smells by rule

No bugs and no vulnerabilities, so every one of these is a maintainability smell:
40 minor, 21 major, 1 critical.

| Count | Rule |
|---|---|
| 13 | React props should be read-only |
| 10 | The most specific assertion should be used |
| 9 | Regular expressions should not cause non-linear backtracking |
| 8 | Deprecated APIs should not be used |
| 8 | Strings should use `replaceAll()` instead of `replace()` with a global regex |
| 4 | Prefer tag over ARIA role |
| 3 | Template literals should not be nested |
| 1 | Generic `Error` should be `TypeError` when thrown after a type check |
| 1 | Ternary operators should not be nested |
| 1 | Top-level await should be preferred over promise chains |
| 1 | React Context Provider values should have stable identities |
| 1 | Test titles should be unique within the same suite |
| 1 | `<button>` elements should have an explicit `type` attribute |
| 1 | Cognitive Complexity of functions should not be too high |

The single critical one is the last: `NotesPage` has a cognitive complexity of 18
against a limit of 15.

## What it would take to pass the gate

1. Fix the ten one line issues above. That drops new issues from 16 to 6.
2. Rewrite the five backtracking regexes in `noteFormat.ts` and `importFile.ts`.
   That clears the new issues condition.
3. Coverage on new code is 56.6% and needs 80%. The gap is all frontend, the new
   dashboard, sidebar, overview and editor screens have no tests at all.

## Notes on the run

The first attempt used the sonarqube:lts-community image (9.9). Its bundled TypeScript
could not read the frontend tsconfig, so none of the React source was analysed and the
line count came out at 1020 instead of the real figure. Moving to the current community
image fixed that. Worth knowing if anyone reproduces this with the LTS tag.

The scan itself finishes with no warnings. Declaration files are kept out of the c8
config, otherwise the lcov file names a `.d.ts` that Sonar does not index and the
scanner logs an unresolved path for it.
