# EBDA EDU — Deployment, Cloud Architecture & DevOps Guide

## Architecture Overview
```
┌─────────────────────────────────────────────────────────┐
│                 Client Frontend (SPA)                   │
│   Hosted on GitHub Pages / Static Hosting / Cloud Run   │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS JSON API Calls
                            ▼
┌─────────────────────────────────────────────────────────┐
│       Backend API Engine (Google Apps Script)           │
│   Web App Deployment (doGet / doPost / Router)          │
└─────────────┬─────────────────────────────┬─────────────┘
              │                             │
              ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│  Database (Google Sheets) │ │   Storage (Google Drive)  │
│ 23 Schema Sheets & Tables │ │ 'EBDA EDU/Lesson Materials'│
└───────────────────────────┘ └───────────────────────────┘
```

---

## 1. Google Apps Script Backend Setup

1. Open [Google Apps Script](https://script.google.com/) and create a new project named **`EBDA EDU Backend`**.
2. Copy the files from the `/apps-script/` directory into your Apps Script project:
   - `Code.gs`
   - `Router.gs`
   - `SpreadsheetService.gs`
   - `AuthService.gs`
   - `SessionService.gs`
   - `UserService.gs`
   - `TeacherService.gs`
   - `ParentService.gs`
   - `StudentService.gs`
   - `TimetableService.gs`
   - `TeachingRecordService.gs`
   - `MaterialService.gs`
   - `DriveService.gs`
   - `BreakService.gs`
   - `SettingsService.gs`
   - `DashboardService.gs`
   - `NotificationService.gs`
   - `AuditService.gs`
   - `ValidationService.gs`
   - `Utils.gs`
   - `appsscript.json`
3. In the Apps Script Editor, select and run the `initializeEBDA()` function once.
   - This automatically creates the Google Spreadsheet with all 23 database sheets, sets up the Google Drive storage folder, and creates the default Operations Manager account (`admin`).
4. Click **Deploy** → **New deployment**:
   - Select type: **Web app**
   - Description: `EBDA EDU Production API v2`
   - Execute as: **Me (your Google account)**
   - Who has access: **Anyone**
5. Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/.../exec`).

---

## 2. Frontend GitHub Pages Deployment

1. In your GitHub repository settings, go to **Secrets and variables** → **Actions**.
2. Add a repository variable:
   - Name: `VITE_API_URL`
   - Value: Your Google Apps Script Web App URL from Step 1.
3. Push changes to `main` branch. The automated GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
   - Run typecheck and verification tests.
   - Compile production SPA assets to `dist/`.
   - Automatically configure SPA fallback routing (`404.html`).
   - Deploy directly to GitHub Pages.

---

## 3. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run all verification test suites
npm test

# 3. Start local development server
npm run dev
```
