import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserStatus, VendorAvailabilityStatus, VendorVerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';

@Injectable()
export class VendorAssignmentService {
  private readonly logger = new Logger(VendorAssignmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates vendor eligibility for assignment (active user, verified profile, available status)
   */
  async validateVendorEligibility(vendorId: string, serviceCategoryId?: string) {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: {
        id: vendorId,
        deletedAt: null,
      },
      select: {
        id: true,
        businessName: true,
        verificationStatus: true,
        availabilityStatus: true,
        user: {
          select: {
            id: true,
            status: true,
            deletedAt: true,
          },
        },
        skills: serviceCategoryId
          ? {
              where: { categoryId: serviceCategoryId },
              select: { id: true, categoryId: true },
            }
          : false,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found or inactive');
    }

    if (!vendor.user || vendor.user.deletedAt !== null || vendor.user.status !== UserStatus.ACTIVE) {
      throw new UnprocessableEntityException('Vendor user account is not active');
    }

    if (vendor.verificationStatus !== VendorVerificationStatus.VERIFIED) {
      throw new UnprocessableEntityException(
        `Vendor "${vendor.businessName}" is not verified (Current Status: ${vendor.verificationStatus})`,
      );
    }

    if (
      vendor.availabilityStatus === VendorAvailabilityStatus.OFFLINE ||
      vendor.availabilityStatus === VendorAvailabilityStatus.ON_LEAVE
    ) {
      throw new UnprocessableEntityException(
        `Vendor "${vendor.businessName}" is currently unavailable (${vendor.availabilityStatus})`,
      );
    }

    this.logger.log(`Vendor ID [${vendorId}] eligibility validated successfully`);
    return vendor;
  }
}
