import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma';
import { AuthenticatedUser, JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('jwt.accessSecret') || process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
      },
      include: {
        customerProfile: { select: { id: true, firstName: true, lastName: true } },
        vendorProfile: { select: { id: true, businessName: true } },
        adminProfile: { select: { id: true, department: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new UnauthorizedException('User account is inactive or suspended');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      customerProfileId: user.customerProfile?.id,
      vendorProfileId: user.vendorProfile?.id,
      adminProfileId: user.adminProfile?.id,
      firstName: user.customerProfile?.firstName,
      lastName: user.customerProfile?.lastName,
      businessName: user.vendorProfile?.businessName,
    };
  }
}
