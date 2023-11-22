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
    update,
    deleted,
    restore,
    search,
    createGoogle,
} = require('./controller');

router.route('/search')
    .get(search)

router.route('/create-google')
    .post(createGoogle)

router.route('/')
    .get(getAll)
    .post(validateSchema(createSchema), create)

router.route('/:id')
    .get(validateSchema(getDetailSchema), getDetail)
    .put(validateSchema(createSchema), update)
    .delete(validateSchema(getDetailSchema), deleted)
    .patch(validateSchema(getDetailSchema), restore)

module.exports = router;
