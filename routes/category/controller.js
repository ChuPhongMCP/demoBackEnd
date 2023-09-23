const bcrypt = require('bcryptjs');

const { Category } = require('../../models');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const results = await Category.find({
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

            const results = await Category.findOne(conditionFind);

            if (!results) {
                return res.send(200, { message: `Không tìm thấy danh mục sản phẩm nào có ID là: ${id}` });
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

            const { name } = data;

            const getNameExits = await Category.findOne({ name });

            const errors = [];
            if (getNameExits) errors.push(' Danh mục sản phẩm đã tồn tại');

            if (errors.length > 0) {
                return res.status(200).json({
                    message: `Thêm danh mục sản phẩm không thành công, ${errors}`,
                });
            }

            const newItem = new Category(data);

            const result = await newItem.save();

            return res.send(200, { message: 'Thêm danh mục sản phẩm thành công', payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Thêm danh mục sản phẩm thất bại", errors: err.message });
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const dataUpdate = req.body;

            const { name } = dataUpdate;

            const conditionFind = {
                _id: id,
                isDeleted: false,
            }
            const conditionFindNameExists = {
                _id: { $ne: id },
                name,
            };

            const findNameExists = await Category.findOne(conditionFindNameExists);

            const errors = [];
            if (findNameExists) {
                errors.push(' Danh mục sản phẩm đã tồn tại');
            }

            if (errors.length > 0) {
                return res.send(200, { message: `Cập nhật danh mục sản phẩm thất bại, ${errors}` })
            }

            const updateCategory = await Category.findOneAndUpdate(
                conditionFind,
                dataUpdate,
                { new: true },
            );

            if (!updateCategory) {
                return res.send(200, { message: `Không tìm thấy danh mục sản phẩm có ID: ${id}` })
            }

            return res.send(200, { message: "Cập nhật danh mục sản phẩm thành công", payload: updateCategory })
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Cập nhật danh mục sản phẩm thất bại", errors: err.message });
        }
    },

    deleted: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: false,
            };

            const result = await Category.findOneAndUpdate(
                conditionFind,
                { isDeleted: true },
                { new: true },
            );

            if (!result) {
                return res.send(200, { message: `Không tìm thấy danh mục sản phẩm có ID: ${id}` });
            }

            return res.send(200, { message: "Xóa danh mục sản phẩm thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Xóa danh mục sản phẩm thất bại", error: err.message });
        }
    },

    restore: async (req, res, next) => {
        try {
            const { id } = req.params;

            const conditionFind = {
                _id: id,
                isDeleted: true,
            };

            const result = await Category.findOneAndUpdate(
                conditionFind,
                { isDeleted: false },
                { new: true },
            );

            if (!result) {
                return res.send(200, { message: `danh mục sản phẩm có ID: ${id} không tìm thấy hoặc đã khôi phục rồi` });
            }

            return res.send(200, { message: "Khôi phục danh mục sản phẩm thành công", payload: result });
        } catch (err) {
            console.log('««««« err »»»»»', err);
            return res.status(500).json({ message: "Khôi phục danh mục sản phẩm thất bại", error: err.message });
        }
    },
};
