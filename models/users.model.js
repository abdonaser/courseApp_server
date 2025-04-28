const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            minlength: [2, 'First name must be at least 2 characters long'],
            maxlength: [50, 'First name cannot exceed 50 characters'],
            validate: {
                validator: function (value) {
                    return /^[A-Za-z\s'-]+$/.test(value);
                },
                message: 'First name can only contain letters, spaces, hyphens, or apostrophes'
            }
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            minlength: [2, 'Last name must be at least 2 characters long'],
            maxlength: [50, 'Last name cannot exceed 50 characters'],
            validate: {
                validator: function (value) {
                    return /^[A-Za-z\s'-]+$/.test(value);
                },
                message: 'Last name can only contain letters, spaces, hyphens, or apostrophes'
            }
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [
                {
                    validator: validator.isEmail,
                    message: 'Please provide a valid email address'
                },
                {
                    validator: function (value) {
                        return value.length <= 100;
                    },
                    message: 'Email address cannot exceed 100 characters'
                }
            ]
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ['user', 'admin', 'manager'],
                message: 'Role must be one of: user, admin, or manager'
            },
            default: 'user'
        },
        password: {
            type: String,
            required: [true, 'password is required'],
            // select: false, //not shown in response

            // minlength: [8, 'password must be at least 8 characters long'],
            // maxlength: [128, 'password cannot exceed 128 characters'],
            // validate: {
            //     validator: function (value) {
            //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            //     },
            //     message: 'password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
            // },
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function (value) {
                    return value === this.password;
                },
                message: 'passwords do not match'
            }
        },
        passwordChangedAt: {
            type: Date,
            required: [false],
        },
        passwordResetCode: String,
        passwordResetExpires: Date,
        verified: {
            type: Boolean,
            default: false,
            select: true,
        },
        accountVerifyCode: String,
        accountVerifyCodeExpires: Date,
    }
)

// Mongoose middleware (pre-save hook) - Executes before saving a document

// Used when a user registers for the first time or updates their password
userSchema.pre('save', async function (next) {
    // Check if the password field was modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(this.password, salt);

        this.password = passwordHashed;
        // Remove passwordConfirm field so it doesn't get saved to the database
        this.passwordConfirm = undefined;

        return next();
    } else {
        // If password is not modified, move to the next middleware
        next();
    }
});

// Triggered only if the user updates their password
userSchema.pre('save', function (next) {
    try {
        // Skip setting passwordChangedAt if:
        // - Password was not modified
        // - Document is new (user is being created, not updated)
        if (!this.isModified('password') || this.isNew) {
            return next();
        }
        // Set passwordChangedAt to the current time minus a small offset
        // This ensures the token issued just before saving won't be invalidated
        const timeOffset = 1000; // 1 second offset
        this.passwordChangedAt = new Date(Date.now() - timeOffset);

        return next();
    } catch (e) {
        // In case of error, pass it to the next middleware
        return next(e);
    }
});

// Mongoose Mithods
userSchema.methods.correctPassword = async function (passin, userpass_fromDb) {
    return await bcrypt.compare(passin, userpass_fromDb)
}

userSchema.methods.createPasswordResetCode = async function () {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedCode = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex');

    this.passwordResetCode = hashedCode;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 mins
    return resetCode;
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};

userSchema.methods.createAccountVerifyCode = function () {
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedCode = crypto
        .createHash('sha256')
        .update(verifyCode)
        .digest('hex');

    this.accountVerifyCode = hashedCode;
    this.accountVerifyCodeExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 mins
    return verifyCode;
};


const usersModel = mongoose.model("users", userSchema)
module.exports = usersModel 