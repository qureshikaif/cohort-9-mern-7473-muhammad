# SonarQube report

| | |
|---|---|
| Project | notes-app |
| Scanner | sonar-scanner-cli (Docker) |
| Server | SonarQube Community 26.8 (Docker, localhost:9000) |
| Branch | develop |
| Commit | f683d04 |
| Date | 2026-08-28 |

## Quality gate: FAILED

The gate only looks at new code, and the new code period starts at the previous
analysis on 25 August, so everything merged since then is measured against it.

| Condition | Actual | Threshold | |
|---|---|---|---|
| Coverage on new code | 92.1% | at least 80% | pass |
| Duplicated lines on new code | 0.0% | under 3% | pass |
| New issues | 5 | 0 | fail |

It started out failing on coverage as well. That is sorted, and 11 of the original 16
new issues are fixed, so the only thing left is five regular expressions.

## Overall code

Every figure below is the whole project, backend and frontend together.

### Ratings

| | |
|---|---|
| Reliability | A |
| Security | A |
| Security review | A |
| Maintainability | A |

### Issues

| | |
|---|---|
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security hotspots | 0 |
| Code smells | 42 |
| Blocker | 0 |
| Critical | 0 |
| Major | 19 |
| Minor | 23 |
| Technical debt | 304 min (5.1 hours) |
| Debt ratio | 0.3% |

### Size

| | |
|---|---|
| Files | 75 |
| Lines | 4490 |
| Lines of code | 3814 |
| Statements | 1145 |
| Functions | 376 |
| Classes | 3 |
| Comment lines | 7 (0.2%) |
| Cyclomatic complexity | 669 |
| Cognitive complexity | 336 |

### Coverage

| | |
|---|---|
| Coverage | 77.8% |
| Line coverage | 80.8% |
| Branch coverage | 71.4% |
| Lines to cover | 2276 |
| Uncovered lines | 438 |
| Conditions to cover | 1073 |
| Uncovered conditions | 307 |

### Tests

| | |
|---|---|
| Tests | 241 |
| Success rate | 100% |
| Failures | 0 |
| Errors | 0 |
| Skipped | 0 |
| Run time | 21.6 s |

### Duplication

| | |
|---|---|
| Duplicated lines | 0.0% (0 lines) |
| Duplicated blocks | 0 |
| Duplicated files | 0 |

## Tests and coverage per project

| Project | Tests | Lines | Branches | Tool |
|---|---|---|---|---|
| backend | 152 (91 unit, 61 integration) | 94.9% | 81.7% | mocha, coverage from c8 |
| frontend | 89 | 53.8% | 56.8% | jest |
| whole project | 241 | 80.8% | 71.4% | as SonarQube adds them up |

All 241 pass, nothing skipped, nothing failing. The integration suite runs against a
real PostgreSQL.

The frontend started at 42 tests and 27.1% of lines, which is what failed the coverage
condition. The four suites added in this branch cover the notes page, the overview
page, the transfer buttons and the shell, and take it to 89 tests and 53.8%. The screens
still without tests are the note editor, the shared note page and the profile page.

## New code issues

These five are what fails the gate. All of them are the same rule, a quantifier inside
a group that can backtrack.

| Severity | Location |
|---|---|
| MAJOR | backend/src/utils/noteFormat.ts:24 |
| MAJOR | backend/src/utils/noteFormat.ts:50 |
| MAJOR | backend/src/utils/noteFormat.ts:63 |
| MAJOR | backend/src/utils/noteFormat.ts:75 |
| MAJOR | frontend/src/lib/importFile.ts:70 |

## All 42 smells by rule

No bugs, no vulnerabilities and no security hotspots, so all 42 are maintainability
smells: 19 major and 23 minor, nothing critical or blocker.

