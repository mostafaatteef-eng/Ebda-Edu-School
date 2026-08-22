/**
 * EBDA EDU — Google Apps Script Entry Point
 * Exposes Web App HTTP handlers (doGet, doPost, doOptions) and Setup / Initialization.
 */

/**
 * Web App GET Handler
 */
function doGet(e) {
  return Router.handleRequest(e, 'GET');
}

/**
 * Web App POST Handler
 */
function doPost(e) {
  return Router.handleRequest(e, 'POST');
}

/**
 * CORS Preflight Options Handler
 */
function doOptions(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Master Initialization Function: initializeEBDA()
 * Run this function once from the Apps Script Editor to bootstrap the system:
 * 1. Creates / attaches Google Spreadsheet
 * 2. Initializes all 23 database sheets with header columns
 * 3. Creates 'EBDA EDU' Google Drive root folder
 * 4. Seeds default settings (60 min duration, 25 lessons weekly target)
 * 5. Creates initial Operations Manager administrator account
 */
function initializeEBDA() {
  Logger.log('🚀 Initializing EBDA EDU Google Apps Script Backend...');
  const props = PropertiesService.getScriptProperties();

  // 1. Spreadsheet Initialization
  let spreadsheet;
  const existingSheetId = props.getProperty('SPREADSHEET_ID');
  if (existingSheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(existingSheetId);
      Logger.log('Attached to existing Spreadsheet: ' + spreadsheet.getName());
    } catch (e) {
      Logger.log('Creating new Spreadsheet...');
      spreadsheet = SpreadsheetApp.create('EBDA EDU — قاعدة بيانات إدارة العمليات والمتابعة الأكاديمية');
      props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
    }
  } else {
    spreadsheet = SpreadsheetApp.create('EBDA EDU — قاعدة بيانات إدارة العمليات والمتابعة الأكاديمية');
    props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
    Logger.log('Created new Spreadsheet with ID: ' + spreadsheet.getId());
  }

  // 2. Schema Bootstrap (23 Sheets)
  SpreadsheetService.bootstrapSchema(spreadsheet);
  Logger.log('✅ Bootstrapped 23 Database Sheets with headers.');

  // 3. Drive Root Folder Initialization
  const driveFolder = DriveService.getRootFolder();
  Logger.log('✅ Google Drive Root Folder Initialized: ' + driveFolder.getName() + ' (ID: ' + driveFolder.getId() + ')');

  // 4. Create Initial Operations Manager Admin User if none exists
  let initialAdminTempPassword = null;
  const existingUsers = SpreadsheetService.getAll('Users');
  if (existingUsers.length === 0) {
    const adminSalt = Utils.generateUUID();
    initialAdminTempPassword = Utils.generateSecureRandomPassword('Admin');
    const adminPasswordHash = Utils.hashPassword(initialAdminTempPassword, adminSalt);
    const adminUser = {
      id: 'usr-admin-01',
      username: 'admin',
      name: 'مدير العمليات والتشغيل',
      role: 'operations_manager',
      email: 'operations@ebdaschools.edu.eg',
      phone: '01000000001',
      status: 'active',
      passwordHash: adminPasswordHash,
      salt: adminSalt,
      createdAt: Utils.getIsoTimestamp(),
      updatedAt: Utils.getIsoTimestamp(),
    };
    SpreadsheetService.insert('Users', adminUser);
    Logger.log('✅ Created Initial Operations Manager (Username: admin)');
    Logger.log('🔑 TEMPORARY INITIAL ADMIN PASSWORD (PROVIDED ONLY ONCE): ' + initialAdminTempPassword);
  }

  Logger.log('✨ EBDA EDU Backend Initialization Complete!');
  Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
  Logger.log('Drive Folder URL: ' + driveFolder.getUrl());

  return {
    success: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    driveFolderId: driveFolder.getId(),
    initialAdminUsername: 'admin',
    initialAdminTempPassword: initialAdminTempPassword,
  };
}
