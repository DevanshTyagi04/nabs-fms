import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from '../storage';
import {
  ChangePasswordDto,
  UpdateAdminProfileDto,
  UpdateCustomerProfileDto,
  UpdateVendorProfileDto,
} from './dto';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
  ) {}

  /**
   * Hashes a plain-text password using Argon2id
   */
  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies a plain-text password against an Argon2 hash
   */
  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  /**
   * Retrieves full profile details for authenticated user based on role
   */
  async getProfile(userId: string, role: UserRole) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        lastLogin: true,
        createdAt: true,
        customerProfile: role === UserRole.CUSTOMER ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            createdAt: true,
          },
        } : false,
        vendorProfile: role === UserRole.VENDOR ? {
          select: {
            id: true,
            businessName: true,
            companyName: true,
            gstNumber: true,
            panNumber: true,
            secondaryPhone: true,
            yearsExperience: true,
            bio: true,
            profileImage: true,
            availabilityStatus: true,
            averageRating: true,
            totalCompletedJobs: true,
            verificationStatus: true,
            createdAt: true,
          },
        } : false,
        adminProfile: role === UserRole.ADMIN ? {
          select: {
            id: true,
            department: true,
            permissions: true,
            createdAt: true,
          },
        } : false,
        avatarAttachments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, url: true, fileName: true, mimeType: true, fileSize: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  /**
   * Updates Customer profile fields
   */
  async updateCustomerProfile(userId: string, dto: UpdateCustomerProfileDto) {
    const customer = await this.prisma.customerProfile.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!customer) {
      throw new ForbiddenException('Customer profile does not exist for this account');
    }

    const updated = await this.prisma.customerProfile.update({
      where: { id: customer.id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName.trim() }),
        ...(dto.lastName && { lastName: dto.lastName.trim() }),
        ...(dto.companyName !== undefined && { companyName: dto.companyName?.trim() || null }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        updatedAt: true,
      },
    });

    this.logger.log(`[AUDIT_EVENT] [PROFILE_UPDATED] User: [${userId}] Role: [CUSTOMER]`);

    return {
      message: 'Customer profile updated successfully',
      profile: updated,
    };
  }

  /**
   * Updates Vendor profile fields (protecting read-only statistics)
   */
  async updateVendorProfile(userId: string, dto: UpdateVendorProfileDto) {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor profile does not exist for this account');
    }

    const updated = await this.prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: {
        ...(dto.companyName !== undefined && { companyName: dto.companyName?.trim() || null }),
        ...(dto.bio !== undefined && { bio: dto.bio?.trim() || null }),
        ...(dto.yearsExperience !== undefined && { yearsExperience: dto.yearsExperience }),
        ...(dto.availabilityStatus && { availabilityStatus: dto.availabilityStatus }),
        ...(dto.gstNumber !== undefined && { gstNumber: dto.gstNumber?.trim().toUpperCase() || null }),
        ...(dto.panNumber !== undefined && { panNumber: dto.panNumber?.trim().toUpperCase() || null }),
        ...(dto.secondaryPhone !== undefined && { secondaryPhone: dto.secondaryPhone?.trim() || null }),
        ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
      },
      select: {
        id: true,
        businessName: true,
        companyName: true,
        gstNumber: true,
        panNumber: true,
        secondaryPhone: true,
        yearsExperience: true,
        bio: true,
        profileImage: true,
        availabilityStatus: true,
        averageRating: true,
        totalCompletedJobs: true,
        verificationStatus: true,
        updatedAt: true,
      },
    });

    this.logger.log(`[AUDIT_EVENT] [PROFILE_UPDATED] User: [${userId}] Role: [VENDOR]`);

    return {
      message: 'Vendor profile updated successfully',
      profile: updated,
    };
  }

  /**
   * Updates Admin profile fields
   */
  async updateAdminProfile(userId: string, dto: UpdateAdminProfileDto) {
    const admin = await this.prisma.adminProfile.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!admin) {
      throw new ForbiddenException('Admin profile does not exist for this account');
    }

    const updated = await this.prisma.adminProfile.update({
      where: { id: admin.id },
      data: {
        ...(dto.department !== undefined && { department: dto.department?.trim() || null }),
      },
      select: {
        id: true,
        department: true,
        permissions: true,
        updatedAt: true,
      },
    });

    this.logger.log(`[AUDIT_EVENT] [PROFILE_UPDATED] User: [${userId}] Role: [ADMIN]`);

    return {
      message: 'Admin profile updated successfully',
      profile: updated,
    };
  }

  /**
   * Changes user password, verifies Argon2, updates hash, and bulk revokes all refresh tokens
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    const isCurrentPasswordValid = await this.verifyPassword(user.passwordHash, dto.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password does not match our records');
    }

    const newPasswordHash = await this.hashPassword(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // Bulk revoke all active sessions to require re-login
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: {
          revokedAt: new Date(),
          revokedReason: 'PASSWORD_CHANGED',
        },
      });
    });

    this.logger.log(`[AUDIT_EVENT] [PASSWORD_CHANGED] User: [${userId}]`);

    return {
      message: 'Password changed successfully. All active sessions have been logged out. Please log in again.',
    };
  }

  /**
   * Validates & uploads profile avatar, creating Attachment record and linking profile reference
   */
  async uploadAvatar(
    userId: string,
    role: UserRole,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ) {
    // 1. File Security Validations
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new BadRequestException(
        `Invalid file type. Allowed formats: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`,
      );
    }

    if (fileBuffer.length > MAX_AVATAR_SIZE_BYTES) {
      throw new BadRequestException('Avatar file size exceeds maximum permitted limit of 5MB');
    }

    // 2. Upload file via Storage Provider
    const uploaded = await this.storageProvider.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      'avatars',
    );

    // 3. Save Attachment record & update Profile in transaction
    const attachment = await this.prisma.$transaction(async (tx) => {
      // Cleanup previous avatar attachments
      const previousAvatar = await tx.attachment.findFirst({
        where: { userAvatarId: userId },
      });

      if (previousAvatar) {
        await this.storageProvider.deleteFile(previousAvatar.url);
        await tx.attachment.delete({ where: { id: previousAvatar.id } });
      }

      // Create new Attachment record
      const newAttachment = await tx.attachment.create({
        data: {
          fileName: uploaded.fileName,
          url: uploaded.url,
          mimeType: uploaded.mimeType,
          fileSize: uploaded.fileSize,
          uploadedById: userId,
          userAvatarId: userId,
        },
        select: {
          id: true,
          fileName: true,
          url: true,
          mimeType: true,
          fileSize: true,
          createdAt: true,
        },
      });

      // Update VendorProfile profileImage if vendor
      if (role === UserRole.VENDOR) {
        const vendor = await tx.vendorProfile.findFirst({ where: { userId } });
        if (vendor) {
          await tx.vendorProfile.update({
            where: { id: vendor.id },
            data: { profileImage: uploaded.url },
          });
        }
      }

      return newAttachment;
    });

    this.logger.log(`[AUDIT_EVENT] [AVATAR_UPDATED] User: [${userId}] Attachment: [${attachment.id}]`);

    return {
      message: 'Avatar uploaded successfully',
      avatar: attachment,
    };
  }

  /**
   * Removes current user profile avatar
   */
  async deleteAvatar(userId: string, role: UserRole) {
    const avatar = await this.prisma.attachment.findFirst({
      where: { userAvatarId: userId },
    });

    if (!avatar) {
      throw new NotFoundException('No active avatar image found for this account');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.storageProvider.deleteFile(avatar.url);

      await tx.attachment.delete({
        where: { id: avatar.id },
      });

      if (role === UserRole.VENDOR) {
        const vendor = await tx.vendorProfile.findFirst({ where: { userId } });
        if (vendor) {
          await tx.vendorProfile.update({
            where: { id: vendor.id },
            data: { profileImage: null },
          });
        }
      }
    });

    this.logger.log(`[AUDIT_EVENT] [AVATAR_UPDATED] User: [${userId}] Removed Avatar`);

    return {
      message: 'Avatar removed successfully',
    };
  }

  /**
   * Placeholder Email Verification request endpoint
   */
  async requestEmailVerification(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { email: true, emailVerifiedAt: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerifiedAt) return { message: 'Email address is already verified' };

    return {
      message: `Verification link placeholder triggered for ${user.email}. (Email delivery infrastructure will be active in future notification phase).`,
    };
  }

  /**
   * Placeholder Phone Verification request endpoint
   */
  async requestPhoneVerification(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { phone: true, phoneVerifiedAt: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.phoneVerifiedAt) return { message: 'Phone number is already verified' };

    return {
      message: `SMS OTP placeholder triggered for ${user.phone}. (SMS gateway infrastructure will be active in future notification phase).`,
    };
  }
}
