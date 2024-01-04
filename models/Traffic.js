const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const trafficSchema = Schema(
  {
    trafficId: { type: String, required: true },

    traffic: { type: Number, required: true, default: 0 },
  },

  {
    versionKey: false,
    timestamps: true,
  },
);

trafficSchema.set('toJSON', { virtuals: true });
trafficSchema.set('toObject', { virtuals: true });

const Traffic = model('traffics', trafficSchema);
module.exports = Traffic;
