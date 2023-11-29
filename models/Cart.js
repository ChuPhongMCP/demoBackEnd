const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

const cartDetailSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    quantity: { type: Number, require: true, min: 0 },
    price: { type: Number, require: true, min: 0 },
  },
  {
    versionKey: false,
  },
);

// Virtual with Populate
cartDetailSchema.virtual('product', {
  ref: 'products',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
  options: { strictPopulate: false },
});

// Virtuals in console.log()
cartDetailSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
cartDetailSchema.set('toJSON', { virtuals: true });

// ------------------------------------------------------------------------------------------------

const cartSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
    totalItem: { type: Number, require: true, min: 0, default: 0 },
    subtotal: { type: Number, require: true, min: 0, default: 0 },
    shipping: { type: Number, require: true, min: 0, default: 0 },
    total: { type: Number, require: true, min: 0, default: 0 },
    // Array
    products: [cartDetailSchema],
  },
  {
    versionKey: false,
  },
);

// Virtual with Populate
cartSchema.virtual('customer', {
  ref: 'customers',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

// Virtuals in console.log()
cartSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
cartSchema.set('toJSON', { virtuals: true });

const Cart = model('Cart', cartSchema);
module.exports = Cart;
