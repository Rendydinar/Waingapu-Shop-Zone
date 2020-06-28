// pk.eyJ1IjoicmVuZHlkaW5hciIsImEiOiJja2FjbWNocWcwMGY0MndwYTQxZnQ5cWg4In0.LASCd-ZQF3mKlSWH7jrSNQ
require('dotenv').config();

const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const User = require('./models/user.model.js');
const session = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const colors = require('colors');
var cors = require('cors')
// const seedPosts = require('./seeds');
// seedPosts();

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// HANDLE SEMUA ACTION DARI BACKEND KE FRONTEND MAUPUN SEBALIKNYA DAN LAKUKAN INTERAKTIF CLINET DENGAN JAVASCRIPT
// PERBAKI PESAN ERORR NOTIFIKASI, HALAMAN 500 ERROR 
// MOBILE DESIGN

// REFACTORY, PERBAKI PhotoSwipe, Perbaiki Hapus Akun.

// require routes
const index   = require('./routes/index.route.js');
const product   = require('./routes/product.route.js');
const reviews = require('./routes/reviews.route.js');

const app = express();

app.use(cors())

// Perbaiki sidebar dan header untuk mobile+tablet, setelah itu gasa semua page

// Perbaiki mapbox saat mengambil alamat lewat zipcode, kalau bisa cari cara pengambilan lokasi yang sangat akurat

// Buat Halaman untk my profile (private) dan users-profile (public)

// -NAVBAR KETIKA LOGIN TIDAK RESPONSI
// - LANDING PAGE DONE
// - PRODUCT INDEX DONE
// - PRODUCT SHOW DONE
// 
// CLEAN CODE, PETA LOCAL ERROR

// connect to the database 
// mongoose.connect('mongodb://localhost:27017/waingapu-shop-zone', { 
mongoose.connect('mongodb+srv://rendy:R3ndycoder433@cluster0-x0xe9.mongodb.net/waingapu-shop-zone', { 
   useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('we\'re connected!');
});

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// set public assets directory
app.use(express.static('public'));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Add moment to every view
app.locals.moment = require('moment');

// Configure Passport and Sessions
app.use(session({
  secret: 'waingapu-shop-zone-secret-session',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set local variables middleware
app.use(function(req, res, next) {
  // console.log(req.user);
  // set currentUser
  //   req.user = {
  //   '_id' : '5ee6e8e490dfb1657186e831',
  //   username : 'rendydinar',
  //   image : {
  //     secure_url : '/images/default-profile.jpg',
  //   },
  //   email : 'rendy@gmail.com',
  //   nomorTelfon : 82217971133,
  //   facebook : '',
  //   instagram : '',
  //   bio : 'Saya Penjual'

  // }
  // set categoris product digunakan untuk sidebar view
  res.locals.categories = req.session.categories || [];
  // res.locals.currentUser = req.user;
  res.locals.currentUser = req.user
  // set default page title
  res.locals.titlePage = 'Waingapu Shop Zone';
  // set success flash message
  res.locals.success = req.session.success || '';
  delete req.session.success;
  // set error flash message
  res.locals.error = req.session.error || '';
  delete req.session.error;
  // continue on to next function in middleware chain
  next();
});

// Sidebase cetegori product tidak muncul di beberapa view

// VALIDASI EMAIL YANG BENAR SAAT REGISTER
// PAHAMI CATCH AND TRY KARENA SUDAH MENGGUNAKAN MIDDLEWARE ERRORHANDLER DAN PAHAMI KODE 500 ERROR

// Mount routes
app.use('/', index);
app.use('/products', product);
app.use('/products/:id/reviews', reviews);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status = 404;
  res.render('404');
});

// error handler when development mode
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log('Terjadi error!'.red);
  console.log(err);
  console.log('Akhir dari informasi error!'.blue);

  /**
   * Kita lakukan pengujian apakah untuk error saat mengupload file yang formatnya tidak dapat diterima
   * atau ukuran file upload gambar melebih kapasitas.
   * Error kedua ini masih dalam status kode 422, selain itu kode 500
   */
  if(err.message.includes('file format')) {
    err.message = 'Format File Tidak Didukung';
    req.session.error = err.message;
    return res.status(422).redirect('back');
  } else if(err.message.includes('File too large')) {
    err.message = 'Ukuran File Terlalu Besar';
    req.session.error = err.message;
    return res.status(422).redirect('back');
  } else {
    // render the error page
    // error 500 production mode
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    return res.render('error');

    // error 500 development mode
    // return res.status(422).redirect('back');
  }
 
});

module.exports = app;
