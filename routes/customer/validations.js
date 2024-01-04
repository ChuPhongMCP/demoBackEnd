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

        email: yup.string()
            .required("Email không được bỏ trống")
            .max(100, "Email không được vượt quá 100 ký tự")
            .test('email type', '${value} không phải email hợp lệ', (value) => {
                const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

                return emailRegex.test(value);
            }),

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
