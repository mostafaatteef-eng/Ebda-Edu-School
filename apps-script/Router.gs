/**
 * EBDA EDU — Google Apps Script Action Router & Request Dispatcher
 * Maps client API requests to dedicated backend domain services with session authorization.
 */

var Router = {
  handleRequest: function (e, method) {
    try {
      // Parse parameters and body
      var params = (e && e.parameter) || {};
      var body = {};

      if (e && e.postData && e.postData.contents) {
        body = Utils.safeJsonParse(e.postData.contents, {});
      }

      var action = params.action || body.action || '';
      var token = params.token || body.token || (e && e.parameter && e.parameter.access_token) || '';

      // Public / Unauthenticated Actions
      if (action === 'ping' || action === 'health' || action === 'healthCheck') {
        return Utils.jsonSuccess({ status: 'healthy', version: '2.0.0', platform: 'Google Apps Script', school: 'مدرسة ابدا - للعلوم التقنية - بدر' }, 'EBDA EDU API is operational.');
      }

      if (action === 'setup' || action === 'initialize') {
        SpreadsheetService.bootstrapSchema();
        return Utils.jsonSuccess({ initialized: true }, 'تمت تهيئة قاعدة البيانات والجداول بنجاح.');
      }

      if (action === 'login') {
        var username = body.username || params.username;
        var password = body.password || params.password;
        var authResult = AuthService.login(username, password);
        return Utils.jsonSuccess(authResult, 'تم تسجيل الدخول بنجاح.');
      }

      // Authenticated Actions Required
      var currentUser = AuthService.authenticateRequest(token);

      // Route Dispatcher
      switch (action) {
        case 'logout':
          SessionService.revokeSession(token);
          return Utils.jsonSuccess({ loggedOut: true }, 'تم تسجيل الخروج بنجاح.');

        case 'getCurrentUser':
          return Utils.jsonSuccess(currentUser);

        case 'getAllData':
          return Utils.jsonSuccess({
            subjects: SubjectService.getAllSubjects(),
            classes: ClassService.getAllClasses(),
            grades: ClassService.getAllGrades(),
            labs: LabWorkshopService.getAllLabs(),
            workshops: LabWorkshopService.getAllWorkshops(),
            teachers: TeacherService.getAllTeachers(),
            settings: SettingsService.getSettings(),
            breaks: BreakService.getAllBreaks(),
            timetable: TimetableService.getAllSlots(),
            teachingRecords: TeachingRecordService.getAllRecords(),
          }, 'تم جلب كافة البيانات بنجاح من Google Sheets.');

        case 'getSettings':
          return Utils.jsonSuccess(SettingsService.getSettings());

        case 'updateSettings':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل الإعدادات مقتصرة على إدارة العمليات.', 403);
          }
          var updatedSettings = SettingsService.updateSettings(body.settings || {}, currentUser.name);
          return Utils.jsonSuccess(updatedSettings, 'تم تحديث الإعدادات بنجاح.');

        case 'getDashboardStats':
          return Utils.jsonSuccess(DashboardService.getDashboardStats(params.date || body.date));

        case 'getUsers':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية عرض المستخدمين مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(UserService.getAllUsers());

        case 'createUser':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إنشاء المستخدمين مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(UserService.createUser(body.user || {}, currentUser));

        case 'updateUser':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل المستخدمين مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(UserService.updateUser(body.id, body.updates || {}, currentUser));

        case 'resetParentPassword':
          return Utils.jsonSuccess(UserService.resetParentPassword(body.userId, body.newPassword, currentUser));

        case 'resetUserPassword':
          return Utils.jsonSuccess(UserService.resetUserPassword(body.userId, currentUser));

        case 'getParents':
          return Utils.jsonSuccess(ParentService.getAllParents());

        case 'getStudents':
          return Utils.jsonSuccess(StudentService.getAllStudents());

        case 'createStudent':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة الطلاب مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(StudentService.createStudent(body.student || {}, currentUser));

        case 'getClasses':
          return Utils.jsonSuccess(ClassService.getAllClasses());

        case 'createClass':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة الفصول مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(ClassService.createClass(body.classData || {}, currentUser));

        case 'updateClass':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل الفصول مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(ClassService.updateClass(body.id, body.updates || {}, currentUser));

        case 'deleteClass':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية حذف الفصول مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess({ deleted: ClassService.deleteClass(body.id, currentUser) });

        case 'getGrades':
          return Utils.jsonSuccess(ClassService.getAllGrades());

        case 'getSubjects':
          return Utils.jsonSuccess(SubjectService.getAllSubjects());

        case 'createSubject':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة المواد مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(SubjectService.createSubject(body.subject || {}, currentUser));

        case 'updateSubject':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل المواد مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(SubjectService.updateSubject(body.id, body.updates || {}, currentUser));

        case 'deleteSubject':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية حذف المواد مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess({ deleted: SubjectService.deleteSubject(body.id, currentUser) });

        case 'getLabs':
          return Utils.jsonSuccess(LabWorkshopService.getAllLabs());

        case 'createLab':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة المعامل مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(LabWorkshopService.createLab(body.lab || {}, currentUser));

        case 'updateLab':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل المعامل مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(LabWorkshopService.updateLab(body.id, body.updates || {}, currentUser));

        case 'deleteLab':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية حذف المعامل مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess({ deleted: LabWorkshopService.deleteLab(body.id, currentUser) });

        case 'getWorkshops':
          return Utils.jsonSuccess(LabWorkshopService.getAllWorkshops());

        case 'createWorkshop':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة الورش مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(LabWorkshopService.createWorkshop(body.workshop || {}, currentUser));

        case 'updateWorkshop':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل الورش مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(LabWorkshopService.updateWorkshop(body.id, body.updates || {}, currentUser));

        case 'deleteWorkshop':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية حذف الورش مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess({ deleted: LabWorkshopService.deleteWorkshop(body.id, currentUser) });

        case 'getLessons':
          return Utils.jsonSuccess(LessonService.getAllLessons(params.date || body.date));

        case 'getLesson':
          return Utils.jsonSuccess(LessonService.getLessonById(params.id || body.id));

        case 'getLessonHistory':
          return Utils.jsonSuccess(TeachingRecordService.getAllRecords());

        case 'getTeachers':
          return Utils.jsonSuccess(TeacherService.getAllTeachers());

        case 'createTeacher':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة المعلمين مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(TeacherService.createTeacher(body.teacher || {}, currentUser));

        case 'updateTeacher':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل المعلمين مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(TeacherService.updateTeacher(body.id, body.updates || {}, currentUser));

        case 'deleteTeacher':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية حذف المعلمين مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess({ deleted: TeacherService.deleteTeacher(body.id, currentUser) });

        case 'getTeacherWorkload':
          var targetTeacherId = params.teacherId || body.teacherId || currentUser.teacherId;
          return Utils.jsonSuccess(TeacherService.calculateWorkload(targetTeacherId));

        case 'getBreaks':
          return Utils.jsonSuccess(BreakService.getAllBreaks());

        case 'createBreak':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة فترات الاستراحة مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(BreakService.createBreak(body.breakData || {}, currentUser));

        case 'updateBreak':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل فترات الاستراحة مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(BreakService.updateBreak(body.id, body.updates || {}, currentUser));

        case 'deleteBreak':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية حذف فترات الاستراحة مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess({ deleted: BreakService.deleteBreak(body.id, currentUser) });

        case 'getTimetable':
          return Utils.jsonSuccess(TimetableService.getAllSlots());

        case 'createTimetableSlot':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل الجدول الدراسي مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(TimetableService.createSlot(body.slot || {}, currentUser));

        case 'updateTimetableSlot':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل الجدول الدراسي مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(TimetableService.updateSlot(body.id, body.updates || {}, currentUser));

        case 'deleteTimetableSlot':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية حذف حصة من الجدول مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess({ deleted: TimetableService.deleteSlot(body.id, currentUser) });

        case 'getTeachingRecords':
          return Utils.jsonSuccess(TeachingRecordService.getAllRecords());

        case 'recordLesson':
          return Utils.jsonSuccess(TeachingRecordService.recordLesson(body.record || {}, currentUser));

        case 'updateTeachingRecord':
          return Utils.jsonSuccess(TeachingRecordService.updateRecord(body.id, body.updates || {}, currentUser));

        case 'toggleParentVisibility':
          return Utils.jsonSuccess(TeachingRecordService.toggleParentVisibility(body.id, body.visible, currentUser));

        case 'getMaterials':
          return Utils.jsonSuccess(MaterialService.getAllMaterials());

        case 'uploadDriveFile':
          return Utils.jsonSuccess(DriveService.uploadFile(body.fileData));

        case 'getWeeklyLearningRecord':
          return Utils.jsonSuccess(ParentService.getWeeklyLearningRecord(params.classId || body.classId));

        case 'getNotifications':
          return Utils.jsonSuccess(NotificationService.getNotifications(currentUser));

        case 'getAuditLogs':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية الاطلاع على سجل الأنشطة مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(SpreadsheetService.getAll('AuditLog'));

        default:
          return Utils.jsonError('UNKNOWN_ACTION', 'الإجراء المطلوب غير معروف: ' + action, 404);
      }
    } catch (err) {
      Logger.log('Router Error: ' + err.message + ' Stack: ' + err.stack);
      return Utils.jsonError('OPERATION_FAILED', err.message || 'فشلت العملية في الخادم.', 500);
    }
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.Router = Router;
}
if (typeof global !== 'undefined') {
  global.Router = Router;
}
