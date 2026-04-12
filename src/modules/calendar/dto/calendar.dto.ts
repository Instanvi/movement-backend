import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class RoomDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  capacity?: number;

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
}

export class AppointmentTypeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  churchId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}

export class EventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  allDay: boolean;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  roomId?: string;

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
}
