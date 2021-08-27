const express = require('express')
const app = express()
var passport = require('passport');
app.use(passport.initialize());
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'ユーザーIDが正しくありません。' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'パスワードが正しくありません。' });
      }
      return done(null, user);
    });
  }
));
app.get('/login', function(req, res){
    res.sendFile('login.html', { root: __dirname });
});
app.get('/', (req, res) => res.send('Hello World!'))
app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',  // 失敗したときの遷移先
        successRedirect: '/',  // 成功したときの遷移先
    }))
var session = require('express-session');
app.use(session({
    secret: '○○',
}));
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
app.listen(5000, () => console.log('Example app listening on port 5000!'))