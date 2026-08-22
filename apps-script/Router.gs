/**
 * EBDA EDU — Google Apps Script Action Router & Request Dispatcher
 * Maps client API requests to dedicated backend domain services with session authorization.
 */

const Router = {
  handleRequest: function (e, method) {
    try {
      // Parse parameters and body
      const params = (e && e.parameter) || {};
      let body = {};

      if (e && e.postData && e.postData.contents) {
        body = Utils.safeJsonParse(e.postData.contents, {});
      }

      const action = params.action || body.action || '';
      const token = params.token || body.token || (e && e.parameter && e.parameter.access_token) || '';

      // Public / Unauthenticated Actions
      if (action === 'ping' || action === 'health') {
        return Utils.jsonSuccess({ status: 'healthy', version: '2.0.0', platform: 'Google Apps Script' }, 'EBDA EDU API is operational.');
      }

      if (action === 'setup' || action === 'initialize') {
        SpreadsheetService.bootstrapSchema();
        return Utils.jsonSuccess({ initialized: true }, 'تمت تهيئة قاعدة البيانات والجداول بنجاح.');
      }

      if (action === 'login') {
        const username = body.username || params.username;
        const password = body.password || params.password;
        const authResult = AuthService.login(username, password);
        return Utils.jsonSuccess(authResult, 'تم تسجيل الدخول بنجاح.');
      }

      // Authenticated Actions Required
      const currentUser = AuthService.authenticateRequest(token);

      // Route Dispatcher
      switch (action) {
        case 'logout':
          SessionService.revokeSession(token);
          return Utils.jsonSuccess({ loggedOut: true }, 'تم تسجيل الخروج بنجاح.');

        case 'getCurrentUser':
          return Utils.jsonSuccess(currentUser);

        case 'getSettings':
          return Utils.jsonSuccess(SettingsService.getSettings());

        case 'updateSettings':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية تعديل الإعدادات مقتصرة على إدارة العمليات.', 403);
          }
          const updatedSettings = SettingsService.updateSettings(body.settings || {}, currentUser.name);
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

        case 'getGrades':
          return Utils.jsonSuccess(ClassService.getAllGrades());

        case 'getSubjects':
          return Utils.jsonSuccess(SubjectService.getAllSubjects());

        case 'createSubject':
          if (currentUser.role !== 'operations_manager') {
            return Utils.jsonError('FORBIDDEN', 'صلاحية إضافة المواد مقتصرة على إدارة العمليات.', 403);
          }
          return Utils.jsonSuccess(SubjectService.createSubject(body.subject || {}, currentUser));

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
          const targetTeacherId = params.teacherId || body.teacherId || currentUser.teacherId;
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
