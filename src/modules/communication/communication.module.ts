import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { AnnouncementController } from './announcement.controller';
import { FormController } from './form.controller';
import { DomainModule } from '../../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [AnnouncementController, FormController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
