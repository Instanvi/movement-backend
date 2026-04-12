import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class UpdateChurchSettingDto {
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  defaultPronouns?: boolean;

  @ApiProperty({ example: 'basic', required: false })
  @IsOptional()
  @IsString()
  genderOptionType?: string;

  @ApiProperty({ example: { child: true, adult: true }, required: false })
  @IsOptional()
  @IsObject()
  ageGroups?: any;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @ApiProperty({ example: 'UTC', required: false })
  @IsOptional()
  @IsString()
  defaultTimezone?: string;
}

export class CreateCustomFieldDto {
  @ApiProperty({ example: 'Favorite Verse' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'text' })
  @IsString()
  @IsNotEmpty()
  type: string; // 'text', 'select', 'date', 'number'

  @ApiProperty({ example: 'Enter your favorite verse', required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  showOnPortal?: boolean;

  @ApiProperty({ example: ['Faith', 'Hope'], required: false })
  @IsOptional()
  @IsObject()
  options?: any;
}

export class ChurchSettingDto {
  @ApiProperty()
  churchId: string;

  @ApiProperty()
  defaultPronouns: boolean;

  @ApiProperty()
  genderOptionType: string;

  @ApiProperty()
  ageGroups: any;

  @ApiProperty()
  defaultCurrency: string;

  @ApiProperty()
  defaultTimezone: string;
}

export class CustomFieldDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  churchId: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  placeholder?: string;

  @ApiProperty()
  showOnPortal: boolean;

  @ApiPropertyOptional()
  options?: any;
}
