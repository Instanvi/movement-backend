import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { StreamingRelayService } from './streaming-relay.service';
import { StreamingRepository } from '../../domain/repositories/streaming.repository';

@ApiTags('streaming-callbacks')
@Controller('churches/callbacks/rtmp')
export class StreamingCallbackController {
  private readonly logger = new Logger(StreamingCallbackController.name);

  constructor(
    private readonly relayService: StreamingRelayService,
    private readonly streamingRepo: StreamingRepository,
  ) {}

  /**
   * Called by NGINX-RTMP when a stream starts publishing.
   * Body contains RTMP params: { name: 'streamKey', app: 'live', ... }
   */
  @Post('publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'RTMP on_publish callback',
    description:
      'Invoked by nginx-rtmp when FFmpeg/OBS connects. `name` is the stream key; must match a configured platform or the publish is rejected.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: 'RTMP stream key' },
        app: {
          type: 'string',
          description: 'RTMP application name',
          example: 'live',
        },
      },
    },
    examples: {
      default: { value: { name: 'obs-stream-key', app: 'live' } },
    },
  })
  async onPublish(@Body() body: { name: string; app: string }) {
    const streamKey = body.name;
    this.logger.log(`Received publish callback for ${streamKey}`);

    const platform = await this.streamingRepo.findOneByStreamKey(streamKey);

    if (platform) {
      await this.relayService.startRelay(platform.churchId, streamKey);
      return { success: true };
    }

    this.logger.warn(
      `Rejected publish attempt for non-existent key: ${streamKey}`,
    );
    throw new Error('Forbidden');
  }

  /**
   * Called by NGINX-RTMP when a stream stops.
   */
  @Post('done')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'RTMP on_done callback',
    description:
      'Invoked when publishing stops; stops FFmpeg relay for the stream key.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string', description: 'RTMP stream key' } },
    },
    examples: { default: { value: { name: 'obs-stream-key' } } },
  })
  onPublishDone(@Body() body: { name: string }) {
    const streamKey = body.name;
    this.logger.log(`Stream ${streamKey} finished publishing.`);
    this.relayService.stopRelay(streamKey);
    return { success: true };
  }
}
