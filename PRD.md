# Product Requirements Document (PRD)

## Sutra Backend

### 1. Product Overview

**Product Name:** Sutra Backend  
**Version:** 1.0.0  
**Product Type:** RESTful Backend API for a Project Management System

Sutra Backend is a RESTful API designed to support collaborative project management.
It enables teams to organize projects, manage project membership,
create tasks and subtasks, maintain project notes, upload task attachments,
and securely access resources through authentication, role-based access control,
and resource ownership checks.

---

### 2. Target Users

- **System Administrators:** Create and manage projects, manage project membership,
  and access all project resources.
- **Project Admins:** Manage project content and team activities within
  assigned projects.
- **Project Members:** Collaborate on projects, create tasks and notes, and
  manage resources for which they are responsible.

---

### 3. Core Features

#### 3.1 User Authentication & Authorization

- **User Registration:** Account creation with email verification
- **User Login:** Secure authentication with JWT tokens
- **Password Management:** Change password, forgot/reset password functionality
- **Email Verification:** Account verification via email tokens
- **Token Management:** Access token refresh mechanism
- **Role-Based Access Control:** Authorization is divided into system-level
  administration and project-level roles.
- **Ownership-Based Authorization:** Selected operations are additionally
  restricted using ownership fields such as `createdBy` and `assignedTo`.

#### 3.2 Project Management

- **Project Creation:** System administrators can create projects.
- **Project Listing:** Users can list projects they are allowed to access.
  System administrators can access all projects.
- **Project Details:** Project members can view individual project information.
- **Project Updates:** System administrators can modify project information.
- **Project Deletion:** System administrators can delete projects.

#### 3.3 Team Member Management

- **Member Addition:** Add one or more existing users to a project.
- **Member Listing:** View all members of a project.
- **Role Management:** Update the project-level role of an existing member.
- **Member Removal:** Remove a member from a project.
- **Duplicate Prevention:** A user cannot have more than one membership record
  for the same project.

#### 3.4 Task Mangement

- **Task Creation:** Project members can create tasks within projects they can
  access.
- **Task Listing:** Project members can view tasks within their projects.
- **Task Details:** Project members can view individual task information.
- **Task Updates:** System admins and project admins can update project tasks.
  Members can update tasks they created or to which they are assigned.
- **Task Deletion:** System admins and project admins can delete project tasks.
  Members can delete tasks they created.
- **Task Assignment:** Tasks can be assigned to an existing member of the
  project.
- **Status Tracking:** Tasks use `todo`, `in_progress`, and `done` statuses.
- **File Attachments:** Task creators and assignees can upload and manage task
  attachments.
- **Attachment Access:** Project members can preview and download attachments
  belonging to tasks in their projects.

#### 3.5 Subtask Management

- **Subtask Creation:** System admins, project admins, task creators, and task
  assignees can add subtasks to a task.
- **Subtask Listing:** Project members can view the subtasks of accessible
  tasks.
- **Subtask Details:** Project members can view individual subtasks.
- **Subtask Updates:** System admins, project admins, task creators, and task
  assignees can update subtask details and completion state.
- **Subtask Deletion:** System admins, project admins, task creators, and task
  assignees can delete subtasks.
- **Completion Tracking:** Subtasks support an `isCompleted` state.

#### 3.6 Project Notes

- **Note Creation:** Any project member can add a note to an accessible project.
- **Note Listing:** Project members can view notes belonging to their projects.
- **Note Details:** Project members can view individual project notes.
- **Note Updates:** System admins and project admins can update any note.
  Members can update notes they created.
- **Note Deletion:** System admins and project admins can delete any note.
  Members can delete notes they created.
- **Creator Information:** Note responses may include selected information
  about the note creator.

#### 3.7 System Health

- **Health Check:** API endpoint for system status monitoring

---

### 4. Technical Specifications

#### 4.1 API Endpoints Structure

**Authentication Routes(`/api/v1/auth`)**

