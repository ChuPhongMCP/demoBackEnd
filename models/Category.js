const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục không được bỏ trống'],
      maxLength: [100, 'Tên danh mục không được vượt quá 100 ký tự'],
      unique: [true, 'Tên danh mục không được trùng'],
    },
    description: {
      type: String,
      maxLength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Category = model('categories', categorySchema);
module.exports = Category;