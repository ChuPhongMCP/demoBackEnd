const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const keySearchSchema = new Schema(
  {
    keyWork: {
      type: String,
      required: [true, 'keyWork không được bỏ trống'],
      maxLength: [100, 'keyWork không được vượt quá 100 ký tự'],
      unique: [true, 'keyWork không được trùng'],
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

const KeySearch = model('keySearchs', keySearchSchema);
module.exports = KeySearch;