const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

const orderDetailSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    quantity: { type: Number, require: true, min: 0, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, default: 0 },
  },
  {
    versionKey: false,
  },
);

// Virtual with Populate
orderDetailSchema.virtual('product', {
  ref: 'products',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

// Virtuals in console.log()
orderDetailSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
orderDetailSchema.set('toJSON', { virtuals: true });

orderDetailSchema.plugin(mongooseLeanVirtuals);

// -----------------------------------------------------------------------------------------------

const orderSchema = new Schema(
  {
    createdDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    shippedDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;

          if (value < this.createdDate) {
            return false;
          }

          return true;
        },
        // message: `Shipped date: {VALUE} phải lớn hơn hoặc bằng createdDate`,
        message: `Shipped date: phải lớn hơn hoặc bằng createdDate`,
      },
      required: true,
      default: Date.now,
    },

    paymentType: {
      type: String,
      required: true,
      default: 'CASH',
      // enum: ['CASH', 'CREDIT_CARD'],
      enum: {
        values: ['CASH', 'CREDIT_CARD'],
        message: 'paymentType phải là CASH hoặc CREDIT_CARD',
      }
      // validate: {
      //   validator: (value) => {
      //     if (['CASH', 'CREDIT_CARD'].includes(value.toUpperCase())) {
      //       return true;
      //     }
      //     return false;
      //   },
      //   message: `Payment type: {VALUE} is invalid!`,
      // },
    },

    status: {
      type: String,
      required: true,
      // enum: ['WAITING', 'COMPLETED', 'CANCELED', 'REJECTED', 'DELIVERING'],
      enum: {
        values: ['WAITING', 'COMPLETED', 'CANCELED', 'REJECTED', 'DELIVERING'],
        message: 'status phải là một trong các giá trị: WAITING, COMPLETED, CANCELED, REJECTED, DELIVERING',
      },
      default: 'WAITING',
      // validate: {
      //   validator: (value) => {
      //     if (['WAITING', 'COMPLETED', 'CANCELED'].includes(value)) {
      //       return true;
      //     }
      //     return false;
      //   },
      //   message: `Status: {VALUE} is invalid!`,
      // },
    },
    customerId: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'employees' },
    // isDeleted: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    // Array
    orderDetails: [orderDetailSchema],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Virtual with Populate
orderSchema.virtual('customer', {
  ref: 'customers',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

orderSchema.virtual('employee', {
  ref: 'employees',
  localField: 'employeeId',
  foreignField: '_id',
  justOne: true,
});

// Virtuals in console.log()
orderSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
orderSchema.set('toJSON', { virtuals: true });

orderSchema.plugin(mongooseLeanVirtuals);

const Order = model('orders', orderSchema);
module.exports = Order;
