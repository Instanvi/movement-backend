import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class CreateStreamPlatformDto {
  @ApiProperty({ example: 'YouTube Live' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'rtmp://a.rtmp.youtube.com/live2' })
  @IsUrl()
  @IsNotEmpty()
  rtmpUrl: string;

  @ApiProperty({ example: 'stream-key-here' })
  @IsString()
  @IsNotEmpty()
  streamKey: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  createdById: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}

export class UpdateStreamStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // 'offline', 'live'
}

export class StreamPlatformDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  rtmpUrl: string;

  @ApiProperty()
  streamKey: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiProperty()
  createdById: string;

  @ApiPropertyOptional()
  lastStartedAt?: string;

  @ApiPropertyOptional()
  lastStoppedAt?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}
