function doPost(e) {
  var timestamp = new Date();
  logToSheet(e, timestamp);
  var json = JSON.parse(e.postData.contents);
  logToSheet(json, timestamp);
  var events = json.events;
  logToSheet(events, timestamp);
  

  if (events.length > 0) {
    logToSheet(events[0], timestamp);
    var userId = events[0].source.userId;

    // スプレッドシートにアクセス
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LineConfig');
    
    // スプレッドシートのA列に既存のユーザーIDリストを取得
    var userIds = sheet.getRange('A:A').getValues();
    
    // 重複チェック: ユーザーIDがすでに存在するか
    var isExist = false;
    for (var i = 0; i < userIds.length; i++) {
      if (userIds[i][0] === userId) {
        isExist = true;
        break;
      }
    }

    // ユーザーIDが重複していなければスプレッドシートに追加
    if (!isExist) {
      
      sheet.appendRow([userId, timestamp]);
      
      // Logシートにログを保存
      logToSheet("ユーザーID " + userId + " を登録しました。", timestamp);
    } else {
      // Logシートにログを保存
      logToSheet("ユーザーID " + userId + " は既に登録されています。", new Date());
    }
  }
}

// Logシートにログを保存する関数
function logToSheet(message, timestamp) {
  var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  
  if (!logSheet) {
    // Logシートが存在しない場合は新たに作成
    logSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Log');
    logSheet.appendRow(['Timestamp', 'Message']);
  }
  
  logSheet.appendRow([timestamp, message]);
}
