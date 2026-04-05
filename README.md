# 📱 Time Tracker Mobile App

A mobile workforce management application built with **React Native** and **Expo**, designed to manage employee attendance, working hours, and administrative processes in a real business environment.

---

## 📖 Overview

This project was developed as part of a **Final Year Project (TCC)** in Software Engineering.

The application allows companies to manage:

* employee attendance
* clock in / clock out
* leave requests
* employee classification
* administrative workflows
* weekly reports and PDF exports

The system supports both **employee operations** and **admin management features**, reflecting real-world business needs.

---

## 🚀 Technologies Used

### 📱 Mobile

* React Native
* Expo
* Expo Router
* Axios
* AsyncStorage

### 📦 Native Features

* Expo Print (PDF generation)
* Expo Sharing
* Expo Location

### 🔗 Backend Integration

* REST API (Node.js + Express)
* Prisma ORM
* MySQL Database

---

## 🏗️ System Architecture

The mobile application communicates with a backend API using a REST architecture.

```
Mobile App (React Native)
        ↓
     Axios API
        ↓
Backend (Node.js + Express)
        ↓
     Prisma ORM
        ↓
      MySQL
```

---

## 📱 Features

### 👤 Employee Features

* Secure login
* Daily dashboard
* Clock in / clock out
* QR Code scanning
* Location validation
* Leave request submission
* Leave history
* Annual leave tracking

---

### 🛠️ Admin Features

* Admin panel
* Admin dashboard (weekly overview)
* Manage employees
* Edit employee status (active/inactive)
* Edit employee type (temporary/full-time)
* Edit payment type
* Approve leave requests
* View pending adjustments

---

## 💰 Payment Types Logic

The system supports different payment structures:

* `weekly`
* `monthly`
* `cash_in_hand`

### Business Rule

Employees marked as **cash_in_hand**:

* are visible in the app
* appear in internal reports
* are excluded from official accountant PDF reports

This reflects real-world financial workflows.

---

## 📊 Reports System

### 📄 Accountant Report (PDF)

* Includes only valid employees
* Excludes cash-in-hand
* Excludes inactive employees

---

### 📋 Internal Report

* Includes all active employees
* Separates cash-in-hand workers
* Supports daily business operations

---

## 📊 Admin Dashboard

The dashboard provides real-time insights:

* Total employees
* Active employees
* Inactive employees
* Cash in hand employees
* Weekly work summary

---

## 📂 Project Structure

```
app/
screens/
services/
components/
assets/
```

---

## ⚙️ How to Run

### 1. Clone repository

```bash
git clone https://github.com/KakaLopes/tcc-mobile-app.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start project

```bash
npx expo start
```

---

## 🌐 API Configuration

Edit:

```js
services/api.js
```

### Local:

```js
baseURL: "http://YOUR_IP:3000"
```

### Production:

```js
baseURL: "https://your-backend-url.com"
```

---

## 🔐 Roles

### 👤 User

* Clock in/out
* Request leave
* View personal data

### 🛠️ Admin

* Manage employees
* Approve requests
* Generate reports
* Export PDFs

---

## 📌 Current Status

The system currently includes:

* attendance tracking
* leave management
* admin dashboard
* employee management
* report generation
* PDF export system

The application simulates a real business workflow and is ready for demonstration.

---

## 🚀 Future Improvements

* Payroll calculation
* Dashboard charts
* Notifications system
* Mobile employee creation
* UI enhancements

---

## 👩‍💻 Author

Developed by **Catalina Lopes**
Final Year Project — Software Engineering
