const multer = require('multer')
const { FAIL } = require('@utils/json_status_text')
const path = require('path');
const appError = require('@utils/appError')
const fs = require('fs')

// Ensure the 'uploads' directory exists, create it if not
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Configure file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save files to 'uploads' directory
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase(); // Extract file extension safely
        const fileName = `avatar-${Date.now()}${ext}`; // Unique filename
        cb(null, fileName);
    }
});

// Filter allowed file types (images only)
const fileFilter = (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMime.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = appError.create("File type not allowed. Only image files are accepted.", 400, FAIL);
        cb(err, false);
    }
};

// Create the multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Optional: limit file size to 2MB
    }
});


module.exports = upload;