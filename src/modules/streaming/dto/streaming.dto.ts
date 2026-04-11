import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'live' })
  @IsString()
  @IsNotEmpty()
  status: string; // 'offline', 'live'
}
