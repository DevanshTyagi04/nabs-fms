import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService, ClientSessionInfo } from './auth.service';
import { CurrentUser, Public } from './decorators';
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterCustomerDto } from './dto';
import { AuthenticatedUser } from './interfaces';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractClientSessionInfo(req: Request): ClientSessionInfo {
    const userAgent = (req.headers['user-agent'] as string) || '';
    const secPlatform = (req.headers['sec-ch-ua-platform'] as string)?.replace(/"/g, '');

    let platform = secPlatform || 'Unknown';
    if (!secPlatform && userAgent) {
      if (userAgent.includes('Windows')) platform = 'Windows';
      else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) platform = 'macOS';
      else if (userAgent.includes('Android')) platform = 'Android';
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';
      else if (userAgent.includes('Linux')) platform = 'Linux';
    }

    let browser = 'Unknown';
    if (userAgent.includes('PostmanRuntime')) browser = 'Postman';
    else if (userAgent.includes('Edg/')) browser = 'Microsoft Edge';
    else if (userAgent.includes('Chrome/')) browser = 'Google Chrome';
    else if (userAgent.includes('Safari/')) browser = 'Safari';
    else if (userAgent.includes('Firefox/')) browser = 'Mozilla Firefox';

    const deviceName = `${browser} on ${platform}`;

    return {
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress,
      userAgent,
      deviceName,
      platform,
      browser,
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new Customer account',
    description:
      'Customer self-registration endpoint. Creates a new User record and associated CustomerProfile.',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully. Returns user details and initial JWT tokens.',
    schema: {
      example: {
        statusCode: 201,
        message: 'Registration successful',
        data: {
          user: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            email: 'customer@nabs.com',
            phone: '+18005550199',
            role: 'CUSTOMER',
            status: 'ACTIVE',
            customerProfile: {
              id: 'c1234567-89ab-cdef-0123-456789abcdef',
              firstName: 'John',
              lastName: 'Doe',
              companyName: 'Acme Services',
            },
          },
          tokens: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            tokenType: 'Bearer',
            expiresIn: 900,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (invalid email, phone, or weak password).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Email or phone number is already registered.',
  })
  async register(@Body() dto: RegisterCustomerDto, @Req() req: Request) {
    const clientInfo = this.extractClientSessionInfo(req);
    return this.authService.registerCustomer(dto, clientInfo);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login (Customer, Vendor, Admin)',
    description:
      'Authenticates any registered platform user via Email & Password and issues a JWT token pair.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful. Returns user details and JWT access + refresh tokens.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Login successful',
        data: {
          user: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            email: 'user@nabs.com',
            phone: '+18005550199',
            role: 'CUSTOMER',
            status: 'ACTIVE',
            customerProfileId: 'c1234567-89ab-cdef-0123-456789abcdef',
            firstName: 'John',
            lastName: 'Doe',
          },
          tokens: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            tokenType: 'Bearer',
            expiresIn: 900,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid email/password or account suspended/inactive.',
  })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const clientInfo = this.extractClientSessionInfo(req);
    return this.authService.login(dto, clientInfo);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Access Token (O(1) Token Rotation)',
    description:
      'Exchanges a valid, non-revoked Refresh Token for a fresh Access Token and new Refresh Token via O(1) jti lookup.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Tokens refreshed successfully',
        data: {
          tokens: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            tokenType: 'Bearer',
            expiresIn: 900,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Refresh token is invalid, expired, or revoked (replay attack prevented).',
  })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const clientInfo = this.extractClientSessionInfo(req);
    return this.authService.refreshToken(dto, clientInfo);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout User',
    description:
      'Revokes active refresh token for current session or performs bulk revocation across all logged-in devices.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Logged out successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid or missing bearer access token.',
  })
  async logout(@CurrentUser('id') userId: string, @Body() dto: LogoutDto) {
    return this.authService.logout(userId, dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Current Authenticated User Context',
    description:
      'Retrieves identity context, role, and profile IDs for the currently logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile context returned successfully.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Authenticated user context retrieved successfully',
        data: {
          user: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            email: 'user@nabs.com',
            phone: '+18005550199',
            role: 'CUSTOMER',
            status: 'ACTIVE',
            customerProfileId: 'c1234567-89ab-cdef-0123-456789abcdef',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Access token missing, invalid, or expired.',
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Authenticated user context retrieved successfully',
      user,
    };
  }
}
