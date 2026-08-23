/**
 * EBDA EDU — Lesson Materials Management Service
 * Manages links (Google Drive, OneDrive, Docs, LMS) and uploaded file attachments.
 */

var MaterialService = {
  getAllMaterials: function () {
    var materials = SpreadsheetService.getAll('LessonMaterials');
    return materials.map(function (m) {
      return {
        id: m.id,
        teachingRecordId: m.teachingRecordId || '',
        lessonId: m.lessonId || '',
        title: m.title || '',
        type: m.type || 'link',
        url: m.url || '',
        driveFileId: m.driveFileId || '',
        mimeType: m.mimeType || '',
        size: m.size || '',
        uploadedBy: m.uploadedBy || '',
        parentVisibility: m.parentVisibility === true || m.parentVisibility === 'true',
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });
  },

  saveMaterial: function (data) {
    if (!data.url && !data.driveFileId) {
      throw new Error('رابط المادة التعليمية أو معرف الملف مطلوب.');
    }

    var record = {
      id: Utils.generateUUID(),
      teachingRecordId: data.teachingRecordId || '',
      lessonId: data.lessonId || '',
      title: data.title || 'مادة تعليمية',
      type: data.type || 'link',
      url: data.url || '',
      driveFileId: data.driveFileId || '',
      mimeType: data.mimeType || '',
      size: data.size || '',
      uploadedBy: data.uploadedBy || 'TEACHER',
      parentVisibility: data.parentVisibility !== undefined ? data.parentVisibility : true,
    };

    return SpreadsheetService.insert('LessonMaterials', record);
  },

  syncMaterialForRecord: function (recordId, url, title, userId, parentVisibility) {
    var all = SpreadsheetService.getAll('LessonMaterials');
    var existing = null;
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].teachingRecordId) === String(recordId)) {
        existing = all[i];
        break;
      }
    }

    if (existing) {
      if (url && url.trim() !== '') {
        SpreadsheetService.update('LessonMaterials', existing.id, {
          url: url.trim(),
          parentVisibility: parentVisibility,
        });
      } else {
        SpreadsheetService.deleteById('LessonMaterials', existing.id);
      }
    } else if (url && url.trim() !== '') {
      this.saveMaterial({
        teachingRecordId: recordId,
        title: title || 'مادة تعليمية',
        url: url.trim(),
        uploadedBy: userId,
        parentVisibility: parentVisibility,
      });
    }
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.MaterialService = MaterialService;
}
if (typeof global !== 'undefined') {
  global.MaterialService = MaterialService;
}
