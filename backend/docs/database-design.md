# Database Design Specification (Production Final Hardened Schema)

## Overview
This document specifies the complete, production-hardened database design for the **NABS Field Service Management (FSM) Platform**. The schema is engineered for enterprise-grade SaaS scalability, strict 3NF normalization, database-enforced referential integrity, optimistic concurrency control, and multi-tenant auditability.

The database runs on **Neon PostgreSQL** and is managed via **Prisma ORM** with UUID v4 primary keys across all models.

---

## Global Conventions & Rules
1. **Primary Keys**: Every entity uses a UUID (v4) generated primary key (`id`). Auto-increment integers are strictly prohibited.
2. **Timestamps**: Every business entity maintains `createdAt` and `updatedAt` timestamps unless it is an immutable log/history record (`createdAt` / `timestamp` only).
3. **Dual Soft-Delete Policy**:
   - Master/Configuration entities (`User`, `CustomerProfile`, `VendorProfile`, `AdminProfile`, `Address`, `ServiceCategory`) support soft deletion (`deletedAt`).
   - Operational/Financial entities (`ServiceRequest`, `Survey`, `Estimate`, `WorkOrder`, `Payment`, `Invoice`, `AuditLog`, `ServiceRequestHistory`) **never** use soft delete.
4. **Data Types**: Monetary values use high-precision decimals (`Decimal(12,2)`). Hours use `Decimal(5,2)`. Audit snapshots use PostgreSQL native `Json` (`oldData Json?`, `newData Json?`).
5. **Strict Referential Integrity & Single-Parent XOR Constraint**: `Attachment` and `Comment` use explicit optional foreign key columns backed by PostgreSQL `CHECK` constraints to ensure exactly ONE parent reference is populated.
6. **Optimistic Concurrency Control**: `ServiceRequest`, `WorkOrder`, and `Payment` include a `version` counter (`version Int @default(1)`) to prevent concurrent write collisions.

---

## Complete Entity & Field Inventory

### 1. User (`users`)
- `id` (UUID, PK), `email` (Unique), `phone` (Unique), `passwordHash`, `role` (`UserRole`), `status` (`UserStatus`), `emailVerifiedAt` (`DateTime?`), `phoneVerifiedAt` (`DateTime?`), `lastLogin`, `createdAt`, `updatedAt`, `deletedAt`.

### 2. RefreshToken (`refresh_tokens`)
- `id` (UUID, PK), `userId` (FK -> User), `tokenHash` (Unique), `deviceName`, `ipAddress`, `expiresAt`, `revokedAt`, `createdAt`.

### 3. CustomerProfile (`customer_profiles`)
- `id` (UUID, PK), `userId` (Unique FK -> User), `firstName`, `lastName`, `companyName`, `createdAt`, `updatedAt`, `deletedAt`.

### 4. VendorProfile (`vendor_profiles`)
- `id` (UUID, PK), `userId` (Unique FK -> User), `businessName`, `companyName`, `gstNumber`, `panNumber`, `secondaryPhone`, `yearsExperience`, `bio`, `profileImage`, `availabilityStatus` (`VendorAvailabilityStatus`), `averageRating` (Decimal 3,2), `totalCompletedJobs`, `verificationStatus` (`VendorVerificationStatus`), `createdAt`, `updatedAt`, `deletedAt`.

### 5. AdminProfile (`admin_profiles`)
- `id` (UUID, PK), `userId` (Unique FK -> User), `department`, `permissions` (`String[]`), `createdAt`, `updatedAt`, `deletedAt`.

### 6. Address (`addresses`)
- `id` (UUID, PK), `customerId` (FK -> CustomerProfile), `label`, `addressType` (`AddressType`), `addressLine1`, `addressLine2`, `landmark`, `city`, `state`, `country`, `postalCode`, `latitude`, `longitude`, `isDefault`, `createdAt`, `updatedAt`, `deletedAt`.

### 7. AMCSubscription (`amc_subscriptions`)
- `id` (UUID, PK), `customerId` (FK -> CustomerProfile), `planName`, `startDate`, `endDate`, `status` (`AMCStatus`), `visitsIncluded`, `visitsUsed`, `createdAt`, `updatedAt`.

