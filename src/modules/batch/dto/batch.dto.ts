import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  batchDate?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsEnum(['open', 'closed', 'processing', 'voided'])
  status?: 'open' | 'closed' | 'processing' | 'voided';
}

export class UpdateBatchDto extends PartialType(CreateBatchDto) {
  @ApiPropertyOptional({
    description:
      'When true, sets archivedAt (archived). When false, clears archivedAt.',
  })
  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}

export class DepositBatchDto {
  @IsUUID()
  accountId: string;
}

export class BatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: ['open', 'closed', 'processing', 'voided'] })
  status: string;

  @ApiProperty()
  batchDate: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;

  @ApiPropertyOptional()
  totalAmount?: string;

  @ApiPropertyOptional()
  uniqueContributors?: number;
}

export class BatchOverviewSummaryDto {
  @ApiProperty()
  batchCount: number;

  @ApiProperty()
  uniqueContributors: number;
}

export class BatchOverviewDto {
  @ApiProperty()
  summary: BatchOverviewSummaryDto;

  @ApiProperty({ type: [BatchDto] })
  batches: BatchDto[];
}
