import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import { AuthenticatedUser } from '../auth/interfaces';
import {
  ChangePasswordDto,
  UpdateAdminProfileDto,
  UpdateCustomerProfileDto,
  UpdateVendorProfileDto,
} from './dto';
import { UsersService } from './users.service';

@ApiTags('User Profile & Security')
@ApiBearerAuth('JWT-auth')
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Own Profile Context',
    description:
      'Retrieves the full profile details (Customer, Vendor, or Admin) associated with the currently authenticated account.',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.id, user.role);
  }

  @Patch('customer-profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Update Customer Profile',
    description: 'Updates firstName, lastName, or companyName for authenticated Customer.',
  })
  @ApiResponse({ status: 200, description: 'Customer profile updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires CUSTOMER role.' })
  async updateCustomerProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.usersService.updateCustomerProfile(userId, dto);
  }

  @Patch('vendor-profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.VENDOR)
  @ApiOperation({
    summary: 'Update Vendor Profile',
    description:
      'Updates companyName, bio, yearsExperience, availabilityStatus, GST, PAN, secondaryPhone, or profileImage for authenticated Vendor. System stats remain protected read-only.',
  })
  @ApiResponse({ status: 200, description: 'Vendor profile updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires VENDOR role.' })
  async updateVendorProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateVendorProfileDto,
  ) {
    return this.usersService.updateVendorProfile(userId, dto);
  }

  @Patch('admin-profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update Admin Profile',
    description: 'Updates department for authenticated Admin account.',
  })
  @ApiResponse({ status: 200, description: 'Admin profile updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role.' })
  async updateAdminProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.usersService.updateAdminProfile(userId, dto);
  }

  @Post('security/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change Account Password',
    description:
      'Verifies current password with Argon2id, updates password hash, and bulk revokes all active refresh tokens requiring re-login.',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully. All active sessions logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Current password invalid.' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload Profile Avatar Image',
    description:
      'Validates image file (JPEG, PNG, WEBP max 5MB), stores via IStorageProvider abstraction, creates Attachment record, and updates profile reference.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile avatar image file (max 5MB, JPEG/PNG/WEBP)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeds limit.' })
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: any,
  ) {
    if (!file || !file.buffer) {
      throw new Error('Avatar image file is required in request body as "file"');
    }

    return this.usersService.uploadAvatar(
      user.id,
      user.role,
      file.buffer,
      file.originalname || 'avatar.jpg',
      file.mimetype || 'image/jpeg',
    );
  }

  @Delete('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove Profile Avatar Image' })
  @ApiResponse({ status: 200, description: 'Avatar image removed successfully.' })
  @ApiResponse({ status: 404, description: 'No active avatar image found.' })
  async deleteAvatar(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteAvatar(user.id, user.role);
  }

  @Post('verification/email/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Email Verification Link Placeholder' })
  @ApiResponse({ status: 200, description: 'Email verification trigger placeholder response.' })
  async requestEmailVerification(@CurrentUser('id') userId: string) {
    return this.usersService.requestEmailVerification(userId);
  }

  @Post('verification/phone/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Phone SMS OTP Verification Placeholder' })
  @ApiResponse({ status: 200, description: 'Phone verification trigger placeholder response.' })
  async requestPhoneVerification(@CurrentUser('id') userId: string) {
    return this.usersService.requestPhoneVerification(userId);
  }
}