### 8. ServiceCategory (`service_categories`)
- `id` (UUID, PK), `name` (Unique), `description`, `icon`, `iconUrl`, `color`, `displayOrder`, `estimatedDuration`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`.

### 9. VendorSkill (`vendor_skills`)
- `id` (UUID, PK), `vendorId` (FK -> VendorProfile), `categoryId` (FK -> ServiceCategory), `yearsOfExperience`, `skillLevel` (`SkillLevel`), `isPrimary`, `createdAt`, `updatedAt`. Unique `[vendorId, categoryId]`.

### 10. ServiceRequest (`service_requests`)
- `id` (UUID, PK), `ticketNumber` (Unique), `source` (`RequestSource`), `customerId` (FK -> CustomerProfile), `addressId` (FK -> Address), `serviceCategoryId` (FK -> ServiceCategory), `amcSubscriptionId` (FK -> AMCSubscription), `assignedVendorId` (FK -> VendorProfile), `title`, `description`, `priority`, `status`, `preferredDate`, `version` (Int), `createdAt`, `updatedAt`.

### 11. ServiceRequestHistory (`service_request_history`)
- `id` (UUID, PK), `serviceRequestId` (FK -> ServiceRequest), `fromStatus`, `toStatus`, `changedById` (FK -> User), `remarks`, `createdAt`.

### 12. Survey (`surveys`)
- `id` (UUID, PK), `serviceRequestId` (FK -> ServiceRequest), `vendorId` (FK -> VendorProfile), `version` (Int), `status` (`SurveyStatus`), `notes`, `startedAt`, `submittedAt`, `approvedAt`, `createdAt`, `updatedAt`.

### 13. SurveyItem (`survey_items`)
- `id` (UUID, PK), `surveyId` (FK -> Survey), `area`, `element`, `observation`, `actionRequired`, `severity` (`SurveySeverity`), `sortOrder`, `isMandatory`, `photoRequired`, `createdAt`, `updatedAt`.

### 14. Estimate (`estimates`)
- `id` (UUID, PK), `serviceRequestId` (FK -> ServiceRequest), `surveyId` (FK -> Survey), `version` (Int), `status` (`EstimateStatus`), `subtotal`, `taxAmount`, `discountAmount`, `totalAmount`, `termsAndConditions`, `validUntil`, `approvedAt`, `rejectedAt`, `createdAt`, `updatedAt`.

### 15. EstimateItem (`estimate_items`)
- `id` (UUID, PK), `estimateId` (FK -> Estimate), `description`, `quantity`, `unitPrice`, `taxRate`, `discount`, `total`, `createdAt`, `updatedAt`.

### 16. WorkOrder (`work_orders`)
- `id` (UUID, PK), `workOrderNumber` (Unique), `serviceRequestId` (FK -> ServiceRequest), `estimateId` (FK -> Estimate), `assignedVendorId` (FK -> VendorProfile), `status` (`WorkOrderStatus`), `scheduledStart`, `scheduledEnd`, `estimatedDuration`, `actualStartTime`, `actualEndTime`, `startedAt`, `completedAt`, `version` (Int), `createdAt`, `updatedAt`.

### 17. WorkTask (`work_tasks`)
- `id` (UUID, PK), `workOrderId` (FK -> WorkOrder), `description`, `remarks`, `sequenceNumber`, `estimatedHours`, `actualHours`, `status`, `completedAt`, `createdAt`, `updatedAt`.

### 18. WorkTimeline (`work_timelines`) & WorkStatusHistory (`work_status_history`)
- Work order timeline event logs & formal status audit history.

### 19. Payment (`payments`)
- `id` (UUID, PK), `paymentNumber` (Unique), `serviceRequestId` (FK -> ServiceRequest), `amount`, `type` (`PaymentType`), `status` (`PaymentStatus`), `gateway` (`PaymentGateway`), `gatewayTransactionId`, `gatewayOrderId`, `paymentMethod` (`PaymentMethod`), `paidAt`, `version` (Int), `createdAt`, `updatedAt`.

### 20. Invoice (`invoices`)
- `id` (UUID, PK), `invoiceNumber` (Unique), `paymentId` (Unique FK -> Payment), `status` (`InvoiceStatus`), `totalAmount`, `paidAmount`, `dueAmount`, `dueDate`, `issuedAt`, `pdfUrl`, `createdAt`, `updatedAt`.

### 21. Comment (`comments`)
- `id` (UUID, PK), `userId` (FK -> User), `comment`, `editedAt`, `createdAt`, `updatedAt`, explicit optional parent FKs (`serviceRequestId`, `surveyId`, `surveyItemId`, `estimateId`, `workOrderId`, `workTaskId`, `paymentId`, `invoiceId`, `vendorProfileId`, `customerProfileId`). Enforced via PostgreSQL `CHECK` constraint.

### 22. Attachment (`attachments`)
- `id` (UUID, PK), `fileName`, `url`, `mimeType`, `fileSize`, `storageProvider` (`StorageProvider`), `checksum`, `uploadedById` (FK -> User), `uploadedAt`, `createdAt`, `updatedAt`, explicit optional parent FKs (`serviceRequestId`, `surveyId`, `surveyItemId`, `estimateId`, `workOrderId`, `workTaskId`, `paymentId`, `invoiceId`, `userAvatarId`, `vendorProfileId`, `customerProfileId`). Enforced via PostgreSQL `CHECK` constraint.

### 23. Notification (`notifications`) & AuditLog (`audit_logs`)
- Notifications with delivery tracking; audit logs with native PostgreSQL `Json` snapshots.
