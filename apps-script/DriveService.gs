/**
 * EBDA EDU — Google Drive Storage Service
 * Manages Drive folders and direct file uploads for lesson materials.
 */

const DriveService = {
  getRootFolder: function () {
    const props = PropertiesService.getScriptProperties();
    let folderId = props.getProperty('DRIVE_ROOT_FOLDER_ID');
    if (folderId) {
      try {
        return DriveApp.getFolderById(folderId);
      } catch (e) {
        // ID invalid, recreate
      }
    }

    // Search or create
    const folders = DriveApp.getFoldersByName('EBDA EDU');
    if (folders.hasNext()) {
      const folder = folders.next();
      props.setProperty('DRIVE_ROOT_FOLDER_ID', folder.getId());
      return folder;
    }

    const newFolder = DriveApp.createFolder('EBDA EDU');
    props.setProperty('DRIVE_ROOT_FOLDER_ID', newFolder.getId());
    return newFolder;
  },

  getMaterialsFolder: function () {
    const root = this.getRootFolder();
    const subfolders = root.getFoldersByName('Lesson Materials');
    if (subfolders.hasNext()) {
      return subfolders.next();
    }
    return root.createFolder('Lesson Materials');
  },

  uploadFile: function (fileData) {
    if (!fileData || !fileData.base64Data || !fileData.fileName) {
      throw new Error('بيانات الملف غير مكتملة.');
    }

    const folder = this.getMaterialsFolder();
    const bytes = Utilities.base64Decode(fileData.base64Data);
    const blob = Utilities.newBlob(bytes, fileData.mimeType || 'application/octet-stream', fileData.fileName);
    const file = folder.createFile(blob);

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
