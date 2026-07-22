import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateAddressDto, UpdateAddressDto } from '../dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Resolves CustomerProfile ID for authenticated user or throws ForbiddenException
   */
  private async getCustomerProfileOrThrow(userId: string) {
    const profile = await this.prisma.customerProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    if (!profile) {
      throw new ForbiddenException('Only customers are permitted to manage delivery addresses');
    }

    return profile;
  }

  /**
   * Creates a new Customer address (handling default address switching atomically)
   */
  async createAddress(userId: string, dto: CreateAddressDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const addressCount = await this.prisma.address.count({
      where: { customerId: customer.id, deletedAt: null },
    });

    const shouldBeDefault = dto.isDefault || addressCount === 0;

    const address = await this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { customerId: customer.id, deletedAt: null },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          customerId: customer.id,
          label: dto.label.trim(),
          addressType: dto.addressType,
          addressLine1: dto.addressLine1.trim(),
          addressLine2: dto.addressLine2?.trim() || null,
          landmark: dto.landmark?.trim() || null,
          city: dto.city.trim(),
          state: dto.state.trim(),
          country: dto.country.trim(),
          postalCode: dto.postalCode.trim(),
          latitude: dto.latitude !== undefined ? dto.latitude : null,
          longitude: dto.longitude !== undefined ? dto.longitude : null,
          isDefault: shouldBeDefault,
        },
        select: {
          id: true,
          label: true,
          addressType: true,
          addressLine1: true,
          addressLine2: true,
          landmark: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          latitude: true,
          longitude: true,
          isDefault: true,
          createdAt: true,
        },
      });
    });

    this.logger.log(`[AUDIT_EVENT] [ADDRESS_CREATED] User: [${userId}] Address: [${address.id}]`);

    return {
      message: 'Address created successfully',
      address,
    };
  }

  /**
   * Lists all active addresses for authenticated customer
   */
  async getAddresses(userId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const addresses = await this.prisma.address.findMany({
      where: {
        customerId: customer.id,
        deletedAt: null,
      },
      select: {
        id: true,
        label: true,
        addressType: true,
        addressLine1: true,
        addressLine2: true,
        landmark: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        isDefault: true,
        createdAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      message: 'Addresses retrieved successfully',
      addresses,
    };
  }

  /**
   * Retrieves single address enforcing strict ownership & soft-delete checks
   */
  async getAddressById(userId: string, addressId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        deletedAt: null,
      },
      select: {
        id: true,
        customerId: true,
        label: true,
        addressType: true,
        addressLine1: true,
        addressLine2: true,
        landmark: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        isDefault: true,
        createdAt: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.customerId !== customer.id) {
      throw new ForbiddenException('You do not have permission to access this address');
    }

    return address;
  }

  /**
   * Updates an existing address enforcing ownership & default address switching
   */
  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.getAddressById(userId, addressId);

    const updatedAddress = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { customerId: address.customerId, deletedAt: null },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(dto.label && { label: dto.label.trim() }),
          ...(dto.addressType && { addressType: dto.addressType }),
          ...(dto.addressLine1 && { addressLine1: dto.addressLine1.trim() }),
          ...(dto.addressLine2 !== undefined && { addressLine2: dto.addressLine2?.trim() || null }),
          ...(dto.landmark !== undefined && { landmark: dto.landmark?.trim() || null }),
          ...(dto.city && { city: dto.city.trim() }),
          ...(dto.state && { state: dto.state.trim() }),
          ...(dto.country && { country: dto.country.trim() }),
          ...(dto.postalCode && { postalCode: dto.postalCode.trim() }),
          ...(dto.latitude !== undefined && { latitude: dto.latitude }),
          ...(dto.longitude !== undefined && { longitude: dto.longitude }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        },
        select: {
          id: true,
          label: true,
          addressType: true,
          addressLine1: true,
          addressLine2: true,
          landmark: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          latitude: true,
          longitude: true,
          isDefault: true,
          createdAt: true,
        },
      });
    });

    this.logger.log(`[AUDIT_EVENT] [ADDRESS_UPDATED] User: [${userId}] Address: [${addressId}]`);

    return {
      message: 'Address updated successfully',
      address: updatedAddress,
    };
  }

  /**
   * Soft deletes an address (`deletedAt = now()`) and reassigns default if necessary
   */
  async deleteAddress(userId: string, addressId: string) {
    const address = await this.getAddressById(userId, addressId);

    await this.prisma.$transaction(async (tx) => {
      await tx.address.update({
        where: { id: addressId },
        data: {
          deletedAt: new Date(),
          isDefault: false,
        },
      });

      // If the deleted address was default, reassign default to newest address
      if (address.isDefault) {
        const newestAddress = await tx.address.findFirst({
          where: { customerId: address.customerId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });

        if (newestAddress) {
          await tx.address.update({
            where: { id: newestAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    this.logger.log(`[AUDIT_EVENT] [ADDRESS_DELETED] User: [${userId}] Address: [${addressId}]`);

    return {
      message: 'Address deleted successfully',
    };
  }

  /**
   * Sets target address as default for the customer atomically
   */
  async setDefaultAddress(userId: string, addressId: string) {
    return this.updateAddress(userId, addressId, { isDefault: true });
  }
}
