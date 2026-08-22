# EBDA EDU — Role-Based Access Control (RBAC) & Permissions Matrix

## 1. System Roles

| Role | Role Key | Target Audience | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Operations Manager** | `operations_manager` | School Leadership, Operations Directors | Full administrative control, schedule building, user management, facility assignments, full reporting & analytics. |
| **Teacher** | `teacher` | Academic & Technical Faculty | Personal timetable access, logging 60-min delivered lessons, uploading materials links, monitoring personal workload quota. |
| **Parent** | `parent` | Student Guardians & Families | Viewing delivered lessons, curriculum progress, and downloading approved learning materials (where permitted). |

---

## 2. Granular Permissions Matrix

| Permission Key | Description | Category | Operations Manager | Teacher | Parent |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `view_dashboard` | Access primary operational / portal dashboard | operations | ✅ | ✅ | ✅ |
| `manage_teachers` | Create/edit teacher profiles & assign quotas | operations | ✅ | ❌ | ❌ |
| `manage_subjects` | Configure subjects, curriculum, and lab needs | operations | ✅ | ❌ | ❌ |
| `manage_grades` | Manage technical secondary stages (G1–G3) | operations | ✅ | ❌ | ❌ |
| `manage_classes` | Configure classes and student cohorts | operations | ✅ | ❌ | ❌ |
| `manage_timetable` | Build, edit, and publish weekly schedules | operations | ✅ | ❌ | ❌ |
| `manage_labs` | Manage specialized technical laboratories | resources | ✅ | ❌ | ❌ |
| `manage_workshops` | Manage industrial engineering workshops | resources | ✅ | ❌ | ❌ |
| `record_lesson` | Document delivered lessons and topics | academic | ✅ | ✅ | ❌ |
| `edit_teaching_record`| Update recorded lessons and materials | academic | ✅ | ✅ | ❌ |
| `view_teaching_load` | Inspect teacher quota and hours analytics | academic | ✅ | ✅ | ❌ |
| `view_lesson_materials`| Access Google Drive/OneDrive materials | academic | ✅ | ✅ | ✅ (Visible Only) |
| `manage_users` | Create, disable, and reset user accounts | system | ✅ | ❌ | ❌ |
| `manage_roles` | Modify permission matrix and roles | system | ✅ | ❌ | ❌ |
| `manage_settings` | Configure 60-min standard & school timing | system | ✅ | ❌ | ❌ |
| `import_excel` | Smart Excel ingestion & column mapping | reporting | ✅ | ❌ | ❌ |
| `export_data` | Export schedules and reports to Excel/PDF | reporting | ✅ | ✅ | ❌ |
| `view_reports` | Generate official A4 printable reports | reporting | ✅ | ❌ | ❌ |
| `view_analytics` | High-level operations analytics & intelligence| reporting | ✅ | ❌ | ❌ |

---

## 3. Security Enforcement
- **Client Side**: Restricts navigation tabs, action buttons, and modal dialogs based on `hasPermission()`.
- **Backend / API**: Authorizes all incoming operations using JWT or session role checks before mutating or retrieving data.
