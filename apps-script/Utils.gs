/**
 * EBDA EDU — Google Apps Script Backend Utility Module
 * Provides UUID generation, JSON formatting, ISO timestamps, and hashing utilities.
 */

const Utils = {
  /**
   * Generates a RFC4122 version 4 compliant UUID.
   */
  generateUUID: function () {
    return Utilities.getUuid();
  },

  /**
   * Returns current UTC timestamp in ISO 8601 format.
   */
  getIsoTimestamp: function () {
    return new Date().toISOString();
  },

  /**
   * Hashes a password string with an optional salt using SHA-256.
   * Never stores plain text passwords.
   */
  hashPassword: function (password, salt) {
    if (!password) return '';
    const saltToUse = salt || 'EBDA_EDU_SECURE_SALT_v1';
    const rawData = saltToUse + '::' + password;
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawData, Utilities.Charset.UTF_8);
    let hexString = '';
    for (let i = 0; i < signature.length; i++) {
      let byteVal = signature[i];
      if (byteVal < 0) byteVal += 256;
      let byteHex = byteVal.toString(16);
      if (byteHex.length === 1) byteHex = '0' + byteHex;
      hexString += byteHex;
    }
    return hexString;
  },

  /**
   * Formats API JSON success response.
   */
  jsonSuccess: function (data, message) {
    const payload = {
      success: true,
      data: data || {},
      message: message || 'Operation completed successfully.',
      timestamp: this.getIsoTimestamp(),
    };
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * Formats API JSON error response.
   */
  jsonError: function (code, message, status) {
    const payload = {
      success: false,
      error: {
        code: code || 'INTERNAL_ERROR',
        message: message || 'An unexpected error occurred.',
        status: status || 400,
      },
      timestamp: this.getIsoTimestamp(),
    };
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * Parses JSON safely.
   */
  safeJsonParse: function (str, fallback) {
    if (!str) return fallback || null;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback || null;
    }
  },
};
