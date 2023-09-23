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
        name: yup.string().required("Tên danh mục không được bỏ trống").max(100, 'Tên danh mục không được vượt quá 100 ký tự'),

        description: yup.string()
            .max(500, 'Mô tả danh mục không được vượt quá 500 ký tự'),
    }),
});

module.exports = {
    getDetailSchema,
    createSchema,
}
