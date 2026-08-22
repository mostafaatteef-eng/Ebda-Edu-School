/**
 * EBDA EDU — Session Management Service
 * Manages user tokens, expiration, and session lifecycle.
 */

const SessionService = {
  /**
   * Creates a new session record and caches it.
   */
  createSession: function (userId, userRole) {
    const token = Utils.generateUUID() + '-' + Utilities.getUuid();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const sessionData = {
      id: Utils.generateUUID(),
      token: token,
      userId: userId,
      userRole: userRole,
      ipAddress: '',
      userAgent: '',
      expiresAt: expiresAt,
      status: 'active',
    };

    SpreadsheetService.insert('UserSessions', sessionData);

    // Cache in Apps Script CacheService for fast lookups
    const cache = CacheService.getScriptCache();
    cache.put('SESSION_' + token, JSON.stringify(sessionData), 21600); // max 6 hours cache

    return { token: token, expiresAt: expiresAt };
  },

  /**
   * Validates a session token.
   */
  validateToken: function (token) {
    if (!token) return null;

    // Check CacheService first
    const cache = CacheService.getScriptCache();
    const cached = cache.get('SESSION_' + token);
    if (cached) {
      const session = JSON.parse(cached);
      if (new Date(session.expiresAt) > new Date() && session.status === 'active') {
        return session;
      }
    }

    // Fallback to Sheet lookup
    const allSessions = SpreadsheetService.getAll('UserSessions');
    const session = allSessions.find((s) => s.token === token && s.status === 'active');
    if (!session) return null;

    if (new Date(session.expiresAt) <= new Date()) {
      SpreadsheetService.update('UserSessions', session.id, { status: 'expired' });
      return null;
    }

    // Re-prime cache
    cache.put('SESSION_' + token, JSON.stringify(session), 21600);
    return session;
  },

  /**
   * Revokes a session token.
   */
  revokeSession: function (token) {
    if (!token) return;
    const cache = CacheService.getScriptCache();
    cache.remove('SESSION_' + token);

    const allSessions = SpreadsheetService.getAll('UserSessions');
    const session = allSessions.find((s) => s.token === token);
    if (session) {
      SpreadsheetService.update('UserSessions', session.id, { status: 'revoked' });
    }
  },
};
