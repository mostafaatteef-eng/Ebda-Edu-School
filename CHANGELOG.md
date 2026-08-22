# Changelog

All notable changes to the **EBDA EDU School Operations & Academic Monitoring System** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-21

### Added
- **Production Baseline Architecture**: Clean state initialization with zero operational demo data.
- **Strict 60-Minute Lesson Architecture**: Standardized 60-minute duration engine for all timetable allocations and workload calculations.
- **Dynamic 25-Lesson / 25-Hour Teaching Workload Engine**: Automated variance, achievement rate, and documentation progress tracking with no hardcoded magic numbers.
- **Multi-Dimensional Timetable Conflict Detection Engine**: Real-time validation for teacher collisions, class double-bookings, lab conflicts, and workshop conflicts.
- **Role-Based Access Control (RBAC)**: Distinct, secure portals for Operations Managers, Teachers, and Parents with granular permission checks.
- **Lesson Materials & Parent Privacy Filter**: Support for Google Drive/OneDrive/SharePoint links with parent visibility toggle.
- **Automated Test Suites**: Unit tests for business rules, Integration tests for the conflict engine, and an 18-step E2E simulation test.
- **GitHub-Ready Infrastructure**: GitHub Actions CI/CD workflows, pull request template, issue templates, dev seed/reset scripts, and comprehensive architecture documentation.
