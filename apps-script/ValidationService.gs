/**
 * EBDA EDU — Validation Service
 */

const ValidationService = {
  validateUrl: function (url) {
    if (!url) return { isValid: false, error: 'الرابط فارغ.' };
    const trimmed = String(url).trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { isValid: false, error: 'يجب أن يبدأ الرابط بـ https:// أو http://' };
    }
    return { isValid: true };
  },

  validateTimeFormat: function (timeStr) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(timeStr);
  },
};
