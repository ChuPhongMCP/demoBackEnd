const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

const getDetailSchema = yup.object({
  params: yup.object({
      id: yup.string().test('validationID', 'ID sai định dạng', (value) => {
          return ObjectId.isValid(value);
      }),
  }),
});

module.exports = {
  getDetailSchema,
}