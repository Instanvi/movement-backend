import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { AccountingController } from './accounting.controller';
import { FundController } from './fund.controller';
import { PledgeController } from './pledge.controller';
import { DomainModule } from '../../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [
    FinanceController,
    AccountingController,
    FundController,
    PledgeController,
  ],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
