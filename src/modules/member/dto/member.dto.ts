import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsBoolean,
  IsEmail,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export type MemberRole = 'admin' | 'pastor' | 'member';
export const MemberRoles: MemberRole[] = ['admin', 'pastor', 'member'];

export const AgeGroups = ['Child', 'Youth', 'Adult', 'Senior'] as const;
export type AgeGroup = (typeof AgeGroups)[number];

export class CreateMemberDto {
  @ApiProperty({ description: 'Display name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Login email (unique)',
    example: 'john@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Church ID', example: 'uuid-here' })
  @IsString()
  @IsNotEmpty()
  churchId: string;

  @ApiPropertyOptional({ description: 'Branch ID', example: 'uuid-here' })
  @IsString()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({
    description: 'Member role in the church',
    enum: MemberRoles,
    example: 'member',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(MemberRoles)
  role: MemberRole;

  @ApiPropertyOptional({ enum: ['Male', 'Female', 'Other'] })
  @IsOptional()
  @IsIn(['Male', 'Female', 'Other'])
  gender?: 'Male' | 'Female' | 'Other';

  @ApiPropertyOptional({
    enum: AgeGroups,
    description: 'Age band (directory / check-in)',
  })
  @IsOptional()
  @IsIn([...AgeGroups])
  ageGroup?: AgeGroup;

  @ApiPropertyOptional({
    description: 'Visitor flag (stored on member; status may be `visitor`)',
  })
  @IsOptional()
  @IsBoolean()
  visitor?: boolean;
}

/** One row in the “Create people” modal (Gracely-style quick add). */
export class CreatePeoplePersonDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description:
      'If omitted, a unique placeholder email is generated so a user account can still be created; edit the profile later.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['Male', 'Female', 'Other'], default: 'Male' })
  @IsOptional()
  @IsIn(['Male', 'Female', 'Other'])
  gender?: 'Male' | 'Female' | 'Other';

  @ApiPropertyOptional({ enum: AgeGroups, default: 'Adult' })
  @IsOptional()
  @IsIn([...AgeGroups])
  ageGroup?: AgeGroup;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  visitor?: boolean;
}

export class CreatePeopleBulkDto {
  @ApiProperty({
    type: [CreatePeoplePersonDto],
    description: 'One object per row in the create-people form',
  })
  @ValidateNested({ each: true })
  @Type(() => CreatePeoplePersonDto)
  @ArrayMinSize(1)
  people: CreatePeoplePersonDto[];

  @ApiPropertyOptional({ description: 'Assign all new members to this branch' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    enum: MemberRoles,
    description: 'Role applied to every person in this batch',
    default: 'member',
  })
  @IsOptional()
  @IsIn(MemberRoles)
  defaultRole?: MemberRole;
}

export class TransferMemberDto {
  @ApiProperty({ description: 'The new branch ID', example: 'uuid-here' })
  @IsString()
  @IsNotEmpty()
  newBranchId: string;
}

export class UpdateMemberStatusDto {
  @ApiProperty({
    description: 'The new status for the member',
    enum: ['new', 'old', 'active', 'inactive', 'visitor'],
    example: 'active',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['new', 'old', 'active', 'inactive', 'visitor'])
  status: string;
}

export class UpdateMemberDto {
  @ApiPropertyOptional({
    description: 'Member role',
    enum: MemberRoles,
    example: 'member',
  })
  @IsString()
  @IsOptional()
  @IsIn(MemberRoles)
  role?: MemberRole;

  @ApiPropertyOptional({
    enum: ['new', 'old', 'active', 'inactive', 'visitor'],
    example: 'active',
  })
  @IsString()
  @IsOptional()
  @IsIn(['new', 'old', 'active', 'inactive', 'visitor'])
  status?: string;

  @ApiPropertyOptional({ enum: ['Male', 'Female', 'Other'] })
  @IsOptional()
  @IsIn(['Male', 'Female', 'Other'])
  gender?: 'Male' | 'Female' | 'Other';

  @ApiPropertyOptional({ enum: AgeGroups })
  @IsOptional()
  @IsIn([...AgeGroups])
  ageGroup?: AgeGroup;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisitor?: boolean;
}

export class MemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  familyId?: string;

  @ApiProperty({ enum: MemberRoles })
  role: MemberRole;

  @ApiProperty()
  gender: string;

  @ApiPropertyOptional()
  ageGroup?: string;

  @ApiProperty()
  isVisitor: boolean;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}

export class MemberListDto {
  @ApiProperty({ type: [MemberDto] })
  items: MemberDto[];

  @ApiProperty()
  count: number;
}
