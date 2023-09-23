const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const bcrypt = require('bcryptjs');

const employeeSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Tên không được bỏ trống'],
            maxLength: [50, 'Tên không được vượt quá 50 ký tự'],
        },
        lastName: {
            type: String,
            required: [true, 'Họ không được bỏ trống'],
            maxLength: [50, 'Họ không được vượt quá 50 ký tự'],
        },
        phoneNumber: {
            type: String,
            maxLength: [50, 'Số điện thoại không được vượt quá 50 ký tự'],
            validate: {
                validator: function (value) {
                    const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
                    return phoneRegex.test(value);
                },
                // message: `{VALUE} không phải là số điện thoại hợp lệ!`,
                message: (props) => `${props.value} không phải là số điện thoại hợp lệ!`,
            },
            unique: [true, 'Số điện thoại không được trùng'],
        },
        address: {
            type: String,
            required: [true, 'Địa chỉ không được bỏ trống'],
            maxLength: [500, 'Địa chỉ không được vượt quá 500 ký tự'],
            // unique: [true, 'Địa chỉ không được trùng'],
        },
        email: {
            type: String,
            validate: {
                validator: function (value) {
                    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                    return emailRegex.test(value);
                },
                // message: `{VALUE} không đúng định dạng email`,
                message: (props) => `${props.value} không đúng định dạng email`,
            },
            required: [true, 'Email không được bỏ trống'],
            maxLength: [50, 'Email không được vượt quá 50 ký tự'],
            unique: [true, 'Email không được trùng'],
        },
        birthday: { type: Date },
        isDeleted: {
            type: Boolean,
            default: false,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minLength: [6, 'Password không được ít hơn 6 ký tự'],
            maxLength: [16, 'Password không được vượt quá 16 ký tự'],
        }
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

// Virtuals
employeeSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

// Config
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });
//
employeeSchema.plugin(mongooseLeanVirtuals);

employeeSchema.pre('save', async function (next) {
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

employeeSchema.methods.isValidPass = async function (pass) {
    try {
        return await bcrypt.compare(pass, this.password);
    } catch (err) {
        throw new Error(err);
    }
};

const Employee = model('employees', employeeSchema);
module.exports = Employee;
