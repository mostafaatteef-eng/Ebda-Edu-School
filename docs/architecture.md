# EBDA EDU — System Architecture & Design

## 1. System Overview
EBDA EDU is an enterprise-grade School Operations and Academic Monitoring Platform specifically architected for **EBDA Applied Technology Schools (مدارس ابدأ للعلوم والتكنولوجيا التطبيقية)**.

The system enforces strict applied technological secondary standards:
- **Strict 60-Minute Lesson Sessions**: Every period corresponds to 60 minutes of instruction.
- **Dynamic 25-Lesson / 25-Hour Workload Engine**: Computes weekly quotas, actual vs target variance, and completion metrics with zero hardcoded values.
- **Multi-Role Portals (RBAC)**: Distinct interfaces and capabilities for **Operations Managers**, **Teachers**, and **Parents**.
- **Centralized Real-Time Conflict Engine**: Real-time multi-dimensional collision prevention across teachers, classes, labs, and workshops.
- **Auditable Lesson Logging & Parent Transparency**: Enables teachers to document curriculum progress, attach verified materials (Google Drive/OneDrive), with explicit granular parent visibility toggles.

---

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                            │
│  Operations Dashboard  │  Timetable Manager  │  Teacher Portal  │ Parent│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         CENTRAL BUSINESS RULES                          │
│  • 60-Minute Session Calculator    • Conflict Detection Engine          │
│  • Workload & Quota Matrix         • Material URL Validator             │
│  • Parent Privacy Filter           • RBAC Access Guard                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         APPLICATION STATE & CONTEXT                     │
│  AppContext (React 19 Hooks + Typed Reducers + Local/Cloud Storage)     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         PERSISTENCE & SCHEMAS                           │
│  Clean Production Baseline (Zero Demo Data) + Dev Fixture Generators    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules & Boundaries

1. **`auth`**: Manages secure session lifecycle, role authentication, and credential state.
2. **`users` & `roles`**: User accounts (Operations Manager, Teacher, Parent) separated strictly from physical profile entities (`Teacher`).
3. **`school-structure`**: School branches (Badr, Damietta), technical secondary grades (G1, G2, G3), and classes/cohorts.
4. **`timetable`**: Master weekly scheduling matrix (Sunday through Thursday, 6 slots/day) with instant conflict indicators.
5. **`teaching-records`**: Actual delivered lesson sessions, topics, unit milestones, attendance status, and parent visibility flags.
6. **`lesson-materials`**: Validated links to cloud repositories (Google Drive, OneDrive, SharePoint) and student study guides.
7. **`labs` & `workshops`**: Specialized technical facilities (e.g., Mechatronics Labs, PLC Workshops) mapped directly into the timetable.
8. **`reports` & `analytics`**: PDF/A4 print-ready administrative reports, subject coverage heatmaps, and workload variance analytics.

---

## 4. Single Source of Truth Principles
- **No Scattered Magic Numbers**: All calculations for lesson duration (60 min), weekly targets (25 lessons), and school hours reference `src/utils/businessRules.ts`.
- **Relational Integrity**: Foreign keys (`teacherId`, `classId`, `subjectId`, `gradeId`) link users and sessions unambiguously.
