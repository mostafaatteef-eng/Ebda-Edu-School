# EBDA EDU — School Operations & Academic Monitoring System
### نظام إدارة وتشغيل ومتابعة العملية التعليمية — مدارس ابدأ للعلوم والتكنولوجيا التطبيقية

![CI Pipeline](https://github.com/ebda-edu/school-operations/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)

---

## 📖 Overview
**EBDA EDU** is a specialized, modern School Operations Management & Academic Monitoring Platform tailored specifically for **EBDA Applied Technology Schools (مدارس ابدأ للعلوم والتكنولوجيا التطبيقية – فرع بدر وفرع دمياط)**.

The platform provides a centralized, role-based operating environment ensuring strict compliance with technical secondary education standards:
- **Strict 60-Minute Lesson Architecture**: Standardized 60-minute sessions across timetable allocation and faculty workloads.
- **Dynamic 25-Lesson / 25-Hour Workload Engine**: Real-time quota tracking, deviation analytics, and coverage reporting.
- **Multi-Dimensional Timetable Conflict Engine**: Instant conflict detection preventing teacher double-booking, class overlap, lab collisions, and workshop resource clashes.
- **Role-Based Portals (RBAC)**:
  - 🛠️ **Operations Manager Portal**: Full scheduling, staff quotas, facility allocation, user administration, and A4 reports.
  - 🎓 **Teacher Portal**: Schedule view, quick 60-min lesson documentation, material attachment, and personal workload tracking.
  - 👨‍👩‍👧 **Parent Portal**: Direct access to documented lessons, curriculum topics, and verified study sheets with strict privacy filtering.
- **Clean Production Baseline**: Guaranteed clean start with 0 operational records (no mock or demo data in production).

---

## 🏗️ Architecture & Technology Stack
- **Frontend Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with RTL (Right-to-Left) native Arabic layout
- **Animation**: Motion (`motion/react`)
- **Icons**: Lucide React
- **Spreadsheets**: SheetJS (`xlsx`) for bidirectional Excel import/export
- **Testing**: Automated Unit, Integration, and End-to-End Simulation suites (`tsx`)
- **Build Tool**: Vite 6

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/ebda-edu/school-operations.git
cd school-operations
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

### 4. Start Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:3000`

---

## 🧪 Testing & Verification

Run the full automated test suite (Unit, Integration, and E2E):
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Business rules & 60-min calculations
npm run test:integration    # Timetable conflict detection engine
npm run test:e2e            # Complete 18-step lifecycle simulation
npm run validate:schema     # Relational schema integrity check
```

---

## 📦 Production Build

```bash
# Clean, typecheck, test, and build
npm run typecheck
npm test
npm run build
```
Production assets are generated in the `dist/` directory.

---

## 📂 Project Structure

```
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # Automated GitHub Actions CI
│   │   └── build.yml             # Production artifact build
│   ├── ISSUE_TEMPLATE/           # Bug reports & feature requests
│   └── pull_request_template.md  # Standard PR checklist
├── docs/
│   ├── architecture.md           # System design & boundaries
│   ├── database.md               # Schema & relational architecture
│   ├── permissions.md            # RBAC access control matrix
│   ├── workflows.md              # Business logic & lesson logging
│   └── deployment.md             # DevOps & deployment instructions
├── scripts/
│   ├── db/
│   │   ├── seed-dev.ts           # Isolated development fixtures
│   │   └── reset-dev.ts          # Safe development reset
│   └── validation/
│       └── validate-schema.ts    # Schema integrity validator
├── src/
│   ├── components/               # UI Portals & Views
│   │   ├── auth/                 # Login & Authentication
│   │   ├── common/               # Shared components & navigation
│   │   ├── operations/           # Operations Manager Portal
│   │   ├── teacher/              # Teacher Portal
│   │   └── parent/               # Parent Portal
│   ├── context/                  # AppContext & State Provider
│   ├── data/                     # Clean Initial Data Baseline
│   ├── types/                    # TypeScript interfaces & types
│   └── utils/                    # Business rules, conflicts & formatters
├── tests/
│   ├── unit/                     # Unit test suites
│   ├── integration/              # Conflict engine tests
│   ├── e2e/                      # 18-step lifecycle test
│   └── run-all-tests.ts          # Master test runner
├── .env.example                  # Environment template (NO SECRETS)
├── .gitignore                    # Comprehensive source control ignores
├── CHANGELOG.md                  # Release history
├── CONTRIBUTING.md               # Git workflow & contribution rules
├── LICENSE                       # Apache-2.0 License
└── package.json                  # Dependencies & scripts
```

---

## 🔐 Security & Data Privacy
- **Zero Committed Secrets**: All secrets and API credentials are provided through environment variables.
- **Parent Visibility Safeguard**: Internal teaching notes and assessment records marked private are strictly excluded from Parent Portal queries.
- **Role-Based Protection**: Destructive operations (user deletion, timetable mutation) are restricted exclusively to authenticated Operations Managers.

---

## 📄 License
This project is licensed under the **Apache-2.0 License** — see the [LICENSE](LICENSE) file for details.
