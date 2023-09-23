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
        firstName: yup.string().required("firstName không được bỏ trống").max(50, 'Họ không được vượt quá 50 ký tự'),

        lastName: yup.string().required("lastName không được bỏ trống").max(50, 'Tên không được vượt quá 50 ký tự'),

        email: yup.string()
            .required("Email không được bỏ trống")
            .max(50, 'Email không được vượt quá 50 ký tự')
            .test('email type', '${value} Không phải email hợp lệ', (value) => {
                const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

                return emailRegex.test(value);
            })
        ,

        phoneNumber: yup.string()
            .required("phoneNumber không được bỏ trống")
            .max(50, 'Số điện thoại không được vượt quá 50 ký tự')
            .test('phoneNumber type', '${value} Không phải số điện thoại hợp lệ', (value) => {
                const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

                return phoneRegex.test(value);
            })
        ,

        address: yup.string()
            .required("address không được bỏ trống")
            .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),

        birthday: yup.date(),

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
