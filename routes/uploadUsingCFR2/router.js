var express = require('express');
var router = express.Router();

const { uploadSingle, uploadMultiple } = require('./controller');

router.route('/upload-single/:objid')
  .post(uploadSingle);

router.route('/upload-multiple/:objid')
  .post(uploadMultiple);

module.exports = router;
