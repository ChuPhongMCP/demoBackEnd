const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

const getDetailSchema = yup.object({
    params: yup.object({
        id: yup.string().test('validationID', 'ID sai định dạng', (value) => {
            return ObjectId.isValid(value);
        }),
    }),
});

const createSchema = yup.object({
    body: yup.object({
        keyWork: yup.string().required("KeyWork không được bỏ trống").max(100, 'KeyWork không được vượt quá 100 ký tự'),

        description: yup.string()
            .max(500, 'Mô tả không được vượt quá 500 ký tự'),
    }),
});

module.exports = {
    getDetailSchema,
    createSchema,
}
