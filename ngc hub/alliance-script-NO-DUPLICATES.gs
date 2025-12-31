/****************************************************
 * LAST WAR: ALLIANCE COMMAND CENTER
 * Template universale per gestione alleanze
 * Canyon & Storm Strategy Manager
 * ✅ VERSIONE SENZA DUPLICATI - FIXED!
 ****************************************************/

// Costanti
var SQUAD_MANAGER_CANYON = 'Canyon Manager';
var SQUAD_MANAGER_STORM = 'Storm Manager';
var CANYON_STRATEGY_SHEET = 'Canyon Strategy';
var STORM_STRATEGY_SHEET = 'Storm Strategy';
var CANYON_HISTORY_SHEET = 'Canyon History';
var STORM_HISTORY_SHEET = 'Storm History';
var DATA_SHEET_NAME = 'War Room Data';
var LATEST_PLAYERS_SHEET = 'Latest Players';
var CONFIG_SHEET = 'Alliance Config';
var SECRET_CODE_CELL = 'H1';
var R4_CODE_CELL = 'H2';
var PIN_SHEET_NAME = 'Player PINs';

/****************************************************
 * MENU
 ****************************************************/
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('⚔️ Alliance Hub')
      .addItem('🚀 Setup Completo', 'setupComplete')
      .addSeparator()
      .addItem('⚙️ Configura Alleanza', 'setupConfig')
      .addSeparator()
      .addItem('⛰️ Setup Canyon', 'setupCanyonManager')
      .addItem('🌪️ Setup Storm', 'setupStormManager')
      .addSeparator()
      .addItem('🔄 Aggiorna Canyon Strategy', 'updateCanyonStrategy')
      .addItem('🔄 Aggiorna Storm Strategy', 'updateStormStrategy')
      .addSeparator()
      .addItem('📊 Aggiorna Statistiche', 'updateStats')
      .addItem('🧹 Pulisci Duplicati', 'cleanDuplicates')
      .addSeparator()
      .addItem('⏰ Attiva Aggiornamento Automatico', 'setupAutoUpdate')
      .addItem('🛑 Disattiva Aggiornamento Automatico', 'removeAutoUpdate')
      .addToUi();
  } catch (e) {
    Logger.log(e);
  }
}

/****************************************************
 * 🧹 PULIZIA DUPLICATI - NUOVA FUNZIONE!
 ****************************************************/
function cleanDuplicates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var latestSheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
  
  if (!latestSheet) {
    ss.toast('❌ Latest Players sheet not found', 'Error', 3);
    return;
  }
  
  var data = latestSheet.getDataRange().getValues();
  if (data.length < 2) {
    ss.toast('⚠️ No data to clean', 'Info', 3);
    return;
  }
  
  // STEP 1: Trova tutti i nomi univoci con l'ULTIMA occorrenza
  var seen = {};
  var rowsToDelete = [];
  
  // Scansiona dal basso verso l'alto (l'ultimo è il più recente)
  for (var i = data.length - 1; i >= 1; i--) {
    var name = String(data[i][0]).trim().toUpperCase();
    
    if (!name) continue;
    
    if (seen[name]) {
      // DUPLICATO! Segna riga per eliminazione
      rowsToDelete.push(i + 1); // +1 perché le righe partono da 1
    } else {
      // Prima occorrenza (dal basso) = ULTIMA = QUELLA DA TENERE
      seen[name] = true;
    }
  }
  
  if (rowsToDelete.length === 0) {
    ss.toast('✅ No duplicates found!', 'Success', 3);
    return;
  }
  
  // STEP 2: Elimina righe duplicate (dal basso verso l'alto per non sballare gli indici)
  rowsToDelete.sort(function(a, b) { return b - a; });
  
  for (var i = 0; i < rowsToDelete.length; i++) {
    latestSheet.deleteRow(rowsToDelete[i]);
  }
  
  ss.toast('✅ Removed ' + rowsToDelete.length + ' duplicate rows!', 'Success', 5);
  
  // STEP 3: Riordina e riformatta
  var totalRows = latestSheet.getLastRow();
  if (totalRows > 2) {
    var dataRange = latestSheet.getRange(2, 1, totalRows - 1, 7);
    dataRange.sort({column: 6, ascending: false});
  }
  
  // Riapplica formattazione
  for (var i = 2; i <= totalRows; i++) {
    var missile = latestSheet.getRange(i, 3).getValue();
    var aerei = latestSheet.getRange(i, 4).getValue();
    var tank = latestSheet.getRange(i, 5).getValue();
    var giorni = latestSheet.getRange(i, 7).getValue();
    formatPlayerRow_(latestSheet, i, missile, aerei, tank, giorni);
  }
  
  // Riapplica header
  latestSheet.getRange(1, 1, 1, 7)
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground('#0b3d91')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  latestSheet.setRowHeight(1, 40);
}

/****************************************************
 * SETUP COMPLETO
 ****************************************************/
function setupComplete() {
  setupConfig();          // Config alleanza
  setupWarRoom();         // War Room base
  
  // IMPORTANTE: Aggiorna Latest Players se ci sono dati
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
  if (dataSheet && dataSheet.getLastRow() > 1) {
    updateStats();        // Popola Latest Players
  }
  
  setupCanyonManager();   // Canyon Manager
  setupStormManager();    // Storm Manager
  
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('✅ Setup completo! Se non vedi i nomi nei Manager, aggiungi prima dati e clicca "Aggiorna Statistiche".', 'Alliance Hub', 7);
}

/****************************************************
 * SETUP CONFIG - Personalizzazione Alleanza
 ****************************************************/
function setupConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName(CONFIG_SHEET);
  
  if (!configSheet) {
    configSheet = ss.insertSheet(CONFIG_SHEET);
  } else {
    configSheet.clear();
  }
  
  // Header
  configSheet.getRange('A1').setValue('⚙️ CONFIGURAZIONE ALLEANZA').setFontSize(14).setFontWeight('bold').setBackground('#1565c0').setFontColor('#ffffff');
  configSheet.getRange('A1:B1').merge();
  
  // Configurazioni predefinite
  var configData = [
    ['alliance_name', 'My Alliance'],
    ['server', '1105'],
    ['primary_color', '#1565c0'],
    ['secondary_color', '#0b3d91'],
    ['accent_color', '#2196f3'],
    ['logo_url', ''],
    ['language', 'en'],
    ['announcement', 'Welcome to Alliance Command Center!'],
    ['announcement_color', '#fff4cc'],
    ['show_announcement', 'true'],
    ['contact_discord', ''],
    ['contact_email', '']
  ];
  
  configSheet.getRange('A2').setValue('PARAMETRO').setFontWeight('bold').setBackground('#bbdefb');
  configSheet.getRange('B2').setValue('VALORE').setFontWeight('bold').setBackground('#bbdefb');
  
  configSheet.getRange(3, 1, configData.length, 2).setValues(configData);
  
  // Formattazione
  configSheet.setColumnWidth(1, 200);
  configSheet.setColumnWidth(2, 400);
  configSheet.getRange('A:A').setFontWeight('bold');
  configSheet.setFrozenRows(2);
  
  // Bordi
  configSheet.getRange(2, 1, configData.length + 1, 2)
    .setBorder(true, true, true, true, true, true);
  
  // Note esplicative
  configSheet.getRange('D2').setValue('📝 CONFIGURATION GUIDE');
  configSheet.getRange('D3').setValue('alliance_name: Your alliance name');
  configSheet.getRange('D4').setValue('server: Server number');
  configSheet.getRange('D5').setValue('primary_color: Main color (hex)');
  configSheet.getRange('D6').setValue('secondary_color: Secondary color (hex)');
  configSheet.getRange('D7').setValue('accent_color: Accent color (hex)');
  configSheet.getRange('D8').setValue('logo_url: Alliance logo URL (optional)');
  configSheet.getRange('D9').setValue('language: en/it/fr/es/de');
  configSheet.getRange('D10').setValue('announcement: Homepage announcement text');
  configSheet.getRange('D11').setValue('announcement_color: Announcement background color');
  configSheet.getRange('D12').setValue('show_announcement: true/false');
  configSheet.getRange('D13').setValue('contact_discord: Discord invite link (optional)');
  configSheet.getRange('D14').setValue('contact_email: Contact email (optional)');
  
  configSheet.getRange('D2:D14').setFontSize(9).setFontColor('#666666');
  configSheet.setColumnWidth(4, 350);
  
  ss.toast('✅ Config created! Customize values for your alliance', 'Alliance Hub', 5);
}

