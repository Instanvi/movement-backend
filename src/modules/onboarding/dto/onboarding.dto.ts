import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateChurchDto } from '../../church/dto/church.dto';
import { CreateBranchDto } from '../../branch/dto/branch.dto';
export { CreateChurchDto, CreateBranchDto };

export class OnboardChurchDto {
  @ApiProperty({ type: CreateChurchDto })
  @ValidateNested()
  @Type(() => CreateChurchDto)
  church: CreateChurchDto;

  @ApiProperty({ type: CreateBranchDto })
  @ValidateNested()
  @Type(() => CreateBranchDto)
  branch: CreateBranchDto;
}

/** Response shape for `POST /onboarding/church`. */
export class OnboardChurchResultDto {
  @ApiProperty({
    description: 'Created church row',
    type: 'object',
    additionalProperties: true,
  })
  church: Record<string, unknown>;

  @ApiProperty({
    description: 'Headquarters (or first) branch row',
    type: 'object',
    additionalProperties: true,
  })
  hqBranch: Record<string, unknown>;

  @ApiProperty({
    example: 1,
    description: 'Total number of branches for this church after onboarding',
  })
  branchCount: number;
}
