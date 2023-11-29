const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const mediaSchema = new Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, require: true },
    location: { type: String, required: true },
    // employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    objectId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true, enum: { values: ['smallImg', 'largeImg'], } }
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

mediaSchema.virtual('creator', {
  ref: 'employees',
  localField: 'employeeId',
  foreignField: '_id',
  justOne: true,
});

// Virtuals in console.log()
mediaSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
mediaSchema.set('toJSON', { virtuals: true });

mediaSchema.plugin(mongooseLeanVirtuals);

const Media = model('Media', mediaSchema);
module.exports = Media;
