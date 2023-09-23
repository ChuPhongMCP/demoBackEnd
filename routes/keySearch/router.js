const express = require('express');
const router = express.Router();

const { validateSchema } = require('../../helper');
const {
    getDetailSchema,
    createSchema,
} = require('./validations');
const {
    getAll,
    create,
    update,
    deleted,
    restore,
} = require('./controller');

router.route('/')
    .get(getAll)
    .post(validateSchema(createSchema), create)

router.route('/:id')
    .put(validateSchema(getDetailSchema), validateSchema(createSchema), update)
    .delete(validateSchema(getDetailSchema), deleted)
    .patch(validateSchema(getDetailSchema), restore)

module.exports = router;
