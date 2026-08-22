/**
 * EBDA EDU — User & Access Management Service
 * Strict Role-Based Access Control and Parent Password Management.
 */

const UserService = {
  getAllUsers: function () {
    const users = SpreadsheetService.getAll('Users');
    return users.map((u) => AuthService.sanitizeUser(u));
  },

  createUser: function (userData, creatorUser) {
    if (!userData.username || !userData.name || !userData.role) {
      throw new Error('اسم المستخدم، الاسم الكامل، ونوع الحساب حقول مطلوبة.');
    }

    const allUsers = SpreadsheetService.getAll('Users');
    const exists = allUsers.some(
      (u) => String(u.username).trim().toLowerCase() === String(userData.username).trim().toLowerCase()
    );
    if (exists) {
      throw new Error('اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر.');
    }

    const salt = Utils.generateUUID();
    const initialPassword = userData.initialPassword || userData.password || Utils.generateSecureRandomPassword('Ebda');
    const passwordHash = Utils.hashPassword(initialPassword, salt);

    const record = {
      id: Utils.generateUUID(),
      username: String(userData.username).trim(),
      name: String(userData.name).trim(),
      role: userData.role,
      email: userData.email || '',
      phone: userData.phone || '',
      teacherId: userData.teacherId || '',
      parentId: userData.parentId || '',
      status: userData.status || 'active',
      passwordHash: passwordHash,
      salt: salt,
      lastLoginAt: '',
    };

    const created = SpreadsheetService.insert('Users', record);

    AuditService.log({
      userId: creatorUser.id,
      userName: creatorUser.name,
      userRole: creatorUser.role,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: created.id,
      description: 'إنشاء حساب مستخدم جديد: ' + created.name + ' (' + created.role + ')',
    });

    return AuthService.sanitizeUser(created);
  },

  updateUser: function (id, updates, updaterUser) {
    const existing = SpreadsheetService.findById('Users', id);
    if (!existing) throw new Error('المستخدم غير موجود.');

    // Protect password fields from direct update
    const sanitizedUpdates = Object.assign({}, updates);
    delete sanitizedUpdates.passwordHash;
    delete sanitizedUpdates.salt;
    delete sanitizedUpdates.id;

    const updated = SpreadsheetService.update('Users', id, sanitizedUpdates);

    AuditService.log({
      userId: updaterUser.id,
      userName: updaterUser.name,
      userRole: updaterUser.role,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: id,
      description: 'تحديث بيانات المستخدم: ' + existing.name,
    });

    return AuthService.sanitizeUser(updated);
  },

  /**
   * Reset Parent Password — Operations Manager ONLY.
   * School Policy: Parents cannot self-reset passwords.
   */
  resetParentPassword: function (userId, newPassword, adminUser) {
    if (adminUser.role !== 'operations_manager') {
      throw new Error('صلاحية إعادة تعيين كلمات المرور مقتصرة على إدارة العمليات فقط.');
    }

    const user = SpreadsheetService.findById('Users', userId);
    if (!user) throw new Error('المستخدم غير موجود.');

    if (user.role !== 'parent') {
      throw new Error('هذا الإجراء مخصص لحسابات أولياء الأمور.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات.');
    }

    const salt = Utils.generateUUID();
    const passwordHash = Utils.hashPassword(newPassword, salt);

    SpreadsheetService.update('Users', userId, {
      passwordHash: passwordHash,
      salt: salt,
    });

    AuditService.log({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'RESET_PARENT_PASSWORD',
      entityType: 'user',
      entityId: userId,
      description: 'إعادة تعيين كلمة مرور ولي الأمر: ' + user.name + ' بواسطة إدارة العمليات.',
    });

    return { success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح.' };
  },

  /**
   * General Reset User Password (Operations Manager ONLY).
   */
  resetUserPassword: function (userId, adminUser) {
    if (adminUser.role !== 'operations_manager') {
      throw new Error('صلاحية إعادة تعيين كلمات المرور مقتصرة على إدارة العمليات فقط.');
    }

    const user = SpreadsheetService.findById('Users', userId);
    if (!user) throw new Error('المستخدم غير موجود.');

    const tempPassword = Utils.generateSecureRandomPassword('Ebda');
    const salt = Utils.generateUUID();
    const passwordHash = Utils.hashPassword(tempPassword, salt);

    SpreadsheetService.update('Users', userId, {
      passwordHash: passwordHash,
      salt: salt,
    });

    AuditService.log({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'RESET_PASSWORD',
      entityType: 'user',
      entityId: userId,
      description: 'توليد كلمة مرور مؤقتة للمستخدم: ' + user.name,
    });

    return { tempPassword: tempPassword };
  },
};
