const bcrypt = require('bcryptjs');

const validateSchema = (schema) => async (req, res, next) => { // thực thi việc xác thực
    try {
        await schema.validate(
            {
                body: req.body,
                query: req.query,
                params: req.params,
            },
            {
                abortEarly: false,
            }
        );
        return next();
    } catch (err) {
        console.log('««««« err »»»»»', err);
        return res.status(200).json({ type: err.name, errors: err.errors, provider: "YUP" });
    }
};

const hashPassword = async (newPassword) => {
    try {
        // generate salt key
        const salt = await bcrypt.genSalt(10); // 10 ký tự
        // generate password = salt key + hash key
        const hashPass = await bcrypt.hash(newPassword, salt);

        return hashPass;
    } catch (err) {
        throw new Error(err);
    }
};

const fuzzySearch = (text) => {
    const regex = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    return new RegExp(regex, 'gi');
};

const getQueryDateTime = (from, to, type = 'IN') => {
    fromDate = new Date(from);

    const tmpToDate = new Date(to);
    toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));

    let query = {};

    if (type === 'IN') {
        const compareFromDate = { $gte: ['$createdDate', fromDate] };
        const compareToDate = { $lt: ['$createdDate', toDate] };

        query = {
            $expr: { $and: [compareFromDate, compareToDate] },
        };
    } else {
        const compareFromDate = { $lt: ['$createdDate', fromDate] };
        const compareToDate = { $gt: ['$createdDate', toDate] };

        query = {
            $expr: { $or: [compareFromDate, compareToDate] },
        };
    }

    return query;
};

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index += 1) {
        await callback(array[index], index, array); // eslint-disable-line
    }
};

module.exports = {
    validateSchema,
    hashPassword,
    fuzzySearch,
    getQueryDateTime,
    asyncForEach,
};
