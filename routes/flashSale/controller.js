const { FlashSale, Product } = require('../../models');
const { fuzzySearch, asyncForEach } = require('../../helper');
const { insertDocuments } = require('../../helper/MongoDbHelper');
// const ObjectId = require('mongodb').ObjectId;

module.exports = {
  getAll: async (req, res, next) => { // NOTE

    try {
      const { page, pageSize } = req.query;

      const total = await FlashSale.countDocuments();

      const limit = pageSize || total;
      
      const skip = limit * page - limit || 0;

      let results = await FlashSale.find()
        .populate('product')
        .skip(skip)
        .limit(limit)
      // .lean();

      const numOfShow = results.length;

      return res.send(200, {
        statusCode: 200,
        total,
        numOfShow,
        page: parseInt(page || 1),
        pageSize: parseInt(pageSize || limit),
        payload: results,
      });
    } catch (err) {
      return res.send(500, {
        statusCode: 500,
        message: "Internal Server Error",
        errors: err.message,
      });
    }
  },

  searchForOrder: async (req, res, next) => {
    try {
      const { query } = req.query;
      let conditionFind = { isDeleted: false };

      if (query) {
        const ObjectId = require('mongoose').Types.ObjectId;

        if (ObjectId.isValid(query)) {
          conditionFind = {
            ...conditionFind,
            _id: query,
          }
        } else {
          conditionFind = {
            ...conditionFind,
            name: fuzzySearch(query),
          }
        }

        // const objId = new ObjectId(!ObjectId.isValid(query) ? "123456789012" : query);

        // conditionFind = {
        //   ...conditionFind,
        //   $or: [{ _id: objId }, { name: fuzzySearch(query) }],
        // }
      }

      console.log('««««« conditionFind »»»»»', conditionFind);

      const result = await FlashSale.find(conditionFind)
        .populate('category')
        .populate('supplier');

      res.send(200, {
        message: "Tìm kiếm thành công",
        payload: result,
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.send(404, {
        message: "Không tìm thấy",
        errors: err.message,
      })
    }
  },

  search: async (req, res, next) => {
    try {
      const { id, name, categoryId, priceStart, priceEnd, supplierId } = req.query;
      const conditionFind = { isDeleted: false };

      if (id) {
        conditionFind._id = id;
      };

      if (name) conditionFind.name = fuzzySearch(name);

      if (categoryId) {
        conditionFind.categoryId = categoryId;
      };

      if (supplierId) {
        conditionFind.supplierId = supplierId;
      };

      if (priceStart && priceEnd) { // 20 - 50
        const compareStart = { $lte: ['$price', parseFloat(priceEnd)] }; // '$field'
        const compareEnd = { $gte: ['$price', parseFloat(priceStart)] };
        conditionFind.$expr = { $and: [compareStart, compareEnd] };
      } else if (priceStart) {
        conditionFind.price = { $gte: parseFloat(priceStart) };
      } else if (priceEnd) {
        conditionFind.price = { $lte: parseFloat(priceEnd) };
      }

      console.log('««««« conditionFind »»»»»', conditionFind);

      const result = await FlashSale.find(conditionFind)
        .populate('category')
        .populate('supplier');

      res.send(200, {
        message: "Tìm kiếm thành công",
        payload: result,
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.send(404, {
        message: "Không tìm thấy",
        errors: err.message,
      })
    }
  },

  largeSearch: async (req, res, next) => {
    try {
      const { name, categoryId, priceStart, priceEnd, supplierId } = req.body;
      const conditionFind = { isDeleted: false };

      if (name) conditionFind.name = fuzzySearch(name);

      if (categoryId) {
        conditionFind.categoryId = categoryId;
      };

      if (supplierId) {
        conditionFind.supplierId = supplierId;
      };

      if (priceStart && priceEnd) { // 20 - 50
        const compareStart = { $lte: ['$price', parseFloat(priceEnd)] }; // '$field'
        const compareEnd = { $gte: ['$price', parseFloat(priceStart)] };
        conditionFind.$expr = { $and: [compareStart, compareEnd] };
      } else if (priceStart) {
        conditionFind.price = { $gte: parseFloat(priceStart) };
      } else if (priceEnd) {
        conditionFind.price = { $lte: parseFloat(priceEnd) };
      }

      console.log('««««« conditionFind »»»»»', conditionFind);

      const result = await FlashSale.find(conditionFind)
        .populate('category')
        .populate('supplier');

      res.send(200, {
        message: "Tìm kiếm thành công",
        payload: result,
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.send(404, {
        message: "Không tìm thấy",
        errors: err.message,
      })
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;

      let result = await FlashSale.findOne({
        _id: id,
        isDeleted: false,
      })
        .populate('category')
        .populate('supplier');

      if (result) {
        return res.send(200, { message: "Tìm kiếm thành công", payload: result });
      }

      return res.status(200).send({ message: `Không tìm thấy sản phẩm có ID: ${id}` });
    } catch (err) {
      res.status(500).json({
        message: 'Tìm kiếm thất bại',
        errors: err.message,
      });
    }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;

      let errors = [];

      await asyncForEach(data, async (item) => {
        const product = await Product.findOne({
          _id: item.productId,
          isDeleted: false,
        });

        if (!product) errors.push(` Product ${item.productId} is not available !!!,`);

        if (product && product.stock < item.stock) errors.push(`Stock of product ${item.productId} is invalid !!!,`);
      
        const flaseSale = await FlashSale.findOne({
          productId: item.productId,
        });

        if (flaseSale) {
          errors.push(` Product ${item.productId} is existed on Flash Sale model !!!,`);
        }
      });

      if (errors.length > 0) {
        return res.send(400, {
          statusCode: 400,
          message: "Add products failed",
          errors,
        });
      }

      // const existProductId = await Product.findOne({
      //   _id: data.productId,
      //   isDeleted: false,
      // });

      // if (!existProductId) {
      //   return res.send(400, {
      //     statusCode: 400,
      //     message: "Add product failed, productId does not exist in products model",
      //   });
      // }

      // const newRecord = new FlashSale(data);

      // let result = await newRecord.save();

      let result = await insertDocuments(data, 'FlashSale');

      await asyncForEach(result, async (item) => {
        await Product.findOneAndUpdate(
          { _id: item.productId },
          { isFlashSale: true }
        );
      });

      return res.send(200, {
        statusCode: 200,
        message: "Add products success",
        payload: result,
      });
    } catch (err) {
      return res.send(500, {
        statusCode: 500,
        message: "Internal server error",
        error: err.message,
      });
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const dataUpdate = req.body;

      // // Check if the product exists and is not deleted
      // const product = await FlashSale.findOne({ _id: id, isDeleted: false });

      // console.log('««««« product »»»»»', product);

      // if (!product) {
      //   return res.status(404).json({ message: `Không tìm thấy sản phẩm nào có ID: ${id}` });
      // }

      // // Check if the supplier exists and is not deleted
      // if (product.supplierId !== dataUpdate.supplierId) {
      //   const supplier = await Supplier.findOne({ _id: dataUpdate.supplierId, isDeleted: false });

      //   if (!supplier) {
      //     return res.status(400).json({ message: `Supplier ${dataUpdate.supplierId} không khả dụng` });
      //   }
      // }

      // // Check if the category exists and is not deleted
      // if (product.categoryId !== dataUpdate.categoryId) {
      //   const category = await Category.findOne({ _id: dataUpdate.categoryId, isDeleted: false });

      //   if (!category) {
      //     return res.status(400).json({ message: `Category ${dataUpdate.categoryId} không khả dụng` });
      //   }
      // }

      const findSupplier = Supplier.findOne({ _id: dataUpdate.supplierId, isDeleted: false });
      const findCategory = Category.findOne({ _id: dataUpdate.categoryId, isDeleted: false });

      const [doFindSupplier, doFindCategory] = await Promise.all([findSupplier, findCategory]);

      const errors = [];
      if (!doFindSupplier) {
        errors.push(' Nhà cung cấp không khả dụng');
      }
      if (!doFindCategory) {
        errors.push(' Danh mục không khả dụng');
      }

      if (errors.length > 0) {
        return res.send(200, { message: `Cập nhật sản phẩm thất bại,${errors}` })
      }

      // Update the product
      const updatedFlashSale = await FlashSale.findOneAndUpdate(
        { _id: id, isDeleted: false },
        dataUpdate,
        { new: true }
      );

      if (updatedFlashSale) {
        return res.status(200).json({
          message: "Cập nhật sản phẩm thành công",
          payload: updatedFlashSale,
        });
      }

      return res.status(404).json({ message: `Không tìm thấy sản phẩm có ID: ${id}` });
    } catch (error) {
      console.log('««««« error »»»»»', error);
      return res.send(500, {
        message: "Có lỗi",
        error,
      });
    }
  },

  softDelete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const conditionFind = {
        _id: id,
        isDeleted: false,
      }

      const result = await FlashSale.findOneAndUpdate(
        conditionFind,
        { isDeleted: true },
        { new: true },
      );

      if (result) {
        return res.send(200, {
          message: "Xóa thành công",
          payload: result,
        });
      }

      return res.send(404, {
        message: `Không tìm thấy sản phẩm có ID: ${id}`,
      });
    } catch (err) {
      return res.send(500, {
        message: "Thất bại",
        errors: err.message,
      });
    }
  },

  restore: async (req, res, next) => {
    try {
      const { id } = req.params;

      const conditionFind = {
        _id: id,
        isDeleted: true,
      }

      const result = await FlashSale.findOneAndUpdate(
        conditionFind,
        { isDeleted: false },
        { new: true },
      );

      if (result) {
        return res.send(200, {
          message: "Khôi phục thành công",
          payload: result,
        });
      }

      return res.send(404, {
        message: `Sản phẩm có ID: ${id} không tìm thấy hoặc đã khôi phục rồi`,
      });
    } catch (err) {
      return res.send(500, {
        message: "Thất bại",
        errors: err.message,
      });
    }
  },
};
