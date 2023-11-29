const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const flaseSaleSchema = Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    stock: { type: Number, min: 0, default: 0 },
  },
  {
    versionKey: false,
    timeStamp: true,
  },
);

// Virtual with Populate
flaseSaleSchema.virtual('product', {
  ref: 'products',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

// Config
flaseSaleSchema.set('toJSON', { virtuals: true });
flaseSaleSchema.set('toObject', { virtuals: true });
//
flaseSaleSchema.plugin(mongooseLeanVirtuals);

const FlashSale = model('FlashSale', flaseSaleSchema);
module.exports = FlashSale;