- **`POST /register`** - User registration
- **`POST /login`** - User authentication
- **`POST /logout`** - User logout (secured)
- **`GET /current-user`** - Get current user info (secured)
- **`POST /change-password`** - Change user password (secured)
- **`POST /refresh-token`** - Refresh access token
- **`POST /verify-email/:verificationToken`** - Email Verification
- **`POST /forgot-password`** - Request password reset
- **`POST /reset-password/:resetToken`** - Reset forgotten password
- **`POST /resend-email-verification`** - Resend verification email (secured)

**Project Routes (`/api/v1/projects`)**

- **`GET /`** - List user projects (secured)
- **`POST /`** - Create project (secured)
- **`GET /:projectId`** - Get project details (secured, role-based)
- **`PATCH /:projectId`** - Update project (secured, Admin only)
- **`DELETE /:projectId`** - Delete project (secured, Admin only)
- **`GET /:projectId/members`** - List project members (secured)
- **`POST /:projectId/members`** - Add project member (secured, Admin only)
- **`PATCH /:projectId/members/:userId`** - Update member role (secured, Admin only)
- **`DELETE /:projectId/members/:userId`** - Remove member (secured, Admin only)

**Task Routes (`/api/v1/projects/:projectId/tasks`)** Admin/Project Admin direct access

> NOTE: Projects Heirarchy POV

- **`GET /`** - List project tasks (secured, role-based)
- **`POST /`** - Create task (secured, Admin/ Project Admin/ Member)
- **`GET /:taskId`** - Get task details (secured, role-based)
- **`PATCH /:taskId`** - Update task (secured, Admin/Project Admin/Member -> CreatedBy, AssignedTo)
- **`DELETE /:taskId`** - Delete task (secured, Admin/Project Admin/Member -> CreatedBy)
- **`POST /:taskId/attachments`** - Upload Attachment (secured, Admin/Project Admin/Member -> CreatedBy, AssignedTo)
- **`GET /:taskId/attachments/:attachmentId?mode=<mode>`** - Fetch Attachment (secured, role-based)
- **`DELETE /:taskId/attachments/:attachmentId`** - Delete Attachment (secured, Admin/Project Admin/Member -> CreatedBy, UploadedBy)
- **`GET /:taskId/sub-tasks`** - List task's subtask (secured, role-based)
- **`POST /:taskId/sub-tasks`** - Create subtask (secured, Admin/Project Admin/Member)
- **`GET /:taskId/sub-tasks/:subTaskId`** - List task's subtask (secured, role-based)
- **`PATCH /:taskId/sub-tasks/:subTaskId`** - Update subtask (secured, Admin/Project Admin/Member)
- **`DELETE /:taskId/sub-tasks/:subTaskId`** - Delete subtask (secured, Admin/ Project Admin/Member)

**Note Routes (`/api/v1/projects/:projectId/notes`)**

- **`GET /`** - List project notes (secured, role-based)
- **`POST /`** - Create note (secured, Admin/Project Admin/Member)
- **`GET /:noteId`** - Get note details (secured, role-based)
- **`PATCH /:noteId`** - Update note (secured, Admin/Project Admin/Member -> CreatedBy)
- **`DELETE /:noteId`** - Delete note (secured, Admin/Project Admin/Member -> CreatedBy)

#### 4.2 Permission Matrix

| Feature                       | System Admin | Project Admin | Member | Conditions                                            |
| ----------------------------- | :----------: | :-----------: | :----: | ----------------------------------------------------- |
| Create project                |      ✅      |      ❌       |   ❌   | System admin only                                     |
| Update/delete project         |      ✅      |      ❌       |   ❌   | System admin only                                     |
| Manage project members        |      ✅      |      ✅       |   ❌   | Includes adding, removing, and changing project roles |
| View project content          |      ✅      |      ✅       |   ✅   | Member must belong to the project                     |
| Create task                   |      ✅      |      ✅       |   ✅   | Member must belong to the project                     |
| Update task                   |      ✅      |      ✅       |  ✅\*  | Member must be the task creator or assignee           |
| Delete task                   |      ✅      |      ✅       |  ✅\*  | Member must be the task creator                       |
| Upload task attachments       |      ✅      |      ✅       |  ✅\*  | Member must be the task creator or assignee           |
| Preview/download attachments  |      ✅      |      ✅       |   ✅   | Member must belong to the project                     |
| Delete task attachments       |      ✅      |      ✅       |  ✅\*  | Member must be the task creator or assignee           |
| View subtasks                 |      ✅      |      ✅       |   ✅   | Member must belong to the project                     |
| Create/update/delete subtasks |      ✅      |      ✅       |  ✅\*  | Member must be the parent task’s creator or assignee  |
| View project notes            |      ✅      |      ✅       |   ✅   | Member must belong to the project                     |
| Create project notes          |      ✅      |      ✅       |   ✅   | Member must belong to the project                     |
| Update/delete project notes   |      ✅      |      ✅       |  ✅\*  | Member must be the note creator                       |

