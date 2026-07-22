import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../../auth/decorators';
import { CreateAddressDto, UpdateAddressDto } from '../dto';
import { AddressService } from './address.service';

@ApiTags('Address Management (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('users/me/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Customer Address',
    description:
      'Creates a new delivery address for the authenticated Customer. Handles default address assignment atomically.',
  })
  @ApiResponse({ status: 201, description: 'Address created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only customers can add addresses.' })
  async createAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.createAddress(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Customer Addresses',
    description: 'Lists all active (non-deleted) addresses for the authenticated Customer.',
  })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully.' })
  async getAddresses(@CurrentUser('id') userId: string) {
    return this.addressService.getAddresses(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Address Details' })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiResponse({ status: 200, description: 'Address details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not your address.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  async getAddressById(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    const address = await this.addressService.getAddressById(userId, addressId);
    return { message: 'Address details retrieved successfully', address };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Address' })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiResponse({ status: 200, description: 'Address updated successfully.' })
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(userId, addressId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft Delete Address' })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiResponse({ status: 200, description: 'Address soft-deleted successfully.' })
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.addressService.deleteAddress(userId, addressId);
  }

  @Patch(':id/set-default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set Address as Default' })
  @ApiParam({ name: 'id', description: 'Address UUID' })
  @ApiResponse({ status: 200, description: 'Set as default address successfully.' })
  async setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.addressService.setDefaultAddress(userId, addressId);
  }
}
