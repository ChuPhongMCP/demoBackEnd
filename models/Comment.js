const mongoose = require('mongoose');
const { date } = require('yup');
const { Schema, model } = mongoose;

const commentSchema = Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'products' },
    userName: { type: String, required: true, default: "Player" },
    comment: { type: String, min: 1, required: true },
    like: { type: Number, required: true, default: 0 },
    createDate: { type: String, required: true },
  },

  {
    versionKey: false,
    timestamps: true,
  },
);

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

const Comment = model('comments', commentSchema);
module.exports = Comment;
