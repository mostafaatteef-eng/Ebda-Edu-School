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
 * 5. Creates initial Operations Manager administrator account: mostafa@atef / mostafa@ebda
 */
function initializeEBDA() {
  Logger.log('🚀 Initializing EBDA EDU Google Apps Script Backend...');
  var props = PropertiesService.getScriptProperties();

  // 1. Spreadsheet Initialization
  var spreadsheet;
  var existingSheetId = props.getProperty('SPREADSHEET_ID');
  if (existingSheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(existingSheetId);
      Logger.log('Attached to existing Spreadsheet: ' + spreadsheet.getName());
    } catch (e) {
      Logger.log('Creating new Spreadsheet...');
      spreadsheet = SpreadsheetApp.create('EBDA EDU — قاعدة بيانات مدرسة ابدا - للعلوم التقنية - بدر');
      props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
    }
  } else {
    spreadsheet = SpreadsheetApp.create('EBDA EDU — قاعدة بيانات مدرسة ابدا - للعلوم التقنية - بدر');
    props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
    Logger.log('Created new Spreadsheet with ID: ' + spreadsheet.getId());
  }

  // 2. Schema Bootstrap (23 Sheets)
  SpreadsheetService.bootstrapSchema(spreadsheet);
  Logger.log('✅ Bootstrapped 23 Database Sheets with headers.');

  // 3. Drive Root Folder Initialization
  var driveFolder = DriveService.getRootFolder();
  Logger.log('✅ Google Drive Root Folder Initialized: ' + driveFolder.getName() + ' (ID: ' + driveFolder.getId() + ')');

  // 4. Create Initial Operations Manager Admin User: mostafa@atef / mostafa@ebda
  var existingUsers = SpreadsheetService.getAll('Users');
  var existingAdmin = existingUsers.find(function (u) {
    return String(u.username).trim().toLowerCase() === 'mostafa@atef' || String(u.username).trim().toLowerCase() === 'admin';
  });

  if (!existingAdmin) {
    var adminSalt = Utils.generateUUID();
    var adminPasswordHash = Utils.hashPassword('mostafa@ebda', adminSalt);
    var adminUser = {
      id: 'usr-admin-01',
      username: 'mostafa@atef',
      name: 'أ/ مصطفى عاطف (مدير العمليات والتشغيل)',
      role: 'operations_manager',
      email: 'mostafa@atef',
      phone: '01000000001',
      status: 'active',
      passwordHash: adminPasswordHash,
      salt: adminSalt,
      createdAt: Utils.getIsoTimestamp(),
      updatedAt: Utils.getIsoTimestamp(),
    };
    SpreadsheetService.insert('Users', adminUser);
    Logger.log('✅ Created Operations Manager (Username: mostafa@atef / Password: mostafa@ebda)');
  }

  Logger.log('✨ EBDA EDU Backend Initialization Complete!');
  Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
  Logger.log('Drive Folder URL: ' + driveFolder.getUrl());

  return {
    success: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    driveFolderId: driveFolder.getId(),
    initialAdminUsername: 'mostafa@atef',
    message: 'تمت تهيئة النظام وقاعدة البيانات بنجاح.',
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.doGet = doGet;
  globalThis.doPost = doPost;
  globalThis.doOptions = doOptions;
  globalThis.initializeEBDA = initializeEBDA;
}
