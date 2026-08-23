/**
 * EBDA EDU — Smart Labs & Industrial Workshops Management Service
 * Manages specialized educational facilities, occupancy tracking, and equipment allocation.
 */

var LabWorkshopService = {
  // Labs Operations
  getAllLabs: function () {
    return SpreadsheetService.getAll('Labs').map(function (l) {
      return {
        id: l.id,
        code: l.code || '',
        nameAr: l.nameAr,
        nameEn: l.nameEn || '',
        type: l.type || 'smart_lab',
        capacity: Number(l.capacity) || 30,
        location: l.location || '',
        inChargeEngineer: l.inChargeEngineer || '',
        equipmentSummary: l.equipmentSummary || '',
        status: l.status || 'active',
        schoolId: l.schoolId || 'badr',
      };
    });
  },

  createLab: function (data, user) {
    if (!data.nameAr) {
      throw new Error('اسم المعمل حقل مطلوب.');
    }
    var record = {
      id: Utils.generateUUID(),
      code: data.code || ('LAB-' + Utils.generateShortId()),
      nameAr: data.nameAr,
      nameEn: data.nameEn || '',
      type: data.type || 'smart_lab',
      capacity: Number(data.capacity) || 30,
      location: data.location || '',
      inChargeEngineer: data.inChargeEngineer || '',
      equipmentSummary: data.equipmentSummary || '',
      status: data.status || 'active',
      schoolId: data.schoolId || 'badr',
    };
    var created = SpreadsheetService.insert('Labs', record);
    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'CREATE_LAB',
        entityType: 'lab',
        entityId: created.id,
        description: 'إضافة معمل ذكي جديد: ' + created.nameAr,
      });
    } catch (e) {}
    return created;
  },

  updateLab: function (id, updates, user) {
    var updated = SpreadsheetService.update('Labs', id, updates);
    if (updated) {
      try {
        AuditService.log({
          userId: user ? user.id : 'SYSTEM',
          userName: user ? user.name : 'SYSTEM',
          userRole: user ? user.role : 'operations_manager',
          action: 'UPDATE_LAB',
          entityType: 'lab',
          entityId: id,
          description: 'تحديث بيانات المعمل الذكي: ' + (updated.nameAr || id),
        });
      } catch (e) {}
    }
    return updated;
  },

  deleteLab: function (id, user) {
    var deleted = SpreadsheetService.deleteById('Labs', id);
    if (deleted) {
      try {
        AuditService.log({
          userId: user ? user.id : 'SYSTEM',
          userName: user ? user.name : 'SYSTEM',
          userRole: user ? user.role : 'operations_manager',
          action: 'DELETE_LAB',
          entityType: 'lab',
          entityId: id,
          description: 'حذف المعمل الذكي: ' + id,
        });
      } catch (e) {}
    }
    return deleted;
  },

  // Workshops Operations
  getAllWorkshops: function () {
    return SpreadsheetService.getAll('Workshops').map(function (w) {
      return {
        id: w.id,
        code: w.code || '',
        nameAr: w.nameAr,
        nameEn: w.nameEn || '',
        type: w.type || 'industrial_workshop',
        capacity: Number(w.capacity) || 25,
        location: w.location || '',
        inChargeEngineer: w.inChargeEngineer || '',
        equipmentSummary: w.equipmentSummary || '',
        status: w.status || 'active',
        schoolId: w.schoolId || 'badr',
      };
    });
  },

  createWorkshop: function (data, user) {
    if (!data.nameAr) {
      throw new Error('اسم الورشة التدريبية حقل مطلوب.');
    }
    var record = {
      id: Utils.generateUUID(),
      code: data.code || ('WS-' + Utils.generateShortId()),
      nameAr: data.nameAr,
      nameEn: data.nameEn || '',
      type: data.type || 'industrial_workshop',
      capacity: Number(data.capacity) || 25,
      location: data.location || '',
      inChargeEngineer: data.inChargeEngineer || '',
      equipmentSummary: data.equipmentSummary || '',
      status: data.status || 'active',
      schoolId: data.schoolId || 'badr',
    };
    var created = SpreadsheetService.insert('Workshops', record);
    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'CREATE_WORKSHOP',
        entityType: 'workshop',
        entityId: created.id,
        description: 'إضافة ورشة تدريبية جديدة: ' + created.nameAr,
      });
    } catch (e) {}
    return created;
  },

  updateWorkshop: function (id, updates, user) {
    var updated = SpreadsheetService.update('Workshops', id, updates);
    if (updated) {
      try {
        AuditService.log({
          userId: user ? user.id : 'SYSTEM',
          userName: user ? user.name : 'SYSTEM',
          userRole: user ? user.role : 'operations_manager',
          action: 'UPDATE_WORKSHOP',
          entityType: 'workshop',
          entityId: id,
          description: 'تحديث بيانات الورشة التدريبية: ' + (updated.nameAr || id),
        });
      } catch (e) {}
    }
    return updated;
  },

  deleteWorkshop: function (id, user) {
    var deleted = SpreadsheetService.deleteById('Workshops', id);
    if (deleted) {
      try {
        AuditService.log({
          userId: user ? user.id : 'SYSTEM',
          userName: user ? user.name : 'SYSTEM',
          userRole: user ? user.role : 'operations_manager',
          action: 'DELETE_WORKSHOP',
          entityType: 'workshop',
          entityId: id,
          description: 'حذف الورشة التدريبية: ' + id,
        });
      } catch (e) {}
    }
    return deleted;
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.LabWorkshopService = LabWorkshopService;
}
if (typeof global !== 'undefined') {
  global.LabWorkshopService = LabWorkshopService;
}
