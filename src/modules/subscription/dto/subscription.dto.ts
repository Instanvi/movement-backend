import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsObject,
} from 'class-validator';
import { OmitType } from '@nestjs/swagger';

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
  churchId: string;

  @IsEnum(['free', 'standard', 'pro'])
  plan: 'free' | 'standard' | 'pro';
}
