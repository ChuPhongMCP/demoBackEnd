const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên không được bỏ trống'],
      maxLength: [50, 'Tên sản phẩm không được vượt quá 50 ký tự'],
    },

    price: { type: Number, required: [true, 'Giá không được để trống'], min: [0, 'Giá thấp nhất là 0'], default: 0 },

    discount: { type: Number, min: 0, max: 75, default: 0 },

    stock: { type: Number, min: 0, default: 0 },

    // Reference to Category
    categoryId: { type: Schema.Types.ObjectId, ref: 'categories', required: true },

    // Reference to Supplier
    supplierId: { type: Schema.Types.ObjectId, ref: 'suppliers', required: true },

    description: {
      type: String,
      maxLength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    },

    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },

    isFlashSale: {
      type: Boolean,
      default: false,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    createDate: {
      type: String,
      required: true,
    },

    imageHD: {
      type: String,
      required: true,
    },

    imageList: {
      type: [String],
    },

    linkDownload: {
      type: [String],
    },

    noteDownload: {
      type: [String],
    },

    view: { type: Number, min: 0, default: 0 },
  },
  {
    versionKey: false,
    timeStamp: true,
  },
);

const Product = model('products', productSchema);
module.exports = Product;
