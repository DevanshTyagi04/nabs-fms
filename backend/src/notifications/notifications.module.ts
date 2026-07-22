import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma';
import { AdminNotificationController } from './admin-notifications.controller';
import { NotificationDispatcherService } from './dispatcher/notification-dispatcher.service';
import { NotificationEventListener } from './events/notification-event.listener';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { InAppProvider } from './providers/in-app.provider';
import {
  EMAIL_PROVIDER_TOKEN,
  IN_APP_PROVIDER_TOKEN,
} from './providers/interfaces/notification-provider.interface';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [NotificationsController, AdminNotificationController],
  providers: [
    NotificationsService,
    NotificationDispatcherService,
    NotificationEventListener,
    InAppProvider,
    EmailProvider,
    {
      provide: IN_APP_PROVIDER_TOKEN,
      useClass: InAppProvider,
    },
    {
      provide: EMAIL_PROVIDER_TOKEN,
      useClass: EmailProvider,
    },
  ],
  exports: [
    NotificationsService,
    NotificationDispatcherService,
    IN_APP_PROVIDER_TOKEN,
    EMAIL_PROVIDER_TOKEN,
  ],
})
export class NotificationsModule {}
