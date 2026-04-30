# /qtest — Run E2E tests and auto-fix failures

Run the Playwright test suite against the video editor. On failure, identify the broken source file, patch it, rerun, and commit the fix. Max 2 auto-fix attempts per failing test.

## Steps

1. **Run full suite**

Run from `C:\Users\User\Documents\Overmind\Projects\01-Video-Editor`:
```
npx playwright test --reporter=json
```
Read `test-results/results.json` for failures.

2. **If all pass:** report "✅ All tests passing" and stop.

3. **If failures found:** for each failing test:
   - Read the error message and failing assertion
   - Map to the source file (timeline failures → `index.html`; canvas failures → `index.html`; FFmpeg failures → `index.html` spike section)
   - Read the relevant section of the source file
   - Make a targeted fix (never modify files in `tests/`)
   - Rerun the failing spec: `npx playwright test <spec-file> --reporter=list`
   - If green → run full suite → if green → commit: `git commit -m "fix(auto): <what broke and how it was fixed>"`
   - If still failing after 2 attempts → report diagnosis to user and stop

4. **Constraints:**
   - Max 2 fix attempts per failing test
   - Never modify `tests/` directory
   - If fix requires new dependency or major refactor, report to user
   - Always run full suite after any fix to check for regressions
