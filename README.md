# 📱 Work Time Management System – Mobile App

This mobile application was developed as part of a Final Year Project (TCC) for the Software Engineering course.

The system was designed for cafés and small businesses to manage employee working hours, attendance tracking, leave requests, and administrative operations through a modern mobile application.

The application communicates with a Node.js backend API hosted online and supports Android devices, web access, and real-time integration with a MySQL database.

---

# 🚀 Technologies Used

## Frontend
- React Native
- Expo
- Expo Router
- Axios
- AsyncStorage

## Mobile Features
- Expo Document Picker
- Expo File System
- Expo Sharing
- Expo Linking

## Backend Communication
- REST API
- JWT Authentication

## Deployment & Infrastructure
- Render (Backend Hosting)
- Aiven MySQL Cloud Database

## Language
- JavaScript (ES6+)

---

# 🏗 Application Architecture

The mobile application follows a component-based architecture:

- Screens → User interface and interaction
- Services → API communication layer
- Navigation → Expo Router
- State Management → React Hooks
- Authentication → JWT + AsyncStorage
- Backend Integration → REST API

---

# 📂 Project Structure

```bash
mobile-app
│
├── app
│   ├── login.js
│   ├── register.js
│   ├── home.js
│   ├── requestLeave.js
│   ├── adminLeaveRequests.js
│   ├── adminReports.js
│   └── profile.js
│
├── services
│   └── api.js
│
├── assets
├── components
│
├── package.json
└── app.json
```

---

# 🔐 Authentication

The application uses JWT authentication.

## Features
- Secure login with email and password
- JWT token generation on backend
- Token stored locally using AsyncStorage
- Protected routes and admin authorization

Example:

```text
Authorization: Bearer TOKEN
```

---

# ⏱ Main Features

## 🔓 Authentication
- Login and registration system
- JWT-based authentication
- Secure protected routes
- Role-based access control

---

## ⏰ Clock In / Clock Out
- Register working hours in real time
- Prevent duplicate clock-in
- Automatic work duration calculation
- Daily and weekly work summaries

---

## 📊 Work Tracking
- Hours worked today
- Weekly report
- Work history
- Attendance monitoring

---

## 🏖 Leave Management

Employees can request:

- Vacation
- Day Off
- Sick Leave
- Other leave types

### Validation Features
- Date validation
- Required field validation
- Invalid request prevention

---

## 📎 Medical Certificate Upload

Sick Leave requests support:

- PDF upload
- Image upload
- Base64 conversion
- Cloudinary integration
- Document attachment storage

---

## 👨‍💼 Admin Features

Administrators can:

- View all employees
- Approve/reject leave requests
- Access uploaded documents
- Manage employees
- Generate reports
- Access admin dashboard
- Create new employees
- Promote users to admin

---

# 🌐 Online Infrastructure

## Backend API
Hosted on Render:

```text
https://worktime-backend.onrender.com
```

## Database
Hosted on Aiven MySQL Cloud.

---

# 🌍 Web Support

The application also supports web access through Expo Web:

```bash
npx expo start --web
```

---

# ▶️ How to Run the Project

## Install dependencies

```bash
npm install
```

## Start Expo

```bash
npx expo start
```

## Run on Android

```bash
eas build -p android --profile preview
```

## Run Web Version

```bash
npx expo start --web
```

---

# 📱 APK Build

The application can be installed as an Android APK generated using Expo EAS Build.

---

# ⚠️ Important Notes

- Backend API must be online
- Database connection required
- Cloudinary required for uploads
- Internet connection required
- JWT token required for protected routes

---

# 🔮 Future Improvements

- Push notifications
- GPS validation for clock-in
- Offline mode
- Dark mode
- In-app PDF preview
- Employee analytics dashboard
- Export reports to PDF

---

# 👨‍🎓 Author

Catalina Lopes  
Bachelor Degree in Software Engineering  
Final Year Project (TCC)

---

# 📚 Academic Purpose

This project demonstrates knowledge in:

- Mobile Development
- Full-Stack Development
- REST API Integration
- JWT Authentication
- Cloud Deployment
- Database Management
- File Upload Handling
- Real-World System Design
- Mobile Architecture
- Administrative Systems