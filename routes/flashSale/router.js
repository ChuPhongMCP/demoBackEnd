var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../helper');

const { getAll, create } = require('./controller');
const { getDetailSchema, validationSchema } = require('./validation');

router.route('/')
  .get(getAll)
  .post(create)

// router.get('/search', validateSchema(validationQuerySchema), search);
// router.post('/search', validateSchema(validationQuerySchema), largeSearch);

// router.route('/:id')
//   .get(validateSchema(getDetailSchema), getDetail)
//   .put(validateSchema(getDetailSchema), validateSchema(validationSchema), update)
//   .delete(validateSchema(getDetailSchema), softDelete)
//   .patch(validateSchema(getDetailSchema), restore)


module.exports = router;