/****************************************************
 * SETUP WAR ROOM (Base Data)
 ****************************************************/
function setupWarRoom() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DATA_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(DATA_SHEET_NAME);
  }
  
  // Intestazioni War Room
  sheet.getRange(1, 1, 1, 6).setValues([['PLAYER NAME', 'DATE', 'MISSILES', 'AIRCRAFT', 'TANKS', 'TIMESTAMP']]);
  sheet.getRange(1, 1, 1, 6)
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground('#0b3d91')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 180);
  sheet.setFrozenRows(1);
  
  // Codici
  var secretCell = sheet.getRange(SECRET_CODE_CELL);
  if (!secretCell.getValue()) {
    secretCell.setValue('ALLIANCE2024');
  }
  secretCell.setBackground('#fff4cc').setFontWeight('bold');
  
  var r4Cell = sheet.getRange(R4_CODE_CELL);
  if (!r4Cell.getValue()) {
    r4Cell.setValue('R4ADMIN');
  }
  r4Cell.setBackground('#ffcccc').setFontWeight('bold');
  
  // Label
  sheet.getRange('G1').setValue('🔐 ALLIANCE CODE').setBackground('#0b3d91').setFontColor('#ffffff');
  sheet.getRange('G2').setValue('🔒 R4 CODE').setBackground('#d32f2f').setFontColor('#ffffff');
  
  // Latest Players
  var latestSheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
  if (!latestSheet) {
    latestSheet = ss.insertSheet(LATEST_PLAYERS_SHEET);
  }
  
  latestSheet.getRange(1, 1, 1, 7).setValues([['PLAYER NAME', 'LAST UPDATE', 'MISSILES', 'AIRCRAFT', 'TANKS', 'TOTAL', 'DAYS AGO']]);
  latestSheet.getRange(1, 1, 1, 7)
    .setFontWeight('bold')
    .setBackground('#0b3d91')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  
  // Dimensioni colonne ottimizzate
  latestSheet.setColumnWidth(1, 250);  // PLAYER NAME - PIÙ LARGO
  latestSheet.setColumnWidth(2, 180);
  latestSheet.setColumnWidth(3, 120);
  latestSheet.setColumnWidth(4, 120);
  latestSheet.setColumnWidth(5, 120);
  latestSheet.setColumnWidth(6, 120);
  latestSheet.setColumnWidth(7, 100);
  latestSheet.setFrozenRows(1);
  latestSheet.setFrozenColumns(1);  // Blocca anche colonna nomi
  
  ss.toast('✅ War Room created!', 'Alliance Hub', 2);
}

/****************************************************
 * CANYON - SETUP MANAGER
 ****************************************************/
function setupCanyonManager() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SQUAD_MANAGER_CANYON);
  
  if (!sheet) {
    sheet = ss.insertSheet(SQUAD_MANAGER_CANYON);
  } else {
    sheet.clear();
  }
  
  // Lista giocatori (da Latest Players)
  var members = getMembersList_();
  
  // Lista edifici Canyon (12)
  var canyonBuildings = [
    'Data Center 1',
    'Data Center 2',
    'Serum Factory 1',
    'Power Tower',
    'Defense System 2',
    'Defense System 1',
    'Virus Lab',
    'Serum Factory 2',
    'Sample Warehouse 1',
    'Sample Warehouse 2',
    'Sample Warehouse 3',
    'Sample Warehouse 4'
  ];
  
  // Header
  sheet.getRange('A1').setValue('⛰️ CANYON MANAGER').setFontSize(14).setFontWeight('bold').setBackground('#8d6e63').setFontColor('#ffffff');
  sheet.getRange('A1:E1').merge();
  
  sheet.getRange('A2').setValue('PLAYER').setFontWeight('bold').setBackground('#bcaaa4').setHorizontalAlignment('center');
  sheet.getRange('B2').setValue('TEAM').setFontWeight('bold').setBackground('#bcaaa4').setHorizontalAlignment('center');
  sheet.getRange('C2').setValue('BUILDING').setFontWeight('bold').setBackground('#bcaaa4').setHorizontalAlignment('center');
  sheet.getRange('D2').setValue('KILL SWAT').setFontWeight('bold').setBackground('#d32f2f').setFontColor('#ffffff').setHorizontalAlignment('center');
  sheet.getRange('E2').setValue('ROLE').setFontWeight('bold').setBackground('#bcaaa4').setHorizontalAlignment('center');
  
  // 60 righe vuote con dropdown
  for (var i = 3; i <= 62; i++) {
    // Dropdown giocatore
    var rulePlayer = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---'].concat(members), true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('A' + i).setDataValidation(rulePlayer);
    
    // Dropdown Team
    var ruleTeam = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---', 'A', 'B'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('B' + i).setDataValidation(ruleTeam);
    
    // Dropdown Edificio
    var ruleBuilding = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---'].concat(canyonBuildings), true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('C' + i).setDataValidation(ruleBuilding);
    
    // Dropdown Kill Swat
    var ruleSwat = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---', 'NO', 'YES'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('D' + i).setDataValidation(ruleSwat);
    
    // Dropdown Ruolo
    var ruleRole = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---', 'Main', 'Reserve'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('E' + i).setDataValidation(ruleRole);
  }
  
  // Formattazione
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 120);
  sheet.setFrozenRows(2);
  
  // Bordi
  sheet.getRange('A2:E62').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // Istruzioni
  sheet.getRange('G2').setValue('📝 INSTRUCTIONS').setFontWeight('bold').setFontSize(12);
  sheet.getRange('G3').setValue('1. Select PLAYER from list');
  sheet.getRange('G4').setValue('2. Choose TEAM (A or B)');
  sheet.getRange('G5').setValue('3. Assign BUILDING (if Main)');
  sheet.getRange('G6').setValue('4. Set KILL SWAT');
  sheet.getRange('G7').setValue('5. Select ROLE (Main/Reserve)');
  sheet.getRange('G8').setValue('6. Click "Update Canyon Strategy" from menu');
  sheet.getRange('G3:G8').setFontSize(10).setWrap(true);
  sheet.setColumnWidth(7, 300);
  
  // Setup Canyon History
  setupCanyonHistory_();
  
  ss.toast('✅ Canyon Manager created! Fill the table and click "Update Canyon Strategy"', 'Alliance Hub', 5);
}

