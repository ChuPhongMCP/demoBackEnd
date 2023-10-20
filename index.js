const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const multer = require('multer');
const { default: mongoose } = require('mongoose');
const passport = require('passport');
require('dotenv').config();

const indexRouter = require('./routes/index');
const employeesRouter = require('./routes/employee/router');
const customerRouter = require('./routes/customer/router');
const supplierRouter = require('./routes/supplier/router');
const categoryRouter = require('./routes/category/router');
const authEmployeeRouter = require('./routes/authEmployee/router');
const productRouter = require('./routes/product/router');
const orderRouter = require('./routes/order/router');
const mediaRouter = require('./routes/upload');
const keySearchRouter = require('./routes/keySearch/router');
const mediaS3Router = require('./routes/uploadUsingCFR2/router');
const questionsRouter = require('./routes/questions/router');

const {
  passportVerifyToken,
  passportVerifyAccount,
  // passportConfigBasic,
} = require('./middlewares/passport');

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: '*',
  }),
);

mongoose.connect(`${process.env.DATABASE_URL}${process.env.DATABASE_NAME}`);

passport.use(passportVerifyToken);
passport.use(passportVerifyAccount);
// passport.use(passportConfigBasic);

app.use('/', indexRouter);
// app.use('/employees', passport.authenticate('jwt', { session: false }), employeesRouter);
// app.use('/customers', passport.authenticate('jwt', { session: false }), customerRouter);
// app.use('/suppliers', passport.authenticate('jwt', { session: false }), supplierRouter);
// app.use('/categories', passport.authenticate('jwt', { session: false }), categoryRouter);
// app.use('/authEmployee', authEmployeeRouter);
// app.use('/products', passport.authenticate('jwt', { session: false }), productRouter);
// app.use('/media', passport.authenticate('jwt', { session: false }), mediaRouter);
// app.use('/keySearch', passport.authenticate('jwt', { session: false }), keySearchRouter);
app.use('/mediaS3', passport.authenticate('jwt', { session: false }), mediaS3Router);

app.use('/employees', employeesRouter);
app.use('/customers', customerRouter);
app.use('/suppliers', supplierRouter);
app.use('/categories', categoryRouter);
app.use('/authEmployee', authEmployeeRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/media', mediaRouter);
app.use('/keySearch', keySearchRouter);
app.use('/questions', questionsRouter);
// app.use('/mediaS3', mediaS3Router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
