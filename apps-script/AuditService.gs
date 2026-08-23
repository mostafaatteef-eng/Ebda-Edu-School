/**
 * EBDA EDU — Audit Logging Service
 * Records all system mutations while strictly preventing password/secret logging.
 */

var AuditService = {
  log: function (params) {
    try {
      var sanitizedDetails = Object.assign({}, (params && params.details) || {});
      // Scrub sensitive keys
      ['password', 'passwordHash', 'token', 'secret', 'tempPassword'].forEach(function (k) {
        delete sanitizedDetails[k];
      });

      var entry = {
        id: Utils.generateUUID(),
        timestamp: Utils.getIsoTimestamp(),
        userId: (params && params.userId) || 'SYSTEM',
        userName: (params && params.userName) || 'النظام الإداري',
        userRole: (params && params.userRole) || 'SYSTEM',
        action: (params && params.action) || 'OPERATION',
        entityType: (params && params.entityType) || 'system',
        entityId: (params && params.entityId) || '',
        description: (params && params.description) || '',
        detailsJson: JSON.stringify(sanitizedDetails),
      };

      SpreadsheetService.insert('AuditLog', entry);
    } catch (e) {
      // Non-blocking audit logging error
      Logger.log('Audit logging failed: ' + e.message);
    }
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.AuditService = AuditService;
}
if (typeof global !== 'undefined') {
  global.AuditService = AuditService;
}
