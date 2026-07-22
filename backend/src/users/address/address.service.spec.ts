import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AddressType } from '@prisma/client';
import { AddressService } from './address.service';

describe('AddressService (Address CRUD & Default Switch Verification)', () => {
  let addressService: AddressService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      customerProfile: {
        findFirst: jest.fn(),
      },
      address: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    addressService = new AddressService(prismaMock);
  });

  describe('createAddress', () => {
    it('should create default address atomically if customer has 0 addresses', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.address.count.mockResolvedValue(0);
      prismaMock.address.create.mockResolvedValue({
        id: 'addr-1',
        label: 'Home',
        isDefault: true,
      });

      const dto = {
        label: 'Home',
        addressType: AddressType.HOME,
        addressLine1: '123 Main St',
        city: 'City',
        state: 'State',
        country: 'Country',
        postalCode: '12345',
      };

      const res = await addressService.createAddress('u-cust', dto);

      expect(prismaMock.address.updateMany).toHaveBeenCalledWith({
        where: { customerId: 'c-1', deletedAt: null },
        data: { isDefault: false },
      });
      expect(res.address.isDefault).toBe(true);
    });
  });

  describe('getAddressById', () => {
    it('should throw ForbiddenException if address belongs to another customer', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.address.findFirst.mockResolvedValue({
        id: 'addr-other',
        customerId: 'c-other-owner',
      });

      await expect(addressService.getAddressById('u-cust', 'addr-other')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if address does not exist or is soft-deleted', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.address.findFirst.mockResolvedValue(null);

      await expect(addressService.getAddressById('u-cust', 'addr-deleted')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
