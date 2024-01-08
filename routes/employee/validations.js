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

        fullName: yup.string().required("fullName không được bỏ trống").max(100, 'Tên không được vượt quá 100 ký tự'),

        username: yup.string(),

        password: yup.string()
            .required("Password không được bỏ trống")
            .min(6, 'Password không được ít hơn 6 ký tự')
            .max(16, 'Password không được vượt quá 16 ký tự'),
    }),
});

module.exports = {
    getDetailSchema,
    createSchema,
}
