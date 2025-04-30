const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose');
var cors = require('cors')
const cookieParser = require('cookie-parser');
const app = express()
const PORT = process.env.PORT || 3000
const connectDB = require('../config/dbConnection');
const { ERROR } = require('../utils/json_status_text');
const path = require('path');
const ejs = require('ejs');
const serverless = require('serverless-http');

//#region //MiddleWares------------------------------------------------------
require('module-alias/register');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Enable CORS with specified options to allow cross-origin requests
const corsOptions = require('../config/corsOptions');
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'Public')));
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
//#endregion ------------------------------------------------------


//#region //' Handel All Routes

// courses Routes
const coursesRoutes = require('../routes/course.routes');
app.use('/api/courses', coursesRoutes)

// Users Routes
const usersRoutes = require('../routes/user.routes')
app.use('/api/users', usersRoutes)

// Auth Routes
const AuthRoutes = require('../routes/auth.routes')
app.use('/api/auth', AuthRoutes)

// uploads Routes
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))


//#endregion

// Handling 404 errors
app.all('*', (req, res) => {
    // If the request comes from a browser
    if (req.accepts('html')) {
        res.status(404).render('404');
    }
    // If the request comes from mobile/postman
    else if (req.accepts('json')) {
        res.status(404).json({ message: '404 page not found' });
    }
    // Default response if the request comes from other sources
    else {
        res.status(404).type('txt').send('404 Not Found');
    }
});


// Global Error Handlers {errorMessage, statusCode, statusText}
app.use((error, req, res, next) => {
    return res
        .status(error.statusCode || 500)
        .json({
            status: error.statusText || ERROR,
            message: error.errorMessage || error.message || undefined,
            code: error.statusCode || 500,
            data: null
        })
})
//#endregion



let dbConnection;

const startServer = async () => {
    if (!dbConnection) {
        dbConnection = await connectDB();
    }

    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
};

// Only start server locally
if (process.env.NODE_ENV !== 'production') {
    startServer();
}


module.exports.handler = serverless(app); // Vercel will use this

//#region  Server Creation
// connectDB(); // Connect to the database

// // Don't start the server until the database connection is established
// mongoose.connection.once('open', () => {
//     app.listen(PORT, () =>
//         console.log(`Server running at http://localhost:${PORT}`)
//     );
// });

// // Log errors if the database connection fails
// mongoose.connection.on('error', (error) =>
//     console.log('Database connection error:', error)
// );

// Optional: Uncomment this line to log when the database connection is established successfully
// mongoose.connection.on('open', () =>
//     console.log('Database connected successfully')
// );
//#endregion