/****************************************************
 * STORM - SETUP MANAGER
 ****************************************************/
function setupStormManager() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SQUAD_MANAGER_STORM);
  
  if (!sheet) {
    sheet = ss.insertSheet(SQUAD_MANAGER_STORM);
  } else {
    sheet.clear();
  }
  
  // Lista giocatori
  var members = getMembersList_();
  
  // Lista edifici Storm (11)
  var stormBuildings = [
    'Building 1 - Hospital',
    'Building 2 - Hospital',
    'Building 3 - Hospital',
    'Building 4 - Hospital',
    'Building 5 - Refinery',
    'Building 6 - Info Center',
    'Building 7 - Tech Center',
    'Building 8 - Refinery',
    'Building 9 - Factory',
    'Building 10 - Arsenal',
    'Building 11 - Silo'
  ];
  
  // Header
  sheet.getRange('A1').setValue('🌪️ STORM MANAGER').setFontSize(14).setFontWeight('bold').setBackground('#ff9800').setFontColor('#ffffff');
  sheet.getRange('A1:E1').merge();
  
  sheet.getRange('A2').setValue('PLAYER').setFontWeight('bold').setBackground('#ffb74d').setHorizontalAlignment('center');
  sheet.getRange('B2').setValue('TEAM').setFontWeight('bold').setBackground('#ffb74d').setHorizontalAlignment('center');
  sheet.getRange('C2').setValue('BUILDING').setFontWeight('bold').setBackground('#ffb74d').setHorizontalAlignment('center');
  sheet.getRange('D2').setValue('KILL SWAT').setFontWeight('bold').setBackground('#d32f2f').setFontColor('#ffffff').setHorizontalAlignment('center');
  sheet.getRange('E2').setValue('ROLE').setFontWeight('bold').setBackground('#ffb74d').setHorizontalAlignment('center');
  
  // 60 righe vuote con dropdown
  for (var i = 3; i <= 62; i++) {
    // Dropdown giocatore
    var rulePlayer = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---'].concat(members), true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('A' + i).setDataValidation(rulePlayer);
    
    // Dropdown Team
    var ruleTeam = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---', 'A', 'B'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('B' + i).setDataValidation(ruleTeam);
    
    // Dropdown Edificio
    var ruleBuilding = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---'].concat(stormBuildings), true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('C' + i).setDataValidation(ruleBuilding);
    
    // Dropdown Kill Swat
    var ruleSwat = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---', 'NO', 'YES'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('D' + i).setDataValidation(ruleSwat);
    
    // Dropdown Ruolo
    var ruleRole = SpreadsheetApp.newDataValidation()
      .requireValueInList(['---', 'Main', 'Reserve'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('E' + i).setDataValidation(ruleRole);
  }
  
  // Formattazione
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 120);
  sheet.setFrozenRows(2);
  
  // Bordi
  sheet.getRange('A2:E62').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // Istruzioni
  sheet.getRange('G2').setValue('📝 INSTRUCTIONS').setFontWeight('bold').setFontSize(12);
  sheet.getRange('G3').setValue('1. Select PLAYER from list');
  sheet.getRange('G4').setValue('2. Choose TEAM (A or B)');
  sheet.getRange('G5').setValue('3. Assign BUILDING (if Main)');
  sheet.getRange('G6').setValue('4. Set KILL SWAT');
  sheet.getRange('G7').setValue('5. Select ROLE (Main/Reserve)');
  sheet.getRange('G8').setValue('6. Click "Update Storm Strategy" from menu');
  sheet.getRange('G3:G8').setFontSize(10).setWrap(true);
  sheet.setColumnWidth(7, 300);
  
  // Setup Storm History
  setupStormHistory_();
  
  ss.toast('✅ Storm Manager created! Fill the table and click "Update Storm Strategy"', 'Alliance Hub', 5);
}

/****************************************************
 * CANYON HISTORY - Setup
 ****************************************************/
function setupCanyonHistory_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var historySheet = ss.getSheetByName(CANYON_HISTORY_SHEET);
  
  if (!historySheet) {
    historySheet = ss.insertSheet(CANYON_HISTORY_SHEET);
    historySheet.getRange(1, 1, 1, 5).setValues([['PLAYER NAME', 'PARTICIPATIONS', 'LAST DATE', 'TEAM A', 'TEAM B']]);
    historySheet.getRange(1, 1, 1, 5)
      .setFontWeight('bold')
      .setBackground('#8d6e63')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    historySheet.setColumnWidth(1, 200);
    historySheet.setColumnWidth(2, 150);
    historySheet.setColumnWidth(3, 120);
    historySheet.setColumnWidth(4, 100);
    historySheet.setColumnWidth(5, 100);
    historySheet.setFrozenRows(1);
  }
}

/****************************************************
 * STORM HISTORY - Setup
 ****************************************************/
function setupStormHistory_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var historySheet = ss.getSheetByName(STORM_HISTORY_SHEET);
  
  if (!historySheet) {
    historySheet = ss.insertSheet(STORM_HISTORY_SHEET);
    historySheet.getRange(1, 1, 1, 5).setValues([['PLAYER NAME', 'PARTICIPATIONS', 'LAST DATE', 'TEAM A', 'TEAM B']]);
    historySheet.getRange(1, 1, 1, 5)
      .setFontWeight('bold')
      .setBackground('#ff9800')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    historySheet.setColumnWidth(1, 200);
    historySheet.setColumnWidth(2, 150);
    historySheet.setColumnWidth(3, 120);
    historySheet.setColumnWidth(4, 100);
    historySheet.setColumnWidth(5, 100);
    historySheet.setFrozenRows(1);
  }
}

/****************************************************
 * CANYON - UPDATE STRATEGY (Auto-genera da Manager)
 ****************************************************/
