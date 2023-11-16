var express = require('express');
var router = express.Router();

const {
  createPayment,
  checkReturn,
  checkIpn,
} = require('./controller');

router.route('/create_payment_url')
  .post(createPayment);

router.route('/vnpay_return')
  .get(checkReturn);

router.route('/check_ipn')
  .get(checkIpn);

module.exports = router;