# Sutra – Project Management Backend API

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-v1%20%2F%20In%20Progress-orange)

A RESTful backend API for a collaborative project management system built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

Sutra Backend provides authentication, project/member management, hierarchical task management, file attachments, project notes, and role-based access control.

> This repository represents the first working version of the backend. It is functional and structured, but not yet production-ready.

---

## Why this project?

Sutra Backend was built to practice and demonstrate backend engineering concepts beyond simple CRUD APIs.

The project focuses on:

- designing nested REST resources,
- implementing authentication and authorization,
- modelling project/task ownership rules,
- handling file uploads,
- validating API input,
- and organizing a backend codebase that can be refactored into a more production-grade architecture over time.

---

## Features

- User authentication with JWT access and refresh tokens
- Email verification and password reset flow
- Project creation, listing, update, and deletion
- Project member management with project-level roles
- Task management with assignment and status tracking
- Subtask management under tasks
- Task file attachments using Multer
- Project notes for project-level documentation
- Role-based and ownership-based access control
- Request validation using `express-validator`
- Initial system admin bootstrap script

---

## Tech Stack

| Area           | Technology                    |
| -------------- | ----------------------------- |
| Runtime        | Node.js                       |
| Framework      | Express.js                    |
| Database       | MongoDB                       |
| ODM            | Mongoose                      |
| Authentication | JWT, bcrypt                   |
| Validation     | express-validator             |
| File Uploads   | Multer                        |
| Email          | Nodemailer, Mailgen, Mailtrap |
| Formatting     | Prettier                      |
| Git Hooks      | Husky, lint-staged            |

---

## Domain Model Overview

Sutra follows a project-first hierarchy:

```txt
User
 └── ProjectMember

Project
 ├── ProjectMember
 ├── Task
 │    ├── SubTask
 │    └── Attachments
 └── ProjectNote
```

The main resource hierarchy used by the API is:

```txt
/projects
/projects/:projectId/members
/projects/:projectId/tasks
/projects/:projectId/tasks/:taskId/sub-tasks
/projects/:projectId/tasks/:taskId/attachments
/projects/:projectId/notes
```

Detailed endpoint behavior is documented separately in the PRD and the Bruno API collection.

---

## Authorization Model

Sutra uses two levels of authorization.

### 1. System-level access

A user may be marked as a system admin using:

```txt
isAdmin: true
```

System admins can perform global administrative actions such as creating projects and managing project-level data.

### 2. Project-level access

Project-specific roles are stored in the project membership collection:

```txt
project_admin
member
```

These roles determine what a user can do inside a project.

### Ownership-based checks

Some actions also depend on ownership fields such as:

```txt
createdBy
assignedTo
uploadedBy
```

For example, task updates, task deletion, subtask changes, attachment deletion, and note updates are guarded using a combination of:

- system admin access,
- project role,
- and ownership of the resource.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB Atlas or local MongoDB
- Mailtrap account for SMTP testing

### Installation

Clone the repository:

```bash
git clone https://github.com/bvvinaykumar45/sutra-backend.git
cd sutra-backend
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.sample .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.sample .env
```

---

## Environment Variables

The project expects the following environment variables:

```env
PORT=
CORS_ORIGIN=

# MongoDB connection string
MONGO_URL=

# JWT access token
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

# JWT refresh token
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

# Mailtrap SMTP settings
MAILTRAP_SMTP_HOST=
MAILTRAP_SMTP_PORT=
MAILTRAP_SMTP_USER=
MAILTRAP_SMTP_PASS=

# Initial system admin bootstrap user
ADMIN_USERNAME=
ADMIN_EMAIL=
ADMIN_FULLNAME=
ADMIN_PASSWORD=
```

---

## Create the First Admin User

New users are registered as regular users by default.

To create the first system admin, configure the `ADMIN_*` variables in `.env` and run:

```bash
npm run create-admin
```

This creates or promotes the configured user as the first system administrator.

---

## Running the Project

Start the development server:

```bash
npm run dev
```

Start the server without Nodemon:

```bash
npm start
```

---

## API Testing

A Bruno collection is planned under:

```txt
bruno-client/
```

This folder is intended to contain saved API requests for authentication, projects, members, tasks, subtasks, attachments, and notes.

The collection is useful for manually testing API flows without having to recreate requests from scratch.

---

## File Uploads

Task attachments are handled using Multer and currently stored locally at:

```txt
/public/uploads/tasks
```

Attachment metadata is stored in MongoDB, including fields such as:

```txt
url
originalName
mimeType
size
uploadedBy
```

This local file-storage setup is suitable for development. A production deployment should move attachments to a dedicated object storage service such as AWS S3, Azure Blob Storage, Cloudinary, or equivalent.

---

## Project Structure

A simplified view of the project structure:

```txt
src/
 ├── controllers/
 ├── middlewares/
 ├── models/
 ├── routes/
 ├── validators/
 ├── utils/
 ├── scripts/
 ├── app.js
 └── index.js
```

### Key folders

| Folder         | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `controllers/` | Request handlers and response logic                        |
| `middlewares/` | Authentication, authorization, validation, upload handling |
| `models/`      | Mongoose schemas and models                                |
| `routes/`      | API route definitions                                      |
| `validators/`  | express-validator request validation rules                 |
| `utils/`       | Shared utilities, constants, API response/error helpers    |
| `scripts/`     | Utility scripts such as admin bootstrap                    |

---

## Current Status

This project is currently a working backend v1.

Implemented:

- Authentication and authorization
- Project and member management
- Tasks and subtasks
- Task attachments
- Project notes
- Admin bootstrap flow
- Request validation
- Local file upload support

---

## Current Limitations

The project is functional, but several areas are planned for improvement before it can be considered production-ready:

- Controllers should be refactored into service-layer architecture
- Repeated database checks can be extracted into reusable helpers
- Cascade deletion is not fully complete across all related entities
- File uploads are stored locally instead of object storage
- API documentation should eventually be formalized using OpenAPI or similar tooling
- Test coverage is not yet added
- Error handling and logging can be improved for production observability
- Transaction handling should be expanded for multi-collection writes/deletes

---

## Roadmap

Planned improvements include:

- Refactor controllers into smaller services
- Add unit and integration tests
- Add OpenAPI documentation
- Move file uploads to cloud/object storage
- Complete cascade deletion for projects, tasks, subtasks, notes, and attachments
- Improve logging and monitoring
- Add pagination and filtering where needed
- Harden production security configuration
- Improve developer-facing documentation

---

## Documentation

- Product requirements: [`PRD.md`](./PRD.md)
- API request collection: `bruno-client/`

The README intentionally provides a high-level repository overview. Detailed product rules, endpoint behavior, and permission expectations should live in the PRD and API collection.

---

## Author

**Venkata Vinay Kumar B**

GitHub: [@bvvinaykumar45](https://github.com/bvvinaykumar45)

---

## License

This project is licensed under the [LICENSE](./LICENSE).
