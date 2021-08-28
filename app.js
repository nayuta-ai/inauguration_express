const express = require('express');
const cors = require('cors')
const app = express();
const passport = require('./auth');
const http = require('http')
const session = require('express-session');
const flash = require('connect-flash');
const server = http.createServer(app)

const mustacheExpress = require('mustache-express');
app.engine('mst', mustacheExpress());
app.set('view engine', 'mst');
app.set('views', __dirname + '/views');

const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('./models').User;

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
  secret: 'YOUR-SECRET-STRING',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
)

const authMiddleware = (req, res, next) => {
  if(req.isAuthenticated()) { // ログインしてるかチェック

    next();

  } else {

    res.redirect(302, '/login');

  }
};

// ログインフォーム
app.get('/login', (req, res) => {
  const errorMessage = req.flash('error').join('<br>');
  res.render('login/form', {
    errorMessage: errorMessage
  });
});
// ログイン実行
app.post('/login',
passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: '「メールアドレス」と「パスワード」は必須入力です。'
})
);

// ログイン成功後のページ
app.get('/user', function(req, res){
  const user = req.user;
  res.sendFile('/front/main.html', { root: __dirname });
});

app.get('/register', (req, res) => {
  return res.render('auth/register');
})
// 暗号化につかうキー
const appKey = 'YOUR-SECRET-KEY';

// メール送信設定
const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 1025,
  secure: '',
  auth: {
    user: '',
    pass: ''
  }
});

// バリデーション・ルール
const registrationValidationRules = [
  check('name')
    .not().isEmpty().withMessage('この項目は必須入力です。'),
  check('email')
    .not().isEmpty().withMessage('この項目は必須入力です。')
    .isEmail().withMessage('有効なメールアドレス形式で指定してください。'),
  check('password')
    .not().isEmpty().withMessage('この項目は必須入力です。')
    .isLength({ min:8, max:25 }).withMessage('8文字から25文字にしてください。')
    .custom((value, { req }) => {

      if(req.body.password !== req.body.passwordConfirmation) {

        throw new Error('パスワード（確認）と一致しません。');

      }

      return true;

    })
];
// ここに先ほどの事前データ

app.post('/register', registrationValidationRules, (req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()) { // バリデーション失敗

    return res.status(422).json({ errors: errors.array() });

  }

  // 送信されたデータ
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  // ユーザーデータを登録（仮登録）
  User.findOrCreate({
    where: { email: email },
    defaults: {
      name: name,
      email: email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(8))
    }
  }).then(([user]) => {

    if(user.emailVerifiedAt) { // すでに登録されている時

      return res.status(422).json({
        errors: [
          {
            value: email,
            msg: 'すでに登録されています。',
            param: 'email',
            location: 'body'
          }
        ]
      });

    }
    // 本登録URLを作成
    const hash = crypto.createHash('sha1')
      .update(user.email)
      .digest('hex');
    const now = new Date();
    const expiration = now.setHours(now.getHours() + 1); // 1時間だけ有効
    let verificationUrl = req.get('origin') +'/verify/'+ user.id +'/'+ hash +'?expires='+ expiration;
    const signature = crypto.createHmac('sha256', appKey)
      .update(verificationUrl)
      .digest('hex');
    verificationUrl += '&signature='+ signature;

    // 本登録メールを送信
    transporter.sendMail({
      from: 'from@example.com',
      to: 'to@example.com',
      text: "以下のURLをクリックして本登録を完了させてください。\n\n"+ verificationUrl,
      subject: '本登録メール',
    });

    return res.json({
      result: true
    });

  });

});
app.get('/verify/:id/:hash', (req, res) => {

  const userId = req.params.id;
  User.findByPk(userId)
    .then(user => {

      if(!user) {

        res.status(422).send('このURLは正しくありません。');

      } else if(user.emailVerifiedAt) {  // すでに本登録が完了している場合

        // ログイン＆リダイレクト（Passport.js）
        req.login(user, () => res.redirect('/user'));

      } else {

        const now = new Date();
        const hash = crypto.createHash('sha1')
          .update(user.email)
          .digest('hex');
        const isCorrectHash = (hash === req.params.hash);
        const isExpired = (now.getTime() > parseInt(req.query.expires));
        const verificationUrl = APP_URL + req.originalUrl.split('&signature=')[0];
        const signature = crypto.createHmac('sha256', APP_KEY)
          .update(verificationUrl)
          .digest('hex');
        const isCorrectSignature = (signature === req.query.signature);

        if(!isCorrectHash || !isCorrectSignature || isExpired) {

          res.status(422).send('このURLはすでに有効期限切れか、正しくありません。');

        } else {  // 本登録

          user.emailVerifiedAt = new Date();
          user.save();

          // ログイン＆リダイレクト（Passport.js）
          req.login(user, () => res.redirect('/user'));

        }

      }

    });

});

server.listen(5000, () => {
console.log('listening on *:5000')
});