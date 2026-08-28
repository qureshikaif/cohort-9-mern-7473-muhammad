# SonarQube report

| | |
|---|---|
| Project | notes-app |
| Scanner | sonar-scanner-cli (Docker) |
| Server | SonarQube Community 26.8 (Docker, localhost:9000) |
| Branch | develop |
| Commit | 8bc1f76 |
| Date | 2026-08-28 |

## Quality gate: PASSED

The gate only looks at new code, and the new code period starts at the previous
analysis on 25 August, so everything merged since then is measured against it.

| Condition | Actual | Threshold | |
|---|---|---|---|
| Coverage on new code | 91.2% | at least 80% | pass |
| Duplicated lines on new code | 0.0% | under 3% | pass |
| New issues | 0 | 0 | pass |

It started out failing on both coverage and issues. Coverage on new code was 56.7% and
there were 16 new issues, all in the export and import files. Both are dealt with, see
what was fixed below.

## Overall code

Every figure below is the whole project, backend and frontend together.

### Ratings

SonarQube 26 keeps two rating models. The old one rates reliability off the bug count,
the newer one rates it off the severity of each issue's impact. The dashboard shows the
newer one, so both are listed here.

| | Old model | Current model |
|---|---|---|
| Reliability | A | A |
| Security | A | A |
| Maintainability | A | A |
| Security review | A | A |

Reliability was A on the old model but C on the current one, because five issues carried
a medium reliability impact even though none of them were bugs. Those five are fixed, so
the two models now agree.

### Issues

| | |
|---|---|
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security hotspots | 0 |
| Code smells | 26 |
| Blocker | 0 |
| Critical | 0 |
| Major | 8 |
| Minor | 18 |
| Technical debt | 92 min (1.5 hours) |
| Debt ratio | 0.1% |

### Size

| | |
|---|---|
| Files | 76 |
| Lines | 4534 |
| Lines of code | 3847 |
| Statements | 1174 |
| Functions | 377 |
| Classes | 3 |
| Comment lines | 7 (0.2%) |
| Cyclomatic complexity | 676 |
| Cognitive complexity | 349 |

### Coverage

| | |
|---|---|
| Coverage | 77.9% |
| Line coverage | 81.0% |
| Branch coverage | 71.3% |
| Lines to cover | 2321 |
| Uncovered lines | 442 |
| Conditions to cover | 1082 |
| Uncovered conditions | 311 |

### Tests

| | |
|---|---|
| Tests | 241 |
| Success rate | 100% |
| Failures | 0 |
| Errors | 0 |
| Skipped | 0 |
| Run time | 21.8 s |

### Duplication

| | |
|---|---|
| Duplicated lines | 0.0% (0 lines) |
| Duplicated blocks | 0 |
| Duplicated files | 0 |

## Tests and coverage per project

| Project | Tests | Lines | Branches | Tool |
|---|---|---|---|---|
| backend | 152 (91 unit, 61 integration) | 94.8% | 81.7% | mocha, coverage from c8 |
| frontend | 89 | 54.4% | 57.2% | jest |
| whole project | 241 | 81.0% | 71.3% | as SonarQube adds them up |

All 241 pass, nothing skipped, nothing failing. The integration suite runs against a
real PostgreSQL.

The frontend started at 42 tests and 27.1% of lines, which is what failed the coverage
condition. The four suites added in this branch cover the notes page, the overview
page, the transfer buttons and the shell, and take it to 89 tests and 54.4%. The screens
still without tests are the note editor, the shared note page and the profile page.

## New code issues

None. The gate's new issues condition is met.

## All 26 smells by rule

No bugs, no vulnerabilities, no security hotspots and nothing with a reliability or
security impact, so all 26 are maintainability smells: 8 major and 18 minor, nothing
critical or blocker.

| Count | Severity | Rule | Where |
|---|---|---|---|
| 10 | MINOR | The most specific assertion should be used | `api.spec` 71, 181, 263, 264 - `auth.validator.spec` 114, 115, 116 - `apiError.spec` 36 - `share.spec` 157 - `sockets.spec` 131 |
| 8 | MINOR | React props should be read-only | `AuthProvider` 6 - `ActivityChart` 7 - `AuthLayout` 12 - `NotebookArt` 3 - `RichTextEditor` 69 - `SharePanel` 12 - `TransferButtons` 19 - `ProfilePage` 15 |
| 4 | MAJOR | Prefer tag over ARIA role | `NoteCard` 32 - `NotesPage` 183, 197 - `ui.tsx` 97 |
| 1 | MAJOR | Template literals should not be nested | `api.ts` 156 |
| 1 | MAJOR | React Context Provider values should have stable identities | `AuthProvider` 32 |
| 1 | MAJOR | Test titles should be unique within the same suite | `auth.validator.spec` 77 |
| 1 | MAJOR | Top-level await should be preferred over promise chains | `server.ts` 38 |

