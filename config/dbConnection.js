const mongoose = require('mongoose');

// in this step i trying to connect with the  Cluster-nodeCourse {not the project database}

const connectDB = async () => {
    try {
        await mongoose
            .connect(process.env.DB_URL)
        // .then(console.log('MongoDB Database connected'));
    } catch (error) {
        // console.log('Database connection error: ', error);
    }
};

module.exports = connectDB;
