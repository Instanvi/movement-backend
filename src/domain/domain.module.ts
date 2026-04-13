import { Module } from '@nestjs/common';
import { ChurchRepository } from './repositories/church.repository';
import { BranchRepository } from './repositories/branch.repository';
import { DonationRepository } from './repositories/donation.repository';
import { ProjectRepository } from './repositories/project.repository';
import { MessagingRepository } from './repositories/messaging.repository';
import { MemberRepository } from './repositories/member.repository';
import { ReportRepository } from './repositories/report.repository';
import { GroupRepository } from './repositories/group.repository';
import { FinanceRepository } from './repositories/finance.repository';
import { StreamingRepository } from './repositories/streaming.repository';
import { UserRepository } from './repositories/user.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { FamilyRepository } from './repositories/family.repository';
import { BatchRepository } from './repositories/batch.repository';
import { CalendarRepository } from './repositories/calendar.repository';
import { ChurchSettingRepository } from './repositories/church-setting.repository';
import { CommunicationRepository } from './repositories/communication.repository';
import { InvitationRepository } from './repositories/invitation.repository';
import { DevotionalRepository } from './repositories/devotional.repository';
import { DbModule } from '../core/db.module';

@Module({
  imports: [DbModule],
  providers: [
    ChurchRepository,
    BranchRepository,
    DonationRepository,
    ProjectRepository,
    MessagingRepository,
    MemberRepository,
    ReportRepository,
    GroupRepository,
    FinanceRepository,
    StreamingRepository,
    UserRepository,
    SubscriptionRepository,
    FamilyRepository,
    BatchRepository,
    CalendarRepository,
    ChurchSettingRepository,
    CommunicationRepository,
    InvitationRepository,
    DevotionalRepository,
  ],
  exports: [
    ChurchRepository,
    BranchRepository,
    DonationRepository,
    ProjectRepository,
    MessagingRepository,
    MemberRepository,
    ReportRepository,
    GroupRepository,
    FinanceRepository,
    StreamingRepository,
    UserRepository,
    SubscriptionRepository,
    FamilyRepository,
    BatchRepository,
    CalendarRepository,
    ChurchSettingRepository,
    CommunicationRepository,
    InvitationRepository,
    DevotionalRepository,
  ],
})
export class DomainModule {}
