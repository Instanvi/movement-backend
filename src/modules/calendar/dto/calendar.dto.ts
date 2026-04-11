import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Sanctuary' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class CreateAppointmentTypeDto {
  @ApiProperty({ example: 'Pastoral Counseling' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '30-minute counseling session', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Office', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsNotEmpty()
  duration: number;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Sunday Worship Service' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Join us for worship', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-04-12T09:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2026-04-12T11:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'Sanctuary Auditorium', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;
}
