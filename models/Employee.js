const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');

const employeeSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Tên không được bỏ trống'],
            maxLength: [100, 'Tên không được vượt quá 100 ký tự'],
        },
        username: {
            type: String,
            required: [true, 'User không được bỏ trống'],
            maxLength: [100, 'User không được vượt quá 100 ký tự'],
            unique: [true, 'User không được trùng'],
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
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });
//

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
