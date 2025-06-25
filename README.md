# HR Management Web App

This is a full-stack HR Management system built with **React (Vite)** for the frontend and **Node.js + Express + MongoDB** for the backend.

It allows HR personnel to manage candidate data, search, view detailed profiles, generate reports, and perform actions such as delete, evaluate, and schedule via a calendar interface.

---

## ✨ Features

- 🔐 Authentication (Signup, Login, Google OAuth)
- 🔍 Search Bar (Real-time search for candidates)
- 🧑 View Candidate Profiles
- 📝 Comprehensive Report Tab per Candidate
- 🗑️ Delete Candidates
- 🗓️ Calendar integration (on Profile page)
- 📄 View Completed Evaluations
- 🚪 Logout functionality
- 📁 MongoDB database (hosted on Atlas)
- 🌐 CORS-safe backend–frontend communication

---

## 🧰 Technologies Used

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Netlify (for deployment)

### Backend
- Node.js
- Express
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- Nodemailer
- Render (for deployment)

---

## 🚀 Deployment

- **Frontend**: [Netlify](https://danny23.netlify.app)
- **Backend**: [Render](https://hr-zouw.onrender.com)

Connected securely via `VITE_API_BASE_URL` environment variable in the frontend.

---

## 🖥️ Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Dannywest223/hr.git
cd hr-management
