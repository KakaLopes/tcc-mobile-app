# Time Tracker Mobile App

A mobile workforce management application built with **React Native** and **Expo**, designed to help companies manage employee attendance, leave requests, weekly reports, and administrative controls in a practical and organized way.

## Overview

This project was developed as part of a college final project and simulates a real business environment where managers need to:

- register employee attendance
- control clock in / clock out
- manage annual leave and leave requests
- review and approve admin actions
- classify employees by payment type
- export weekly PDF reports for different business purposes

The app supports both **employee features** and **admin features**, with role-based access to management tools.

---

## Main Features

### Employee Features
- Secure login
- Daily dashboard
- Clock in and clock out
- QR scanner integration
- Workplace location validationgir
- Leave request submission
- My leave requests view
- Leave balance and annual leave tracking

### Admin Features
- Admin panel
- Admin dashboard with weekly summary
- Manage employees
- Edit employee status
- Edit employee type
- Edit payment type
- View pending adjustments
- Approve leave requests
- Weekly reports
- Export accountant PDF
- Export internal business report

---

## Payment Type Logic

The system supports different employee payment types:

- `weekly`
- `monthly`
- `cash_in_hand`

### Business Rule
Employees marked as `cash_in_hand`:
- remain visible in the system
- remain visible in internal reports
- are excluded from the accountant PDF

This reflects a more realistic business workflow, where internal operational records may differ from official payroll exports.

---

## Admin Dashboard

The admin dashboard provides a quick summary of:

- total employees
- active employees
- inactive employees
- cash in hand employees
- weekly work summary

This helps managers make operational decisions quickly and keep visibility over the workforce.

---

## Weekly Reports

The app provides two different PDF report flows:

### 1. Accountant PDF
Used for official payroll/accounting purposes.
- includes only active employees
- excludes `cash_in_hand`
- excludes inactive employees

### 2. Internal Report
Used for internal business control.
- includes active employees
- separates cash-in-hand employees
- supports operational visibility for daily payments

---

## Tech Stack

### Mobile
- React Native
- Expo
- Expo Router
- Axios
- AsyncStorage
- Expo Print
- Expo Sharing
- Expo Location

### Backend Integration
This mobile app connects to a Node.js + Express backend with Prisma ORM and MySQL.

---

## Project Structure

```bash
app/
screens/
services/
components/
assets/