None of these are in new code, so none affect the gate.

`NoteCard:32` is arguable rather than wrong. Sonar asks for a real `<button>` instead of
`role="button"`, but the card itself is already a button and nesting one inside another
is not valid HTML, which is why the span is there. The ten assertion ones are Sonar
preferring `to.be.undefined` over `to.equal(undefined)`.

## What was fixed in this branch

### Coverage on new code, 56.7% to 91.2%

Four Jest suites were added: `NotesPage.test.tsx`, `OverviewPage.test.tsx`,
`TransferButtons.test.tsx` and `AppShell.test.tsx`, 47 tests between them. That took the
frontend from 42 tests and 27.1% of lines to 89 tests and 54.4%. `test/polyfills.ts` also
gained a `Blob.prototype.text` shim, because jsdom does not implement it and the import
path calls it.

### New issues, 16 to 0

- eight `String#replace()` calls with a plain string pattern now use `replaceAll()`,
  four in `escapeHtml` in `noteFormat.ts`, three in `escapeHtml` in `importFile.ts`
  and the `</p>` one in `htmlToMarkdown`
- the `Array.isArray` guard in `importFile.ts` throws `TypeError` instead of `Error`
- two nested template literals in `htmlToMarkdown` pull the inner string into a
  variable first
- the three `<[^>]+>` tag strips in `noteFormat.ts` became a `stripTags` helper that
  walks the string once with `indexOf` and stops when there is no closing bracket left.
  The regex version retried every run that had no `>` after it, which is where the
  quadratic behaviour came from
- the heading pattern in `importFile.ts` went from `/^#\s+(.*\S)/` to
  `/^#[ \t]+(\S.*)/`. In the old one `\s+`, `.*` and `\S` could all match the same
  space, so the engine had choices to make. In the new one `[ \t]+` and `\S` cannot
  overlap
- `tidy` used to strip trailing whitespace with `/[ \t]+\n/g`. Anchoring it as
  `/[ \t]+$/gm` did not help, a long run of spaces in the middle of a line still had to
  be retried, so it now splits on newlines and uses `trimEnd()` instead

### Reliability, C to A

Five issues carried a medium reliability impact, which held the current model's
reliability rating at C:

- the same `<[^>]*>` tag strip was copied into `NoteCard`, `NotesPage` and
  `OverviewPage`. All three now call one `plainText` helper in `lib/text.ts` that walks
  the string once, the same approach used for `stripTags` on the backend. Output is
  unchanged, checked against the old version on eight inputs including unbalanced
  brackets
- the email pattern in `validate.ts` went from `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` to
  `/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/`. The old middle class allowed a dot, so the
  engine had to guess where the domain ended. The new one rejects `a@b..c`, which the
  old one accepted, and behaves the same on everything else
- `Button` in `ui.tsx` now defaults to `type="button"`. Every caller inside a form
  already passes `type="submit"`, so nothing changes there, but the buttons outside
  forms no longer inherit the submit default

### Other issues cleared along the way

- eight uses of the deprecated `FormEvent` type became `SyntheticEvent`, in
  `AuthLayout`, `PasswordForm`, `LoginPage` and `RegisterPage`. The React types say
  "FormEvent doesn't actually exist"
- the one critical, `NotesPage` at a cognitive complexity of 18 against a limit of 15.
  The empty state moved into its own `EmptyState` component and the three render
  conditions were pulled out of the JSX into named booleans
- the nested ternary in `Field` became an if/else, and five components now take
  `Readonly` props

Altogether code smells went from 62 to 26, the debt from 8.2 hours to 1.5, and the
critical count, the reliability issues and the new issues are all at zero. All 241 tests
still pass and the export and import output is unchanged.

One thing that is not a Sonar issue but was worth changing: the signup password hint
used to read "No more than 72 bytes". The limit is real, bcrypt ignores anything past 72
bytes, but bytes mean nothing to someone filling in a form. The hint list now shows only
the minimum length, and the byte check still runs and reports "Password is too long" if
anyone actually hits it.

## Notes on the run

The first attempt used the sonarqube:lts-community image (9.9). Its bundled TypeScript
could not read the frontend tsconfig, so none of the React source was analysed and the
line count came out at 1020 instead of the real figure. Moving to the current community
image fixed that. Worth knowing if anyone reproduces this with the LTS tag.

The scan itself finishes with no warnings. Declaration files are kept out of the c8
config, otherwise the lcov file names a `.d.ts` that Sonar does not index and the
scanner logs an unresolved path for it.
