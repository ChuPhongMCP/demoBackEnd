const express = require('express');
const router = express.Router();

const {
  updateTraffic,
  getTraffic,
  create,
} = require('./controller');

router.route('/')
  .post(create)
  .get(getTraffic)

  router.route('/update')
  .post(updateTraffic)

module.exports = router;
