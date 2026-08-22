/**
 * EBDA EDU — Centralized System Settings Service
 * Single Source of Truth for school operational standards:
 * - Lesson Duration: 60 Minutes
 * - Target Weekly Teaching Load: 25 Lessons / 25 Hours
 */

const SettingsService = {
  /**
   * Retrieves all system settings as a key-value object.
   */
  getSettings: function () {
    const rows = SpreadsheetService.getAll('SystemSettings');
    const settings = {
      lessonDurationMinutes: 60,
      weeklyTeachingTarget: 25,
      schoolStartTime: '08:00',
      requireMaterialsLink: false,
      defaultParentVisibility: true,
      maxUploadSizeMB: 50,
      activeSchoolId: 'badr',
      schoolNameAr: 'مدرسة ابدأ – بدر للعلوم والتكنولوجيا التطبيقية',
    };

    rows.forEach((r) => {
      let val = r.value;
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
    const ss = SpreadsheetService.getSpreadsheet();
    const sheet = ss.getSheetByName('SystemSettings');
    if (!sheet) throw new Error('SystemSettings sheet not found.');

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      const data = sheet.getDataRange().getValues();
      const now = Utils.getIsoTimestamp();

      Object.keys(newSettings).forEach((key) => {
        const value = String(newSettings[key]);
        let found = false;

        for (let r = 1; r < data.length; r++) {
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

      return this.getSettings();
    } finally {
      lock.releaseLock();
    }
  },
};
