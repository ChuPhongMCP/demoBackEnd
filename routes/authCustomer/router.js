const express = require('express');
const passport = require('passport');
const router = express.Router();

const { validateSchema } = require('../../helper');
const {
  loginSchema,
} = require('./validations');
const {
  login,
  checkRefreshToken,
  getMe,
} = require('./controller');

const {
  passportVerifyTokenUser,
  passportVerifyAccountUser,
} = require('../../middlewares/passportUser');

passport.use('jwtUser', passportVerifyTokenUser);
passport.use('localUser', passportVerifyAccountUser);

router.route('/login')
  .post(
    validateSchema(loginSchema),
    passport.authenticate('localUser', { session: false }),
    login,
  );

router.route('/check-refreshtoken')
  .post(
    checkRefreshToken,
  );

router.route('/profile')
  .get(
    passport.authenticate('jwtUser', { session: false }),
    getMe,
  );

module.exports = router;
