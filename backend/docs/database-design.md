# Database Design Specification (Final Architecture Freeze)

## Overview
This document specifies the complete, frozen database design for the **NABS Field Service Management (FSM) Platform**. The schema is engineered for enterprise-grade SaaS scalability, strict 3NF normalization, referential integrity, comprehensive workflow history, and multi-tenant auditability.

The database runs on **Neon PostgreSQL** and is managed via **Prisma ORM** with UUID v4 primary keys across all models.

---

## Global Conventions & Rules
1. **Primary Keys**: Every entity uses a UUID (v4) generated primary key (`id`). Auto-increment integers are strictly prohibited.
2. **Timestamps**: Every business entity maintains `createdAt` and `updatedAt` timestamps unless it is an immutable log/history record (`createdAt` / `timestamp` only).
3. **Soft Delete**: Soft delete (`deletedAt`) is applied **only** to master and configuration entities (`User`, `CustomerProfile`, `VendorProfile`, `AdminProfile`, `Address`, `ServiceCategory`). Operational workflow entities (`ServiceRequest`, `Survey`, `Estimate`, `WorkOrder`, `Payment`, `Invoice`, `AuditLog`, `ServiceRequestHistory`) do not use soft delete.
4. **Data Types**: All monetary values use high-precision decimals (`Decimal(12,2)`). Hours use `Decimal(5,2)`. Floating-point values are avoided for financial calculations.
5. **Polymorphism**: `Attachment` and `Comment` handle file metadata and contextual business notes across all entities using generic `entityType` (`EntityType` enum) and `entityId` parameters.
6. **Financial Invoicing Link**: `Invoice` references `Payment` directly (1:1), which in turn links to `ServiceRequest`. This ensures strict payment-to-tax-invoice accounting compliance.
7. **Security**: Refresh tokens are stored as cryptographic hashes (`tokenHash`) with device metadata in `RefreshToken`. User email/phone verification uses timestamps (`emailVerifiedAt`, `phoneVerifiedAt`).

---

## Data Models & Entity Specifications

### 1. Auth & Identity Domain

#### `User`
- **Purpose**: Central authentication entity representing any actor on the platform.
- **Soft Delete**: Yes (`deletedAt`)
- **Fields**: `id`, `email`, `phone`, `passwordHash`, `role` (`UserRole`), `status` (`UserStatus`), `emailVerifiedAt` (`DateTime?`), `phoneVerifiedAt` (`DateTime?`), `lastLogin`, `createdAt`, `updatedAt`, `deletedAt`.
- **Indexes**: `[email]`, `[phone]`, `[role]`, `[status]`.

#### `RefreshToken`
- **Purpose**: Hashed session management with device & IP metadata.
- **Fields**: `id`, `userId`, `tokenHash` (Unique), `deviceName`, `ipAddress`, `expiresAt`, `revokedAt`, `createdAt`.
- **Indexes**: `[userId]`, `[tokenHash]`, `[expiresAt]`.

#### `CustomerProfile`
- **Fields**: `id`, `userId` (Unique), `firstName`, `lastName`, `companyName`, `createdAt`, `updatedAt`, `deletedAt`.

#### `VendorProfile`
- **Fields**: `id`, `userId` (Unique), `businessName`, `companyName`, `gstNumber`, `panNumber`, `secondaryPhone`, `yearsExperience`, `bio`, `profileImage`, `availabilityStatus` (`VendorAvailabilityStatus`), `averageRating` (Decimal 3,2), `totalCompletedJobs`, `verificationStatus` (`VendorVerificationStatus`), `createdAt`, `updatedAt`, `deletedAt`.
- **Indexes**: `[userId]`, `[verificationStatus]`, `[availabilityStatus]`, `[averageRating]`.

#### `AdminProfile`
- **Fields**: `id`, `userId` (Unique), `department`, `permissions` (`String[]`), `createdAt`, `updatedAt`, `deletedAt`.

---

### 2. Location & Subscription Domain

#### `Address`
- **Fields**: `id`, `customerId`, `label`, `addressType` (`AddressType`), `addressLine1`, `addressLine2`, `landmark`, `city`, `state`, `country`, `postalCode`, `latitude`, `longitude`, `isDefault`, `createdAt`, `updatedAt`, `deletedAt`.

