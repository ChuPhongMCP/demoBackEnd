const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');

const customerSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Tên không được bỏ trống'],
            maxLength: [100, 'Tên không được vượt quá 100 ký tự'],
        },
        email: {
            type: String,
            validate: {
                validator: function (value) {
                    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                    return emailRegex.test(value);
                },
                message: `{VALUE} không đúng định dạng email`,
                // message: (props) => `{props.value} is not a valid email!`,
            },
            required: [true, 'Email không được bỏ trống'],
            maxLength: [100, 'Email không được vượt quá 100 ký tự'],
            unique: [true, 'Email không được trùng'],
        },
        isDeleted: {
            type: Boolean,
            default: false,
            required: true,
        },
        password: {
            type: String,
            required: [true, 'Password không được bỏ trống'],
            minLength: [6, 'Password không được ít hơn 6 ký tự'],
            maxLength: [16, 'Password không được vượt quá 16 ký tự'],
        }
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

// Config
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });
//

customerSchema.pre('save', async function (next) {
    try {
        // generate salt key
        const salt = await bcrypt.genSalt(10); // 10 ký tự
        // generate password = salt key + hash key
        const hashPass = await bcrypt.hash(this.password, salt);
        // override password
        this.password = hashPass;
        next();
    } catch (err) {
        next(err);
    }
});

customerSchema.methods.isValidPass = async function (pass) {
    try {
        return await bcrypt.compare(pass, this.password);
    } catch (err) {
        throw new Error(err);
    }
};

const Customer = model('customers', customerSchema);
module.exports = Customer;