> Legend
>
> ✅ — Allowed
> ❌ — Not allowed
> ✅\* — Allowed only when the ownership condition is satisfied

#### 4.3 Authorization and Status Values

#### System-level authorization

- `isAdmin: true` — User has global administrative access.
- `isAdmin: false` — User is a regular application user.

#### Project-level roles

- `project_admin` — Administrative access within a specific project.
- `member` — Standard collaborative access within a specific project.

#### Task status

- `todo` — Task has not started.
- `in_progress` — Work on the task is in progress.
- `done` — Task is completed.

#### Subtask completion

- `isCompleted: false` — Subtask is incomplete.
- `isCompleted: true` — Subtask is complete.

---

### 5. Security Features

- JWT-based access and refresh token authentication
- Password hashing using bcrypt
- Email verification and password-reset token flows
- System-level and project-level authorization middleware
- Resource ownership checks for tasks, subtasks, notes, and attachments
- Request validation using `express-validator`
- MongoDB ObjectId validation
- CORS configuration
- Multer file-size and MIME-type restrictions
- Centralized API error handling
- Admin bootstrap through protected environment configuration

---

### 6. File Management

- Supports multiple file attachments on tasks.
- Files are currently stored under `public/uploads/tasks`.
- Multer uses configurable disk-storage middleware.
- The current attachment limit is three files per upload request.
- The current maximum file size is 5 MB per file.
- Supported attachment types include JPEG, PNG, and PDF.
- MongoDB stores attachment metadata:
  - public URL,
  - original filename,
  - MIME type,
  - file size,
  - uploader.
- Project members can preview or download task attachments.
- File-deletion logic removes the local file and its task metadata.

> Local public storage is a version-one implementation. Future production
> versions should use private blob/object storage and protected or signed URLs.

---

### 7. Implementation Status

#### Implemented

- Authentication and user account workflows
- System-admin bootstrap
- Project and member management
- Task management
- Task assignment and status tracking
- Task attachments
- Subtask management
- Project notes
- Role- and ownership-based authorization
- Request validation and centralized error handling

#### Known limitations

- Project deletion does not yet cascade across every dependent collection.
- Attachment files are stored locally in a publicly served directory.
- Automated unit and integration tests are not yet implemented.
- Collection endpoints do not yet provide complete pagination and filtering.
- API documentation currently relies on the PRD and Bruno collection.
- Controller logic has not yet been completely extracted into service modules.

---

### 8. Success Criteria

#### Version 1

- Functional authentication and account recovery flows
- System-level and project-level authorization
- Complete project, task, subtask, member, and note API workflows
- Ownership-aware resource updates and deletions
- Task attachment upload, preview/download, and deletion
- Request validation and consistent error responses
- Reusable API requests through the Bruno collection

#### Future production readiness

- Automated test coverage
- Complete transactional cascade deletion
- Private object/blob storage
- OpenAPI documentation
- Pagination, filtering, and searching
- Structured logging and monitoring
- Security hardening and deployment configuration

---

### 9. Documentation

- [`README.md`](./README.md) — Repository introduction, setup, architecture, and current status
- [`PRD.md`](./PRD.md) — Product requirements, endpoint catalogue, and permission rules
- [`bruno-client`](./bruno-client/) — Executable/manual API request collection
- OpenAPI specification — Planned for a future iteration
