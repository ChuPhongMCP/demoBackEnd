const express = require('express');
const router = express.Router();

const {
  addComment,
  getComment,
  addLike,
} = require('./controller');

router.route('/')
  .post(addComment)
  .get(getComment)

router.route('/like')
  .post(addLike)

module.exports = router;
