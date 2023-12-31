const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
// const multer = require('multer');
const { default: mongoose } = require('mongoose');
const passport = require('passport');
require('dotenv').config();

const indexRouter = require('./routes/index');
const customerRouter = require('./routes/customer/router');
const employeeRouter = require('./routes/employee/router');
const authCustomersRouter = require('./routes/authCustomer/router');
const authEmployeesRouter = require('./routes/authEmployee/router');
const productRouter = require('./routes/product-admin/router');
const commentRouter = require('./routes/comment/router');
const replyRouter = require('./routes/reply/router');
const trafficRouter = require('./routes/traffic/router');

const {
  passportVerifyTokenUser,
  passportVerifyAccountUser,
  // passportConfigBasic,
} = require('./middlewares/passportUser');

const {
  passportVerifyTokenAdmin,
  passportVerifyAccountAdmin,
  // passportConfigBasic,
} = require('./middlewares/passportAdmin');

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

passport.use('jwtUser', passportVerifyTokenUser);
passport.use('localUser', passportVerifyAccountUser);

passport.use('jwtAdmin', passportVerifyTokenAdmin);
passport.use('localAdmin', passportVerifyAccountAdmin);

app.use('/', indexRouter);

app.use('/customers', customerRouter);
app.use('/employees', employeeRouter);
app.use('/authCustomers', authCustomersRouter);
app.use('/authEmployees', authEmployeesRouter);
// app.use('/products', passport.authenticate('jwtAdmin', { session: false }), productRouter);
app.use('/products', productRouter);
app.use('/comments', commentRouter);
app.use('/replys', replyRouter);
app.use('/traffics', trafficRouter);

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
