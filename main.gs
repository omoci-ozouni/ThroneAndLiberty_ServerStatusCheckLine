function checkServerStatus() {
  var url = 'https://www.playthroneandliberty.com/ja-jp/support/server-status';
  var serverName = 'Sunstorm';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ServerStatus");
  var lastStatus = sheet.getRange("B2").getValue(); // 前回のステータスを取得
  
  // Webページを取得
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    Logger.log("Failed to fetch the server status.");
    return;
  }

  // HTML解析
  var html = response.getContentText();
  var serverStatus = parseServerStatus(html, serverName);
  var timestamp = new Date(); // 現在の時刻
  
  Logger.log("Current status: " + serverStatus);
  Logger.log("Previous status: " + lastStatus);

  // メンテナンス終了を検知
  if (lastStatus === "Maintenance" && serverStatus !== "Maintenance") {
    var message = "🎉 Throne and Liberty サーバー '" + serverName + "' がオンラインになりました！";
    Logger.log(message);
    sendLineMessage(message);
  }

  // スプレッドシートを更新
  sheet.getRange("A2").setValue(timestamp);  // 現在時刻
  sheet.getRange("B2").setValue(serverStatus); // サーバーステータス
}

// サーバーの状態を解析する関数（スペースで区切って最後の単語を取得）
function parseServerStatus(html, serverName) {
  var regex = new RegExp('<span[^>]*aria-label="([^"]*)"[^>]*>' + serverName + '</span>', 'i');
  var match = html.match(regex);
  if (match) {
    var statusParts = match[1].trim().split(/\s+/); // スペース区切り
    return statusParts[statusParts.length - 1]; // 最後の単語を取得
  }
  return "Unknown";
}


function sendLineMessage(message) {
  // スクリプトプロパティからLINEアクセストークンを取得
  var accessToken = PropertiesService.getScriptProperties().getProperty("LINE_ACCESS_TOKEN");
  
  if (!accessToken) {
    Logger.log("アクセストークンが設定されていません");
    return;
  }

  // ユーザーIDリストをLineConfigシートから取得
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LineConfig');
  var userIds = sheet.getRange('A2:A').getValues();  // A2からユーザーIDを取得
  
  // ユーザーIDリストをループしてメッセージを送信
  for (var i = 0; i < userIds.length; i++) {
    var userId = userIds[i][0];
    
    // ユーザーIDが空でない場合に送信
    if (userId) {
      var url = "https://api.line.me/v2/bot/message/push"; // LINE Messaging API のURL

      var payload = JSON.stringify({
        "to": userId,  // 送信先のユーザーID
        "messages": [{ "type": "text", "text": message }]
      });

      var options = {
        "method": "post",
        "headers": {
          "Authorization": "Bearer " + accessToken,
          "Content-Type": "application/json"
        },
        "payload": payload
      };

      try {
        var response = UrlFetchApp.fetch(url, options);
        Logger.log("Response: " + response.getContentText());
      } catch (error) {
        Logger.log("エラーが発生しました: " + error);
      }
    }
  }
}


// LINE Messaging API でメッセージを送信
function sendLineMessage2(message) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LineConfig");
  var config = sheet.getRange("A2:A").getValues().filter(row => row[0] && row[1]); // 有効な設定のみ取得

  var url = "https://api.line.me/v2/bot/message/push";
  
  config.forEach(function(row) {
    var accessToken = row[0];
    var userId = row[1];

    var payload = JSON.stringify({
      "to": userId,
      "messages": [{ "type": "text", "text": message }]
    });

    var options = {
      "method": "post",
      "headers": {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      "payload": payload
    };
    Logger.log(options);
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Sent to user: " + userId + " Response: " + response.getContentText());
  });
}
