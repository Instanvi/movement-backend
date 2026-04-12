import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateMessagingDto {
  @ApiProperty({
    description: 'Title of the messaging',
    example: 'Upcoming Event',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Content of the messaging',
    example: 'Join us for a wonderful event this Sunday.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Type of the messaging',
    enum: ['info', 'announcement', 'event'],
    example: 'event',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['info', 'announcement', 'event'])
  type: string;

  @ApiProperty({
    description: 'The Church ID this messaging belongs to',
    example: 'uuid-here',
  })
  @IsString()
  @IsNotEmpty()
  churchId: string;

  @ApiProperty({ description: 'Target Branch ID (Optional)', required: false })
  @IsString()
  @IsOptional()
  branchId?: string;
}

export class SendBulkMessagingDto extends CreateMessagingDto {
  @ApiProperty({
    description:
      'The target audience for the bulk messaging. "all" goes to everyone, "new_members" goes specifically to new members, "old_members" for old ones.',
    enum: ['all', 'new_members', 'old_members', 'active'],
    example: 'new_members',
  })
  @IsNotEmpty()
  @IsIn(['all', 'new_members', 'old_members', 'active'])
  targetAudience: string;
}

export class MessagingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['info', 'announcement', 'event'] })
  type: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;

  @ApiPropertyOptional()
  targetAudience?: string;

  @ApiPropertyOptional()
  sentToCount?: number;
}
