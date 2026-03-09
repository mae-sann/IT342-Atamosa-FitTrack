# FitTrack - Workout Logger

A cross-platform fitness tracking application for managing workout sessions, monitoring progress, and achieving fitness goals.

---

## 🎯 Project Objectives

- Develop a cross-platform fitness tracking system (web and mobile)
- Implement secure user authentication (registration and login)
- Provide a predefined exercise library organized by muscle group or category
- Allow users to log workout sessions including sets and repetitions
- Enable users to track workout history and monitor fitness progress
- Allow users to set and manage personal fitness goals
- Build a scalable system using proper system architecture and database design

---

**Primary Users:**
- Health-conscious individuals tracking their workouts
- Fitness beginners needing simple logging tools
- Gym-goers monitoring workout progress

---

## ✨ System Features

- **User Registration and Login** – Create an account and securely log in
- **Secure Authentication using JWT** – Token-based authentication for API security
- **Workout Session Logging** – Record exercises with sets, reps, and weights
- **Exercise Library** – Browse a categorized library of exercises by muscle group
- **Workout History Tracking** – View past workouts and analyze trends
- **Fitness Goal Management** – Set, track, and achieve personal fitness goals
- **Dashboard Overview** – Get a snapshot of your progress and statistics
- **Responsive Web Interface** – Optimized for desktop and mobile browsers
- **Mobile Application Support** – Native Android app for on-the-go logging

---

## 🛠️ Technology Stack

### Frontend
- **React** – Modern JavaScript library for building user interfaces

### Backend
- **Spring Boot** – Java-based framework for RESTful API development

### Mobile Application
- **Kotlin** – Native Android development using Android Studio

### Database
- **MySQL** – Relational database for structured data storage
- **Supabase** – Backend-as-a-Service for additional cloud features

### Deployment
- **Render** – Cloud platform for backend and web hosting

### Version Control
- **Git** – Distributed version control system
- **GitHub** – Repository hosting and collaboration

---

## 🏗️ System Architecture

FitTrack follows a **centralized backend architecture** where both the web frontend (React) and Android mobile application (Kotlin) communicate with the backend server (Spring Boot) using **REST APIs**.

```
┌─────────────────┐       ┌─────────────────┐
│   Web Frontend  │       │  Mobile App     │
│     (React)     │       │    (Kotlin)     │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └────────┐       ┌────────┘
                  │       │
                  ▼       ▼
         ┌─────────────────────────┐
         │   Backend API Server    │
         │    (Spring Boot)        │
         └───────────┬─────────────┘
                     │
                     ▼
         ┌─────────────────────────┐
         │   Database (MySQL)      │
         │   Supabase              │
         └─────────────────────────┘
```

**Key Components:**
- **Frontend (Web & Mobile):** User interfaces for logging workouts and viewing progress
- **Backend API:** Centralized server handling authentication, data processing, and business logic
- **Database:** Persistent storage for user accounts, exercises, workouts, and goals

All communication is secured using JWT (JSON Web Tokens) for authentication and authorization.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16+)
- **Java** (JDK 17+)
- **MySQL** (8.0+)
- **Android Studio** (for mobile development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/IT342-Atamosa-FitTrack.git
   cd IT342-Atamosa-FitTrack
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Web Frontend Setup:**
   ```bash
   cd web
   npm install
   npm run dev
   ```

4. **Mobile App Setup:**
   - Open the `mobile` folder in Android Studio
   - Sync Gradle dependencies
   - Run on emulator or connected device

---

## 📂 Project Structure

```
IT342-Atamosa-FitTrack/
├── backend/         # Spring Boot REST API
├── web/             # React web application
├── mobile/          # Kotlin Android application
├── docs/            # Documentation and diagrams
└── README.md        # This file
```

---

## 👤 Author

**Charry Mae A. Atamosa**

---

## 📄 License

This project is an academic project developed for educational purposes.


