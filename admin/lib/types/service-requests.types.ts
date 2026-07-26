export interface StatusHistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  remarks: string | null;
  createdAt: string;
  changedBy?: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export interface InternalCommentItem {
  id: string;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export interface AttachmentItem {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
}

export interface ServiceRequestDetail {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status:
    | 'CREATED'
    | 'ASSIGNED'
    | 'SURVEY_PENDING'
    | 'SURVEY_SUBMITTED'
    | 'SURVEY_APPROVED'
    | 'ESTIMATE_CREATED'
    | 'AWAITING_APPROVAL'
    | 'ADVANCE_PENDING'
    | 'ADVANCE_RECEIVED'
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'WORK_COMPLETED'
    | 'QUALITY_CHECK'
    | 'FINAL_PAYMENT_PENDING'
    | 'COMPLETED'
    | 'ARCHIVED'
    | 'CANCELLED';
  source?: 'AMC' | 'ONE_TIME' | 'WARRANTY';
  preferredDate?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string | null;
    user?: {
      id: string;
      email: string;
      phone: string;
    } | null;
  } | null;
  address?: {
    id: string;
    label: string;
    addressLine1: string;
    addressLine2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  serviceCategory?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  assignedVendor?: {
    id: string;
    businessName: string;
    companyName?: string | null;
    verificationStatus?: string;
    availabilityStatus?: string;
    averageRating?: string | number;
  } | null;
  statusHistory?: StatusHistoryItem[];
  comments?: InternalCommentItem[];
  attachments?: AttachmentItem[];
}

export interface SurveySummary {
  id: string;
  serviceRequestId: string;
  vendorId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
  notes?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  items?: Array<{ id: string; area: string; element: string; observation: string; severity: string }>;
  attachments?: AttachmentItem[];
}

export interface EstimateSummary {
  id: string;
  serviceRequestId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REVISED' | 'SUPERSEDED';
  subtotal: string | number;
  taxAmount: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  validUntil?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkOrderSummary {
  id: string;
  workOrderNumber: string;
  serviceRequestId: string;
  assignedVendorId: string;
  status: 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  scheduledStart: string;
  scheduledEnd: string;
  estimatedDuration?: number | null;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface PaymentSummary {
  id: string;
  paymentNumber: string;
  serviceRequestId: string;
  amount: string | number;
  type: 'ADVANCE' | 'PARTIAL' | 'MILESTONE' | 'FINAL' | 'REFUND';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  gateway: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  paymentId: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  totalAmount: string | number;
  paidAmount: string | number;
  dueAmount: string | number;
  dueDate?: string | null;
  issuedAt: string;
  pdfUrl?: string | null;
  createdAt: string;
}

export interface ActivityTimelineItem {
  id: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  title?: string;
  description?: string;
  timestamp: string;
  actor?: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export interface VendorOptionItem {
  id: string;
  businessName: string;
  verificationStatus?: string;
  availabilityStatus?: string;
  averageRating?: string | number;
}
