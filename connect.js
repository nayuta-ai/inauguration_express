const mysql=require('mysql');
var connection = mysql.createConnection({
    host     : 'db', //接続先ホスト
    user     : 'appuser',      //ユーザー名
    password : 'mysql',  //パスワード
    database : 'test'    //DB名
  });
