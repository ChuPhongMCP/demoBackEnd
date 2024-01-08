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
  passportVerifyTokenAdmin,
  passportVerifyAccountAdmin,
} = require('../../middlewares/passportAdmin');

passport.use('jwtAdmin', passportVerifyTokenAdmin);
passport.use('localAdmin', passportVerifyAccountAdmin);

router.route('/login')
  .post(
    validateSchema(loginSchema),
    passport.authenticate('localAdmin', { session: false }),
    login,
  );

router.route('/check-refreshtoken')
  .post(
    checkRefreshToken,
  );

router.route('/profile')
  .get(
    passport.authenticate('jwtAdmin', { session: false }),
    getMe,
  );

module.exports = router;