| Count | Severity | Rule | Where |
|---|---|---|---|
| 13 | MINOR | React props should be read-only | `ui.tsx` 22, 33, 73, 84 - `AuthProvider` 6 - `ActivityChart` 7 - `AuthLayout` 12 - `NoteCard` 25 - `NotebookArt` 3 - `RichTextEditor` 69 - `SharePanel` 12 - `TransferButtons` 19 - `ProfilePage` 15 |
| 10 | MINOR | The most specific assertion should be used | `api.spec` 71, 181, 263, 264 - `auth.validator.spec` 114, 115, 116 - `apiError.spec` 36 - `share.spec` 157 - `sockets.spec` 131 |
| 9 | MAJOR | Regular expressions should not cause non-linear backtracking | `noteFormat.ts` 24, 50, 63, 75 - `importFile.ts` 70 - `NoteCard` 11 - `validate.ts` 12 - `NotesPage` 49 - `OverviewPage` 15 |
| 4 | MAJOR | Prefer tag over ARIA role | `NoteCard` 36 - `ui.tsx` 86 - `NotesPage` 189, 203 |
| 1 | MAJOR | Template literals should not be nested | `api.ts` 156 |
| 1 | MAJOR | Ternary operators should not be nested | `ui.tsx` 34 |
| 1 | MAJOR | React Context Provider values should have stable identities | `AuthProvider` 32 |
| 1 | MAJOR | `<button>` should have an explicit `type` attribute | `ui.tsx` 23 |
| 1 | MAJOR | Test titles should be unique within the same suite | `auth.validator.spec` 77 |
| 1 | MAJOR | Top-level await should be preferred over promise chains | `server.ts` 38 |

Two of these are arguable rather than wrong. `NoteCard:36` asks for a real `<button>`
instead of `role="button"`, but the card itself is already a button and nesting one
inside another is not valid HTML, which is why the span is there. The ten assertion
ones are Sonar preferring `to.be.undefined` over `to.equal(undefined)`.

## What was fixed in this branch

Coverage on new code went from 56.7% to 92.1% by adding four Jest suites,
`NotesPage.test.tsx`, `OverviewPage.test.tsx`, `TransferButtons.test.tsx` and
`AppShell.test.tsx`, 47 tests between them. `test/polyfills.ts` also gained a
`Blob.prototype.text` shim, because jsdom does not implement it and the import path
calls it.

Twenty of the issues are gone:

- eight `String#replace()` calls with a plain string pattern now use `replaceAll()`,
  four in `escapeHtml` in `noteFormat.ts`, three in `escapeHtml` in `importFile.ts`
  and the `</p>` one in `htmlToMarkdown`
- the `Array.isArray` guard in `importFile.ts` throws `TypeError` instead of `Error`
- two nested template literals in `htmlToMarkdown` pull the inner string into a
  variable first
- eight uses of the deprecated `FormEvent` type became `SyntheticEvent`, in
  `AuthLayout`, `PasswordForm`, `LoginPage` and `RegisterPage`. The React types say
  "FormEvent doesn't actually exist"
- the one critical, `NotesPage` at a cognitive complexity of 18 against a limit of 15.
  The empty state moved into its own `EmptyState` component and the three render
  conditions were pulled out of the JSX into named booleans

That took code smells from 62 to 42, the debt from 8.2 hours to 5.1, and the critical
count to zero. All 241 tests still pass.

## What is left to pass the gate

Rewrite the five backtracking regexes in `noteFormat.ts` and `importFile.ts`. They are
the `<tag>([\s\S]*?)</tag>` pairs in the HTML conversion, so they change how the
conversion works and want their own tests rather than being rushed in here.

The coverage condition is already met at 92.1%.

## Notes on the run

The first attempt used the sonarqube:lts-community image (9.9). Its bundled TypeScript
could not read the frontend tsconfig, so none of the React source was analysed and the
line count came out at 1020 instead of the real figure. Moving to the current community
image fixed that. Worth knowing if anyone reproduces this with the LTS tag.

The scan itself finishes with no warnings. Declaration files are kept out of the c8
config, otherwise the lcov file names a `.d.ts` that Sonar does not index and the
scanner logs an unresolved path for it.
