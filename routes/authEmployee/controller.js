const JWT = require('jsonwebtoken');

const jwtSetting = require('../../constants/jwtSetting');
const { generateToken, generateRefreshToken } = require('../../helper/jwtHelper');
const { Employee } = require('../../models');

module.exports = {
  login: async (req, res, next) => {
    try {
      const {
        _id,
        fullName,
        email,
        createdAt,
      } = req.user

      const token = generateToken({
        _id,
        fullName,
        email,
        createdAt,
      });

      const refreshToken = generateRefreshToken(_id);

      return res.status(200).json({
        token,
        refreshToken,
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  checkRefreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      JWT.verify(refreshToken, jwtSetting.SECRET,
        async (err, data) => {
          if (err) {
            return res.status(403).json({
              message: "refreshToken is invalid"
            });
          }
          else {
            const { id } = data;

            const employee = await Employee.findOne({
              _id: id,
              isDeleted: false,
            }).select('-password').lean();

            if (employee) {
              const {
                _id,
                fullName,
                email,
                createdAt,
              } = employee;
              const token = generateToken({
                _id,
                fullName,
                email,
                createdAt,
              });

              return res.status(200).json({
                token,
              });
            }
          }
        });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(401).json({
        message: "Lỗi"
      });
    }
  },

  getMe: async (req, res, next) => {
    try {
      res.status(200).json({
        message: "Lấy thông tin thành công",
        payload: req.user,
      });
    } catch (err) {
      res.sendStatus(500).json({ message: "Lấy thông tin thất bại", errors: err.message });
    }
  },
};
