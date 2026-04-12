import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

export class CreateFinancialAccountDto {
  @ApiProperty({ example: 'Operating Checking' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '878',
    required: false,
    description: 'Optional chart code (Gracely “Code”).',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    example: 'Main bank account for offerings',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: AccountType,
    description:
      'Gracely Create Account uses Asset or Liability; equity/revenue/expense remain available for full ledger use.',
  })
  @IsEnum(AccountType)
  @IsNotEmpty()
  type: AccountType;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({
    example: 'uuid',
    required: false,
    description:
      'Optional linked fund (“Connected fund”). Must belong to this church. UI multi-fund pick maps to a single fund here.',
  })
  @IsOptional()
  @IsUUID()
  fundId?: string;

  @ApiProperty({
    example: 0,
    description: 'Opening balance (Gracely required field).',
  })
  @IsNumber()
  @IsNotEmpty()
  openingBalance: number;

  @ApiProperty({
    example: '2026-04-11',
    description: 'Opening date ISO string (Gracely required field).',
  })
  @IsString()
  @IsNotEmpty()
  openingDate: string;
}

export class CreateFundDto {
  @ApiProperty({ example: 'Building Fund' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'For new sanctuary construction', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isRestricted?: boolean;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class CreatePledgeCampaignDto {
  @ApiProperty({ example: 'Capital Campaign 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Fund this drive is tied to' })
  @IsUUID()
  @IsNotEmpty()
  fundId: string;

  @ApiProperty({ example: '2026-04-11' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2027-04-11', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class UpdatePledgeCampaignDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false, enum: ['draft', 'active', 'closed'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    required: false,
    description: 'true = archive (soft-hide), false = restore',
  })
  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}

export class CreateStewardshipPledgeDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'fund-uuid' })
  @IsUUID()
  @IsNotEmpty()
  fundId: string;

  @ApiProperty({
    required: false,
    description: 'When set, must match the campaign’s fund and church',
  })
  @IsOptional()
  @IsUUID()
  pledgeCampaignId?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @IsNotEmpty()
  targetAmount: number;

  @ApiProperty({ example: '2026-04-01T00:00:00Z', required: false })
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-12-31T00:00:00Z', required: false })
  @IsOptional()
  endDate?: string;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Weekly Offering' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'credit' })
  @IsString()
  @IsNotEmpty()
  type: string; // 'debit' or 'credit'

  @ApiProperty({ example: 'offering', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  fundId?: string;
}

export class FinancialAccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: AccountType })
  type: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiPropertyOptional()
  fundId?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class FundDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  targetAmount?: string;

  @ApiProperty()
  isRestricted: boolean;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PledgeCampaignDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fundId: string;

  @ApiProperty()
  churchId: string;

  @ApiProperty()
  startDate: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class StewardshipPledgeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  fundId: string;

  @ApiPropertyOptional()
  pledgeCampaignId?: string;

  @ApiProperty()
  churchId: string;

  @ApiProperty()
  targetAmount: string;

  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;
}

export class TransactionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  category?: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  referenceId?: string;

  @ApiPropertyOptional()
  fundId?: string;

  @ApiProperty()
  createdAt: string;
}

export class AccountingOverviewSummaryDto {
  @ApiProperty()
  totalBalance: number;

  @ApiProperty()
  assetAccountCount: number;

  @ApiProperty()
  liabilityAccountCount: number;

  @ApiProperty()
  categoryCount: number;

  @ApiProperty()
  payeeCount: number;
}

export class AccountingOverviewAccountDto extends FinancialAccountDto {
  @ApiProperty()
  balance: number;

  @ApiPropertyOptional()
  fundName?: string;
}

export class AccountingOverviewDto {
  @ApiProperty()
  summary: AccountingOverviewSummaryDto;

  @ApiProperty({ type: [AccountingOverviewAccountDto] })
  accounts: AccountingOverviewAccountDto[];
}

export class PledgeCampaignOverviewSummaryDto {
  @ApiProperty()
  totalPledged: number;

  @ApiProperty()
  totalRaised: number;

  @ApiProperty()
  remaining: number;
}

export class PledgeCampaignDetailedDto extends PledgeCampaignDto {
  @ApiPropertyOptional()
  fundName?: string;

  @ApiProperty()
  totalPledged: number;

  @ApiProperty()
  totalRaised: number;

  @ApiProperty()
  remaining: number;

  @ApiProperty()
  progressPercent: number;
}

export class PledgeCampaignOverviewDto {
  @ApiProperty()
  summary: PledgeCampaignOverviewSummaryDto;

  @ApiProperty({ type: [PledgeCampaignDetailedDto] })
  campaigns: PledgeCampaignDetailedDto[];
}

export class FundStatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;

  @ApiPropertyOptional()
  target?: number;

  @ApiPropertyOptional()
  progress?: number;
}

export class StatsDto {
  @ApiProperty()
  totalBalance: number;

  @ApiProperty()
  accountCount: number;

  @ApiProperty()
  fundCount: number;

  @ApiProperty({ type: [FundStatDto] })
  funds: FundStatDto[];
}
