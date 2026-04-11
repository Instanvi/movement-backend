import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { FinanceModule } from '../finance/finance.module';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  imports: [DomainModule, FinanceModule],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
