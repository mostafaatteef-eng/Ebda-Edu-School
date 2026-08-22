/**
 * EBDA EDU — Authentication & Authorization Service
 * Enforces secure password verification, role-based access control, and sanitization.
 */

const AuthService = {
  /**
   * Authenticates a user by username and password.
   */
  login: function (username, password) {
    if (!username) {
      throw new Error('Username is required.');
    }

    const allUsers = SpreadsheetService.getAll('Users');
    const user = allUsers.find(
      (u) => String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase()
    );

    if (!user) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }

    if (user.status !== 'active') {
      throw new Error('تم تعطيل هذا الحساب. يرجى مراجعة إدارة العمليات.');
    }

    // Password validation if password is set
    if (user.passwordHash) {
      const computedHash = Utils.hashPassword(password, user.salt || 'EBDA_EDU_SECURE_SALT_v1');
      if (computedHash !== user.passwordHash) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
    }

    // Create secure session
    const session = SessionService.createSession(user.id, user.role);

    // Update last login
    SpreadsheetService.update('Users', user.id, {
      lastLoginAt: Utils.getIsoTimestamp(),
    });

    // Record in AuditLog
    AuditService.log({
      userId: user.id,
      userName: user.name || user.username,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      description: 'تم تسجيل الدخول بنجاح للنظام.',
    });

    return {
      user: this.sanitizeUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  },

  /**
   * Validates a request token and verifies user permissions.
   */
  authenticateRequest: function (token, requiredRole) {
    if (!token) {
      throw new Error('رمز الجلسة مفقود (Session token required).');
    }

    const session = SessionService.validateToken(token);
    if (!session) {
      throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.');
    }

    const user = SpreadsheetService.findById('Users', session.userId);
    if (!user || user.status !== 'active') {
      throw new Error('حساب المستخدم غير متاح أو تم تعطيله.');
    }

    if (requiredRole) {
      if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(user.role)) {
          throw new Error('ليس لديك صلاحية لتنفيذ هذا الإجراء.');
        }
      } else if (user.role !== requiredRole && user.role !== 'operations_manager') {
        throw new Error('ليس لديك صلاحية لتنفيذ هذا الإجراء.');
      }
    }

    return this.sanitizeUser(user);
  },

  /**
   * Sanitizes user object to remove passwordHash and salt before returning.
   */
  sanitizeUser: function (user) {
    if (!user) return null;
    const sanitized = Object.assign({}, user);
    delete sanitized.passwordHash;
    delete sanitized.salt;
    return sanitized;
  },
};
