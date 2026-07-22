export const SWAGGER_DOMAIN_EXAMPLES = {
  auth: {
    loginRequest: {
      email: 'customer@nabs.com',
      password: 'SecurePassword123!',
    },
    loginResponse: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'u-cust-123',
        email: 'customer@nabs.com',
        role: 'CUSTOMER',
      },
    },
  },
  serviceRequest: {
    createRequest: {
      title: 'AC Leaking Water Indoors',
      description: 'Split AC unit in living room is leaking water from lower vent.',
      serviceCategoryId: 'cat-ac-service-123',
      addressId: 'addr-home-123',
      priority: 'HIGH',
      preferredSchedule: '2026-07-25T10:00:00.000Z',
    },
    createResponse: {
      id: 'sr-uuid-123',
      ticketNumber: 'SR-20260722-A1B2',
      title: 'AC Leaking Water Indoors',
      status: 'CREATED',
      priority: 'HIGH',
      createdAt: '2026-07-22T22:00:00.000Z',
    },
  },
  workOrder: {
    item: {
      id: 'wo-uuid-123',
      workOrderNumber: 'WO-20260805-A1B2',
      status: 'IN_PROGRESS',
      assignedVendorId: 'v-vendor-123',
      scheduledDate: '2026-07-26T09:00:00.000Z',
    },
  },
  payment: {
    verifyRequest: {
      paymentId: 'p-pay-123',
      gatewayPaymentId: 'pay_NabsPayment123',
      gatewaySignature: 'a8f9c0e...hmac-sha256-signature',
    },
    verifyResponse: {
      status: 'SUCCESS',
      paymentNumber: 'PAY-20260805-A1B2',
      verifiedAt: '2026-07-22T22:00:00.000Z',
    },
  },
};
