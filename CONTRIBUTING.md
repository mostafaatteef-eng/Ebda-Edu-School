# Contributing to EBDA EDU

Thank you for contributing to **EBDA EDU — School Operations & Academic Monitoring System**!

## 1. Branch Naming Strategy
All new work should be developed on dedicated branches branched off `main` or `develop`:

- `feat/feature-name` — New features (e.g. `feat/timetable-pdf-export`)
- `fix/bug-description` — Bug fixes (e.g. `fix/conflict-detector-lab-overlap`)
- `refactor/module-name` — Code quality improvements
- `test/test-description` — Adding or updating test suites
- `docs/doc-update` — Documentation updates

---

## 2. Commit Message Guidelines (Conventional Commits)
We enforce clear, standardized commit messages:

- `feat: add lab conflict detection rule`
- `fix: resolve teacher double-booking calculation`
- `test: add 18-step E2E simulation test`
- `docs: update deployment and architecture documentation`
- `refactor: extract centralized 60-min business rules engine`
- `chore: update dependencies and build scripts`

---

## 3. Pull Request Requirements
Before submitting a Pull Request:
1. Ensure all tests pass: `npm test`
2. Ensure TypeScript compilation passes: `npm run typecheck`
3. Ensure schema validation passes: `npm run validate:schema`
4. Fill out all sections in the [Pull Request Template](.github/pull_request_template.md).
5. Ensure **no mock or sample data** is introduced into the production baseline.
