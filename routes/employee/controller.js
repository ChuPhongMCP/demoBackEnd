const { Employee, Cart } = require('../../models');
const { hashPassword } = require('../../helper');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const results = await Employee.find({
                isDeleted: false,
            }).select('-password');

            return res.send(200, { message: "Tìm kiếm thành công", payload: results });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Tìm kiếm thất bại", errors: err.message });
        }
    },

    getDetail: async (req, res, next) => {
        try {
            const { id } = req.params;

            conditionFind = {
                _id: id,
                isDeleted: false,
            }

            const results = await Employee.findOne(conditionFind).select('-password');

            if (!results) {
                return res.send(200, { message: `Không tìm thấy nhân viên nào có ID là: ${id}` });
            }

            return res.send(200, { message: "Tìm kiếm thành công", payload: results });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Tìm kiếm thất bại", errors: err.message });
        }
    },

    search: async (req, res, next) => {
        try {
            const { username } = req.query;

            const conditionFind = {
                username,
            }

            const results = await Employee.findOne(conditionFind).select('-password');

            if (results) {
                return res.send(200, { statusCode: 200, message: "success" })
            } else {
                return res.send(404, { statusCode: 404, message: "not found" })
            }
        } catch (error) {
            console.log('««««« error »»»»»', error);
            return res.status(500).json({ message: "Internal server error", errors: error.message });
        }
    },

    create: async (req, res, next) => {
        try {
            const data = req.body;

            const { username } = data;

            const getUsernameExits = await Employee.findOne({ username });


            const errors = [];
            
            if (getUsernameExits) errors.push(' Username đã tồn tại');

            if (errors.length > 0) {
                return res.status(400).json({
                    message: `Thêm nhân viên không thành công, ${errors}`,
                });
            }

            const newItem = new Employee(data);

            let result = await newItem.save();

            result.password = undefined;
          
            return res.send(200, { statusCode: 200, message: 'success', payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Internal server error", errors: err.message });
        }
    },
};
