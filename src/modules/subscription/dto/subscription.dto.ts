import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsObject,
} from 'class-validator';
import { OmitType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
    'paused',
  ])
  status?:
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid'
    | 'paused';

  @IsOptional()
  @IsEnum(['free', 'standard', 'pro'])
  plan?: 'free' | 'standard' | 'pro';

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @IsOptional()
  @IsDate()
  currentPeriodEnd?: Date;

  @IsOptional()
  @IsObject()
  metadata?: unknown;
}

export class CreateSubscriptionDto extends OmitType(UpdateSubscriptionDto, [
  'plan',
] as const) {
  @IsString()
  @IsEnum(['free', 'standard', 'pro'])
  plan: 'free' | 'standard' | 'pro';
}

export class SubscriptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  stripeSubscriptionId?: string;

  @ApiPropertyOptional()
  stripeCustomerId?: string;

  @ApiPropertyOptional()
  stripePriceId?: string;

  @ApiProperty({ enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'paused'] })
  status: string;

  @ApiProperty({ enum: ['free', 'standard', 'pro'] })
  plan: string;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiPropertyOptional()
  currentPeriodStart?: string;

  @ApiPropertyOptional()
  currentPeriodEnd?: string;

  @ApiPropertyOptional()
  trialStart?: string;

  @ApiPropertyOptional()
  trialEnd?: string;

  @ApiPropertyOptional()
  endedAt?: string;

  @ApiPropertyOptional()
  cancelAt?: string;

  @ApiPropertyOptional()
  canceledAt?: string;

  @ApiPropertyOptional()
  metadata?: any;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}
