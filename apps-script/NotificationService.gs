/**
 * EBDA EDU — Notification & Smart Alert Service
 */

const NotificationService = {
  getNotifications: function (user) {
    const all = SpreadsheetService.getAll('Notifications');
    return all
      .filter((n) => {
        if (user.role === 'operations_manager') return true;
        if (n.targetUserId && String(n.targetUserId) === String(user.id)) return true;
        if (n.targetRole && String(n.targetRole) === String(user.role)) return true;
        return false;
      })
      .map((n) => ({
        id: n.id,
        type: n.type || 'operational',
        title: n.title,
        message: n.message,
        severity: n.severity || 'medium',
        targetRole: n.targetRole,
        targetUserId: n.targetUserId,
        read: n.read === true || n.read === 'true',
        resolved: n.resolved === true || n.resolved === 'true',
        createdAt: n.createdAt,
      }));
  },

  createNotification: function (data) {
    const record = {
      id: Utils.generateUUID(),
      type: data.type || 'operational',
      title: data.title,
      message: data.message,
      severity: data.severity || 'medium',
      targetRole: data.targetRole || '',
      targetUserId: data.targetUserId || '',
      read: false,
      resolved: false,
    };
    return SpreadsheetService.insert('Notifications', record);
  },
};