#### `AMCSubscription`
- **Fields**: `id`, `customerId`, `planName`, `startDate`, `endDate`, `status` (`AMCStatus`), `visitsIncluded`, `visitsUsed`, `createdAt`, `updatedAt`.

---

### 3. Master Domain

#### `ServiceCategory`
- **Fields**: `id`, `name` (Unique), `description`, `icon`, `iconUrl`, `color`, `displayOrder`, `estimatedDuration`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`.

#### `VendorSkill`
- **Fields**: `id`, `vendorId`, `categoryId`, `yearsOfExperience`, `isPrimary`, `createdAt`, `updatedAt`.
- **Constraints**: Unique `[vendorId, categoryId]`.

---

### 4. Core Workflow Domain

#### `ServiceRequest`
- **Fields**: `id`, `ticketNumber` (Unique), `source` (`RequestSource`), `customerId`, `addressId`, `serviceCategoryId`, `amcSubscriptionId`, `assignedVendorId`, `title`, `description`, `priority`, `status`, `preferredDate`, `createdAt`, `updatedAt`.

#### `ServiceRequestHistory`
- **Fields**: `id`, `serviceRequestId`, `fromStatus`, `toStatus`, `changedById`, `remarks`, `createdAt`.

#### `Survey`
- **Fields**: `id`, `serviceRequestId`, `vendorId`, `version`, `status` (`SurveyStatus`), `notes`, `startedAt`, `submittedAt`, `approvedAt`, `createdAt`, `updatedAt`.

#### `SurveyItem`
- **Fields**: `id`, `surveyId`, `area`, `element`, `observation`, `actionRequired`, `sortOrder`, `isMandatory`, `photoRequired`, `createdAt`, `updatedAt`.

#### `Estimate`
- **Fields**: `id`, `serviceRequestId`, `surveyId`, `version`, `status` (`EstimateStatus`), `subtotal`, `taxAmount`, `discountAmount`, `totalAmount`, `termsAndConditions`, `validUntil`, `approvedAt`, `rejectedAt`, `createdAt`, `updatedAt`.

#### `EstimateItem`
- **Fields**: `id`, `estimateId`, `description`, `quantity`, `unitPrice`, `taxRate`, `discount`, `total`, `createdAt`, `updatedAt`.

---

### 5. Execution Domain

#### `WorkOrder`
- **Fields**: `id`, `workOrderNumber` (Unique), `serviceRequestId`, `estimateId`, `assignedVendorId`, `status` (`WorkOrderStatus`), `scheduledDate`, `scheduledStart`, `scheduledEnd`, `estimatedDuration`, `actualStartTime`, `actualEndTime`, `startedAt`, `completedAt`, `createdAt`, `updatedAt`.

#### `WorkTask`
- **Fields**: `id`, `workOrderId`, `description`, `sequenceNumber`, `estimatedHours`, `actualHours`, `status`, `completedAt`, `createdAt`, `updatedAt`.

#### `WorkTimeline` & `WorkStatusHistory`
- Timeline event logs & status audit history.

---

### 6. Financial Domain

#### `Payment`
- **Fields**: `id`, `paymentNumber` (Unique), `serviceRequestId`, `amount`, `type` (`PaymentType`), `status` (`PaymentStatus`), `gateway`, `gatewayTransactionId`, `gatewayOrderId`, `paymentMethod`, `paidAt`, `createdAt`, `updatedAt`.

#### `Invoice`
- **Fields**: `id`, `invoiceNumber` (Unique), `paymentId` (Unique FK -> Payment.id), `totalAmount`, `paidAmount`, `dueAmount`, `dueDate`, `issuedAt`, `pdfUrl`, `createdAt`, `updatedAt`.

---

### 7. Cross-Cutting & Infrastructure Domain

#### `Comment`
- **Fields**: `id`, `entityType` (`EntityType`), `entityId`, `userId`, `comment`, `editedAt`, `createdAt`, `updatedAt`.

#### `Attachment`
- **Fields**: `id`, `entityType` (`EntityType`), `entityId`, `fileName`, `url`, `mimeType`, `fileSize`, `storageProvider`, `checksum`, `uploadedById`, `uploadedAt`, `createdAt`, `updatedAt`.

#### `Notification` & `AuditLog`
- Notifications with delivery tracking; audit logs with `oldData`/`newData` JSON snapshots.
