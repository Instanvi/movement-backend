import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export const FamilyMemberRoles = [
  'Head of House',
  'Spouse',
  'Child',
  'Relative',
  'Other',
] as const;
export type FamilyMemberRole = (typeof FamilyMemberRoles)[number];

/** One row when creating a family with pre-selected members (Gracely “Create family”). */
export class CreateFamilyMemberRowDto {
  @ApiProperty({ description: 'Existing church member UUID' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ enum: FamilyMemberRoles })
  @IsString()
  @IsIn([...FamilyMemberRoles])
  familyRole: FamilyMemberRole;
}

export class CreateFamilyDto {
  @ApiProperty({ example: 'Eureka' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Optional branch scope' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    description:
      'Main contact / head of household. Must be in `members` or linked in the same request; if omitted, the sole `Head of House` row in `members` is used.',
  })
  @IsOptional()
  @IsUUID()
  headOfHouseId?: string;

  @ApiPropertyOptional({
    type: [CreateFamilyMemberRowDto],
    description:
      'Optional batch link after the family row is created (name + selected members modal).',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyMemberRowDto)
  members?: CreateFamilyMemberRowDto[];
}

/** Partial update (`name`, `branchId`). Head of household: `PATCH .../head-of-house`. */
export class UpdateFamilyDto {
  @ApiPropertyOptional({ example: 'Eureka' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class AddMemberToFamilyDto {
  @ApiProperty()
  @IsUUID()
  memberId: string;

  @ApiProperty({ enum: FamilyMemberRoles })
  @IsString()
  @IsIn([...FamilyMemberRoles])
  familyRole: FamilyMemberRole;
}

export class AssignHeadOfHouseDto {
  @ApiProperty({
    description:
  @IsUUID()
  memberId: string;
}

export class FamilyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  churchId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiPropertyOptional()
  headOfHouseId?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}