function updateCanyonStrategy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var managerSheet = ss.getSheetByName(SQUAD_MANAGER_CANYON);
  
  if (!managerSheet) {
    ss.toast('❌ Run "Setup Canyon" first', 'Error', 3);
    return;
  }
  
  // Leggi dati manager
  var data = managerSheet.getRange('A3:E62').getValues();
  
  var teamA = [];
  var teamB = [];
  
  for (var i = 0; i < data.length; i++) {
    var player = String(data[i][0]).trim();
    var team = String(data[i][1]).trim().toUpperCase();
    var building = String(data[i][2]).trim();
    var killSwat = String(data[i][3]).trim();
    var role = String(data[i][4]).trim();
    
    if (player === '' || player === '---') continue;
    
    var entry = {
      player: player,
      building: building === '---' ? '' : building,
      killSwat: killSwat === 'YES' ? 'YES' : 'NO',
      role: role
    };
    
    if (team === 'A') {
      teamA.push(entry);
    } else if (team === 'B') {
      teamB.push(entry);
    }
  }
  
  // Crea/aggiorna foglio Strategy
  var strategySheet = ss.getSheetByName(CANYON_STRATEGY_SHEET);
  if (!strategySheet) {
    strategySheet = ss.insertSheet(CANYON_STRATEGY_SHEET);
  } else {
    strategySheet.clear();
  }
  
  // TEAM A
  strategySheet.getRange('A1').setValue('⛰️ CANYON - TEAM A').setFontSize(14).setFontWeight('bold').setBackground('#8d6e63').setFontColor('#ffffff');
  strategySheet.getRange('A1:D1').merge();
  
  strategySheet.getRange('A2').setValue('PLAYER').setFontWeight('bold').setBackground('#bcaaa4');
  strategySheet.getRange('B2').setValue('BUILDING').setFontWeight('bold').setBackground('#bcaaa4');
  strategySheet.getRange('C2').setValue('KILL SWAT').setFontWeight('bold').setBackground('#d32f2f').setFontColor('#ffffff');
  strategySheet.getRange('D2').setValue('ROLE').setFontWeight('bold').setBackground('#bcaaa4');
  
  var row = 3;
  for (var i = 0; i < teamA.length; i++) {
    strategySheet.getRange('A' + row).setValue(teamA[i].player);
    strategySheet.getRange('B' + row).setValue(teamA[i].building);
    strategySheet.getRange('C' + row).setValue(teamA[i].killSwat);
    strategySheet.getRange('D' + row).setValue(teamA[i].role);
    row++;
  }
  
  // TEAM B
  row += 2;
  strategySheet.getRange('A' + row).setValue('⛰️ CANYON - TEAM B').setFontSize(14).setFontWeight('bold').setBackground('#8d6e63').setFontColor('#ffffff');
  strategySheet.getRange('A' + row + ':D' + row).merge();
  
  row++;
  strategySheet.getRange('A' + row).setValue('PLAYER').setFontWeight('bold').setBackground('#bcaaa4');
  strategySheet.getRange('B' + row).setValue('BUILDING').setFontWeight('bold').setBackground('#bcaaa4');
  strategySheet.getRange('C' + row).setValue('KILL SWAT').setFontWeight('bold').setBackground('#d32f2f').setFontColor('#ffffff');
  strategySheet.getRange('D' + row).setValue('ROLE').setFontWeight('bold').setBackground('#bcaaa4');
  
  row++;
  for (var i = 0; i < teamB.length; i++) {
    strategySheet.getRange('A' + row).setValue(teamB[i].player);
    strategySheet.getRange('B' + row).setValue(teamB[i].building);
    strategySheet.getRange('C' + row).setValue(teamB[i].killSwat);
    strategySheet.getRange('D' + row).setValue(teamB[i].role);
    row++;
  }
  
  // Formattazione
  strategySheet.setColumnWidth(1, 180);
  strategySheet.setColumnWidth(2, 180);
  strategySheet.setColumnWidth(3, 100);
  strategySheet.setColumnWidth(4, 120);
  
  // Aggiorna History
  updateCanyonHistory_(teamA.concat(teamB));
  
  ss.toast('✅ Canyon Strategy updated! (' + teamA.length + ' Team A, ' + teamB.length + ' Team B)', 'Alliance Hub', 3);
}

/****************************************************
 * STORM - UPDATE STRATEGY (Auto-genera da Manager)
 ****************************************************/
function updateStormStrategy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var managerSheet = ss.getSheetByName(SQUAD_MANAGER_STORM);
  
  if (!managerSheet) {
    ss.toast('❌ Run "Setup Storm" first', 'Error', 3);
    return;
  }
  
  // Leggi dati manager
  var data = managerSheet.getRange('A3:E62').getValues();
  
  var teamA = [];
  var teamB = [];
  
  for (var i = 0; i < data.length; i++) {
    var player = String(data[i][0]).trim();
    var team = String(data[i][1]).trim().toUpperCase();
    var building = String(data[i][2]).trim();
    var killSwat = String(data[i][3]).trim();
    var role = String(data[i][4]).trim();
    
    if (player === '' || player === '---') continue;
    
    var entry = {
      player: player,
      building: building === '---' ? '' : building,
      killSwat: killSwat === 'YES' ? 'YES' : 'NO',
      role: role
    };
    
    if (team === 'A') {
      teamA.push(entry);
    } else if (team === 'B') {
      teamB.push(entry);
    }
  }
  
  // Crea/aggiorna foglio Strategy
  var strategySheet = ss.getSheetByName(STORM_STRATEGY_SHEET);
  if (!strategySheet) {
    strategySheet = ss.insertSheet(STORM_STRATEGY_SHEET);
  } else {
    strategySheet.clear();
  }
  
  // TEAM A
  strategySheet.getRange('A1').setValue('🌪️ STORM - TEAM A').setFontSize(14).setFontWeight('bold').setBackground('#ff9800').setFontColor('#ffffff');
  strategySheet.getRange('A1:D1').merge();
  
  strategySheet.getRange('A2').setValue('PLAYER').setFontWeight('bold').setBackground('#ffb74d');
  strategySheet.getRange('B2').setValue('BUILDING').setFontWeight('bold').setBackground('#ffb74d');
  strategySheet.getRange('C2').setValue('KILL SWAT').setFontWeight('bold').setBackground('#d32f2f').setFontColor('#ffffff');
  strategySheet.getRange('D2').setValue('ROLE').setFontWeight('bold').setBackground('#ffb74d');
  
  var row = 3;
  for (var i = 0; i < teamA.length; i++) {
    strategySheet.getRange('A' + row).setValue(teamA[i].player);
    strategySheet.getRange('B' + row).setValue(teamA[i].building);
    strategySheet.getRange('C' + row).setValue(teamA[i].killSwat);
    strategySheet.getRange('D' + row).setValue(teamA[i].role);
    row++;
  }
  
  // TEAM B
  row += 2;
  strategySheet.getRange('A' + row).setValue('🌪️ STORM - TEAM B').setFontSize(14).setFontWeight('bold').setBackground('#ff9800').setFontColor('#ffffff');
  strategySheet.getRange('A' + row + ':D' + row).merge();
  
  row++;
  strategySheet.getRange('A' + row).setValue('PLAYER').setFontWeight('bold').setBackground('#ffb74d');
  strategySheet.getRange('B' + row).setValue('BUILDING').setFontWeight('bold').setBackground('#ffb74d');
  strategySheet.getRange('C' + row).setValue('KILL SWAT').setFontWeight('bold').setBackground('#d32f2f').setFontColor('#ffffff');
  strategySheet.getRange('D' + row).setValue('ROLE').setFontWeight('bold').setBackground('#ffb74d');
  
  row++;
  for (var i = 0; i < teamB.length; i++) {
    strategySheet.getRange('A' + row).setValue(teamB[i].player);
    strategySheet.getRange('B' + row).setValue(teamB[i].building);
    strategySheet.getRange('C' + row).setValue(teamB[i].killSwat);
    strategySheet.getRange('D' + row).setValue(teamB[i].role);
    row++;
  }
  
  // Formattazione
  strategySheet.setColumnWidth(1, 180);
  strategySheet.setColumnWidth(2, 180);
  strategySheet.setColumnWidth(3, 100);
  strategySheet.setColumnWidth(4, 120);
  
  // Aggiorna History
  updateStormHistory_(teamA.concat(teamB));
  
  ss.toast('✅ Storm Strategy updated! (' + teamA.length + ' Team A, ' + teamB.length + ' Team B)', 'Alliance Hub', 3);
}

