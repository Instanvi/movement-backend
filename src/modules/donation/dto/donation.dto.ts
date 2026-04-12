import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({ example: 100.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    example: 'Cash',
    enum: ['Cash', 'Check', 'Online', 'Bank Transfer', 'Card', 'Other'],
  })
  @IsOptional()
  @IsEnum(['Cash', 'Check', 'Online', 'Bank Transfer', 'Card', 'Other'])
  method?: 'Cash' | 'Check' | 'Online' | 'Bank Transfer' | 'Card' | 'Other';

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({ example: 'Thank you for your service', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: 'uuid',
    required: false,
    description: 'Optional fund ID',
  })
  @IsOptional()
  @IsUUID()
  fundId?: string;

  @ApiProperty({
    example: 'uuid',
    required: false,
    description: 'Optional batch ID',
  })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @ApiProperty({
    example: 'uuid',
    required: false,
    description: 'Optional family ID',
  })
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiProperty({
    example: 'cc5527f4-8a4b-4f9e-bf33-219344c20b8e',
    required: false,
    description: 'Optional project ID',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    example: 'ee1127f4-8a4b-4f9e-bf33-219344c20b8e',
    required: false,
    description: 'Optional project item ID',
  })
  @IsOptional()
  @IsUUID()
  projectItemId?: string;
}

export class DonationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  donorId: string;

  @ApiProperty()
  churchId: string;

  @ApiProperty()
  branchId: string;

  @ApiPropertyOptional()
  familyId?: string;

  @ApiPropertyOptional()
  fundId?: string;

  @ApiPropertyOptional()
  batchId?: string;

  @ApiPropertyOptional()
  projectId?: string;

  @ApiPropertyOptional()
  projectItemId?: string;

  @ApiProperty({ enum: ['Cash', 'Check', 'Online', 'Bank Transfer', 'Card', 'Other'] })
  method: string;

  @ApiProperty()
  isRecurring: boolean;

  @ApiProperty()
  isAnonymous: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}
