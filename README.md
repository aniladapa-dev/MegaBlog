# MegaBlog

A modern full-stack blogging platform built with **Spring Boot** and **React**, featuring secure JWT authentication, Google OAuth2 login, rich text editing, image uploads, and social engagement features such as likes, comments, and bookmarks.

The application follows a decoupled architecture with a React frontend and Spring Boot REST API backend, deployed independently on Vercel and Render.

---

## Live Demo

**Frontend:** https://mega-blog-gamma-six.vercel.app

**Backend API:** https://megablog-backend.onrender.com

---

## Features

### Authentication

- User Registration
- User Login
- JWT Authentication
- Google OAuth2 Login
- Protected Routes
- Persistent Login Sessions
- User Profile Management

### Blog Management

- Create Blog Posts
- Edit Existing Posts
- Delete Posts
- Rich Text Editor (TinyMCE)
- Featured Image Upload
- Category Support
- Search Posts

### Social Features

- Like Posts
- Bookmark Posts
- Comment on Posts
- Delete Own Comments
- View User Profiles

### Media Management

- Image Upload using Cloudinary
- Image Preview
- Image Deletion

### User Experience

- Responsive UI
- Dark Mode
- Loading States
- Error Handling
- Toast Notifications
- Protected Navigation

---

# Tech Stack

## Frontend

- React
- Vite
- React Router DOM
- Redux Toolkit
- React Hook Form
- Tailwind CSS
- TinyMCE

## Backend

- Spring Boot
- Spring Security
- Spring Data JPA
- Spring OAuth2 Client
- JWT Authentication
- REST APIs

## Database

- PostgreSQL (Neon)

## Cloud Storage

- Cloudinary

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# Architecture

```
                    React + Vite
                     (Vercel)
                         │
                         │ REST APIs
                         ▼
               Spring Boot Backend
                    (Render)
                         │
        ┌────────────────┴───────────────┐
        │                                │
        ▼                                ▼
 PostgreSQL (Neon)                 Cloudinary
      Database                   Image Storage
```

---

# Authentication Flow

## Email Authentication

```
React
   │
   ▼
Spring Boot
   │
Validate Credentials
   │
Generate JWT
   │
Return Token
   │
React stores JWT
```

---

## Google OAuth2 Authentication

```
React
   │
Login with Google
   │
   ▼
Spring Boot
   │
Redirect to Google
   │
Google Authentication
   │
Spring Boot Callback
   │
Generate JWT
   │
Redirect
   │
React (/oauth2/callback)
   │
Store JWT
   │
Load User
```

---

# Project Structure

```
MegaBlog
│
├── Backend
│   ├── src
│   ├── Dockerfile
│   ├── pom.xml
│   └── application.properties
│
├── Frontend
│   ├── src
│   │   ├── components
│   │   ├── Pages
│   │   ├── services
│   │   ├── store
│   │   └── context
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Environment Variables

## Backend

Create a `.env` file inside the backend.

```env
DB_URL=

DB_USERNAME=

DB_PASSWORD=

JWT_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

CLOUDINARY_URL=

FRONTEND_REDIRECT_URL=
```

---

## Frontend

Create a `.env` file inside the frontend.

```env
VITE_BACKEND_URL=

VITE_TINYMCE_API_KEY=
```

---

# Running Locally

## Clone Repository

```bash
git clone https://github.com/aniladapa-dev/MegaBlog.git

cd MegaBlog
```

---

## Backend

```bash
cd Backend

./mvnw spring-boot:run
```

Runs on

```
http://localhost:8080
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# Docker

## Build Backend Image

```bash
docker build -t megablog-backend .
```

## Run Container

```bash
docker run \
--env-file .env \
-p 8080:8080 \
megablog-backend
```

---

# Deployment

## Frontend

- Platform: Vercel

## Backend

- Platform: Render

## Database

- Neon PostgreSQL

## Image Storage

- Cloudinary

---

# REST API Modules

### Authentication

```
POST   /api/auth/signup

POST   /api/auth/login

GET    /api/auth/me

PUT    /api/auth/update-profile

DELETE /api/auth/delete-account
```

---

### Posts

```
GET    /api/posts

GET    /api/posts/{slug}

POST   /api/posts

PUT    /api/posts/{slug}

DELETE /api/posts/{slug}
```

---

### Comments

```
GET    /api/posts/{slug}/comments

POST   /api/posts/{slug}/comments

DELETE /api/comments/{id}
```

---

### Likes

```
POST   /api/posts/{slug}/like

GET    /api/posts/{slug}/like-status
```

---

### Bookmarks

```
POST   /api/posts/{slug}/bookmark

GET    /api/posts/{slug}/bookmark-status

GET    /api/bookmarks
```

---

### Files

```
POST   /api/files/upload

DELETE /api/files/{id}
```

---

# Security

- Spring Security
- JWT Authentication
- Google OAuth2
- BCrypt Password Hashing
- Protected REST APIs
- Role-Based Authorization Ready
- Secure File Upload
- CORS Configuration

---

# Future Enhancements

- Email Verification
- Password Reset
- Draft Posts
- Reading Time Estimation
- User Following System
- Notifications
- Admin Dashboard
- Analytics Dashboard
- Rich Markdown Support
- Infinite Scroll
- Progressive Web App (PWA)

---

# Author

**Anil Kumar**

B.Tech Computer Science Engineering

GitHub: https://github.com/aniladapa-dev

LinkedIn: https://www.linkedin.com/in/anilkumar1324/