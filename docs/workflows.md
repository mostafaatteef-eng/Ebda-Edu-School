# EBDA EDU — Operational Workflows & Business Processes

## 1. Weekly Timetable Lifecycle & Conflict Prevention
1. **Curriculum & Workload Planning**: Operations Manager defines teachers, target quotas (25 lessons/week), subjects, and lab/workshop requirements.
2. **Scheduling Grid**: Assigns 60-minute slots across the 5-day week (Sunday to Thursday, 08:00 to 14:30).
3. **Automated Collision Prevention Engine**:
   - Checks if a Teacher is double-booked across two different classes.
   - Checks if a Class is scheduled for two subjects simultaneously.
   - Checks if a Lab or Workshop is reserved by more than one class.
4. **Publishing**: Finalized schedules become immediately available to teachers and parents.

---

## 2. 60-Minute Lesson Documentation Workflow
1. **Teacher Access**: Faculty member logs into the **Teacher Portal**.
2. **Schedule Selection**: System highlights current or scheduled sessions for the day.
3. **Session Logging**:
   - Enter Lesson Topic and Curriculum Unit.
   - Select Delivery Status (`completed`, `partially_completed`, `cancelled`, `substitute`).
   - Paste URL for Lesson Materials (Google Drive / OneDrive).
   - Set **Parent Visibility Flag** (Checked = Visible to parents; Unchecked = Internal staff only).
4. **Workload Recalculation**: Logged session increments the teacher's delivered hours in real time.

---

## 3. Parent Portal Information Flow
1. **Parent Authentication**: Guardian logs in via the unified parent credentials.
2. **Class Selection**: Selects student's cohort (e.g. `1/1 - ميكاترونكس`).
3. **Filtered Curriculum View**: The system retrieves **only records where `isParentVisible === true`**.
4. **Direct Materials Access**: Guardian clicks validated material links to view study sheets and homework directly.
