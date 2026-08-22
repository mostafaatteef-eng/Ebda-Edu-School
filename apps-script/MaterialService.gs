/**
 * EBDA EDU — Lesson Materials Management Service
 * Manages links (Google Drive, OneDrive, Docs, LMS) and uploaded file attachments.
 */

const MaterialService = {
  getAllMaterials: function () {
    const materials = SpreadsheetService.getAll('LessonMaterials');
    return materials.map((m) => ({
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
    }));
  },

  saveMaterial: function (data) {
    if (!data.url && !data.driveFileId) {
      throw new Error('رابط المادة التعليمية أو معرف الملف مطلوب.');
    }

    const record = {
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
    const all = SpreadsheetService.getAll('LessonMaterials');
    const existing = all.find((m) => String(m.teachingRecordId) === String(recordId));

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