/****************************************************
 * CANYON HISTORY - Update
 ****************************************************/
function updateCanyonHistory_(players) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var historySheet = ss.getSheetByName(CANYON_HISTORY_SHEET);
  
  if (!historySheet) {
    setupCanyonHistory_();
    historySheet = ss.getSheetByName(CANYON_HISTORY_SHEET);
  }
  
  var data = historySheet.getDataRange().getValues();
  var historyMap = {};
  
  // Carica dati esistenti
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0]).trim();
    if (name) {
      historyMap[name] = {
        row: i + 1,
        participations: data[i][1] || 0,
        lastDate: data[i][2] || '',
        teamA: data[i][3] || 0,
        teamB: data[i][4] || 0
      };
    }
  }
  
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // Aggiorna con nuovi dati
  for (var i = 0; i < players.length; i++) {
    var player = players[i].player;
    var team = players[i].team || (i < players.length / 2 ? 'A' : 'B');
    
    if (historyMap[player]) {
      var h = historyMap[player];
      h.participations++;
      h.lastDate = today;
      if (team === 'A') h.teamA++;
      else h.teamB++;
      
      historySheet.getRange(h.row, 1, 1, 5).setValues([[
        player, h.participations, h.lastDate, h.teamA, h.teamB
      ]]);
    } else {
      var teamA = team === 'A' ? 1 : 0;
      var teamB = team === 'B' ? 1 : 0;
      historySheet.appendRow([player, 1, today, teamA, teamB]);
    }
  }
}

/****************************************************
 * STORM HISTORY - Update
 ****************************************************/
function updateStormHistory_(players) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var historySheet = ss.getSheetByName(STORM_HISTORY_SHEET);
  
  if (!historySheet) {
    setupStormHistory_();
    historySheet = ss.getSheetByName(STORM_HISTORY_SHEET);
  }
  
  var data = historySheet.getDataRange().getValues();
  var historyMap = {};
  
  // Carica dati esistenti
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0]).trim();
    if (name) {
      historyMap[name] = {
        row: i + 1,
        participations: data[i][1] || 0,
        lastDate: data[i][2] || '',
        teamA: data[i][3] || 0,
        teamB: data[i][4] || 0
      };
    }
  }
  
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // Aggiorna con nuovi dati
  for (var i = 0; i < players.length; i++) {
    var player = players[i].player;
    var team = players[i].team || (i < players.length / 2 ? 'A' : 'B');
    
    if (historyMap[player]) {
      var h = historyMap[player];
      h.participations++;
      h.lastDate = today;
      if (team === 'A') h.teamA++;
      else h.teamB++;
      
      historySheet.getRange(h.row, 1, 1, 5).setValues([[
        player, h.participations, h.lastDate, h.teamA, h.teamB
      ]]);
    } else {
      var teamA = team === 'A' ? 1 : 0;
      var teamB = team === 'B' ? 1 : 0;
      historySheet.appendRow([player, 1, today, teamA, teamB]);
    }
  }
}

/****************************************************
 * ✅ UPDATE STATS - VERSIONE SENZA DUPLICATI!
 ****************************************************/
function updateStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
  var latestSheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
  
  if (!dataSheet) {
    ss.toast('❌ War Room Data not found', 'Error', 3);
    return;
  }
  
  if (!latestSheet) {
    setupWarRoom();
    latestSheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
  }
  
  var data = dataSheet.getDataRange().getValues();
  if (data.length < 2) {
    ss.toast('⚠️ No data to process', 'Warning', 3);
    return;
  }
  
  // STEP 1: Trova l'ULTIMO record per ogni giocatore
  var latest = {};
  var now = new Date().getTime();
  
  for (var i = data.length - 1; i >= 1; i--) {
    var nik = String(data[i][0]).trim().toUpperCase();
    var timestamp = data[i][5];
    
    if (!nik || !timestamp) continue;
    
    var ts = new Date(timestamp).getTime();
    
    if (!latest[nik]) {
      latest[nik] = {
        nik: nik,
        timestamp: timestamp,
        missile: Number(data[i][2]) || 0,
        aerei: Number(data[i][3]) || 0,
        tank: Number(data[i][4]) || 0,
        ts: ts
      };
    }
  }
  
  // ✅ STEP 2: CANCELLA TUTTO (tranne header) E RISCRIVI DA ZERO!
  var lastRow = latestSheet.getLastRow();
  if (lastRow > 1) {
    latestSheet.deleteRows(2, lastRow - 1);
  }
  
  // STEP 3: Aggiungi SOLO i record univoci
  var rowsData = [];
  
  for (var nik in latest) {
    var p = latest[nik];
    var totale = p.missile + p.aerei + p.tank;
    var giorni = Math.floor((now - p.ts) / (1000 * 60 * 60 * 24));
    rowsData.push([p.nik, p.timestamp, p.missile, p.aerei, p.tank, totale, giorni]);
  }
  
  // Scrivi tutto in una volta
  if (rowsData.length > 0) {
    latestSheet.getRange(2, 1, rowsData.length, 7).setValues(rowsData);
  }
  
  // STEP 4: Ordina per TOTALE decrescente
  var totalRows = latestSheet.getLastRow();
  if (totalRows > 2) {
    var dataRange = latestSheet.getRange(2, 1, totalRows - 1, 7);
    dataRange.sort({column: 6, ascending: false});
  }
  
  // STEP 5: Formattazione
  for (var i = 2; i <= totalRows; i++) {
    var missile = latestSheet.getRange(i, 3).getValue();
    var aerei = latestSheet.getRange(i, 4).getValue();
    var tank = latestSheet.getRange(i, 5).getValue();
    var giorni = latestSheet.getRange(i, 7).getValue();
    formatPlayerRow_(latestSheet, i, missile, aerei, tank, giorni);
  }
  
  // STEP 6: Bordi
  if (totalRows > 1) {
    latestSheet.getRange(1, 1, totalRows, 7)
      .setBorder(true, true, true, true, true, true, '#d0d7de', SpreadsheetApp.BorderStyle.SOLID);
  }
  
  // STEP 7: Riapplica header
  latestSheet.getRange(1, 1, 1, 7)
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground('#0b3d91')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  latestSheet.setRowHeight(1, 40);
  
  ss.toast('✅ Updated: ' + rowsData.length + ' unique players (no duplicates!)', 'Alliance Hub', 5);
}

