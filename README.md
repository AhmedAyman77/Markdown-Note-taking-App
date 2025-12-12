# Markdown Note-taking App (API)

A simple, secure Markdown note-taking REST API built with Express.js and PostgreSQL via Sequelize. Users can register and log in, create and manage Markdown notes, render them to HTML, and attach files with type/size validation.

## Table of Contents
 - **Overview**
 - **Tech Stack**
 - **Features**
 - **Project Structure**
 - **Getting Started**
 - **Environment Variables**
 - **Database**
 - **API Reference**
 - **Auth & Security**
 - **File Uploads**
 - **Markdown Rendering**
 - **Error Handling**
 - **Run & Dev Commands**
 - **Notes & Caveats**

## Overview
 - A backend-only API server that exposes endpoints for users, notes, and files.
 - Authentication via JWT stored in an HTTP-only cookie.
 - Markdown is rendered to HTML using `marked`.
 - Files are stored on disk under a configurable upload directory and tracked in the DB.

## Tech Stack
 - **Runtime:** Node.js (ES Modules)
 - **Framework:** Express 5
 - **Database:** PostgreSQL
 - **ORM:** Sequelize
 - **Auth:** JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
 - **Uploads:** Multer
 - **Markdown:** marked

## Features
 - **User Accounts:** Register, login, delete (with cascade deletion of user notes and files).
 - **Notes CRUD:** Create, read, update, delete notes per authenticated user.
 - **Markdown → HTML:** Rendered output returned in create/update responses.
 - **File Attachments:** Upload and delete files per note with validation.
 - **Robust Errors:** Centralized 404 and general error handlers.

## Project Structure
See key files below:
 - [src/server.js](src/server.js): Express app setup, routes, middleware, server bootstrap.
 - [src/config/db.config.js](src/config/db.config.js): Sequelize connection, `connectDB()`.
 - Routers: [src/routes/user.route.js](src/routes/user.route.js), [src/routes/note.route.js](src/routes/note.route.js), [src/routes/file.route.js](src/routes/file.route.js)
 - Controllers: [src/controllers/user.controller.js](src/controllers/user.controller.js), [src/controllers/note.controller.js](src/controllers/note.controller.js), [src/controllers/file.controller.js](src/controllers/file.controller.js)
 - Middleware: [src/middleware/auth.middleware.js](src/middleware/auth.middleware.js), [src/middleware/error.middleware.js](src/middleware/error.middleware.js)
 - Models: [src/models/users.model.js](src/models/users.model.js), [src/models/notes.model.js](src/models/notes.model.js), [src/models/files.model.js](src/models/files.model.js)
 - Utils: [src/utils/markdown.utils.js](src/utils/markdown.utils.js), [src/utils/upload.utils.js](src/utils/upload.utils.js)

## Getting Started
1. Install dependencies:
```bash
npm install
```
2. Create a PostgreSQL database and user.
3. Configure environment variables (see below).
4. Start the server:
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```
The server listens on `http://localhost:<PORT>` and returns "server is running" at `/`.

## Environment Variables
Create a `.env` in the project root and set:
 - **`PORT`**: Server port (e.g., `3000`).
 - **`DB_HOST`**: PostgreSQL host (e.g., `127.0.0.1`).
 - **`DB_PORT`**: PostgreSQL port (e.g., `5432`).
 - **`DB_NAME`**: Database name.
 - **`DB_USER`**: Database user.
 - **`DB_PASS`**: Database password.
 - **`ACCESS_TOKEN_SECRET`**: JWT secret for signing tokens.
 - **`UPLOAD_DIR`**: Relative folder under `src/` where files are stored (e.g., `uploads`).
 - **`ALLOWED_FILE_TYPES`**: JSON array of allowed MIME types (e.g., `["image/png","image/jpeg","application/pdf"]`).
 - **`MAX_FILE_SIZE`**: Max file size in bytes (e.g., `10485760` for 10MB).

Example:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=markdown_notes
DB_USER=postgres
DB_PASS=postgres
ACCESS_TOKEN_SECRET=replace-with-strong-secret
UPLOAD_DIR=uploads
ALLOWED_FILE_TYPES=["image/png","image/jpeg","application/pdf"]
MAX_FILE_SIZE=10485760
```

## Database
 - Sequelize connects and authenticates in [src/config/db.config.js](src/config/db.config.js).
 - `sequelize.sync()` creates tables if they do not exist.
 - Models:
	 - `users`: fields `id`, `username` (unique), `email` (unique), `password_hash`.
	 - `notes`: fields `id`, `user_id` (FK), `title`, `content`.
	 - `files`: fields `id`, `note_id` (FK), `original_name`, `stored_name` (unique), `path`, `mime_type`, `size`.

## API Reference
Base URL: `/api`

### Users
 - **POST** `/api/users/register`
	 - Body: `{ username, email, password }`
	 - Response: `201` with `{ status, message, data: { id, email } }`

 - **POST** `/api/users/login`
	 - Body: `{ login, password }` where `login` is username or email.
	 - Response: `200` with `{ status, message }`, sets HTTP-only cookie `token`.

 - **DELETE** `/api/users/:id`
	 - Auth: Requires cookie `token` for an authenticated user; deletes the user and cascades notes/files.

### Notes (Auth required)
 - **GET** `/api/notes/`
	 - Returns all notes for the authenticated user.

 - **GET** `/api/notes/:id`
	 - Returns a single note by id if owned by the user.

 - **POST** `/api/notes/create`
	 - Body: `{ title, content }`
	 - Returns `render_content` as HTML generated from Markdown.

 - **PUT** `/api/notes/:id`
	 - Body: `{ title?, content? }`
	 - Returns updated `noteToUpdate` and `renderedContent` (HTML).

 - **DELETE** `/api/notes/:id`
	 - Deletes note and its files if owned by the user.

### Files (Auth required)
 - **POST** `/api/files/:noteId`
	 - Form-Data: `file` (single file), validates type and size.
	 - Saves file under `src/<UPLOAD_DIR>` and a DB record linked to the note.

 - **DELETE** `/api/files/:fileId`
	 - Deletes DB record and tries to remove the physical file from disk.

## Auth & Security
 - JWT is stored in cookie `token` and verified in [src/middleware/auth.middleware.js](src/middleware/auth.middleware.js).
 - Endpoints under `/api/notes` and `/api/files` require authentication.
 - Passwords are hashed using `bcryptjs`.

## File Uploads
 - Configurable storage path via `UPLOAD_DIR` (created on startup if missing).
 - MIME types and sizes validated via `ALLOWED_FILE_TYPES` and `MAX_FILE_SIZE`.
 - File naming uses a timestamp prefix via `processFileName()`.

## Markdown Rendering
 - Markdown is converted to HTML with `marked.parse()` in [src/utils/markdown.utils.js](src/utils/markdown.utils.js).
 - Rendered HTML is returned in create (`render_content`) and update (`renderedContent`) responses.

## Error Handling
 - `notFound` middleware returns `404 Not Found` for unmatched routes.
 - `errorHandler` returns JSON with `{ success: false, error }` for unhandled errors.

## Run & Dev Commands
 - `npm start`: runs [src/server.js](src/server.js).
 - `npm run dev`: runs with `nodemon` for auto-restart.

## Notes & Caveats
 - On shutdown, the server attempts a graceful close. If you need DB close access in `SIGTERM`, import `sequelize` where used.
 - Ensure your reverse proxy or client preserves cookies for authenticated routes.
 - Always set a strong `ACCESS_TOKEN_SECRET` in production.
