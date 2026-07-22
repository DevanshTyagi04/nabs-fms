# Architecture Notes (Final Frozen State)

This document outlines the frozen architectural choices for the **NABS Field Service Management (FSM) Platform**.

---

## 1. Direct Invoice to Payment Coupling
- `Invoice` is directly linked via a 1:1 foreign key (`paymentId`) to `Payment`.
- **Financial Compliance**: Every tax invoice generated in NABS corresponds to a specific, recorded financial transaction (`Payment`). Since `Payment` is tied to `ServiceRequest`, `Invoice` maintains access to request data through `Payment` without redundant or unnormalized foreign key duplication.

---

## 2. Granular Verification Timestamps
- `User.isVerified` (Boolean) was replaced with `emailVerifiedAt` (`DateTime?`) and `phoneVerifiedAt` (`DateTime?`).
- **Auditability**: Enables distinct tracking for email and SMS OTP verification workflows, compliance logging, and security re-verification policies.

---

## 3. Dynamic Survey Templates (`SurveyItem`)
- `SurveyItem` includes `sortOrder`, `isMandatory`, and `photoRequired`.
- **Mobile Experience**: Vendor mobile apps can render dynamic inspection checklists with mandatory checks, enforced before/after photo uploads (`photoRequired`), and custom checklist sorting (`sortOrder`).

---

## 4. WorkOrder Scheduling Bounds
- `WorkOrder` includes `scheduledStart` and `scheduledEnd` alongside `scheduledDate` and `estimatedDuration`.
- **Calendar & Dispatch Integration**: Enables exact calendar slot booking (e.g. 10:00 AM - 12:00 PM) for vendor dispatch boards and mobile app calendar synchronization.

---

## 5. Expanded Financial Gateway Attributes
- `Payment` captures `gateway`, `gatewayTransactionId`, `gatewayOrderId`, and `paymentMethod`.
- **Reconciliation**: Provides seamless webhook processing and financial reconciliation with payment processors like Stripe, Razorpay, or PayPal.
