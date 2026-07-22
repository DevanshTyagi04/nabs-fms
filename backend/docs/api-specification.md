# API Specification (Revision 2)

This document details the RESTful API endpoints planned for the **NABS Field Service Management (FSM) Platform** backend.

---

## 1. Authentication Module (`/api/v1/auth`)

### 1.1 Login User
- **Method**: `POST`
- **Route**: `/api/v1/auth/login`
- **Purpose**: Authenticate user credentials and return JWT access token and hashed refresh token session.
- **Authentication**: None
- **Response Body**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "7f8b9a1c...",
    "user": { "id": "u-123", "email": "vendor@nabs.com", "role": "VENDOR" }
  }
  ```

### 1.2 Refresh Token
- **Method**: `POST`
- **Route**: `/api/v1/auth/refresh`
- **Purpose**: Exchange a valid refresh token for a new access token.
- **Status Codes**: `200 OK`, `401 Unauthorized`

---

## 2. Service Request Module (`/api/v1/service-requests`)

### 2.1 Get Request Workflow History
- **Method**: `GET`
- **Route**: `/api/v1/service-requests/:id/history`
- **Purpose**: Fetch status transition history (`ServiceRequestHistory`) for SLA tracking.
- **Roles Allowed**: `ADMIN`, `CUSTOMER`, `VENDOR`
- **Status Codes**: `200 OK`

---

## 3. Comment Module (`/api/v1/comments`)

### 3.1 Create Comment
- **Method**: `POST`
- **Route**: `/api/v1/comments`
- **Purpose**: Post a contextual business note on an entity (`SERVICE_REQUEST`, `SURVEY`, `WORK_ORDER`, etc.).
- **Request Body**:
  ```json
  {
    "entityType": "SERVICE_REQUEST",
    "entityId": "sr-uuid-1234",
    "comment": "Customer requested work after 2 PM."
  }
  ```
- **Status Codes**: `201 Created`

---

## 4. Attachment Module (`/api/v1/attachments`)

### 4.1 Upload File Metadata
- **Method**: `POST`
- **Route**: `/api/v1/attachments`
- **Purpose**: Record file attachment metadata with storage provider and checksum.
- **Status Codes**: `201 Created`
