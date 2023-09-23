const { Customer } = require('../../models');
const { hashPassword } = require('../../helper');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const results = await Customer.find({
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

            const results = await Customer.findOne(conditionFind).select('-password');

            if (!results) {
                return res.send(200, { message: `Không tìm thấy khách hàng nào có ID là: ${id}` });
            }

            return res.send(200, { message: "Tìm kiếm thành công", payload: results });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Tìm kiếm thất bại", errors: err.message });
        }
    },

    create: async (req, res, next) => {
        try {
            const data = req.body;

            const { email, phoneNumber } = data;

            const getEmailExits = Customer.findOne({ email });
            const getPhoneExits = Customer.findOne({ phoneNumber });

            const [doGetEmailExits, doGetPhoneExits] = await Promise.all([getEmailExits, getPhoneExits]);

            const errors = [];
            if (doGetEmailExits) errors.push(' Email đã tồn tại');
            if (doGetPhoneExits) errors.push(' Số điện thoại đã tồn tại');

            if (errors.length > 0) {
                return res.status(200).json({
                    message: `Thêm khách hàng không thành công, ${errors}`,
                });
            }

            const newItem = new Customer(data);

            let result = await newItem.save();

            result.password = undefined;

            return res.send(200, { message: 'Thêm khách hàng thành công', payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Thêm khách hàng thất bại", errors: err.message });
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            let dataUpdate = req.body;

            const { email, phoneNumber } = dataUpdate;

            const conditionFind = {
                _id: id,
                isDeleted: false,
            }
            const conditionFindEmailExists = {
                _id: { $ne: id },
                email,
            };
            const conditionFindPhoneExists = {
                _id: { $ne: id },
                phoneNumber,
            };

            const findEmailExists = Customer.findOne(conditionFindEmailExists);
            const findPhoneExists = Customer.findOne(conditionFindPhoneExists);

            const [doFindEmailExists, doFindPhoneExists] = await Promise.all([findEmailExists, findPhoneExists]);

            const errors = [];
            if (doFindEmailExists) {
                errors.push('Email đã tồn tại');
            }
            if (doFindPhoneExists) {
                errors.push('Số điện thoại đã tồn tại');
            }

            if (errors.length > 0) {
                return res.send(200, { message: `Cập nhật khách hàng thất bại, ${errors}` })
            }

            const newPassword = await hashPassword(dataUpdate.password);

            dataUpdate = {
                ...dataUpdate,
                password: newPassword,
            };

            const updateCustomer = await Customer.findOneAndUpdate(
                conditionFind,
                dataUpdate,
                { new: true },
            ).select('-password');

            if (!updateCustomer) {
                return res.send(200, { message: `Không tìm thấy khách hàng có ID: ${id}` })
            }

            return res.send(200, { message: "Cập nhật khách hàng thành công", payload: updateCustomer })
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Cập nhật khách hàng thất bại", errors: err.message });
        }
    },

    deleted: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: false,
            };

            const result = await Customer.findOneAndUpdate(
                conditionFind,
                { isDeleted: true },
                { new: true },
            ).select('-password');

            if (!result) {
                return res.send(200, { message: `Không tìm thấy khách hàng có ID: ${id}` });
            }

            return res.send(200, { message: "Xóa khách hàng thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Xóa khách hàng thất bại", error: err.message })
        }
    },

    restore: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: true,
            }

            const result = await Customer.findOneAndUpdate(
                conditionFind,
                { isDeleted: false },
                { new: true },
            ).select('-password');

            if (!result) {
                return res.send(200, { message: `khách hàng có ID: ${id} không tìm thấy hoặc đã khôi phục rồi` });
            }

            return res.send(200, { message: "Khôi phục khách hàng thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Khôi phục khách hàng thất bại", error: err.message });
        }
    },
};