// Define the list of allowed origins for cross-origin requests
// These are the domains that are permitted to access the server's resources
const allowedOrigins = [
  'http://localhost:3000', // Local development frontend URL
  'http://localhost:5000',
  // Add more origins as needed, for example:
  // 'https://your-production-domain.com',
  // 'https://another-allowed-origin.com',
];

// Export the allowedOrigins array to be used in CORS configuration
module.exports = allowedOrigins;
