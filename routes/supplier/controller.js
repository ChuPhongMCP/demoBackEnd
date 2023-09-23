const bcrypt = require('bcryptjs');

const { Supplier } = require('../../models');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const results = await Supplier.find({
                isDeleted: false,
            });

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

            const results = await Supplier.findOne(conditionFind);

            if (!results) {
                return res.send(200, { message: `Không tìm thấy nhà cung cấp nào có ID là: ${id}` });
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

            const getEmailExits = Supplier.findOne({ email });
            const getPhoneExits = Supplier.findOne({ phoneNumber });

            const [doGetEmailExits, doGetPhoneExits] = await Promise.all([getEmailExits, getPhoneExits]);

            const errors = [];
            if (doGetEmailExits) errors.push(' Email đã tồn tại');
            if (doGetPhoneExits) errors.push(' Số điện thoại đã tồn tại');

            if (errors.length > 0) {
                return res.send(200, {
                    message: `Thêm nhà cung cấp không thành công, ${errors}`,
                });
            }

            const newItem = new Supplier(data);

            const result = await newItem.save();

            return res.send(200, { message: 'Thêm nhà cung cấp thành công', payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Thêm nhà cung cấp thất bại", errors: err.message });
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const dataUpdate = req.body;

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

            const findEmailExists = Supplier.findOne(conditionFindEmailExists);
            const findPhoneExists = Supplier.findOne(conditionFindPhoneExists);

            const [doFindEmailExists, doFindPhoneExists] = await Promise.all([findEmailExists, findPhoneExists]);

            const errors = [];
            if (doFindEmailExists) {
                errors.push(' Email đã tồn tại');
            }
            if (doFindPhoneExists) {
                errors.push(' Số điện thoại đã tồn tại');
            }

            if (errors.length > 0) {
                return res.send(200, { message: `Cập nhật nhà cung cấp thất bại, ${errors}` })
            }

            const updateSupplier = await Supplier.findOneAndUpdate(
                conditionFind,
                dataUpdate,
                { new: true },
            );

            if (!updateSupplier) {
                return res.send(200, { message: `Không tìm thấy nhà cung cấp có ID: ${id}` })
            }

            return res.send(200, { message: "Cập nhật nhà cung cấp thành công", payload: updateSupplier })
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Cập nhật nhà cung cấp thất bại", errors: err.message });
        }
    },

    deleted: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: false,
            };

            const result = await Supplier.findOneAndUpdate(
                conditionFind,
                { isDeleted: true },
                { new: true },
            );

            if (!result) {
                return res.send(200, { message: `Không tìm thấy nhà cung cấp có ID: ${id}` });
            }

            return res.send(200, { message: "Xóa nhà cung cấp thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Xóa nhà cung cấp thất bại", error: err.message })
        }
    },

    restore: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: true,
            }

            const result = await Supplier.findOneAndUpdate(
                conditionFind,
                { isDeleted: false },
                { new: true },
            );

            if (!result) {
                return res.send(200, { message: `nhà cung cấp có ID: ${id} không tìm thấy hoặc đã khôi phục rồi` });
            }

            return res.send(200, { message: "Khôi phục nhà cung cấp thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Khôi phục nhà cung cấp thất bại", error: err.message });
        }
    },
};
