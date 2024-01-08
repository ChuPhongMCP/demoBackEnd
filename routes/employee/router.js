const express = require('express');
const router = express.Router();

const { validateSchema } = require('../../helper');
const {
    getDetailSchema,
    createSchema,
} = require('./validations');
const {
    getAll,
    getDetail,
    create,
    search,
} = require('./controller');

router.route('/search')
    .get(search)

router.route('/')
    .get(getAll)
    .post(validateSchema(createSchema), create)

router.route('/:id')
    .get(validateSchema(getDetailSchema), getDetail)

module.exports = router;
