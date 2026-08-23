/**
 * EBDA EDU — Spreadsheet Database Access Layer
 * Manages Google Spreadsheet as the Single Source of Truth for EBDA EDU.
 * Supports batch reads/writes, automatic schema bootstrapping, and concurrency locks.
 */

const SpreadsheetService = {
  _cachedSS: null,

  /**
   * 24 Core Schema Sheet Definitions with Column Headers
   */
  SHEET_SCHEMAS: {
    Users: ['id', 'username', 'name', 'role', 'email', 'phone', 'teacherId', 'parentId', 'status', 'passwordHash', 'salt', 'lastLoginAt', 'createdAt', 'updatedAt'],
    Roles: ['id', 'nameAr', 'nameEn', 'description', 'permissionsJson', 'isSystem', 'createdAt', 'updatedAt'],
    Parents: ['id', 'userId', 'parentName', 'phone', 'email', 'studentIdsJson', 'status', 'createdAt', 'updatedAt'],
    Teachers: ['id', 'code', 'name', 'specialization', 'department', 'email', 'phone', 'targetWeeklyLessons', 'active', 'schoolId', 'createdAt', 'updatedAt'],
    Students: ['id', 'nationalId', 'name', 'gradeId', 'classId', 'parentId', 'phone', 'status', 'createdAt', 'updatedAt'],
    Grades: ['id', 'code', 'nameAr', 'level', 'schoolId', 'createdAt', 'updatedAt'],
    Classes: ['id', 'code', 'nameAr', 'gradeId', 'studentCount', 'roomNumber', 'schoolId', 'createdAt', 'updatedAt'],
    Subjects: ['id', 'code', 'nameAr', 'nameEn', 'gradeId', 'weeklyLessonsRequired', 'weeklyLessonsTarget', 'department', 'category', 'color', 'isPractical', 'preferredLocationType', 'schoolId', 'createdAt', 'updatedAt'],
    Rooms: ['id', 'code', 'nameAr', 'capacity', 'floor', 'building', 'status', 'schoolId', 'createdAt', 'updatedAt'],
    Labs: ['id', 'code', 'nameAr', 'nameEn', 'type', 'capacity', 'location', 'inChargeEngineer', 'equipmentSummary', 'status', 'schoolId', 'createdAt', 'updatedAt'],
    Workshops: ['id', 'code', 'nameAr', 'nameEn', 'type', 'capacity', 'location', 'inChargeEngineer', 'equipmentSummary', 'status', 'schoolId', 'createdAt', 'updatedAt'],
    Timetable: ['id', 'schoolId', 'academicYearId', 'dayOfWeek', 'slotIndex', 'startTime', 'endTime', 'durationMinutes', 'gradeId', 'classId', 'subjectId', 'teacherId', 'locationType', 'labId', 'workshopId', 'roomName', 'createdAt', 'updatedAt'],
    Lessons: ['id', 'timetableSlotId', 'date', 'dayOfWeek', 'slotIndex', 'startTime', 'endTime', 'teacherId', 'subjectId', 'classId', 'gradeId', 'status', 'createdAt', 'updatedAt'],
    TeachingRecords: ['id', 'timetableSlotId', 'schoolId', 'date', 'dayOfWeek', 'slotIndex', 'startTime', 'endTime', 'durationMinutes', 'teacherId', 'subjectId', 'gradeId', 'classId', 'locationType', 'labId', 'workshopId', 'roomName', 'lessonTopic', 'unitModule', 'lessonStatus', 'notCompletedReason', 'materialsUrl', 'teacherNotes', 'parentVisibility', 'recordedAt', 'lastUpdatedAt'],
    LessonMaterials: ['id', 'teachingRecordId', 'lessonId', 'title', 'type', 'url', 'driveFileId', 'mimeType', 'size', 'uploadedBy', 'parentVisibility', 'createdAt', 'updatedAt'],
    Breaks: ['id', 'name', 'type', 'startTime', 'endTime', 'durationMinutes', 'daysOfWeekJson', 'status', 'schoolId', 'notes', 'createdAt', 'updatedAt'],
    SystemSettings: ['key', 'value', 'description', 'updatedBy', 'updatedAt'],
    Notifications: ['id', 'type', 'title', 'message', 'severity', 'targetRole', 'targetUserId', 'read', 'resolved', 'createdAt', 'updatedAt'],
    AuditLog: ['id', 'timestamp', 'userId', 'userName', 'userRole', 'action', 'entityType', 'entityId', 'description', 'detailsJson'],
    AcademicYears: ['id', 'name', 'term', 'startDate', 'endDate', 'isCurrent', 'createdAt', 'updatedAt'],
    Terms: ['id', 'academicYearId', 'name', 'startDate', 'endDate', 'isCurrent', 'createdAt', 'updatedAt'],
    Activities: ['id', 'name', 'category', 'targetGradesJson', 'supervisorTeacherId', 'scheduleJson', 'status', 'createdAt', 'updatedAt'],
    UserSessions: ['id', 'token', 'userId', 'userRole', 'ipAddress', 'userAgent', 'expiresAt', 'status', 'createdAt', 'updatedAt'],
    PasswordResets: ['id', 'userId', 'tempPasswordHash', 'requestedBy', 'status', 'createdAt', 'usedAt'],
  },

  /**
   * Retrieves active Spreadsheet instance with execution context caching.
   */
  getSpreadsheet: function () {
    if (this._cachedSS) {
      return this._cachedSS;
    }
    const props = PropertiesService.getScriptProperties();
    const sheetId = props.getProperty('SPREADSHEET_ID');
    if (sheetId) {
      this._cachedSS = SpreadsheetApp.openById(sheetId);
      return this._cachedSS;
    }
    // Fallback: active spreadsheet if bound
    try {
      const active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) {
        props.setProperty('SPREADSHEET_ID', active.getId());
        this._cachedSS = active;
        return active;
      }
    } catch (e) {
      // Unbound standalone script
    }
    throw new Error('Spreadsheet ID is not configured in Script Properties.');
  },

  /**
   * Initializes all 23 database sheets with proper column headers.
   */
  bootstrapSchema: function (spreadsheet) {
    const ss = spreadsheet || this.getSpreadsheet();
    const sheetNames = Object.keys(this.SHEET_SCHEMAS);

    sheetNames.forEach((name) => {
      let sheet = ss.getSheetByName(name);
      const headers = this.SHEET_SCHEMAS[name];
      if (!sheet) {
        sheet = ss.insertSheet(name);
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setBackground('#25A09F').setFontColor('#FFFFFF').setFontWeight('bold');
      } else {
        // Ensure header integrity
        const existingHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
        if (existingHeaders.length === 0 || !existingHeaders[0]) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
          sheet.setFrozenRows(1);
        }
      }
    });

    // Initialize Default System Settings if empty
    this.seedDefaultSettings(ss);
    return true;
  },

  /**
   * Seeds official system setting defaults.
   */
  seedDefaultSettings: function (ss) {
    const settingsSheet = ss.getSheetByName('SystemSettings');
    if (!settingsSheet || settingsSheet.getLastRow() <= 1) {
      const defaultSettings = [
        ['lessonDurationMinutes', '60', 'Default Lesson Duration in Minutes (Official Standard: 60)', 'SYSTEM', Utils.getIsoTimestamp()],
        ['weeklyTeachingTarget', '25', 'Weekly Teaching Load Target in Lessons/Hours (Official: 25)', 'SYSTEM', Utils.getIsoTimestamp()],
        ['requireMaterialsLink', 'false', 'Require Lesson Materials URL Before Record Completion', 'SYSTEM', Utils.getIsoTimestamp()],
        ['defaultParentVisibility', 'true', 'Default Visibility of Documented Lessons to Parents', 'SYSTEM', Utils.getIsoTimestamp()],
        ['maxUploadSizeMB', '50', 'Maximum File Upload Size in Megabytes', 'SYSTEM', Utils.getIsoTimestamp()],
        ['activeSchoolId', 'badr', 'Primary School Tenant Identifier (EBDA School - Badr)', 'SYSTEM', Utils.getIsoTimestamp()],
        ['schoolNameAr', 'مدرسة ابدأ – بدر للعلوم والتكنولوجيا التطبيقية', 'School Official Arabic Name', 'SYSTEM', Utils.getIsoTimestamp()],
        ['schoolStartTime', '08:00', 'School Daily Morning Start Time', 'SYSTEM', Utils.getIsoTimestamp()],
      ];
      settingsSheet.getRange(2, 1, defaultSettings.length, 5).setValues(defaultSettings);
    }
  },

  /**
   * Batch reads all rows from a sheet as an array of JavaScript objects.
   */
  getAll: function (sheetName) {
    const ss = this.getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) return [];

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0];
    const rows = [];

    for (let r = 1; r < data.length; r++) {
      const rowObj = {};
      let hasData = false;
      for (let c = 0; c < headers.length; c++) {
        const val = data[r][c];
        rowObj[headers[c]] = val;
        if (val !== '' && val !== null && val !== undefined) hasData = true;
      }
      if (hasData) {
        rows.push(rowObj);
      }
    }
    return rows;
  },

  /**
   * Finds a single row by ID or specific field.
   */
  findById: function (sheetName, id) {
    const all = this.getAll(sheetName);
    return all.find((item) => String(item.id) === String(id)) || null;
  },

  /**
   * Appends a new row to a sheet using LockService for concurrency control.
   */
  insert: function (sheetName, recordData) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      const ss = this.getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' not found.');

      const headers = this.SHEET_SCHEMAS[sheetName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newId = recordData.id || Utils.generateUUID();
      const now = Utils.getIsoTimestamp();

      const finalRecord = Object.assign({}, recordData, {
        id: newId,
        createdAt: recordData.createdAt || now,
        updatedAt: now,
      });

      const rowValues = headers.map((col) => {
        const val = finalRecord[col];
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });

      sheet.appendRow(rowValues);
      return finalRecord;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Updates an existing row by ID.
   */
  update: function (sheetName, id, updates) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      const ss = this.getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' not found.');

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow <= 1) return null;

      const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = data[0];
      const idColIdx = headers.indexOf('id');
      if (idColIdx === -1) throw new Error('ID column missing in sheet ' + sheetName);

      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idColIdx]) === String(id)) {
          const now = Utils.getIsoTimestamp();
          const merged = {};
          headers.forEach((col, idx) => {
            merged[col] = data[r][idx];
          });
          Object.assign(merged, updates, { updatedAt: now });

          const newRowValues = headers.map((col) => {
            const val = merged[col];
            if (val === undefined || val === null) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return val;
          });

          sheet.getRange(r + 1, 1, 1, headers.length).setValues([newRowValues]);
          return merged;
        }
      }
      return null;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Deletes a row by ID.
   */
  deleteById: function (sheetName, id) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      const ss = this.getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return false;

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow <= 1) return false;

      const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = data[0];
      const idColIdx = headers.indexOf('id');
      if (idColIdx === -1) return false;

      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idColIdx]) === String(id)) {
          sheet.deleteRow(r + 1);
          return true;
        }
      }
      return false;
    } finally {
      lock.releaseLock();
    }
  },
};
