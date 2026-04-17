import { UserModule } from './modules/user/user.module';
import { FinanceModule } from './modules/finance/finance.module';
import { GroupModule } from './modules/group/group.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ReportModule } from './modules/report/report.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { ProjectModule } from './modules/project/project.module';
import { DonationModule } from './modules/donation/donation.module';
import { MemberModule } from './modules/member/member.module';
import { BranchModule } from './modules/branch/branch.module';
import { ChurchModule } from './modules/church/church.module';
import { FamilyModule } from './modules/family/family.module';
import { BatchModule } from './modules/batch/batch.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ChurchSettingModule } from './modules/church-setting/church-setting.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { DevotionalModule } from './modules/devotional/devotional.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { DbModule } from './core/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_CONNECTION } from './core/db.provider';
import { createAppAuth } from './auth/create-app-auth';
import * as appSchema from './core/schema';
import { DomainModule } from './domain/domain.module';
import { RolesGuard } from './core/guards/roles.guard';

@Module({
  imports: [
    UserModule,
    BatchModule,
    FamilyModule,
    SubscriptionModule,
    FinanceModule,
    GroupModule,
    OnboardingModule,
    ReportModule,
    MessagingModule,
    ProjectModule,
    DonationModule,
    MemberModule,
    BranchModule,
    ChurchModule,
    CalendarModule,
    ChurchSettingModule,
    CommunicationModule,
    InvitationModule,
    DevotionalModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    DomainModule,
    AuthModule.forRootAsync({
      imports: [DbModule],
      useFactory(database: NodePgDatabase<typeof appSchema>) {
        return {
          auth: createAppAuth(database),
          disableTrustedOriginsCors: true,
          bodyParser: {
            json: { limit: '2mb' },
            urlencoded: { limit: '2mb', extended: true },
            rawBody: true,
          },
        };
      },
      inject: [DB_CONNECTION],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