// Helper function per formattare riga giocatore
function formatPlayerRow_(sheet, rowNum, missile, aerei, tank, giorni) {
  var rowRange = sheet.getRange(rowNum, 1, 1, 7);
  
  // Formattazione base
  rowRange.setFontSize(11)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('center');
  
  // Colore alternato base
  if ((rowNum - 2) % 2 === 0) {
    rowRange.setBackground('#f0f4ff');
  } else {
    rowRange.setBackground('#ffffff');
  }
  
  // NOME GIOCATORE (colonna A) - Sfondo colorato, bold, più largo
  sheet.getRange(rowNum, 1)
    .setBackground('#e3f2fd')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  
  // EVIDENZIA SQUADRA PIÙ FORTE in VERDE CHIARO
  var maxValue = Math.max(missile, aerei, tank);
  if (missile === maxValue && missile > 0) {
    sheet.getRange(rowNum, 3).setBackground('#90EE90').setFontWeight('bold');
  }
  if (aerei === maxValue && aerei > 0) {
    sheet.getRange(rowNum, 4).setBackground('#90EE90').setFontWeight('bold');
  }
  if (tank === maxValue && tank > 0) {
    sheet.getRange(rowNum, 5).setBackground('#90EE90').setFontWeight('bold');
  }
  
  // TOTALE in verde grassetto
  sheet.getRange(rowNum, 6)
    .setFontWeight('bold')
    .setFontColor('#0b5d0b');
  
  // GIORNI FA - Colore in base a freschezza
  if (giorni === 0) {
    sheet.getRange(rowNum, 7)
      .setBackground('#c8e6c9')
      .setFontWeight('bold')
      .setFontColor('#2e7d32');
  } else if (giorni > 7) {
    sheet.getRange(rowNum, 7)
      .setBackground('#ffcdd2')
      .setFontColor('#c62828');
  }
  
  sheet.setRowHeight(rowNum, 35);
}

/****************************************************
 * UTILITY
 ****************************************************/
function getMembersList_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var latestSheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
  
  if (!latestSheet) {
    return [];
  }
  
  var data = latestSheet.getDataRange().getValues();
  var members = [];
  
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0]).trim();
    if (name && name !== '---') {
      members.push(name);
    }
  }
  
  return members;
}

function getConfig_(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName(CONFIG_SHEET);
  
  if (!configSheet) return null;
  
  var data = configSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      return String(data[i][1]).trim();
    }
  }
  return null;
}

/****************************************************
 * API HANDLERS
 ****************************************************/
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(5000);
    
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'add') {
      return handleWarRoomAdd(payload);
    }

    return createResponse(false, 'Unknown action');

  } catch (error) {
    return createResponse(false, String(error));
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'getConfig') {
    return getConfigAPI();
  }
  
  if (action === 'getCanyonStrategy') {
    return getCanyonStrategyAPI();
  }
  
  if (action === 'getStormStrategy') {
    return getStormStrategyAPI();
  }
  
  if (action === 'getLatestPlayers') {
    return getLatestPlayersAPI();
  }
  
  if (action === 'getCanyonHistory') {
    return getCanyonHistoryAPI();
  }
  
  if (action === 'getStormHistory') {
    return getStormHistoryAPI();
  }
  
  // PERSONAL STATS - Sistema PIN
  if (action === 'checkPlayerPIN') {
    return checkPlayerHasPIN(e.parameter.playerName, e.parameter.secretCode);
  }
  
  if (action === 'registerPlayer') {
    return registerPlayer(e.parameter.playerName, e.parameter.secretCode);
  }
  
  if (action === 'getPlayerStats') {
    return getPlayerStatsWithPIN(e.parameter.playerName, e.parameter.pin);
  }
  
  // R4 CODE VERIFICATION
  if (action === 'verifyR4Code') {
    return verifyR4Code(e.parameter.code);
  }
  
  return createResponse(false, 'Unknown action');
}

/****************************************************
 * R4 CODE VERIFICATION
 ****************************************************/
function verifyR4Code(providedCode) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
    
    if (!dataSheet) {
      return createResponse(false, 'System error');
    }
    
    // Get R4 code from sheet
    var r4Cell = dataSheet.getRange(R4_CODE_CELL);
    var storedCode = String(r4Cell.getValue()).trim();
    
    if (!providedCode || providedCode.trim() === '') {
      return createResponse(false, 'Code required');
    }
    
    if (storedCode === String(providedCode).trim()) {
      return createResponse(true, { valid: true });
    } else {
      return createResponse(false, 'Invalid code');
    }
    
  } catch (error) {
    return createResponse(false, 'Error: ' + error.toString());
  }
}

function getConfigAPI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName(CONFIG_SHEET);
  
  if (!configSheet) {
    return createResponse(false, 'Config not found');
  }
  
  var data = configSheet.getDataRange().getValues();
  var config = {};
  
  for (var i = 2; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var value = String(data[i][1]).trim();
    if (key) config[key] = value;
  }
  
  return createResponse(true, config);
}

function handleWarRoomAdd(payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET_NAME);
  
  var secretCell = sheet.getRange(SECRET_CODE_CELL);
  var secretCode = String(secretCell.getValue()).trim();
  var providedCode = String(payload.data.secretCode).trim();
  
  if (secretCode !== providedCode) {
    return createResponse(false, 'Invalid code');
  }
  
  var nik = String(payload.data.name).trim().toUpperCase();
  var dateISO = payload.data.dateISO;
  var missiles = payload.data.missiles;
  var aircraft = payload.data.aircraft;
  var tanks = payload.data.tanks;
  var timestamp = new Date(payload.data.createdAt).toLocaleString('en-US');

  var data = sheet.getDataRange().getValues();
  var found = false;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === nik && String(data[i][1]) === dateISO) {
      sheet.getRange(i + 1, 1, 1, 6).setValues([[nik, dateISO, missiles, aircraft, tanks, timestamp]]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow([nik, dateISO, missiles, aircraft, tanks, timestamp]);
  }

  // ✅ AUTO-UPDATE: Aggiorna automaticamente Latest Players
  try {
    updateStats();
  } catch (e) {
    Logger.log('Auto-update error: ' + e);
  }

  return createResponse(true, 'Data saved successfully');
}

function getCanyonStrategyAPI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CANYON_STRATEGY_SHEET);
  
  if (!sheet) {
    return createResponse(false, 'Canyon Strategy not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var result = { teamA: [], teamB: [] };
  var currentTeam = null;
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var firstCell = String(row[0]).trim();
    
    if (firstCell.indexOf('TEAM A') > -1) {
      currentTeam = 'A';
      continue;
    }
    if (firstCell.indexOf('TEAM B') > -1) {
      currentTeam = 'B';
      continue;
    }
    if (firstCell === 'PLAYER') continue;
    
    if (currentTeam && firstCell) {
      var entry = {
        player: firstCell,
        building: String(row[1]).trim(),
        killSwat: String(row[2]).trim(),
        role: String(row[3]).trim()
      };
      
      if (currentTeam === 'A') {
        result.teamA.push(entry);
      } else {
        result.teamB.push(entry);
      }
    }
  }
  
  return createResponse(true, result);
}

