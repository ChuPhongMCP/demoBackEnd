const { Order, Customer, Employee, Product } = require('../../models');
const { fuzzySearch, asyncForEach } = require('../../helper');

module.exports = {
  getAll: async (req, res, next) => {

    const { status } = req.query;

    let conditionFind = {}

    if (status) {
      conditionFind = { status }
    }

    try {
      const { page, pageSize } = req.query;

      const total = await Order.countDocuments(conditionFind);

      const limit = parseInt(pageSize) || total;
      const skip = limit * (parseInt(page) - 1) || 0;
      // const skip = limit * page - limit || 0;

      //page = 1, pageSize = 2, limit = 2, skip = 0
      //page = 2, pageSize = 2, limit = 2, skip = 2
      //page = 3, pageSize = 2, limit = 2, skip = 4
      //page = 4, pageSize = 2, limit = 2, skip = 6

      let results = await Order.find(conditionFind)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'orderDetails.product',
          populate: {
            path: 'category',
            model: 'categories',
          },
        })
        .populate("customer")
      // .lean();

      const numOfShow = results.length;

      return res.send(200, {
        total,
        numOfShow,
        page: parseInt(page || 1),
        pageSize: parseInt(pageSize || limit),
        payload: results,
      });
    } catch (err) {
      return res.send(404, {
        message: "Không tìm thấy order list",
        errors: err.message,
      });
    }
  },

  getNumOfStatus: async (req, res, next) => {

    try {
      const totalWaiting = await Order.countDocuments({ status: "WAITING" });
      const totalCompleted = await Order.countDocuments({ status: "COMPLETED" });
      const totalCanceled = await Order.countDocuments({ status: "CANCELED" });
      const totalRejected = await Order.countDocuments({ status: "REJECTED" });
      const totalDelivering = await Order.countDocuments({ status: "DELIVERING" });

      return res.send(200, {
        totalWaiting,
        totalCompleted,
        totalCanceled,
        totalRejected,
        totalDelivering
      });
    } catch (err) {
      return res.send(404, {
        message: "Không tìm thấy order list",
        errors: err.message,
      });
    }
  },

  search: async (req, res, next) => {
    try {
      const { query, startDate, endDate, page, pageSize } = req.query;

      let conditionFind = {};

      if (query) {
        const ObjectId = require('mongoose').Types.ObjectId;
        const objId = new ObjectId((query.length < 12) ? "123456789012" : query);

        conditionFind = {
          ...conditionFind,
          $or: [{ _id: objId }, { status: fuzzySearch(query) }],
        }
      }

      const total = await Order.countDocuments(conditionFind);
      const limit = pageSize || total;
      const skip = limit * (page - 1) || 0;

      console.log('««««« conditionFind »»»»»', conditionFind);

      const results = await Order.find(conditionFind)
        .skip(skip)
        .limit(limit)
        .populate("customer")

      const numOfShow = results.length;

      return res.send(200, { total, numOfShow, page: parseInt(page || 1), pageSize: parseInt(pageSize || limit), payload: results });
    } catch (error) {
      return res.status(400).json({
        message: "Không tìm thấy!",
        errors: error.message,
      });
    }
  },

  // search: async (req, res, next) => {
  //   try {
  //     const { name, categoryId, priceStart, priceEnd, supplierId } = req.query;
  //     const conditionFind = { isDeleted: false };

  //     if (name) conditionFind.name = fuzzySearch(name);

  //     if (categoryId) {
  //       conditionFind.categoryId = categoryId;
  //     };

  //     if (supplierId) {
  //       conditionFind.supplierId = supplierId;
  //     };

  //     if (priceStart && priceEnd) { // 20 - 50
  //       const compareStart = { $lte: ['$price', parseFloat(priceEnd)] }; // '$field'
  //       const compareEnd = { $gte: ['$price', parseFloat(priceStart)] };
  //       conditionFind.$expr = { $and: [compareStart, compareEnd] };
  //     } else if (priceStart) {
  //       conditionFind.price = { $gte: parseFloat(priceStart) };
  //     } else if (priceEnd) {
  //       conditionFind.price = { $lte: parseFloat(priceEnd) };
  //     }

  //     console.log('««««« conditionFind »»»»»', conditionFind);

  //     const result = await Order.find(conditionFind)
  //       .populate('category')
  //       .populate('supplier');

  //     res.send(200, {
  //       message: "Tìm kiếm thành công",
  //       payload: result,
  //     });
  //   } catch (err) {
  //     console.log('««««« err »»»»»', err);
  //     return res.send(404, {
  //       message: "Không tìm thấy",
  //       errors: err.message,
  //     })
  //   }
  // },

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

      const result = await Order.find(conditionFind)
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

      let result = await Order.findOne({
        _id: id,
      })
        .populate({
          path: 'orderDetails.product',
          populate: {
            path: 'category',
            model: 'categories',
          },
        })
        .populate("customer")

      if (result) {
        return res.send(200, { message: "Tìm kiếm thành công", payload: result });
      }

      return res.status(404).send({ message: `Không tìm thấy order có ID: ${id}` });
    } catch (err) {
      return res.status(500).json({
        message: 'Tìm kiếm thất bại',
        errors: err.message,
      });
    }
  },

  searchCustomer: async (req, res, next) => {
    try {
      const { phoneNumber } = req.query;

      console.log('««««« phoneNumber »»»»»', phoneNumber);

      const result = await Customer.find({
        phoneNumber,
      })

      if (result.length > 0) {
        return res.send(200, {
          statusCode: 200,
          message: "search for success !!!",
          payload: result
        });
      }

      return res.send(404, {
        statusCode: 404,
        message: "not found !!!"
      });

    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error !!!',
        errors: error.message,
      });
    }
  },

  createCustomer: async (req, res, next) => {
    try {
      const data = req.body;

      // console.log('««««« req.body »»»»»', req.body);

      console.log('««««« data »»»»»', data);

      const { email, phoneNumber } = data;

      const getEmailExits = Customer.findOne({ email });
      const getPhoneExits = Customer.findOne({ phoneNumber });

      const [doGetEmailExits, doGetPhoneExits] = await Promise.all([getEmailExits, getPhoneExits]);

      const errors = [];
      if (doGetEmailExits) errors.push(' Email already exists');
      if (doGetPhoneExits) errors.push(' Phone Number already exists');

      if (errors.length > 0) {
        return res.status(400).json({
          statusCode: 400,
          message: `Customer creation failed, ${errors} !!!`,
        });
      }

      const newItem = new Customer(data);

      let result = await newItem.save();

      result.password = undefined;

      return res.send(200, {
        statusCode: 200,
        message: 'Create successful customers !!!',
        payload: result
      });

    } catch (error) {
      console.log('««««« error »»»»»', error);
      return res.status(500).json({
        statusCode: 500,
        message: "Internal server error !!!",
        errors: error.message
      });
    }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;

      const { customerId, employeeId, orderDetails } = data;

      const getCustomer = Customer.findOne({
        _id: customerId,
        isDeleted: false,
      });

      const getEmployee = Employee.findOne({
        _id: employeeId,
        isDeleted: false,
      });

      const [customer, employee] = await Promise.all([
        getCustomer,
        getEmployee,
      ]);

      const errors = [];

      if (!customer || customer.isDelete)
        errors.push(' The customer does not exist !!!,');

      if (!employee || employee.isDelete)
        errors.push(' Employee does not exist !!!,');

      await asyncForEach(orderDetails, async (item) => {
        const product = await Product.findOne({
          _id: item.productId,
          isDeleted: false,
        });

        if (!product) errors.push(` Product ${item.productId} is not available !!!,`);

        if (product && product.stock < item.quantity) errors.push(`Quantity of product ${item.productId} is not available !!!,`);
      });

      if (errors.length > 0) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Error',
          errors,
        });
      }

      const newRecord = new Order(data);

      const responsive = await newRecord.save();

      await asyncForEach(responsive.orderDetails, async (item) => {
        await Product.findOneAndUpdate(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      });

      const result = await Order.findOne({ _id: responsive._id })
        .populate({
          path: 'orderDetails.product',
          populate: {
            path: 'category',
            model: 'categories',
          },
        })
        .populate("customer")
        .populate("employee");

      // const result = await responsive.populate({
      //   path: 'orderDetails.product',
      //   populate: {
      //     path: 'category',
      //     model: 'categories',
      //   },
      // })
      //   .populate("customer")
      //   .execPopulate();

      return res.send(200, {
        statusCode: 200,
        message: "Create Order success !!!",
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

      // // Check if the Order exists and is not deleted
      // const Order = await Order.findOne({ _id: id, isDeleted: false });

      // console.log('««««« Order »»»»»', Order);

      // if (!Order) {
      //   return res.status(404).json({ message: `Không tìm thấy sản phẩm nào có ID: ${id}` });
      // }

      // // Check if the supplier exists and is not deleted
      // if (Order.supplierId !== dataUpdate.supplierId) {
      //   const supplier = await Supplier.findOne({ _id: dataUpdate.supplierId, isDeleted: false });

      //   if (!supplier) {
      //     return res.status(400).json({ message: `Supplier ${dataUpdate.supplierId} không khả dụng` });
      //   }
      // }

      // // Check if the category exists and is not deleted
      // if (Order.categoryId !== dataUpdate.categoryId) {
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

      // Update the Order
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: id, isDeleted: false },
        dataUpdate,
        { new: true }
      );

      if (updatedOrder) {
        return res.status(200).json({
          message: "Cập nhật sản phẩm thành công",
          payload: updatedOrder,
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

      const result = await Order.findOneAndUpdate(
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

      const result = await Order.findOneAndUpdate(
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
