/**
 * EBDA EDU — Google Drive Storage Service
 * Manages Drive folders and direct file uploads for lesson materials.
 */

var DriveService = {
  getRootFolder: function () {
    var props = PropertiesService.getScriptProperties();
    var folderId = props.getProperty('DRIVE_ROOT_FOLDER_ID');
    if (folderId) {
      try {
        return DriveApp.getFolderById(folderId);
      } catch (e) {
        // ID invalid, recreate
      }
    }

    // Search or create
    var folders = DriveApp.getFoldersByName('EBDA EDU');
    if (folders.hasNext()) {
      var folder = folders.next();
      props.setProperty('DRIVE_ROOT_FOLDER_ID', folder.getId());
      return folder;
    }

    var newFolder = DriveApp.createFolder('EBDA EDU');
    props.setProperty('DRIVE_ROOT_FOLDER_ID', newFolder.getId());
    return newFolder;
  },

  getMaterialsFolder: function () {
    var root = this.getRootFolder();
    var subfolders = root.getFoldersByName('Lesson Materials');
    if (subfolders.hasNext()) {
      return subfolders.next();
    }
    return root.createFolder('Lesson Materials');
  },

  uploadFile: function (fileData) {
    if (!fileData || !fileData.base64Data || !fileData.fileName) {
      throw new Error('بيانات الملف غير مكتملة.');
    }

    var folder = this.getMaterialsFolder();
    var bytes = Utilities.base64Decode(fileData.base64Data);
    var blob = Utilities.newBlob(bytes, fileData.mimeType || 'application/octet-stream', fileData.fileName);
    var file = folder.createFile(blob);

    // Make accessible via link if parent visibility required
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      // Permission adjustment if domain-restricted
    }

    return {
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
      size: file.getSize(),
      mimeType: file.getMimeType(),
    };
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.DriveService = DriveService;
}
if (typeof global !== 'undefined') {
  global.DriveService = DriveService;
}
