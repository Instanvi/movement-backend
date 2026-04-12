import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2026-04-12T18:13:51.000Z' })
  timestamp: string;
}

export class PaginatedDataDto<T> {
  @ApiProperty()
  items: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;
}
