import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered user email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Account password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
