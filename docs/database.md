# EBDA EDU — Database & Schema Architecture (Google Sheets)

The system utilizes Google Sheets as the relational-style cloud database backend, accessed exclusively via the Google Apps Script API engine with ACID-like script locking and batch operations.

## 23 System Sheets & Column Schemas

1. **`Users`**: `id`, `username`, `name`, `role`, `email`, `phone`, `teacherId`, `parentId`, `status`, `passwordHash`, `salt`, `lastLoginAt`, `createdAt`, `updatedAt`
2. **`Roles`**: `id`, `nameAr`, `nameEn`, `description`, `permissionsJson`, `isSystem`, `createdAt`, `updatedAt`
3. **`Parents`**: `id`, `userId`, `parentName`, `phone`, `email`, `studentIdsJson`, `status`, `createdAt`, `updatedAt`
4. **`Teachers`**: `id`, `code`, `name`, `specialization`, `department`, `email`, `phone`, `targetWeeklyLessons`, `active`, `schoolId`, `createdAt`, `updatedAt`
5. **`Students`**: `id`, `nationalId`, `name`, `gradeId`, `classId`, `parentId`, `phone`, `status`, `createdAt`, `updatedAt`
6. **`Grades`**: `id`, `code`, `nameAr`, `level`, `schoolId`, `createdAt`, `updatedAt`
7. **`Classes`**: `id`, `code`, `nameAr`, `gradeId`, `studentCount`, `roomNumber`, `schoolId`, `createdAt`, `updatedAt`
8. **`Subjects`**: `id`, `code`, `nameAr`, `nameEn`, `gradeId`, `weeklyLessonsRequired`, `weeklyLessonsTarget`, `department`, `category`, `color`, `isPractical`, `preferredLocationType`, `schoolId`, `createdAt`, `updatedAt`
9. **`Rooms`**: `id`, `code`, `nameAr`, `capacity`, `floor`, `building`, `status`, `schoolId`, `createdAt`, `updatedAt`
10. **`Labs`**: `id`, `code`, `nameAr`, `type`, `capacity`, `location`, `inChargeEngineer`, `equipmentSummary`, `schoolId`, `createdAt`, `updatedAt`
11. **`Timetable`**: `id`, `schoolId`, `academicYearId`, `dayOfWeek`, `slotIndex`, `startTime`, `endTime`, `durationMinutes`, `gradeId`, `classId`, `subjectId`, `teacherId`, `locationType`, `labId`, `workshopId`, `roomName`, `createdAt`, `updatedAt`
12. **`Lessons`**: `id`, `timetableSlotId`, `date`, `dayOfWeek`, `slotIndex`, `startTime`, `endTime`, `teacherId`, `subjectId`, `classId`, `gradeId`, `status`, `createdAt`, `updatedAt`
13. **`TeachingRecords`**: `id`, `timetableSlotId`, `schoolId`, `date`, `dayOfWeek`, `slotIndex`, `startTime`, `endTime`, `durationMinutes`, `teacherId`, `subjectId`, `gradeId`, `classId`, `locationType`, `labId`, `workshopId`, `roomName`, `lessonTopic`, `unitModule`, `lessonStatus`, `notCompletedReason`, `materialsUrl`, `teacherNotes`, `parentVisibility`, `recordedAt`, `lastUpdatedAt`
14. **`LessonMaterials`**: `id`, `teachingRecordId`, `lessonId`, `title`, `type`, `url`, `driveFileId`, `mimeType`, `size`, `uploadedBy`, `parentVisibility`, `createdAt`, `updatedAt`
15. **`Breaks`**: `id`, `name`, `type`, `startTime`, `endTime`, `durationMinutes`, `daysOfWeekJson`, `status`, `schoolId`, `notes`, `createdAt`, `updatedAt`
16. **`SystemSettings`**: `key`, `value`, `description`, `updatedBy`, `updatedAt`
17. **`Notifications`**: `id`, `type`, `title`, `message`, `severity`, `targetRole`, `targetUserId`, `read`, `resolved`, `createdAt`, `updatedAt`
18. **`AuditLog`**: `id`, `timestamp`, `userId`, `userName`, `userRole`, `action`, `entityType`, `entityId`, `description`, `detailsJson`
19. **`AcademicYears`**: `id`, `name`, `term`, `startDate`, `endDate`, `isCurrent`, `createdAt`, `updatedAt`
20. **`Terms`**: `id`, `academicYearId`, `name`, `startDate`, `endDate`, `isCurrent`, `createdAt`, `updatedAt`
21. **`Activities`**: `id`, `name`, `category`, `targetGradesJson`, `supervisorTeacherId`, `scheduleJson`, `status`, `createdAt`, `updatedAt`
22. **`UserSessions`**: `id`, `token`, `userId`, `userRole`, `ipAddress`, `userAgent`, `expiresAt`, `status`, `createdAt`, `updatedAt`
23. **`PasswordResets`**: `id`, `userId`, `tempPasswordHash`, `requestedBy`, `status`, `createdAt`, `usedAt`

## Key Operational Invariants
- **Lesson Duration**: Fixed to 60 minutes across all calculations.
- **Weekly Workload Target**: 25 lessons / 25 teaching hours per teacher.
- **School Breaks**: Strictly excluded from lesson counts, workload calculations, and teaching duration.
- **Security**: Passwords salted and hashed with SHA-256; zero secrets stored in client-side code.
- **Parent Portal Privacy**: Records with `parentVisibility = false` are filtered out server-side.
