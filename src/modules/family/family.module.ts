import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';

@Module({
  imports: [DomainModule],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
