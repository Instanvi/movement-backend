import { Module } from '@nestjs/common';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';
import { DomainModule } from '../../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [ChurchController],
  providers: [ChurchService],
  exports: [ChurchService],
})
export class ChurchModule {}
