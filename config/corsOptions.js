// Import the allowed origins array, which contains the list of domains allowed to access the API
const allowedOrigins = require('./allowedOrigins');

// Define the CORS configuration object
const corsOptions = {
  // Function to check if the request's origin is in the allowedOrigins list
  origin: (origin, callback) => {
    // If the origin is in the allowed list or the request has no origin (e.g., Postman or server-to-server requests)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow the request (null indicates no error, true indicates success)
      callback(null, true);
    } else {
      // Deny the request and return an error
      callback(new Error('Not Allowed By CORS'));
    }
  },
  // Enable credentials to allow cookies and authentication headers with cross-origin requests
  credentials: true,

  // Return a successful status code (200) for preflight OPTIONS requests
  optionsSuccessStatus: 200,
};

// Export the CORS configuration for use in other parts of the application
module.exports = corsOptions;
