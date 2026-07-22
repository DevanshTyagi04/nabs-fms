import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({
    enum: ['avatars', 'attachments', 'invoices', 'temp'],
    example: 'attachments',
    description: 'Storage target subfolder/category',
  })
  @IsEnum(['avatars', 'attachments', 'invoices', 'temp'])
  category!: 'avatars' | 'attachments' | 'invoices' | 'temp';

  @ApiProperty({
    example: 'avatars/old-uuid.jpg',
    required: false,
    description: 'Optional file key to atomically replace and delete after successful upload',
  })
  @IsOptional()
  @IsString()
  oldFileKeyToDelete?: string;
}

export class SignedUrlQueryDto {
  @ApiProperty({ example: 'attachments/uuid.pdf' })
  @IsNotEmpty()
  @IsString()
  fileKey!: string;
}

export class StorageMetadataResponseDto {
  @ApiProperty({ example: 'attachments/uuid.pdf' })
  objectKey!: string;

  @ApiProperty({ example: 'report.pdf' })
  originalFilename!: string;

  @ApiProperty({ example: 'application/pdf' })
  contentType!: string;

  @ApiProperty({ example: 1048576 })
  size!: number;

  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  checksum?: string;

  @ApiProperty({ example: '2026-07-22T22:00:00.000Z' })
  lastModified!: Date;

  @ApiProperty({ example: '/uploads/attachments/uuid.pdf' })
  url!: string;
}
