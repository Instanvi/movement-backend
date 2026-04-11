import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { StreamingRepository } from '../../domain/repositories/streaming.repository';

@Injectable()
export class StreamingRelayService {
  private readonly logger = new Logger(StreamingRelayService.name);
  private activeStreams = new Map<string, ChildProcess>();

  constructor(private readonly streamingRepo: StreamingRepository) {}

  async startRelay(churchId: string, streamKey: string) {
    if (this.activeStreams.has(streamKey)) {
      this.logger.warn(`Stream ${streamKey} already being relayed.`);
      return;
    }

    // 1. Fetch all active platforms for this church
    const platforms = await this.streamingRepo.findByChurch(churchId);
    const activePlatforms = platforms.filter(
      (p) => p.isEnabled && p.status === 'offline',
    );

    if (activePlatforms.length === 0) {
      this.logger.warn(`No enabled platforms found for church ${churchId}.`);
      return;
    }

    // 2. Build FFmpeg command to duplicate the incoming RTMP to many destinations
    // Input: rtmp://media/live/$STREAM_KEY (from NGINX)
    const inputUrl = `rtmp://media/live/${streamKey}`;

    // Command structure: ffmpeg -i input -c copy -f flv output1 -c copy -f flv output2 ...
    const args = ['-i', inputUrl];

    for (const platform of activePlatforms) {
      const destUrl = `${platform.rtmpUrl}/${platform.streamKey}`;
      args.push('-c', 'copy', '-f', 'flv', destUrl);

      // Mark platform as 'live' in DB
      await this.streamingRepo.updateStatus(platform.id, 'live');
    }

    this.logger.log(
      `Starting FFmpeg relay for ${streamKey} to ${activePlatforms.length} platforms.`,
    );

    const ffmpeg = spawn('ffmpeg', args, { stdio: 'ignore' });

    ffmpeg.on('close', (code) => {
      this.logger.log(`FFmpeg relay for ${streamKey} closed with code ${code}`);
      this.activeStreams.delete(streamKey);
      void this.handleStreamEnd(
        churchId,
        activePlatforms.map((p) => p.id),
      );
    });

    ffmpeg.on('error', (err) => {
      this.logger.error(`FFmpeg relay for ${streamKey} failed: ${err.message}`);
    });

    this.activeStreams.set(streamKey, ffmpeg);
  }

  stopRelay(streamKey: string): void {
    const ffmpeg = this.activeStreams.get(streamKey);
    if (ffmpeg) {
      ffmpeg.kill('SIGTERM');
      this.activeStreams.delete(streamKey);
    }
  }

  private async handleStreamEnd(churchId: string, platformIds: string[]) {
    for (const id of platformIds) {
      await this.streamingRepo.updateStatus(id, 'offline');
    }
  }
}
