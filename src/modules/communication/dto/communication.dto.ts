import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Easter Sunday Service Update' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Please join us for our special service at 9AM.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'all', required: false })
  @IsOptional()
  @IsString()
  audienceType?: string; // 'all', 'branch', 'group'

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class CreateFormDto {
  @ApiProperty({ example: 'Membership Form' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Please provide your details', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'registration' })
  @IsString()
  @IsNotEmpty()
  type: string; // 'registration', 'prayer', 'event', 'volunteer', 'custom'

  @ApiProperty({
    example: [{ label: 'Full Name', type: 'text', required: true }],
  })
  @IsObject()
  @IsNotEmpty()
  schema: any; // JSON definition of form fields
}
