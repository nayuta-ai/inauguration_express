const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http')
const server = http.createServer(app)

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
)

const mysql=require('mysql');
var con = mysql.createConnection({
    host     : 'db', //接続先ホスト
    user     : 'appuser',      //ユーザー名
    password : 'mysql',  //パスワード
    database : 'test'    //DB名
  });
con.connect(function(err){
  if(err) throw err;
  console.log('Connected');
})
/*
app.get('/api/users',(request,response)=>{
  const sql = "select * from Users"
  con.query(sql,function(err,result,fields){
    if (err) throw err;
    response.json(result[0].name)
  })
})

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Hey',
    message: 'Hello there!',
  })
})
*/
app.get('/api/users', (req, res) => {
  const sql = "select * from Users"
  con.query(sql,function(err,result,fields){
    if (err) throw err;
    res.json({name:result[0].name})
  })
})
/*
app.get('/api/users/:id', (req, res) => {
  res.json({ name: `No.${req.params.id} is Bob` })
})
*/
server.listen(5000, () => {
  console.log('listening on *:5000')
});