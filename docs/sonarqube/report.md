# SonarQube report

| | |
|---|---|
| Project | notes-app |
| Scanner | sonar-scanner-cli (Docker) |
| Server | SonarQube Community 26.8 (Docker, localhost:9000) |
| Commit | e5cd212 |
| Date | 2026-08-25 |

## Quality gate: PASSED

| Metric | Value |
|---|---|
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security hotspots | 0 |
| Code smells | 45 |
| Tests | 151 |
| Coverage | 66.9% |
| Duplicated lines | 0.0% |
| Lines of code | 2910 |
| Reliability | A |
| Security | A |
| Maintainability | A |
| Technical debt | 5.2 hours |

## Tests and coverage

| Project | Tests | Lines | Branches | Tool |
|---|---|---|---|---|
| backend | 118 (74 unit, 44 integration) | 95.0% | 80.6% | mocha, coverage from c8 |
| frontend | 33 | 29.3% | 28.9% | jest |
| whole project | 151 | 70.7% | 59.6% | as SonarQube adds them up |

All 151 pass, nothing skipped, nothing failing. The integration suite runs against a
real PostgreSQL. Frontend tests cover the API client, form validation, the login page
and the note card, and that 29.3% is the weak spot here, most of the screens have no
tests yet.

The test counts come from execution reports the two test runners write next to their
lcov files, so the dashboard shows a real number under Unit Tests instead of a dash.

## Issues

1 critical, 16 major, 28 minor. No bugs and no vulnerabilities, everything below is a
maintainability smell.

| Severity | Location | Message |
|---|---|---|
| CRITICAL | frontend/src/pages/NotesPage.tsx:28 | Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed. |
| MAJOR | backend/src/server.ts:38 | Prefer top-level await over using a promise chain. |
| MAJOR | backend/test/auth.validator.spec.ts:77 | Rename this test title to make it unique within the suite. |
| MAJOR | frontend/src/auth/AuthProvider.tsx:32 | The object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. |
| MAJOR | frontend/src/components/ActivityChart.tsx:20 | Use <img alt=...>, or <img alt=...> instead of the "img" role to ensure accessibility across all devices. |
| MAJOR | frontend/src/components/ActivityChart.tsx:24 | Refactor this code to not use nested template literals. |
| MAJOR | frontend/src/components/NoteCard.tsx:36 | Use <input type="button">, <input type="image">, <input type="reset">, <input type="submit">, or <button> instead of the "button" role to ensure accessibility across all devices. |
| MAJOR | frontend/src/components/NoteCard.tsx:11 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | frontend/src/components/ui.tsx:33 | Extract this nested ternary operation into an independent statement. |
| MAJOR | frontend/src/components/ui.tsx:85 | Use <output> instead of the "status" role to ensure accessibility across all devices. |
| MAJOR | frontend/src/components/ui.tsx:23 | Add an explicit "type" attribute to this button. |
| MAJOR | frontend/src/lib/api.ts:150 | Refactor this code to not use nested template literals. |
| MAJOR | frontend/src/lib/validate.ts:12 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | frontend/src/pages/NotesPage.tsx:23 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MAJOR | frontend/src/pages/NotesPage.tsx:159 | Use <details>, <fieldset>, <optgroup>, or <address> instead of the "group" role to ensure accessibility across all devices. |
| MAJOR | frontend/src/pages/NotesPage.tsx:173 | Use <details>, <fieldset>, <optgroup>, or <address> instead of the "group" role to ensure accessibility across all devices. |
| MAJOR | frontend/src/pages/OverviewPage.tsx:15 | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| MINOR | backend/test/apiError.spec.ts:36 | Prefer "expect(err.details).to.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/auth.validator.spec.ts:114 | Prefer "expect(fieldErrors.name).to.not.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/auth.validator.spec.ts:115 | Prefer "expect(fieldErrors.email).to.not.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/auth.validator.spec.ts:116 | Prefer "expect(fieldErrors.password).to.not.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/integration/api.spec.ts:202 | Prefer "expect(notes[0]?.id).to.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/integration/api.spec.ts:203 | Prefer "expect(notes[0]?.authorId).to.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/integration/api.spec.ts:181 | Prefer "expect(profile.password).to.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/integration/api.spec.ts:71 | Prefer "expect((registered.body.user as Json).password).to.be.undefined" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | backend/test/integration/sockets.spec.ts:131 | Prefer "expect(leaked).to.be.null" over this generic assertion; dedicated matchers read better and report clearer failures. |
| MINOR | frontend/src/auth/AuthProvider.tsx:6 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/ActivityChart.tsx:7 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/AuthLayout.tsx:12 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/AuthLayout.tsx:1 | 'FormEvent' is deprecated. |
| MINOR | frontend/src/components/AuthLayout.tsx:7 | 'FormEvent' is deprecated. |
| MINOR | frontend/src/components/NotebookArt.tsx:3 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/NoteCard.tsx:25 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/RichTextEditor.tsx:69 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/TransferButtons.tsx:14 | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. |
| MINOR | frontend/src/components/TransferButtons.tsx:37 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/ui.tsx:32 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/ui.tsx:22 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/ui.tsx:72 | Mark the props of the component as read-only. |
| MINOR | frontend/src/components/ui.tsx:83 | Mark the props of the component as read-only. |
| MINOR | frontend/src/pages/LoginPage.tsx:41 | 'FormEvent' is deprecated. |
| MINOR | frontend/src/pages/LoginPage.tsx:1 | 'FormEvent' is deprecated. |
| MINOR | frontend/src/pages/ProfilePage.tsx:14 | Mark the props of the component as read-only. |
| MINOR | frontend/src/pages/RegisterPage.tsx:63 | 'FormEvent' is deprecated. |
| MINOR | frontend/src/pages/RegisterPage.tsx:1 | 'FormEvent' is deprecated. |

## Notes on the run

The first attempt used the sonarqube:lts-community image (9.9). Its bundled TypeScript
could not read the frontend tsconfig, so none of the React source was analysed and the
line count came out at 1020 instead of 2910. Moving to the current community image
fixed that. Worth knowing if anyone reproduces this with the LTS tag.

The scan itself finishes with no warnings. Declaration files are kept out of the c8
config, otherwise the lcov file names a `.d.ts` that Sonar does not index and the
scanner logs an unresolved path for it.
