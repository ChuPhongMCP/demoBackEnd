const { Traffic } = require('../../models');
const moment = require('moment-timezone');

module.exports = {
  create: async (req, res, next) => {
    try {
      const data = req.body;

      const newItem = new Traffic(data);

      const result = await newItem.save();

      return res.send(200, { message: "Added", payload: result });

    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ message: "Internal Server Error", errors: err.message });
    }
  },

  updateTraffic: async (req, res, next) => {
    try {
      const { trafficId } = req.query;

      const result = await Traffic.findOneAndUpdate(
        { trafficId },
        { $inc: { traffic: 1 } },
        { new: true }
      );

      return res.send(200, { message: "Success", payload: result });

    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ message: "Internal Server Error", errors: err.message });
    }
  },

  getTraffic: async (req, res, next) => {
    try {
      const result = await Traffic.find();

      return res.send(200, { message: "Success", payload: result });

    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ message: "Internal Server Error", errors: err.message });
    }
  },
};
