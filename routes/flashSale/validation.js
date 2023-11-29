const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

const getDetailSchema = yup.object({
  params: yup.object({
    productId: yup.string().test('validationID', 'invalid ID', (value) => {
      return ObjectId.isValid(value);
    }),
  }),
});

const validationSchema = yup.object().shape({
  body: yup.array({
    productId: yup.string().test('validationID', 'invalid ID', (value) => {
      return ObjectId.isValid(value);
    }),

    discount: yup.number().min(0, "Discount cannot be negative").max(100, "Discount is too big").integer().required(({ path }) => `${path.split(".")[1]} is required`),

    stock: yup.number().min(0, "Invalid stock").integer().required(({ path }) => `${path.split(".")[1]} is required`),
  }),
});

module.exports = {
  getDetailSchema,
  validationSchema,
}