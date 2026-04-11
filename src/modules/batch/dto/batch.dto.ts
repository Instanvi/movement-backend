import { IsString, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';
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
  @ApiProperty({
    description:
      'Ledger financial account ID (asset, e.g. checking) to credit for bank reconciliation.',
  })
  @IsUUID()
  accountId: string;
}
