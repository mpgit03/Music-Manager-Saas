# Project Management API

A secure **RESTful backend API** for managing projects and tasks.
Built with **Node.js, Express, and MongoDB**, this API demonstrates authentication, authorization, file uploads, validation, and production-level backend practices.

---

## Features

* **JWT Authentication** – Secure user registration and login
* **Role-Based Access Control (RBAC)** – Control access to protected routes
* **Project Management** – Create, update, delete, and view projects
* **Task Management** – Manage tasks within projects
* **Ownership Authorization** – Users can only modify resources they own
* **Pagination, Filtering & Search** – Efficient querying of projects and tasks
* **File Uploads** – Attach files to tasks using Multer
* **Input Validation** – Request validation with `express-validator`
* **Security Middleware**

  * Helmet (HTTP security headers)
  * Rate limiting
  * CORS protection
* **Swagger API Documentation**
* **Structured Error Handling**

---

## Tech Stack

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB
* Mongoose ODM

**Authentication & Security**

* JSON Web Tokens (JWT)
* bcrypt
* express-rate-limit
* helmet


**Utilities**

* multer (file uploads)
* express-validator
* morgan (logging)
* swagger-jsdoc
* swagger-ui-express

---

## API Documentation

Interactive Swagger documentation is available at:

```
/api-docs
```

Example:

```
http://localhost:5000/api-docs
```

---

## Project Structure

```
backend/
│
├── config/
│     db.js
│     swagger.js
│
├── controllers/
│     authController.js
│     projectController.js
│     taskController.js
│
├── middleware/
│     authMiddleware.js
│     checkOwnership.js
│     errorHandler.js
│     notFound.js
│     validateRequest.js
│
├── models/
│     User.js
│     Project.js
│     Task.js
│
├── routes/
│     authRoutes.js
│     projectRoutes.js
│     taskRoutes.js
│
├── uploads/
│
├── utils/
│     asyncHandler.js
│
├── server.js
└── package.json
```

---

## Installation

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/project-management-api.git
cd project-management-api
```

Install dependencies:

```
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory.

Example:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## Running the Server

Development mode:

```
npm run dev
```

Production mode:

```
npm start
```

Server runs on:

```
http://localhost:5000
```

---

## Example API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Projects

```
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```
GET    /api/projects/:projectId/tasks
POST   /api/projects/:projectId/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

---

## Security Practices Implemented

* Password hashing with bcrypt
* JWT authentication
* Request validation
* MongoDB query sanitization
* API rate limiting
* Secure HTTP headers

---

## Future Improvements

* Redis caching
* Background jobs (queues)
* Automated testing (Jest / Supertest)
* Docker containerization
* CI/CD pipeline

---

## Author

Built as a backend engineering project demonstrating modern **Node.js API development practices**.
