const bcrypt = require('bcryptjs');

const { KeySearch } = require('../../models');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const results = await KeySearch.find({
                isDeleted: false,
            });

            return res.send(200, { message: "Tìm kiếm thành công", payload: results });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Tìm kiếm thất bại", errors: err.message });
        }
    },

    create: async (req, res, next) => {
        try {
            const data = req.body;

            const { keyWork } = data;

            const getKeyWorkExits = await KeySearch.findOne({ keyWork });

            const errors = [];
            if (getKeyWorkExits) errors.push(' KeyWork đã tồn tại');

            if (errors.length > 0) {
                return res.status(200).json({
                    message: `Thêm keyWork không thành công, ${errors}`,
                });
            }

            const newItem = new KeySearch(data);

            const result = await newItem.save();

            return res.send(200, { message: 'Thêm keyWork thành công', payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Thêm keyWork thất bại", errors: err.message });
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const dataUpdate = req.body;

            const { keyWork } = dataUpdate;

            const conditionFind = {
                _id: id,
                isDeleted: false,
            }
            const conditionFindKeyWorkExists = {
                _id: { $ne: id },
                keyWork,
            };

            const findKeyWorkExists = await KeySearch.findOne(conditionFindKeyWorkExists);

            const errors = [];
            if (findKeyWorkExists) {
                errors.push(' KeyWork đã tồn tại');
            }

            if (errors.length > 0) {
                return res.send(200, { message: `Cập nhật keyWork thất bại, ${errors}` })
            }

            const updateKeySearch = await KeySearch.findOneAndUpdate(
                conditionFind,
                dataUpdate,
                { new: true },
            );

            if (!updateKeySearch) {
                return res.send(200, { message: `Không tìm thấy keyWork có ID: ${id}` })
            }

            return res.send(200, { message: "Cập nhật keyWork thành công", payload: updateKeySearch })
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Cập nhật keyWork thất bại", errors: err.message });
        }
    },

    deleted: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: false,
            };

            const result = await KeySearch.findOneAndUpdate(
                conditionFind,
                { isDeleted: true },
                { new: true },
            );

            if (!result) {
                return res.send(200, { message: `Không tìm thấy keyWork có ID: ${id}` });
            }

            return res.send(200, { message: "Xóa keyWork thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Xóa keyWork thất bại", error: err.message });
        }
    },

    restore: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: true,
            };

            const result = await KeySearch.findOneAndUpdate(
                conditionFind,
                { isDeleted: false },
                { new: true },
            );

            if (!result) {
                return res.send(200, { message: `keyWork có ID: ${id} không tìm thấy hoặc đã khôi phục rồi` });
            }

            return res.send(200, { message: "Khôi phục keyWork thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Khôi phục keyWork thất bại", error: err.message });
        }
    },
};