function getStormStrategyAPI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(STORM_STRATEGY_SHEET);
  
  if (!sheet) {
    return createResponse(false, 'Storm Strategy not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var result = { teamA: [], teamB: [] };
  var currentTeam = null;
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var firstCell = String(row[0]).trim();
    
    if (firstCell.indexOf('TEAM A') > -1) {
      currentTeam = 'A';
      continue;
    }
    if (firstCell.indexOf('TEAM B') > -1) {
      currentTeam = 'B';
      continue;
    }
    if (firstCell === 'PLAYER') continue;
    
    if (currentTeam && firstCell) {
      var entry = {
        player: firstCell,
        building: String(row[1]).trim(),
        killSwat: String(row[2]).trim(),
        role: String(row[3]).trim()
      };
      
      if (currentTeam === 'A') {
        result.teamA.push(entry);
      } else {
        result.teamB.push(entry);
      }
    }
  }
  
  return createResponse(true, result);
}

function getLatestPlayersAPI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
  
  if (!sheet) {
    return createResponse(false, 'Latest Players not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var players = [];
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    
    players.push({
      name: String(data[i][0]),
      lastUpdate: String(data[i][1]),
      missiles: data[i][2] || 0,
      aircraft: data[i][3] || 0,
      tanks: data[i][4] || 0,
      total: data[i][5] || 0,
      daysAgo: data[i][6] || 0
    });
  }
  
  return createResponse(true, players);
}

function getCanyonHistoryAPI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CANYON_HISTORY_SHEET);
  
  if (!sheet) {
    return createResponse(false, 'Canyon History not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var history = [];
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    
    history.push({
      player: String(data[i][0]),
      participations: data[i][1] || 0,
      lastDate: String(data[i][2]),
      teamA: data[i][3] || 0,
      teamB: data[i][4] || 0
    });
  }
  
  return createResponse(true, history);
}

function getStormHistoryAPI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(STORM_HISTORY_SHEET);
  
  if (!sheet) {
    return createResponse(false, 'Storm History not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var history = [];
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    
    history.push({
      player: String(data[i][0]),
      participations: data[i][1] || 0,
      lastDate: String(data[i][2]),
      teamA: data[i][3] || 0,
      teamB: data[i][4] || 0
    });
  }
  
  return createResponse(true, history);
}

function createResponse(success, data) {
  var response = {
    status: success ? 'success' : 'error',
    timestamp: new Date().toISOString()
  };
  
  if (success) {
    response.data = data;
  } else {
    response.message = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/****************************************************
 * PERSONAL STATS - Sistema PIN
 ****************************************************/

/** VERIFICA SE GIOCATORE HA GIÀ UN PIN */
function checkPlayerHasPIN(playerName, secretCode) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
    
    // Verifica codice segreto
    var secretCell = dataSheet.getRange(SECRET_CODE_CELL);
    var storedCode = String(secretCell.getValue()).trim();
    
    if (storedCode !== String(secretCode).trim()) {
      return createResponse(false, 'Invalid alliance code');
    }
    
    if (!playerName || playerName.trim() === '') {
      return createResponse(false, 'Player name required');
    }
    
    var searchName = playerName.trim().toUpperCase();
    
    // Verifica che il giocatore esista
    var data = dataSheet.getDataRange().getValues();
    var playerExists = false;
    
    for (var i = 1; i < data.length; i++) {
      var nik = String(data[i][0]).trim().toUpperCase();
      if (nik === searchName) {
        playerExists = true;
        break;
      }
    }
    
    if (!playerExists) {
      return createResponse(false, 'Player not found in database');
    }
    
    // Controlla se ha già un PIN
    var pinSheet = getPINSheet_();
    var pinData = pinSheet.getDataRange().getValues();
    
    for (var i = 1; i < pinData.length; i++) {
      var name = String(pinData[i][0]).trim().toUpperCase();
      if (name === searchName) {
        return createResponse(true, { hasPIN: true });
      }
    }
    
    return createResponse(true, { hasPIN: false });
    
  } catch (error) {
    return createResponse(false, 'Error: ' + error.toString());
  }
}

/** REGISTRA GIOCATORE E GENERA PIN */
function registerPlayer(playerName, secretCode) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
    
    // Verifica codice segreto
    var secretCell = dataSheet.getRange(SECRET_CODE_CELL);
    var storedCode = String(secretCell.getValue()).trim();
    
    if (storedCode !== String(secretCode).trim()) {
      return createResponse(false, 'Invalid alliance code');
    }
    
    if (!playerName || playerName.trim() === '') {
      return createResponse(false, 'Player name required');
    }
    
    var searchName = playerName.trim().toUpperCase();
    
    // Verifica che il giocatore esista
    var data = dataSheet.getDataRange().getValues();
    var playerExists = false;
    var originalName = '';
    
    for (var i = 1; i < data.length; i++) {
      var nik = String(data[i][0]).trim().toUpperCase();
      if (nik === searchName) {
        playerExists = true;
        originalName = String(data[i][0]).trim();
        break;
      }
    }
    
    if (!playerExists) {
      return createResponse(false, 'Player not found. Add your data first.');
    }
    
    // Verifica che non abbia già un PIN
    var pinSheet = getPINSheet_();
    var pinData = pinSheet.getDataRange().getValues();
    
    for (var i = 1; i < pinData.length; i++) {
      var name = String(pinData[i][0]).trim().toUpperCase();
      if (name === searchName) {
        return createResponse(false, 'You already have a PIN! Use it to access your stats.');
      }
    }
    
    // Genera PIN univoco
    var pin = generateUniquePIN_(pinSheet);
    
    // Salva nel foglio PIN
    var now = new Date().toLocaleString('en-US');
    pinSheet.appendRow([originalName, pin, now]);
    
    return createResponse(true, {
      pin: pin,
      playerName: originalName,
      message: 'PIN generated successfully!'
    });
    
  } catch (error) {
    return createResponse(false, 'Error: ' + error.toString());
  }
}

