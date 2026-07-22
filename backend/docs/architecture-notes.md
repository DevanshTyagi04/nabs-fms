# Architecture Notes (Production Final Hardened Schema)

This document outlines the final production-hardened architectural choices for the **NABS Field Service Management (FSM) Platform**.

---

## 1. Explicit Foreign Keys & PostgreSQL XOR CHECK Constraints (Attachment & Comment)
While explicit optional foreign keys (`serviceRequestId`, `surveyId`, etc.) provide database-enforced referential integrity and native PostgreSQL cascade deletes, a record must belong to **exactly one** parent entity at a time.

Since Prisma ORM DSL syntax does not natively generate multi-column XOR `CHECK` constraints, we enforce this at the PostgreSQL engine level via custom SQL migrations (`migrations/YYYYMMDDHHMMSS_add_xor_check_constraints/migration.sql`):

```sql
-- Enforce exactly ONE parent reference per comment
ALTER TABLE "comments" ADD CONSTRAINT "chk_comment_single_parent" CHECK (
  (CASE WHEN "serviceRequestId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "surveyId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "surveyItemId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "estimateId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "workOrderId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "workTaskId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "paymentId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "invoiceId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "vendorProfileId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "customerProfileId" IS NOT NULL THEN 1 ELSE 0 END) = 1
);

-- Enforce exactly ONE parent reference per attachment
ALTER TABLE "attachments" ADD CONSTRAINT "chk_attachment_single_parent" CHECK (
  (CASE WHEN "serviceRequestId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "surveyId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "surveyItemId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "estimateId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "workOrderId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "workTaskId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "paymentId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "invoiceId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "userAvatarId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "vendorProfileId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "customerProfileId" IS NOT NULL THEN 1 ELSE 0 END) = 1
);
```

---

## 2. Optimistic Concurrency Control (`version`)
High-volume field service management platforms experience concurrent updates (e.g. simultaneous vendor assignments, automated payment webhook processing, and field technician status updates).

We implement optimistic concurrency control (`version Int @default(1)`) on core transactional entities:
- `ServiceRequest`
- `WorkOrder`
- `Payment`

**How it protects data**: NestJS services include `where: { id, version }` when applying state updates, incrementing `version: version + 1`. If another actor modified the record concurrently, the update fails cleanly with a concurrency error rather than overwriting data silently.

---

## 3. Explicit Soft-Delete Strategy
- **Master & Configuration Data (`deletedAt` Enabled)**: `User`, `CustomerProfile`, `VendorProfile`, `AdminProfile`, `Address`, `ServiceCategory`.
  - *Reason*: Deactivating a vendor or service category must mark `deletedAt` without hard-deleting records, preserving historical references in past work orders and financial invoices.
- **Transactional & Workflow Data (`deletedAt` Disabled)**: `ServiceRequest`, `Survey`, `Estimate`, `WorkOrder`, `Payment`, `Invoice`, `AuditLog`, `ServiceRequestHistory`.
  - *Reason*: Financial transactions and service request contracts must never be soft-deleted. Status transitions use domain enums (`CANCELLED`, `ARCHIVED`, `SUPERSEDED`, `REFUNDED`), fulfilling legal non-repudiation and financial auditing standards.

---

## 4. `StorageProvider` Enum
`Attachment.storageProvider` uses `StorageProvider` enum (`S3`, `GCS`, `AZURE_BLOB`, `LOCAL`) instead of plain-text strings to ensure compile-time type safety across cloud storage integrations.
