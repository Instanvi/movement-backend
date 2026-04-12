import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/** Church identity only — addresses and site contact live on {@link CreateBranchDto}. */
export class CreateChurchDto {
  @ApiProperty({ example: 'First Baptist Church' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'first-baptist', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    required: false,
    description: 'Logo URL (public or CDN)',
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ example: 'Baptist', required: false })
  @IsString()
  @IsOptional()
  denomination?: string;

  @ApiProperty({
    required: false,
    description: 'Free-form notes (JSON or text)',
  })
  @IsString()
  @IsOptional()
  metadata?: string;
}

export class ChurchDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  logo?: string;

  @ApiPropertyOptional()
  denomination?: string;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  metadata?: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}
