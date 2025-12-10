# Markdown Notes API - Database Design (ERD)

## Overview
This document describes the database schema for the Markdown Notes API, a note-taking application that supports markdown formatting, file attachments, and multi-user functionality.

---

## Entity Relationship Diagram (ERD)

### Visual Representation

```
┌──────────────────────────────────┐
│           USERS                  │
├──────────────────────────────────┤
│ • id (PK)         VARCHAR(50)    │
│ • username        VARCHAR(100)   │ [UNIQUE]
│ • email           VARCHAR(255)   │ [UNIQUE]
│ • password_hash   VARCHAR(255)   │
│ • created_at      TIMESTAMP      │
└────────┬─────────────────────────┘
         │
         │ owns
         │ 1:M (One user has many notes)
         │ ON DELETE CASCADE
         │
         ▼
┌──────────────────────────────────┐
│           NOTES                  │
├──────────────────────────────────┤
│ • id (PK)         VARCHAR(50)    │
│ ○ user_id (FK)    VARCHAR(50)    │ → users.id
│ • title           VARCHAR(200)   │
│   content         TEXT           │
│ • created_at      TIMESTAMP      │
│ • updated_at      TIMESTAMP      │
└────────┬─────────────────────────┘
         │
         │ has
         │ 1:M (One note has many files)
         │ ON DELETE CASCADE
         │
         ▼
┌──────────────────────────────────┐
│           FILES                  │
├──────────────────────────────────┤
│ • id (PK)           VARCHAR(50)  │
│ ○ note_id (FK)      VARCHAR(50)  │ → notes.id
│ • original_name     VARCHAR(255) │
│ • stored_name       VARCHAR(255) │ [UNIQUE]
│ • path              VARCHAR(500) │
│   mime_type         VARCHAR(100) │
│   size              BIGINT       │
│ • uploaded_at       TIMESTAMP    │
└──────────────────────────────────┘
```

**Legend:**
- `•` = Required field (NOT NULL)
- `○` = Optional field (can be NULL)
- `PK` = Primary Key
- `FK` = Foreign Key
- `[UNIQUE]` = Unique constraint
- `→` = References

---

## Database Relationships

### 1. USERS ↔ NOTES (One-to-Many)
- **Cardinality:** 1:M
- **Description:** One user can create multiple notes
- **Implementation:** `notes.user_id` references `users.id`
- **Cascade Behavior:** When a user is deleted, all their notes are deleted
- **Business Rule:** Every note must belong to a user

### 2. NOTES ↔ FILES (One-to-Many)
- **Cardinality:** 1:M
- **Description:** One note can have multiple file attachments
- **Implementation:** `files.note_id` references `notes.id`
- **Cascade Behavior:** When a note is deleted, all its files are deleted
- **Business Rule:** A note can exist without files, but files must belong to a note

---

## Entity Descriptions

### USERS Table
Stores user account information for authentication and authorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique identifier (UUID) |
| `username` | VARCHAR(100) | NOT NULL, UNIQUE | User's display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Indexes:**
- `idx_users_username` on `username` (for login lookups)
- `idx_users_email` on `email` (for login/recovery)

**Business Rules:**
- Username must be 3-50 characters
- Email must be valid format
- Password must be hashed before storage (never store plain text)
- Username and email must be unique across all users

---

### NOTES Table
Stores markdown notes with metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique identifier (UUID) |
| `user_id` | VARCHAR(50) | FOREIGN KEY → users.id | Owner of the note |
| `title` | VARCHAR(200) | NOT NULL | Note title |
| `content` | TEXT | NULL | Markdown content |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Indexes:**
- `idx_notes_user_id` on `user_id` (for fetching user's notes)
- `idx_notes_created_at` on `created_at DESC` (for sorting by date)
- `idx_notes_title_content` on `title` and `content` (for search functionality)

**Business Rules:**
- Every note must have a title
- Content can be empty (new notes)
- `updated_at` automatically updates on any modification
- Notes are soft-deletable (optional: add `deleted_at` column)
- Title maximum: 200 characters
- Content maximum: 100,000 characters (adjustable)

---

### FILES Table
Stores metadata for file attachments linked to notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique identifier (UUID) |
| `note_id` | VARCHAR(50) | FOREIGN KEY → notes.id | Parent note |
| `original_name` | VARCHAR(255) | NOT NULL | User's original filename |
| `stored_name` | VARCHAR(255) | NOT NULL, UNIQUE | Server-side unique filename |
| `path` | VARCHAR(500) | NOT NULL | Full file path on server |
| `mime_type` | VARCHAR(100) | NULL | File type (image/jpeg, etc.) |
| `size` | BIGINT | CHECK (size >= 0) | File size in bytes |
| `uploaded_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |

**Indexes:**
- `idx_files_note_id` on `note_id` (for fetching note's files)
- `idx_files_stored_name` on `stored_name` (for uniqueness check)
- `idx_files_createdAt` on `createdAt DESC` (for sorting)

**Business Rules:**
- `stored_name` must be globally unique to prevent collisions
- `stored_name` format: `{timestamp}_{uuid}_{original_name}`
- Maximum file size: 5MB (configurable)
- Allowed file types: images (jpg, png, gif), documents (pdf, txt)
- Physical files stored in `/uploads` directory
- When file record is deleted, physical file must also be deleted
- `size` cannot be negative

---