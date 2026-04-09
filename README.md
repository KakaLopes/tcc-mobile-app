# 📱 Work Time Management System – Mobile App

This mobile application was developed as part of a Final Year Project for the Software Engineering course.

It is designed for employees and administrators of cafés and small businesses to manage working hours, track attendance, and handle leave requests directly from their mobile devices.

The app communicates with a Node.js backend API and provides a simple, intuitive interface for daily use.

---

# 🚀 Technologies Used

- React Native  
- Expo  
- Axios  
- AsyncStorage  
- Expo Router  
- Expo Document Picker  
- Expo File System  
- Expo Linking  
- JavaScript (ES6+)  

---

# 🏗 Application Architecture

The mobile app follows a **component-based architecture**:

- Screens – UI and user interaction  
- Services – API communication  
- State management – React hooks (useState, useEffect)  
- Navigation – Expo Router  
- Storage – AsyncStorage (JWT token)  

---

# 📂 Project Structure

```
mobile
│
├── app
│   ├── login.js
│   ├── home.js
│   ├── requestLeave.js
│   ├── adminLeaveRequests.js
│   └── reports.js
│
├── services
│   └── api.js
│
├── assets
│
├── components
│
├── package.json
└── app.json
```

---

# 🔐 Authentication

- User logs in using email and password  
- Backend returns a JWT token  
- Token is stored locally using AsyncStorage  
- Token is sent in all protected requests  

```
Authorization: Bearer TOKEN
```

---

# ⏱ Main Features

## Login

- Secure authentication using JWT  
- Error handling for invalid credentials  

---

## Clock-in / Clock-out

- Register working hours in real time  
- Prevent duplicate clock-in  
- Automatic duration calculation  

---

## Work Tracking

- View hours worked today  
- View weekly work summary  
- Access work history  

---

## 🏖 Leave Requests

- Request different types of leave:
  - Vacation  
  - Day Off  
  - Sick Leave  
  - Other  

- Validate dates and inputs  
- Prevent invalid submissions  

---

## 📎 Document Upload (Sick Leave)

- Upload medical certificate (PDF or image)  
- Convert file to Base64  
- Send to backend (Cloudinary storage)  
- Attach document to leave request  

---

## 👨‍💼 Admin Features

- View all leave requests  
- Approve or reject requests  
- View employee information  
- Open uploaded documents  

---

# 🌐 API Configuration

Base URL is configured in:

```
services/api.js
```

Example:

```js
const api = axios.create({
  baseURL: "http://192.168.0.9:3000"
});
```

---

# ▶️ How to Run the App

Install dependencies

```
npm install
```

Start Expo

```
npx expo start
```

Run on device

- Scan QR code with Expo Go  
- Or run on emulator  

---

# ⚠️ Important Notes

- The mobile app requires the backend to be running  
- Make sure the IP address is correct (same Wi-Fi network)  
- File upload requires backend + Cloudinary configured  
- Ensure permissions for file access are enabled  

---

# 🔮 Future Improvements

- Push notifications (leave approval)  
- GPS validation for clock-in  
- Offline mode support  
- Dark mode  
- In-app PDF preview  

---

# 🌐 Backend API

This mobile app consumes the backend:

```
https://tcc-backend-jornada-production.up.railway.app
```

---

# 👨‍🎓 Author

Catalina Lopes  
Software Engineering – Final Project (TCC)

---

# 📚 Academic Purpose

This project demonstrates knowledge in:

- Mobile development with React Native  
- API integration (REST)  
- Authentication using JWT  
- File upload handling  
- State management with React Hooks  
- Real-world system design  
- Full-stack development
