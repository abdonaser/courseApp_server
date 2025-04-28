const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },

    },
    { timestamps: true }
);

const courseModel = mongoose.model('courses', userSchema);

module.exports = courseModel;