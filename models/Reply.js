const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const replySchema = Schema(
  {
    productId: {
      type: Schema.Types.ObjectId, required: true, ref: 'products'
    },
    commentId: {
      type: Schema.Types.ObjectId, required: true, ref: 'comments'
    },
    repUserName: { type: String, required: true, default: "Player" },
    reply: { type: String, min: 1, required: true },
    repLike: { type: Number, required: true, default: 0 },
    createDate: { type: String, required: true },
  },

  {
    versionKey: false,
    timestamps: true,
  },
);

replySchema.set('toJSON', { virtuals: true });
replySchema.set('toObject', { virtuals: true });

const Reply = model('replys', replySchema);
module.exports = Reply;
