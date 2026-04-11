import { Module } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { StreamingRelayService } from './streaming-relay.service';
import { StreamingController } from './streaming.controller';
import { StreamingCallbackController } from './callback.controller';
import { DomainModule } from '../../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [StreamingController, StreamingCallbackController],
  providers: [StreamingService, StreamingRelayService],
  exports: [StreamingService, StreamingRelayService],
})
export class StreamingModule {}
