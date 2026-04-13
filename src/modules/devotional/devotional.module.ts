import { Module } from '@nestjs/common';
import { DevotionalService } from './devotional.service';
import { DevotionalController } from './devotional.controller';
import { DomainModule } from '../../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [DevotionalController],
  providers: [DevotionalService],
  exports: [DevotionalService],
})
export class DevotionalModule {}
