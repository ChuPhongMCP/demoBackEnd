const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

const getDetailSchema = yup.object({
  params: yup.object({
    id: yup.string().test('validationID', 'ID sai định dạng', (value) => {
      return ObjectId.isValid(value);
    }),
  }),
});

const updateStatusSchema = yup.object({
  body: yup.object({
    // status: yup.string().test('validationStatus', 'Trạng thái không hợp lệ', (value) => {
    //     if (['WAITING', 'COMPLETED', 'CANCELED', 'REJECTED', 'DELIVERING'].includes(value)) {
    //       return true;
    //     }
    //     return false;
    // }),
    status: yup.string()
      .required()
      .oneOf(['WAITING', 'COMPLETED', 'CANCELED', 'REJECTED', 'DELIVERING'], 'Trạng thái không hợp lệ'),

  }),
});

const getOrderListSchema = yup.object({
  query: yup.object({
    status: yup.string()
      .oneOf(['WAITING', 'COMPLETED', 'CANCELED', 'REJECTED', 'DELIVERING'], 'Trạng thái đơn hàng không hợp lệ'),
  }),
});

const createSchema = yup.object({
  body: yup.object({
    createdDate: yup.date(),

    shippedDate: yup
      .date()
      .test('check date', '${path} ngày tháng không hợp lệ', (value) => {
        if (!value) return true;

        if (value && this.createdDate && value < this.createdDate) {
          return false;
        }

        if (value < new Date()) {
          return false;
        }

        return true;
      }),

    paymentType: yup.string()
      .required()
      .oneOf(['CASH', 'CREDIT CARD'], 'Phương thức thanh toán không hợp lệ'),

    status: yup.string()
      .required()
      .oneOf(['WAITING', 'COMPLETED', 'CANCELED'], 'Trạng thái không hợp lệ'),

    customerId: yup
      .string()
      .test('validationCustomerID', 'customerId sai định dạng', (value) => {
        return ObjectId.isValid(value);
      }),

    employeeId: yup
      .string()
      .test('validationEmployeeID', 'employeeId sai định dạng', (value) => {
        return ObjectId.isValid(value);
      }),

    orderDetails: yup.array().of(
      yup.object().shape({
        productId: yup
          .string()
          .test('validationProductID', 'productId sai định dạng', (value) => {
            return ObjectId.isValid(value);
          })
          .required(),

        quantity: yup.number().required().min(0),

        price: yup.number().required().min(0),

        discount: yup.number().required().min(0),
      }),
    ),
  }),
});

const updateShippingDateSchema =  yup.object({
  body: yup.object({
    shippedDate: yup
      .date()
      .test('check date', '${path} ngày tháng không hợp lệ', (value) => {
        if (!value) return true;

        if (value && this.createdDate && value < this.createdDate) {
          return false;
        }

        if (value < new Date()) {
          return false;
        }

        return true;
      }),
  }),
});

const updateEmployeeSchema = yup.object({
  body: yup.object({
    employeeId: yup
      .string()
      .test('validationEmployeeID', 'ID sai định dạng', (value) => {
        return ObjectId.isValid(value);
      }),
  }),
});

module.exports = {
  getDetailSchema,
  getOrderListSchema,
  updateStatusSchema,
  createSchema,
  updateShippingDateSchema,
  updateEmployeeSchema
}