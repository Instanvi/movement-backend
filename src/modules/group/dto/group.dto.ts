import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsIn,
  IsBoolean,
} from 'class-validator';

/** Matches `group_visibility` in the DB (Gracely-style Private / Public / Team). */
export const GroupVisibilities = ['private', 'public', 'team'] as const;
export type GroupVisibility = (typeof GroupVisibilities)[number];

export const GroupEnrollments = ['open', 'closed'] as const;
export type GroupEnrollment = (typeof GroupEnrollments)[number];

export class CreateGroupDto {
  @ApiProperty({ example: 'Youth Ministry', description: 'Name of your group' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Group for church youth members',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    enum: GroupVisibilities,
    default: 'private',
    description:
      'Private group, public group, or team — maps to UI toggles; defaults to private if omitted.',
  })
  @IsOptional()
  @IsIn([...GroupVisibilities])
  visibility?: GroupVisibility;

  @ApiPropertyOptional({
    enum: GroupEnrollments,
    default: 'open',
    description: 'Open vs closed enrollment (details page badges).',
  })
  @IsOptional()
  @IsIn([...GroupEnrollments])
  enrollment?: GroupEnrollment;

  @ApiPropertyOptional({
    example: 'Room 204 / Zoom link in welcome email',
    description: 'General location for the group',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    example: 'Every Thursday at 7pm',
    description:
      'Free-text meetup schedule (HTML description can stay in `description`).',
  })
  @IsString()
  @IsOptional()
  meetupSummary?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/groups/shell.png',
    description: 'Group icon / cover image URL after client upload',
  })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description:
      'Primary group leader at creation; must be a member of this church. Adds a roster row with `isLeader: true`.',
  })
  @IsUUID()
  @IsOptional()
  leaderMemberId?: string;
}

export class AddMemberToGroupDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional({
    description: 'When true, marks this member as a group leader on the roster',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isLeader?: boolean;
}

export class GroupDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiProperty({ enum: GroupVisibilities })
  visibility: string;

  @ApiProperty({ enum: GroupEnrollments })
  enrollment: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  meetupSummary?: string;

  @ApiPropertyOptional()
  iconUrl?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}

export class GroupMemberDto {
  @ApiProperty()
  groupId: string;

  @ApiProperty()
  memberId: string;

  @ApiProperty()
  joinedAt: string;

  @ApiProperty()
  isLeader: boolean;

  @ApiPropertyOptional()
  addedByUserId?: string;
}
