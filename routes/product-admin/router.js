var express = require('express');
var router = express.Router();

const { getDetail, getAll, search, create, update, softDelete, restore, upImageHeader, upImageHD, upImageList } = require('./controller');

router.route('/')
  .get(getAll)
  // .post(validateSchema(validationSchema), create)
  .post(create)

router.route('/up-image-header')
  .post(upImageHeader)

router.route('/up-image-hd')
  .post(upImageHD)

router.route('/up-image-list')
  .post(upImageList)

router.get('/search', search);

router.route('/:id')
  .get(getDetail)
  .put(update)
  .delete(softDelete)
  .patch(restore)


module.exports = router;
