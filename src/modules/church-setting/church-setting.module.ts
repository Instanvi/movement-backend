import { Module } from '@nestjs/common';
import { ChurchSettingService } from './church-setting.service';
import { ChurchSettingController } from './church-setting.controller';
import { DomainModule } from '../../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [ChurchSettingController],
  providers: [ChurchSettingService],
  exports: [ChurchSettingService],
})
export class ChurchSettingModule {}
