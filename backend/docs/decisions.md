# Architectural Decision Log (Production Final Hardened Schema)

This document records all architectural decisions finalized for the **NABS Field Service Management (FSM) Platform**.

---

## Decision-001: Use `WorkOrder` instead of `Job`
- Standardizes execution terminology with enterprise FSM tools.

## Decision-002: Human-Readable Business Ticket Identifiers
- `ticketNumber`, `workOrderNumber`, `paymentNumber`, `invoiceNumber`.

## Decision-003: Dedicated `ServiceRequestHistory` for SLA & Workflow Metrics
- Decoupled from system `AuditLog`.

## Decision-004: Option B Explicit Foreign Keys for `Attachment` and `Comment`
- Replaced loose `entityType`/`entityId` strings with explicit foreign key columns.
- Enforces database referential integrity, native PostgreSQL cascade deletes, and type-safe Prisma `include` queries.

## Decision-005: Cryptographic Hashing for `RefreshToken`
- `tokenHash` stored with IP and device name metadata.

## Decision-006: Direct 1:1 Coupling Between `Invoice` and `Payment`
- Every tax invoice corresponds strictly to a recorded financial payment transaction.

## Decision-007: PostgreSQL Engine XOR CHECK Constraints
- Enforces that `Attachment` and `Comment` records reference exactly ONE parent entity at a time using custom PostgreSQL migration SQL.

## Decision-008: Optimistic Concurrency Control (`version`)
- Added `version Int @default(1)` to `ServiceRequest`, `WorkOrder`, and `Payment` to prevent race conditions during concurrent API requests and webhooks.

## Decision-009: Strict Dual Soft-Delete Policy
- Master/Configuration models use `deletedAt` for safe deactivation.
- Transactional/Workflow models explicitly forbid soft deletion for legal non-repudiation and financial compliance.

## Decision-010: `StorageProvider` Enum
- Standardized cloud storage providers via `StorageProvider` enum (`S3`, `GCS`, `AZURE_BLOB`, `LOCAL`).
