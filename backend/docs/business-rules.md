# Business Rules (Production Final Schema)

This document outlines the core business and operational rules governing the **NABS Field Service Management (FSM) Platform**.

---

## 1. Authentication & Security
- **Single Identity**: Every actor (Customer, Vendor, Admin) has a single `User` record containing authentication credentials and status flags.
- **Hashed Refresh Tokens**: Refresh tokens must be stored as SHA-256 hashes (`tokenHash`) in `RefreshToken` with client IP and device metadata.
- **Timestamp Verification**: `emailVerifiedAt` and `phoneVerifiedAt` record exact OTP verification timestamps.

---

## 2. Vendor Verification & Skills
- **Verification Prerequisite**: A vendor **must** have `verificationStatus = VERIFIED` before assignment to a `ServiceRequest` or `WorkOrder`.
- **Skill Level Assignment**: `VendorSkill` stores `skillLevel` (`BEGINNER`, `INTERMEDIATE`, `EXPERT`) alongside `yearsOfExperience` to ensure complex jobs are assigned to qualified experts.
- **Tax & Legal Information**: Verified vendors must provide valid `gstNumber` and `panNumber` details for financial invoicing compliance.

---

## 3. Service Request & Workflow History
- **Central Parent Entity**: All surveys, estimates, work orders, payments, and invoices belong to a parent `ServiceRequest`.
- **Business History Logging**: Every status transition of a `ServiceRequest` creates a `ServiceRequestHistory` record for SLA tracking.

---

## 4. Survey & Inspection Rules
- **Severity Classification**: Survey line items (`SurveyItem`) must record `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `sortOrder`, `isMandatory`, and `photoRequired`.
- **Workflow Timestamps**: Surveys record `startedAt`, `submittedAt`, and `approvedAt`.

---

## 5. Estimate Lifecycle & Expiration
- **Validity Constraints**: `Estimate` contains `validUntil`, `approvedAt`, and `rejectedAt`. Expired estimates cannot be approved.
- **Immutable Proposals**: Modifications create a new estimate version, transitioning the previous estimate to `REVISED`.

---

## 6. Work Order & Task Scheduling
- **Time Bounds**: `WorkOrder` scheduling is governed by `scheduledStart` and `scheduledEnd` timestamps.
- **Task Remarks**: `WorkTask` records `sequenceNumber`, `estimatedHours`, `actualHours`, and `remarks`.

---

## 7. Financial & Invoicing Rules
- **Gateway & Method Enums**: `Payment` enforces `PaymentGateway` and `PaymentMethod` enums.
- **Invoice Coupling**: Every `Invoice` is bound 1:1 to a `Payment` transaction with `InvoiceStatus` (`DRAFT`, `ISSUED`, `PAID`, `CANCELLED`).

---

## 8. Explicit Attachment & Comment Integrity
- **Database Enforcement**: File attachments and comments reference parent entities through explicit foreign keys (`serviceRequestId`, `workOrderId`, etc.) with PostgreSQL native `onDelete: Cascade` rules.
