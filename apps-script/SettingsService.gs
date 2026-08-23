/**
 * EBDA EDU — Centralized System Settings Service
 * Single Source of Truth for school operational standards:
 * - Lesson Duration: 60 Minutes
 * - Target Weekly Teaching Load: 25 Lessons / 25 Hours
 */

var SettingsService = {
  /**
   * Retrieves all system settings as a key-value object.
   */
  getSettings: function () {
    var rows = SpreadsheetService.getAll('SystemSettings');
    var settings = {
      lessonDurationMinutes: 60,
      weeklyTeachingTarget: 25,
      schoolStartTime: '08:00',
      requireMaterialsLink: false,
      defaultParentVisibility: true,
      maxUploadSizeMB: 50,
      activeSchoolId: 'badr',
      schoolNameAr: 'مدرسة ابدا - للعلوم التقنية - بدر',
    };

    rows.forEach(function (r) {
      var val = r.value;
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(val) && val !== '') val = Number(val);
      settings[r.key] = val;
    });

    return settings;
  },

  /**
   * Updates one or more system settings.
   */
  updateSettings: function (newSettings, updatedBy) {
    var ss = SpreadsheetService.getSpreadsheet();
    var sheet = ss.getSheetByName('SystemSettings');
    if (!sheet) throw new Error('SystemSettings sheet not found.');

    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);
      var data = sheet.getDataRange().getValues();
      var now = Utils.getIsoTimestamp();

      Object.keys(newSettings).forEach(function (key) {
        var value = String(newSettings[key]);
        var found = false;

        for (var r = 1; r < data.length; r++) {
          if (data[r][0] === key) {
            sheet.getRange(r + 1, 2).setValue(value);
            sheet.getRange(r + 1, 4).setValue(updatedBy || 'OPERATIONS_MANAGER');
            sheet.getRange(r + 1, 5).setValue(now);
            found = true;
            break;
          }
        }

        if (!found) {
          sheet.appendRow([key, value, 'Custom Configuration', updatedBy || 'OPERATIONS_MANAGER', now]);
        }
      });

      SpreadsheetApp.flush();
      return this.getSettings();
    } finally {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.SettingsService = SettingsService;
}
if (typeof global !== 'undefined') {
  global.SettingsService = SettingsService;
}
