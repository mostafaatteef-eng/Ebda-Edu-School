/**
 * EBDA EDU — Audit Logging Service
 * Records all system mutations while strictly preventing password/secret logging.
 */

const AuditService = {
  log: function (params) {
    try {
      const sanitizedDetails = Object.assign({}, params.details || {});
      // Scrub sensitive keys
      ['password', 'passwordHash', 'token', 'secret', 'tempPassword'].forEach((k) => {
        delete sanitizedDetails[k];
      });

      const entry = {
        id: Utils.generateUUID(),
        timestamp: Utils.getIsoTimestamp(),
        userId: params.userId || 'SYSTEM',
        userName: params.userName || 'النظام الإداري',
        userRole: params.userRole || 'SYSTEM',
        action: params.action || 'OPERATION',
        entityType: params.entityType || 'system',
        entityId: params.entityId || '',
        description: params.description || '',
        detailsJson: JSON.stringify(sanitizedDetails),
      };

      SpreadsheetService.insert('AuditLog', entry);
    } catch (e) {
      // Non-blocking audit logging error
      Logger.log('Audit logging failed: ' + e.message);
    }
  },
};
