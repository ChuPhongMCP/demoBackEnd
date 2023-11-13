var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../helper')

const {
  getDetail,
  getAll,
  getNumOfStatus,
  search,
  largeSearch,
  create,
  update,
  softDelete,
  restore,
  searchCustomer,
  createCustomer,
} = require('./controller');
const {
  getDetailSchema,
  getOrderListSchema,
  createSchema,
  updateEmployeeSchema,
  updateShippingDateSchema,
  updateStatusSchema
} = require('./validation');

router.route('/')
  .get(validateSchema(getOrderListSchema), getAll)
  .post(create)

router.route('/status')
  .get(getNumOfStatus)

router.get('/search', search);
router.post('/search', largeSearch);

router.route('/search/customer')
  .get(searchCustomer)
router.route('/create/customer')
  .post(createCustomer)

router.route('/:id')
  .get(validateSchema(getDetailSchema), getDetail)
  .put(validateSchema(getDetailSchema), update)
  .delete(validateSchema(getDetailSchema), softDelete)
  .patch(validateSchema(getDetailSchema), restore)


module.exports = router;
