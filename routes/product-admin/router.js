var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../helper')

const { getDetail, getAll, search, create, update, softDelete, restore } = require('./controller');
const { validationSchema, validationQuerySchema, getDetailSchema } = require('./validation');

router.route('/')
  .get(validateSchema(validationQuerySchema), getAll)
  .post(validateSchema(validationSchema), create)

router.get('/search', validateSchema(validationQuerySchema), search);

router.route('/:id')
  .get(validateSchema(getDetailSchema), getDetail)
  .put(validateSchema(getDetailSchema), validateSchema(validationSchema), update)
  .delete(validateSchema(getDetailSchema), softDelete)
  .patch(validateSchema(getDetailSchema), restore)


module.exports = router;
