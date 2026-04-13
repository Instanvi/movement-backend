import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateDevotionalDto {
  @ApiProperty({ example: 'Morning Reflection' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Today we reflect on...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'Psalm 23:1' })
  @IsString()
  @IsOptional()
  scriptureReference?: string;

  @ApiPropertyOptional({ example: 'The Lord is my shepherd...' })
  @IsString()
  @IsOptional()
  scriptureText?: string;

  @ApiPropertyOptional({ example: 'Pastor John Doe' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: '2026-04-13' })
  @IsDateString()
  @IsNotEmpty()
  publishDate: string;

  @ApiProperty({ enum: ['morning', 'evening'], default: 'morning' })
  @IsString()
  @IsNotEmpty()
  timeOfDay: 'morning' | 'evening';

  @ApiPropertyOptional({ example: '1. Pray for strength...' })
  @IsString()
  @IsOptional()
  prayerPoints?: string;

  @ApiPropertyOptional({ example: 'I am the righteousness of God...' })
  @IsString()
  @IsOptional()
  confession?: string;

  @ApiPropertyOptional({ example: 'John 3:16-20' })
  @IsString()
  @IsOptional()
  furtherReading?: string;

  @ApiPropertyOptional({ example: 'Day 122 of 365' })
  @IsString()
  @IsOptional()
  readingPlan?: string;
}

export class UpdateDevotionalDto extends PartialType(CreateDevotionalDto) {}

export class DevotionalDto extends CreateDevotionalDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  churchId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
