# 🛡️ CyberAware Platform

CyberAware is a comprehensive cybersecurity education hub designed to teach students about web security, vulnerabilities, and digital protection strategies.

## ✨ Features
- **Educational Modules**: DNS, HTTPS, Phishing, SQL Injection, XSS, and more.
- **Interactive Quiz**: 10 dynamic questions with instant feedback and score tracking.
- **Full-Stack Integration**: Real user registration, login, and contact form handling.
- **SQLite Persistence**: Secure local database for all platform data.
- **Accessible Design**: Built with semantic HTML5 and WCAG AA compliance.

---

## 🚀 How to Run Locally

Follow these steps to get the platform running on your machine:

### 1. Prerequisites
Ensure you have **Node.js** installed (v18 or higher recommended).
- [Download Node.js](https://nodejs.org/)

### 2. Setup the Project
1. Open your terminal or command prompt.
2. Navigate to the project root directory:
   ```bash
   cd path/to/cyberaware
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

### 3. Start the Server
Run the following command to launch the Node.js backend:
```bash
node server.js
```

### 4. Access the Application
Once the server is running, open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript.
- **Backend**: Node.js & Express.
- **Database**: SQLite (via `sqlite3`).
- **Security**: `bcryptjs` for password hashing.

---

## 📁 Project Structure
- `/public`: Static assets (images, legacy icons).
- `/pages`: HTML sub-pages (Learn, Quiz, etc.).
- `/css`: Modular CSS stylesheets.
- `/js`: Frontend logic and API interaction.
- `/routes`: Backend API route handlers.
- `/models`: Database access logic and queries.
- `/database`: SQLite database file (`database.db`) and initialization scripts.
- `server.js`: The main entry point for the backend.

---

## 🔒 Security Note
This project uses **bcryptjs** for secure password hashing and **Prepared Statements** to prevent SQL injection. In a production environment, ensure you serve the site over **HTTPS** and use `httpOnly` secure cookies for session management.
