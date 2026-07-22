# Architectural Decision Log (Final Frozen State)

This document records all architectural decisions finalized for the **NABS Field Service Management (FSM) Platform**.

---

## Decision-001: Use `WorkOrder` instead of `Job`
- Core execution entity standardizing with enterprise FSM tools.

## Decision-002: Human-Readable Business Ticket Identifiers
- `ticketNumber`, `workOrderNumber`, `paymentNumber`, `invoiceNumber`.

## Decision-003: Dedicated `ServiceRequestHistory` for SLA & Workflow Metrics
- Decoupled from system `AuditLog`.

## Decision-004: Generic Polymorphic `Comment` & `Attachment` Entities
- Supports `entityType` (`EntityType` enum) and `entityId` across 11 entity types.

## Decision-005: Cryptographic Hashing for `RefreshToken`
- `tokenHash` stored with IP and device name metadata.

## Decision-006: Direct 1:1 Coupling Between `Invoice` and `Payment`
- **Reason**: Every tax invoice must correspond strictly to a recorded financial payment transaction.

## Decision-007: Timestamp-Based Verification Fields
- `emailVerifiedAt` and `phoneVerifiedAt` replace binary boolean flags for granular security audits.

## Decision-008: Dynamic Survey Checklist Fields
- `sortOrder`, `isMandatory`, and `photoRequired` added to `SurveyItem`.

## Decision-009: Vendor Availability Enum
- `VendorAvailabilityStatus` (`AVAILABLE`, `BUSY`, `ON_LEAVE`, `OFFLINE`) replaces binary boolean `isAvailable`.
