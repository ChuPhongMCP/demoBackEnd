const { Product, Category, Supplier } = require('../../models');
const { fuzzySearch } = require('../../helper');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const moment = require('moment-timezone');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
});

function generateUniqueFileName(originalname) {
  const timestamp = Date.now();
  const randomChars = Math.random().toString(36).substring(2, 15);
  return `${originalname.split(".")[0]}-${timestamp}-${randomChars}`;
}

module.exports = {
  getAll: async (req, res, next) => { // NOTE

    try {
      const { page, pageSize, sort } = req.query;

      const conditionFind = { isDeleted: false };

      const converSort = +sort;

      const total = await Product.countDocuments(conditionFind);

      const limit = pageSize || total;
      // const skip = limit * (page - 1) || 0;
      const skip = limit * page - limit || 0;

      //page = 1, pageSize = 2, limit = 2, skip = 0
      //page = 2, pageSize = 2, limit = 2, skip = 2
      //page = 3, pageSize = 2, limit = 2, skip = 4
      //page = 4, pageSize = 2, limit = 2, skip = 6

      let results = await Product.find(conditionFind)
        .skip(skip)
        .limit(limit)
        .sort({ createDate: converSort })
      // .lean();

      const numOfShow = results.length;

      return res.send(200, { total, numOfShow, page: parseInt(page || 1), pageSize: parseInt(pageSize || limit), payload: results, });
    } catch (err) {
      return res.send(404, {
        message: "Không tìm thấy",
        errors: err.message,
      });
    }
  },

  search: async (req, res, next) => {
    try {
      const { name, page, pageSize, sort } = req.query;

      const conditionFind = { isDeleted: false };

      const converSort = +sort;

      const total = await Product.countDocuments(conditionFind);

      const limit = pageSize || total;

      const skip = limit * page - limit || 0;

      if (name) conditionFind.name = fuzzySearch(name);

      const results = await Product.find(conditionFind)
        .skip(skip)
        .limit(limit)
        .sort({ createDate: converSort })

      const numOfShow = results.length;

      return res.send(200, { total, numOfShow, page: parseInt(page || 1), pageSize: parseInt(pageSize || limit), payload: results, });
    } catch (error) {
      console.log('««««« error »»»»»', error);
      return res.status(500).json({ message: "Internal Server Error", errors: error.message });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;

      let result = await Product.findOne({
        _id: id,
        isDeleted: false,
      })

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

  upImageHeader: async (req, res, next) => {
    upload.single('imageHeader')(req, res, async (err) => {
      try {
        const fileName = generateUniqueFileName(req.file.originalname)

        const S3 = new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });

        await S3.send(
          new PutObjectCommand({
            Body: req.file.buffer,
            Bucket: 'demobackend',
            Key: fileName,
            ContentType: req.file.mimetype,
          })
        );

        const url = `${process.env.R2_URL}/${fileName}`

        return res.send(200, {
          message: "success",
          payload: url,
        });
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.send(500, {
          message: "Internal server error",
          error,
        });
      }
    })
  },

  upImageHD: async (req, res, next) => {
    upload.single('imageHD')(req, res, async (err) => {
      try {
        const fileName = generateUniqueFileName(req.file.originalname)

        const S3 = new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });

        await S3.send(
          new PutObjectCommand({
            Body: req.file.buffer,
            Bucket: 'demobackend',
            Key: fileName,
            ContentType: req.file.mimetype,
          })
        );

        const url = `${process.env.R2_URL}/${fileName}`

        return res.send(200, {
          message: "success",
          payload: url,
        });
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.send(500, {
          message: "Internal server error",
          error,
        });
      }
    })
  },

  upImageList: async (req, res, next) => {
    upload.array('imageList', 4)(req, res, async (err) => {
      try {
        let listUrl = [];

        const S3 = new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });

        const listFiles = req.files.reduce((prev, file) => {
          prev.push({
            Body: file.buffer,
            Bucket: 'demobackend',
            Key: generateUniqueFileName(file.originalname),
            ContentType: file.mimetype,
          });

          return prev;
        }, []);

        await Promise.all(listFiles.map(async (file) => {
          try {
            const params = {
              Body: file.Body,
              Bucket: file.Bucket,
              Key: file.Key,
              ContentType: file.ContentType,
            };

            await S3.send(new PutObjectCommand(params));

            listUrl.push(`${process.env.R2_URL}/${file.Key}`);
          } catch (error) {
            console.error(`Error uploading file ${file.Key} to S3:`, error);
          }
        }));

        return res.send(200, {
          message: "success",
          payload: listUrl,
        });
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.send(500, {
          message: "Internal server error",
          error,
        });
      }
    })
  },

  create: async (req, res, next) => {
    try {
      const data = req.body

      const currentDateTime = moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');

      const newItem = new Product({
        ...data,
        createDate: currentDateTime,
      });

      const result = await newItem.save();

      return res.send(200, { message: "Added Success", payload: result });
    } catch (error) {
      console.log('««««« error »»»»»', error);
      return res.send(500, {
        message: "Internal server error",
        error,
      });
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const dataUpdate = req.body;

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
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        dataUpdate,
        { new: true }
      );

      if (updatedProduct) {
        return res.status(200).json({
          message: "Cập nhật sản phẩm thành công",
          payload: updatedProduct,
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

      const result = await Product.findOneAndUpdate(
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

      const result = await Product.findOneAndUpdate(
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
