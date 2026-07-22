# Business Rules (Revision 2)

This document outlines the core business and operational rules governing the **NABS Field Service Management (FSM) Platform**.

---

## 1. Authentication & Security
- **Single Identity**: Every actor (Customer, Vendor, Admin) has a single `User` record containing authentication credentials and status flags.
- **Hashed Refresh Tokens**: Refresh tokens must be stored as SHA-256 hashes (`tokenHash`) in `RefreshToken` with client IP and device name metadata. Plain-text token storage is prohibited.

---

## 2. Vendor Verification & Skills
- **Verification Prerequisite**: A vendor **must** have `verificationStatus = VERIFIED` before assignment to a `ServiceRequest` or `WorkOrder`.
- **Skill Alignment**: Vendors can only be assigned to service requests matching their active `VendorSkill` categories.
- **Tax & Legal Information**: Verified vendors must provide valid `gstNumber` and `panNumber` details for financial invoicing compliance.

---

## 3. Service Request & Workflow History
- **Central Parent Entity**: All surveys, estimates, work orders, payments, and invoices belong to a parent `ServiceRequest`.
- **Business History Logging**: Every status transition of a `ServiceRequest` must create a `ServiceRequestHistory` record capturing `fromStatus`, `toStatus`, `changedById`, `remarks`, and `createdAt` for SLA tracking.

---

## 4. Survey Rules
- **Workflow Timestamps**: Surveys record `startedAt` (when site assessment starts), `submittedAt` (when vendor submits report), and `approvedAt` (when customer/admin accepts).
- **Survey Versioning**: Re-evaluations create a new version (`version = version + 1`) marking previous versions as `SUPERSEDED`.

---

## 5. Estimate Lifecycle & Expiration
- **Validity Constraints**: `Estimate` contains `validUntil`, `approvedAt`, and `rejectedAt`. An expired estimate (`validUntil < current_timestamp`) cannot be approved by a customer.
- **Immutable Proposals**: Modifications create a new estimate version, transitioning the previous estimate to `REVISED`.

---

## 6. Work Order & Task Scheduling
- **Task Sequencing**: Tasks inside a `WorkOrder` (`WorkTask`) are assigned an explicit `sequenceNumber`, `estimatedHours`, and `actualHours` for labor efficiency analysis.
- **Execution Tracking**: `WorkOrder` records `scheduledDate`, `estimatedDuration`, `actualStartTime`, and `actualEndTime` to calculate dispatch delay metrics.

---

## 7. Comments & Attachments
- **Contextual Collaboration**: `Comment` allows Admins, Vendors, and Customers to record notes on specific entities (`entityType`, `entityId`).
- **File Asset Integrity**: `Attachment` validates `fileName`, `mimeType`, `fileSize`, `storageProvider`, and `checksum` to prevent duplicate file uploads.
