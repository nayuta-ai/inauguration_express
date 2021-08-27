const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').User;
passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password'
  }, (name, password, done) =>  {
    console.log("hello",name,password); // 追加
    User.findOne({
      where: {
        name: name
      }
    })
    .then(user => {
      console.log('user:',user); // 追加
      if(user && password == user.password) {
        return done(null, user);  // ログイン成功
      }
      throw new Error();
    })
    .catch(error => { // エラー処理
      console.log('error:',error); // 追加
      return done(null, false, { message: '認証情報と一致するレコードがありません。' });
    });
}));
// Session
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
module.exports = passport;