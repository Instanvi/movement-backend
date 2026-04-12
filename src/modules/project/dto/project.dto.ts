import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'New Sanctuarity Project' })
  title: string;

  @ApiProperty({
    example: 'Raising funds to build a new sanctuarity at the main branch',
  })
  description: string;

  @ApiProperty({ example: 500000.0 })
  targetAmount: number;

  @ApiProperty({ example: new Date().toISOString() })
  startDate: string;

  @ApiProperty({
    example: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    required: false,
  })
  endDate?: string;

  @ApiProperty({ example: 'cc5527f4-8a4b-4f9e-bf33-219344c20b8e' })
  branchId: string;
}

export class CreateProjectItemDto {
  @ApiProperty({ example: 'Sound System' })
  name: string;

  @ApiProperty({ example: 'Professional audio setup for worship' })
  description?: string;

  @ApiProperty({ example: 15000.0 })
  targetAmount: number;
}

export class ProjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  targetAmount: string;

  @ApiProperty()
  raisedAmount: string;

  @ApiProperty()
  startDate: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiProperty()
  status: string;

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

export class ProjectItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  targetAmount: string;

  @ApiProperty()
  raisedAmount: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  archivedAt?: string;
}
