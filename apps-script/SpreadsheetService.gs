/**
 * EBDA EDU — Spreadsheet Database Access Layer
 * Manages Google Spreadsheet as the Single Source of Truth for EBDA EDU.
 * Supports batch reads/writes, automatic schema bootstrapping, and concurrency locks.
 */

var SpreadsheetService = {
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
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty('SPREADSHEET_ID');
    if (sheetId) {
      this._cachedSS = SpreadsheetApp.openById(sheetId);
      return this._cachedSS;
    }
    // Fallback: active spreadsheet if bound
    try {
      var active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) {
        props.setProperty('SPREADSHEET_ID', active.getId());
        this._cachedSS = active;
        return active;
      }
    } catch (e) {
      // Unbound standalone script
    }
    throw new Error('لم يتم تكوين معرف جدول البيانات (SPREADSHEET_ID) في خصائص البرنامج النصي.');
  },

  /**
   * Initializes all 24 database sheets with proper column headers.
   */
  bootstrapSchema: function (spreadsheet) {
    var ss = spreadsheet || this.getSpreadsheet();
    var sheetNames = Object.keys(this.SHEET_SCHEMAS);

    sheetNames.forEach(function (name) {
      var sheet = ss.getSheetByName(name);
      var headers = SpreadsheetService.SHEET_SCHEMAS[name];
      if (!sheet) {
        sheet = ss.insertSheet(name);
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
        var headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setBackground('#25A09F').setFontColor('#FFFFFF').setFontWeight('bold');
      } else {
        // Ensure header integrity
        var existingHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
        if (existingHeaders.length === 0 || !existingHeaders[0]) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
          sheet.setFrozenRows(1);
        }
      }
    });

    SpreadsheetApp.flush();

    // Initialize Default System Settings if empty
    this.seedDefaultSettings(ss);
    return true;
  },

  /**
   * Seeds official system setting defaults.
   */
  seedDefaultSettings: function (ss) {
    var settingsSheet = ss.getSheetByName('SystemSettings');
    if (!settingsSheet || settingsSheet.getLastRow() <= 1) {
      var defaultSettings = [
        ['lessonDurationMinutes', '60', 'Default Lesson Duration in Minutes (Official Standard: 60)', 'SYSTEM', Utils.getIsoTimestamp()],
        ['weeklyTeachingTarget', '25', 'Weekly Teaching Load Target in Lessons/Hours (Official: 25)', 'SYSTEM', Utils.getIsoTimestamp()],
        ['requireMaterialsLink', 'false', 'Require Lesson Materials URL Before Record Completion', 'SYSTEM', Utils.getIsoTimestamp()],
        ['defaultParentVisibility', 'true', 'Default Visibility of Documented Lessons to Parents', 'SYSTEM', Utils.getIsoTimestamp()],
        ['maxUploadSizeMB', '50', 'Maximum File Upload Size in Megabytes', 'SYSTEM', Utils.getIsoTimestamp()],
        ['activeSchoolId', 'badr', 'Primary School Tenant Identifier (EBDA School - Badr)', 'SYSTEM', Utils.getIsoTimestamp()],
        ['schoolNameAr', 'مدرسة ابدا - للعلوم التقنية - بدر', 'School Official Arabic Name', 'SYSTEM', Utils.getIsoTimestamp()],
        ['schoolStartTime', '08:00', 'School Daily Morning Start Time', 'SYSTEM', Utils.getIsoTimestamp()],
      ];
      settingsSheet.getRange(2, 1, defaultSettings.length, 5).setValues(defaultSettings);
      SpreadsheetApp.flush();
    }
  },

  /**
   * Batch reads all rows from a sheet as an array of JavaScript objects.
   */
  getAll: function (sheetName) {
    try {
      var ss = this.getSpreadsheet();
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastRow <= 1 || lastCol === 0) return [];

      var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var headers = data[0];
      var rows = [];

      for (var r = 1; r < data.length; r++) {
        var rowObj = {};
        var hasData = false;
        for (var c = 0; c < headers.length; c++) {
          var val = data[r][c];
          rowObj[headers[c]] = val;
          if (val !== '' && val !== null && val !== undefined) hasData = true;
        }
        if (hasData) {
          rows.push(rowObj);
        }
      }
      return rows;
    } catch (e) {
      Logger.log('SpreadsheetService.getAll error for sheet ' + sheetName + ': ' + e);
      return [];
    }
  },

  /**
   * Finds a single row by ID or specific field.
   */
  findById: function (sheetName, id) {
    var all = this.getAll(sheetName);
    return all.find(function (item) {
      return String(item.id) === String(id);
    }) || null;
  },

  /**
   * Appends a new row to a sheet using LockService for concurrency control with instant flush.
   */
  insert: function (sheetName, recordData) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);
      var ss = this.getSpreadsheet();
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' not found.');

      var headers = this.SHEET_SCHEMAS[sheetName] || sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
      var newId = recordData.id || Utils.generateUUID();
      var now = Utils.getIsoTimestamp();

      var finalRecord = Object.assign({}, recordData, {
        id: newId,
        createdAt: recordData.createdAt || now,
        updatedAt: now,
      });

      var rowValues = headers.map(function (col) {
        var val = finalRecord[col];
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });

      sheet.appendRow(rowValues);
      SpreadsheetApp.flush();
      return finalRecord;
    } finally {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  },

  /**
   * Updates an existing row by ID with instant flush.
   */
  update: function (sheetName, id, updates) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);
      var ss = this.getSpreadsheet();
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' not found.');

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastRow <= 1) return null;

      var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var headers = data[0];
      var idColIdx = headers.indexOf('id');
      if (idColIdx === -1) throw new Error('ID column missing in sheet ' + sheetName);

      for (var r = 1; r < data.length; r++) {
        if (String(data[r][idColIdx]) === String(id)) {
          var now = Utils.getIsoTimestamp();
          var merged = {};
          headers.forEach(function (col, idx) {
            merged[col] = data[r][idx];
          });
          Object.assign(merged, updates, { updatedAt: now });

          var newRowValues = headers.map(function (col) {
            var val = merged[col];
            if (val === undefined || val === null) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return val;
          });

          sheet.getRange(r + 1, 1, 1, headers.length).setValues([newRowValues]);
          SpreadsheetApp.flush();
          return merged;
        }
      }
      return null;
    } finally {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  },

  /**
   * Deletes a row by ID with instant flush.
   */
  deleteById: function (sheetName, id) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);
      var ss = this.getSpreadsheet();
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return false;

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastRow <= 1) return false;

      var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var headers = data[0];
      var idColIdx = headers.indexOf('id');
      if (idColIdx === -1) return false;

      for (var r = 1; r < data.length; r++) {
        if (String(data[r][idColIdx]) === String(id)) {
          sheet.deleteRow(r + 1);
          SpreadsheetApp.flush();
          return true;
        }
      }
      return false;
    } finally {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.SpreadsheetService = SpreadsheetService;
}
if (typeof global !== 'undefined') {
  global.SpreadsheetService = SpreadsheetService;
}
