# 📚 CourseApp Server

Welcome to the backend server of **CourseApp** — a Node.js API designed to manage user authentication, course management, password resets, and email verifications.

---

## 🚀 Features

- 🔐 User Authentication (Sign up, Login, Reset Password)
- 📚 Course Management (Create, Edit, Delete Courses)
- 👥 Users Management (Create, Edit, Delete Users)
- 📧 Email Verification & Password Reset Emails
- 🌍 RESTful API following best practices
- 🛡️ Secure with environment variables
- 📨 Nodemailer Integration for sending Emails

---

## 🛠️ Tech Stack & Libraries

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web framework for Node.js.
- **MongoDB** + **Mongoose**: NoSQL database with ORM.
- **Nodemailer**: Sending emails via Gmail SMTP.
- **EJS**: Dynamic email templates.
- **dotenv**: Manage environment variables.
- **html-to-text**: Convert HTML emails to plain text.
- **bcryptjs**: Password hashing for security.
- **jsonwebtoken**: Authentication using JWT.
- **express-validator**: Validate and sanitize request bodies.
- **cookie-parser**: Parse cookies from HTTP requests.
- **cors**: Enable cross-origin requests.
- **validator**: Validate user input fields.
- **module-alias**: Simplify import paths.

---

## 📦 Installation

```bash
git clone https://github.com/abdonaser/courseApp_server.git
cd courseApp_server
npm install
```

---

## 🧪 Running Locally

1. Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=3000
DB_URL=mongodb+srv://YOUR_DB_URL
ACCESS_TOKEN_SECRET=your_ACCESS_jwt_secret_key
REFRESH_TOKEN_SECRET=your_REFRESH_jwt_secret_key
EMAIL_USERNAME_Gmail=your_gmail_email
EMAIL_PASSWORD_Gmail=your_gmail_app_password
EMAIL_HOST_Gmail=smtp.gmail.com
EMAIL_PORT=465
NODE_ENV=development
```

> ⚡ **Important:** Use a [Gmail App Password](https://support.google.com/accounts/answer/185833?hl=en) instead of your personal Gmail password.

2. Start the development server:

```bash
npm run start
```

(Default setup uses **nodemon** for automatic reloading.)

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.

---

## 💬 Contact

- **Developer:** [Abdo Naser](https://github.com/abdonaser)
- **LinkedIn:** [Abdelrahman Naser Muhammed](https://www.linkedin.com/in/abdelrahman-naser-muhammed)
