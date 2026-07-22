import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
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
import { Response } from 'express';
import { Roles } from '../auth/decorators';
import { FileUploadDto, SignedUrlQueryDto, StorageMetadataResponseDto } from './dto';
import { StorageService } from './storage.service';

@ApiTags('File & Storage Management')
@ApiBearerAuth('JWT-auth')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload File (Avatars, Attachments, Invoices)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        category: { type: 'string', enum: ['avatars', 'attachments', 'invoices', 'temp'] },
        oldFileKeyToDelete: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  async uploadFile(
    @UploadedFile() file: any,
    @Body() dto: FileUploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const { metadata, oldFileQueuedForDeletion } = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        category: dto.category,
        customOldFileKeyToDelete: dto.oldFileKeyToDelete,
      },
    );

    return {
      message: 'File uploaded successfully',
      file: metadata,
      oldFileQueuedForDeletion,
    };
  }

  @Get('download/*')
  @ApiOperation({ summary: 'Stream Download File with Content-Disposition' })
  @ApiResponse({ status: 200, description: 'File stream returned.' })
  async downloadFile(
    @Param('0') fileKey: string,
    @Res() res: Response,
  ) {
    const { stream, metadata, contentDisposition } = await this.storageService.downloadStream(fileKey);

    res.setHeader('Content-Type', metadata.contentType);
    res.setHeader('Content-Length', metadata.size);
    res.setHeader('Content-Disposition', contentDisposition);

    stream.pipe(res);
  }

  @Get('signed-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate Provider-Independent Download Signed URL' })
  @ApiResponse({ status: 200, description: 'Signed URL generated.' })
  async getSignedUrl(@Query() query: SignedUrlQueryDto) {
    const url = await this.storageService.generateSignedUrl(query.fileKey);
    return { signedUrl: url, fileKey: query.fileKey };
  }

  @Get('metadata/*')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve Standardized File Metadata' })
  @ApiResponse({ status: 200, description: 'File metadata returned.', type: StorageMetadataResponseDto })
  async getMetadata(@Param('0') fileKey: string) {
    return this.storageService.getMetadata(fileKey);
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Storage Provider Health Check' })
  @ApiResponse({ status: 200, description: 'Provider health check result returned.' })
  async checkHealth() {
    return this.storageService.checkHealth();
  }

  @Delete('*')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete File (Admin Only)' })
  @ApiResponse({ status: 200, description: 'File deleted.' })
  async deleteFile(@Param('0') fileKey: string) {
    const deleted = await this.storageService.deleteFile(fileKey);
    return { deleted, fileKey };
  }
}
