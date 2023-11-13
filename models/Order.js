const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

// const orderDetailSchema = new Schema(
//   {
//     productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
//     quantity: { type: Number, require: true, min: 0, default: 1 },
//     price: { type: Number, required: true, min: 0, default: 0 },
//     discount: { type: Number, required: true, default: 0 },
//   },
//   {
//     versionKey: false,
//   },
// );

// // Virtual with Populate
// orderDetailSchema.virtual('product', {
//   ref: 'products',
//   localField: 'productId',
//   foreignField: '_id',
//   justOne: true,
// });

// // Virtual with Populate
// orderDetailSchema.virtual('category', {
//   ref: 'categories',
//   localField: 'product.categoryId',
//   foreignField: '_id',
//   justOne: true,
// });


const orderDetailSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    quantity: { type: Number, require: true, min: 0, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, default: 0 },
  },
  {
    versionKey: false,
    strictPopulate: false, // Set the strictPopulate option to false for orderDetailSchema
  }
);

orderDetailSchema.virtual('product', {
  ref: 'products',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
  options: { strictPopulate: false }, // Set strictPopulate to false for this virtual
});

orderDetailSchema.virtual('category', {
  ref: 'categories',
  localField: 'product.categoryId',
  foreignField: '_id',
  justOne: true,
  options: { strictPopulate: false }, // Set strictPopulate to false for this virtual
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

    shippedAddress: {
      type: String,
      maxLength: [500, 'shippedAddress must not exceed 500 characters'],
    },

    Description: {
      type: String,
      maxLength: [500, 'Description must not exceed 500 characters'],
    },

    subTotal: {
      type: Number,
      required: true,
    },

    shipping: {
      type: Number,
      required: true,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    // Array
    orderDetails: [orderDetailSchema],
  },
  {
    versionKey: false,
    timestamps: true,
    strictPopulate: false,
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

orderSchema.virtual('totalPrice').get(function () {
  let totalPrice = 0;
  if (this.orderDetails && this.orderDetails.length > 0) {
    for (let i = 0; i < this.orderDetails.length; i++) {
      totalPrice += this.orderDetails[i].quantity * this.orderDetails[i].price * (100 - this.orderDetails[i].discount) / 100;
    }
  }
  return totalPrice;
});

// Virtuals in console.log()
orderSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
orderSchema.set('toJSON', { virtuals: true });

orderSchema.plugin(mongooseLeanVirtuals);

const Order = model('orders', orderSchema);
module.exports = Order;
