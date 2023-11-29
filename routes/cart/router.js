const express = require('express');
const router = express.Router();

const {
  getDetailSchema,
  removeSchema,
  createSchema,
} = require('./validations');
const {
  getDetail,
  addProduct,
  remove,
} = require('./controller');
const { validateSchema } = require('../../helper');

router.route('/')
  .post(validateSchema(createSchema), addProduct)
  .get(getDetail)
  
  router.route('/remove')
  .post(remove)

module.exports = router;
