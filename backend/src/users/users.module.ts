import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { StorageModule } from '../storage';
import { AddressController } from './address/address.controller';
import { AddressService } from './address/address.service';
import { SessionsController } from './sessions/sessions.controller';
import { SessionsService } from './sessions/sessions.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [UsersController, AddressController, SessionsController],
  providers: [UsersService, AddressService, SessionsService],
  exports: [UsersService, AddressService, SessionsService],
})
export class UsersModule {}
