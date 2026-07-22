import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService (Phase 3 Integration & Unit Tests)', () => {
  let usersService: UsersService;
  let prismaMock: any;
  let storageProviderMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      customerProfile: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      vendorProfile: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      adminProfile: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      attachment: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      refreshToken: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    storageProviderMock = {
      uploadFile: jest.fn().mockResolvedValue({
        fileName: 'safe-avatar.jpg',
        originalName: 'my-avatar.jpg',
        url: '/uploads/avatars/safe-avatar.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
      }),
      deleteFile: jest.fn().mockResolvedValue(true),
      getFileUrl: jest.fn().mockImplementation((key) => Promise.resolve(key)),
    };

    usersService = new UsersService(prismaMock, storageProviderMock);
  });

  describe('getProfile', () => {
    it('should return customer profile details excluding soft-deleted records', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'u-cust',
        email: 'customer@nabs.com',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfile: {
          id: 'c-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      const res = await usersService.getProfile('u-cust', UserRole.CUSTOMER);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'u-cust', deletedAt: null },
        select: expect.any(Object),
      });
      expect(res.user.customerProfile?.firstName).toBe('John');
    });

    it('should throw NotFoundException if user profile does not exist', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(usersService.getProfile('nonexistent', UserRole.CUSTOMER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCustomerProfile', () => {
    it('should update customer profile fields', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1', userId: 'u-cust' });
      prismaMock.customerProfile.update.mockResolvedValue({
        id: 'c-1',
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'Acme LLC',
      });

      const res = await usersService.updateCustomerProfile('u-cust', {
        firstName: 'Jane',
        lastName: 'Smith',
      });

      expect(res.profile.firstName).toBe('Jane');
    });

    it('should throw ForbiddenException if customer profile does not exist', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue(null);

      await expect(
        usersService.updateCustomerProfile('u-vendor', { firstName: 'Jane' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException when current password verification fails', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'u-1',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummyHash',
      });

      await expect(
        usersService.changePassword('u-1', {
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewSecurePassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
