# API Specification (Production Final Schema)

This document details the RESTful API endpoints planned for the **NABS Field Service Management (FSM) Platform** backend.

---

## 1. Authentication Module (`/api/v1/auth`)

### 1.1 Login User
- **Method**: `POST`
- **Route**: `/api/v1/auth/login`
- **Purpose**: Authenticate user credentials and return JWT access token and hashed refresh token session.

---

## 2. Service Request Module (`/api/v1/service-requests`)

### 2.1 Get Request Workflow History
- **Method**: `GET`
- **Route**: `/api/v1/service-requests/:id/history`
- **Purpose**: Fetch status transition history (`ServiceRequestHistory`) for SLA tracking.

---

## 3. Comment Module (`/api/v1/comments`)

### 3.1 Create Comment (Explicit Relations)
- **Method**: `POST`
- **Route**: `/api/v1/comments`
- **Purpose**: Post a contextual note on a specific entity using explicit relation fields (`serviceRequestId`, `workOrderId`, etc.).
- **Request Body**:
  ```json
  {
    "serviceRequestId": "sr-uuid-1234",
    "comment": "Customer requested work after 2 PM."
  }
  ```
- **Status Codes**: `201 Created`

---

## 4. Attachment Module (`/api/v1/attachments`)

### 4.1 Upload File Metadata
- **Method**: `POST`
- **Route**: `/api/v1/attachments`
- **Purpose**: Record file attachment metadata with explicit entity relation, storage provider, and SHA-256 checksum.
- **Status Codes**: `201 Created`