/** OTTIENI STATISTICHE CON PIN */
function getPlayerStatsWithPIN(playerName, pin) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!playerName || playerName.trim() === '') {
      return createResponse(false, 'Player name required');
    }
    
    if (!pin || pin.trim() === '') {
      return createResponse(false, 'PIN required');
    }
    
    var searchName = playerName.trim().toUpperCase();
    var searchPIN = pin.trim().toUpperCase();
    
    // Verifica PIN
    var pinSheet = getPINSheet_();
    var pinData = pinSheet.getDataRange().getValues();
    var pinValid = false;
    var originalName = '';
    
    for (var i = 1; i < pinData.length; i++) {
      var name = String(pinData[i][0]).trim().toUpperCase();
      var storedPIN = String(pinData[i][1]).trim().toUpperCase();
      
      if (name === searchName && storedPIN === searchPIN) {
        pinValid = true;
        originalName = String(pinData[i][0]).trim();
        break;
      }
    }
    
    if (!pinValid) {
      return createResponse(false, 'Invalid name or PIN');
    }
    
    // PIN valido - carica statistiche
    var dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
    var data = dataSheet.getDataRange().getValues();
    
    // Filtra record del giocatore
    var playerRecords = [];
    for (var i = 1; i < data.length; i++) {
      var nik = String(data[i][0]).trim().toUpperCase();
      if (nik === searchName) {
        var dateValue = data[i][1];
        var dateString = '';
        
        if (dateValue instanceof Date) {
          var year = dateValue.getFullYear();
          var month = String(dateValue.getMonth() + 1).padStart(2, '0');
          var day = String(dateValue.getDate()).padStart(2, '0');
          dateString = year + '-' + month + '-' + day;
        } else {
          dateString = String(dateValue);
        }
        
        playerRecords.push({
          name: originalName,
          date: dateString,
          missile: Number(data[i][2]) || 0,
          aerei: Number(data[i][3]) || 0,
          tank: Number(data[i][4]) || 0,
          timestamp: data[i][5]
        });
      }
    }
    
    if (playerRecords.length === 0) {
      return createResponse(false, 'No data found for this player');
    }
    
    // Ordina per timestamp
    playerRecords.sort(function(a, b) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // Calcola trend
    var latest = playerRecords[playerRecords.length - 1];
    var previous = playerRecords.length > 1 ? playerRecords[playerRecords.length - 2] : latest;
    
    var latestTotal = latest.missile + latest.aerei + latest.tank;
    var previousTotal = previous.missile + previous.aerei + previous.tank;
    
    var trend = {
      missile: {
        current: latest.missile,
        previous: previous.missile,
        change: latest.missile - previous.missile,
        percentChange: previous.missile > 0 ? ((latest.missile - previous.missile) / previous.missile * 100).toFixed(1) : 0
      },
      aerei: {
        current: latest.aerei,
        previous: previous.aerei,
        change: latest.aerei - previous.aerei,
        percentChange: previous.aerei > 0 ? ((latest.aerei - previous.aerei) / previous.aerei * 100).toFixed(1) : 0
      },
      tank: {
        current: latest.tank,
        previous: previous.tank,
        change: latest.tank - previous.tank,
        percentChange: previous.tank > 0 ? ((latest.tank - previous.tank) / previous.tank * 100).toFixed(1) : 0
      },
      total: {
        current: latestTotal,
        previous: previousTotal,
        change: latestTotal - previousTotal,
        percentChange: previousTotal > 0 ? ((latestTotal - previousTotal) / previousTotal * 100).toFixed(1) : 0
      }
    };
    
    // Ranking
    var latestSheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
    var ranking = null;
    
    if (latestSheet) {
      var latestData = latestSheet.getDataRange().getValues();
      var allPlayers = [];
      
      for (var i = 1; i < latestData.length; i++) {
        var name = String(latestData[i][0]).trim().toUpperCase();
        var total = Number(latestData[i][5]) || 0;
        allPlayers.push({name: name, total: total});
      }
      
      allPlayers.sort(function(a, b) { return b.total - a.total; });
      
      for (var i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i].name === searchName) {
          var topPlayer = allPlayers[0];
          ranking = {
            position: i + 1,
            total: allPlayers.length,
            playerTotal: allPlayers[i].total,
            topTotal: topPlayer.total,
            gapFromTop: topPlayer.total - allPlayers[i].total,
            percentFromTop: topPlayer.total > 0 ? ((topPlayer.total - allPlayers[i].total) / topPlayer.total * 100).toFixed(1) : 0
          };
          break;
        }
      }
      
      if (allPlayers.length > 0) {
        var sum = 0;
        for (var i = 0; i < allPlayers.length; i++) {
          sum += allPlayers[i].total;
        }
        var avg = Math.round(sum / allPlayers.length);
        ranking.allianceAverage = avg;
        ranking.vsAverage = latestTotal - avg;
        ranking.vsAveragePercent = avg > 0 ? ((latestTotal - avg) / avg * 100).toFixed(1) : 0;
      }
    }
    
    // Chart data
    var chartData = [];
    var startIndex = Math.max(0, playerRecords.length - 10);
    for (var i = startIndex; i < playerRecords.length; i++) {
      var r = playerRecords[i];
      chartData.push({
        date: formatDate(r.date),
        missile: r.missile,
        aerei: r.aerei,
        tank: r.tank,
        total: r.missile + r.aerei + r.tank
      });
    }
    
    var response = {
      playerName: originalName,
      trend: trend,
      ranking: ranking,
      history: playerRecords.reverse(),
      chartData: chartData,
      totalRecords: playerRecords.length
    };
    
    return createResponse(true, response);
    
  } catch (error) {
    return createResponse(false, 'Error: ' + error.toString());
  }
}

/** OTTIENI O CREA FOGLIO PIN */
function getPINSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pinSheet = ss.getSheetByName(PIN_SHEET_NAME);
  
  if (!pinSheet) {
    pinSheet = ss.insertSheet(PIN_SHEET_NAME);
    
    // Intestazioni
    pinSheet.getRange(1, 1, 1, 3).setValues([['PLAYER NAME', 'PIN', 'CREATED']]);
    pinSheet.getRange(1, 1, 1, 3)
      .setFontWeight('bold')
      .setFontSize(12)
      .setBackground('#0b3d91')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    
    pinSheet.setColumnWidth(1, 200);
    pinSheet.setColumnWidth(2, 120);
    pinSheet.setColumnWidth(3, 180);
    pinSheet.setRowHeight(1, 40);
    pinSheet.setFrozenRows(1);
  }
  
  return pinSheet;
}

/** GENERA PIN UNIVOCO */
function generateUniquePIN_(pinSheet) {
  var chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  var existingPINs = {};
  
  var data = pinSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    existingPINs[data[i][1]] = true;
  }
  
  var pin = '';
  var attempts = 0;
  
  do {
    pin = '';
    for (var i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (existingPINs[pin] && attempts < 100);
  
  return pin;
}

/** Formatta data per grafico (GG/MM) */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  
  try {
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      var parts = dateStr.split('-');
      return parts[2] + '/' + parts[1];
    }
    
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    return day + '/' + month;
  } catch (e) {
    return '-';
  }
}

/****************************************************
 * AUTO-UPDATE TRIGGERS
 ****************************************************/
function setupAutoUpdate() {
  // Rimuovi trigger esistenti
  removeAutoUpdate();
  
  // Crea trigger che esegue updateStats ogni ora
  ScriptApp.newTrigger('updateStats')
    .timeBased()
    .everyHours(1)
    .create();
  
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('✅ Auto-update attivato! Le statistiche si aggiorneranno ogni ora.', 'Alliance Hub', 5);
}

function removeAutoUpdate() {
  var triggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'updateStats') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('🛑 Auto-update disattivato.', 'Alliance Hub', 3);
}

/****************************************************
 * AUTO-UPDATE ON EDIT (Aggiorna quando modifichi War Room Data)
 ****************************************************/
function onEdit(e) {
  // Controlla se la modifica è nel foglio War Room Data
  var sheet = e.source.getActiveSheet();
  
  if (sheet.getName() === DATA_SHEET_NAME) {
    // Aspetta 2 secondi e poi aggiorna
    Utilities.sleep(2000);
    updateStats();
  }
}
