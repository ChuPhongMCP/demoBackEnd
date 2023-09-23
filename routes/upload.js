const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Media } = require('../models');

const upload = require('../middlewares/fileMulter');
const {
  insertDocument,
  updateDocument,
  findDocument,
  insertDocuments,
} = require('../helper/MongoDbHelper');

const TYPE = {
  SMALL_IMG: "smallImg",
  LARGE_IMG: "largeImg",
}

router.post('/upload-single/:objid', (req, res, next) =>
  upload.single('image')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } else {
        // const response = await insertDocument(
        //   {
        //     location: req.file.path,
        //     name: req.file.filename,
        //     employeeId: req.user._id,
        //     size: req.file.size,
        //   },
        //   'Media',
        // );
        const media = new Media({
          location: req.file.path,
          name: req.file.filename,
          employeeId: req.user._id,
          objectId: req.params.objid,
          size: req.file.size,
          type: TYPE.LARGE_IMG,
        });

        const response = await media.save();

        res.status(200).json({ message: "Tải lên thành công", payload: response });
      }
    } catch (error) {
      console.log('««««« error »»»»»', error);
      res.status(500).json({ message: "Upload file error", error });
    }
  })
);

router.post('/upload-multiple/:objid', (req, res) =>
  upload.array('images', 4)(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ type: 'MulterError', err: err });
      } else if (err) {
        res.status(500).json({ type: 'UnknownError', err: err });
      } else {
        const dataInsert = req.files.reduce((prev, file) => {
          prev.push({
            name: file.filename,
            location: file.path,
            size: file.size,
            employeeId: req.user._id,
            objectId: req.params.objid,
            type: TYPE.SMALL_IMG,
          });
          return prev;
        }, []);

        let response = await insertDocuments(dataInsert, 'Media');

        res.status(200).json({ message: "Tải lên thành công", payload: response });
      }
    } catch (error) {
      console.log('««««« error »»»»»', error);
      res.status(500).json({ message: "Upload files error", error });
    }
  })
);

router.get('/getLargeImg/:id', async (req, res, next) => {
  const { id } = req.params;
  const payload = await Media.findOne({ objectId: id, type: TYPE.LARGE_IMG })
    .populate('creator');

  if (payload) return res.status(200).json({ payload });

  return res.status(400).json({ message: "Không tìm thấy" });
});

router.get('/getSmallImg/:id', async (req, res, next) => {
  const { id } = req.params;
  const payload = await Media.find({ objectId: id, type: TYPE.SMALL_IMG })
    .populate('object')
    .populate('creator');;

  if (payload?.length > 0) return res.status(200).json({ payload });

  return res.status(400).json({ message: "Không tìm thấy" });
});

router.post('/update-single/:objid', async (req, res) => {
  const { objid } = req.params;

  const found = await Media.findOne({ objectId: objid, type: TYPE.LARGE_IMG });
  if (found) {
    upload.single('image')(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          return res.status(500).json({ type: 'MulterError', err: err });
        } else if (err) {
          return res.status(500).json({ type: 'UnknownError', err: err });
        } else {
          const response = await updateDocument(
            { objectId: objid, type: TYPE.LARGE_IMG },
            {
              location: req.file.path,
              name: req.file.filename,
              employeeId: req.user._id,
              size: req.file.size,
              type: TYPE.LARGE_IMG
            },
            'Media',
          );

          return res.status(200).json({ message: "Update hình ảnh thành công", payload: response });
        }
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.status(500).json({ message: "Update hình ảnh thất bại", error });
      }
    });
  } else {
    upload.single('image')(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          return res.status(500).json({ type: 'MulterError', err: err });
        } else if (err) {
          return res.status(500).json({ type: 'UnknownError', err: err });
        } else {
          const media = new Media({
            location: req.file.path,
            name: req.file.filename,
            employeeId: req.user._id,
            objectId: objid,
            size: req.file.size,
            type: TYPE.LARGE_IMG,
          });

          const response = await media.save();

          return res.status(200).json({ message: "Tải lên thành công", payload: response });
        }
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.status(500).json({ message: "Upload file error", error });
      }
    });
  }
});

router.post('/update-multiple/:objid', async (req, res) => {
  const { objid } = req.params;

  const found = await Media.find({ objectId: objid, type: TYPE.SMALL_IMG });

  if (found) {
    upload.array('images', 4)(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          return res.status(500).json({ type: 'MulterError', err: err });
        } else if (err) {
          return res.status(500).json({ type: 'UnknownError', err: err });
        } else {
          await Media.deleteMany(
            {
              objectId: objid,
              type: TYPE.SMALL_IMG,
            }
          );

          const dataInsert = req.files.reduce((prev, file) => {
            prev.push({
              name: file.filename,
              location: file.path,
              size: file.size,
              employeeId: req.user._id,
              objectId: objid,
              type: TYPE.SMALL_IMG,
            });

            return prev;
          }, []);

          let response = await insertDocuments(dataInsert, 'Media');

          return res.status(200).json({ message: "Update thành công", payload: response });
        }
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.status(500).json({ message: "Update thất bại", error });
      }
    });
  } else {
    upload.array('images', 4)(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          return res.status(500).json({ type: 'MulterError', err: err });
        } else if (err) {
          return res.status(500).json({ type: 'UnknownError', err: err });
        } else {
          const dataInsert = req.files.reduce((prev, file) => {
            prev.push({
              name: file.filename,
              location: file.path,
              size: file.size,
              employeeId: req.user._id,
              objectId: objid,
              type: TYPE.SMALL_IMG,
            });
            return prev;
          }, []);

          let response = await insertDocuments(dataInsert, 'Media');

          return res.status(200).json({ message: "Tải lên thành công", payload: response });
        }
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.status(500).json({ message: "Tải lên thất bại", error });
      }
    });
  }
});

module.exports = router;
