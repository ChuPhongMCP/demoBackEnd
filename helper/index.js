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

module.exports = {
    validateSchema,
    hashPassword,
    fuzzySearch,
};
