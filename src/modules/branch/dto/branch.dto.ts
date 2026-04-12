import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Main Branch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '456 Earth Rd, Muddy Town', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 'hq@church.org', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://church.org/location', required: false })
  @IsString()
  @IsOptional()
  website?: string;
}

export class BranchDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  zipCode?: string;

  @ApiPropertyOptional()
  latitude?: string;

  @ApiPropertyOptional()
  longitude?: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}
