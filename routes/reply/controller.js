const { Reply } = require('../../models');
const moment = require('moment-timezone');

module.exports = {
  addReply: async (req, res, next) => {
    try {
      const data = req.body;

      const currentDateTime = moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');

      const newItem = new Reply({
        ...data,
        createDate: currentDateTime,
      });

      const result = await newItem.save();

      return res.send(200, { message: "Added Reply", payload: result });

    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ message: "Internal Server Error", errors: err.message });
    }
  },

  getReply: async (req, res, next) => {
    try {
      const { productId } = req.query;

      const result = await Reply.find({ productId }).sort({ createdAt: 1 });

      return res.send(200, { message: "Success", payload: result });

    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ message: "Internal Server Error", errors: err.message });
    }
  },

  addLike: async (req, res, next) => {
    try {
      const { id } = req.query;

      const result = await Reply.findOneAndUpdate(
        { _id: id },
        { $inc: { repLike: +1 } }
      );

      return res.send(200, { message: "Success", payload: result });

    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ message: "Internal Server Error", errors: err.message });
    }
  },
};
