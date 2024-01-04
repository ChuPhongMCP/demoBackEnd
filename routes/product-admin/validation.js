const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

const validationSchema = yup.object().shape({
  body: yup.object({
    name: yup.string().max(50, "Tên sản phẩm quá dài").required("Tên không được bỏ trống"),

    price: yup.number().min(0, "Giá không thể âm").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),

    discount: yup.number().min(0, "Giảm giá không thể âm").max(75, "Giảm giá quá lớn").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),

    stock: yup.number().min(0, "Số lượng không hợp lệ").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),

    description: yup.string().max(3000, "Mô tả quá dài").required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),

    // isDeleted: yup.boolean().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
    categoryId: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
      //if (!value) return true;
      return ObjectId.isValid(value);
    }),

    supplierId: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
      //if (!value) return true;
      return ObjectId.isValid(value);
    }),
  }),
});

const validationQuerySchema = yup.object().shape({
  query: yup.object({
   
    page: yup.number().min(1),

    pageSize: yup.number().min(2),

    name: yup.string(),

  }),
});

const getDetailSchema = yup.object({
  params: yup.object({
      id: yup.string().test('validationID', 'ID sai định dạng', (value) => {
          return ObjectId.isValid(value);
      }),
  }),
});

module.exports = {
  validationSchema,
  validationQuerySchema,
  getDetailSchema,
}