const express = require('express');
const router = express.Router();

const {
  addReply,
  getReply,
  addLike,
} = require('./controller');

router.route('/')
  .post(addReply)
  .get(getReply)

router.route('/like')
  .post(addLike)

module.exports = router;
