import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DevotionalService } from './devotional.service';
import {
  CreateDevotionalDto,
  UpdateDevotionalDto,
  DevotionalDto,
} from './dto/devotional.dto';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiBranchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiPaginatedResponse,
} from '../../core/swagger/responses.decorator';
import { PaginationQueryDto } from '../../core/dto/pagination-query.dto';

@ApiTags('devotionals')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/devotionals')
@UseGuards(RolesGuard)
export class DevotionalController {
  constructor(private readonly devotionalService: DevotionalService) {}

  @Post()
  @Roles('admin', 'overseer', 'pastor')
  @ApiOperation({ summary: 'Create devotional' })
  @ApiBaseResponse(DevotionalDto)
  async create(
    @Param('branchId') branchId: string,
    @Body() body: CreateDevotionalDto,
  ) {
    return await this.devotionalService.create(branchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List devotionals' })
  @ApiPaginatedResponse(DevotionalDto)
  async list(
    @Param('branchId') branchId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return await this.devotionalService.listByChurch(branchId, pagination);
  }

  @Get(':id')
  @ApiUuidPathParam('id', 'Devotional ID')
  @ApiOperation({ summary: 'Get devotional by ID' })
  @ApiBaseResponse(DevotionalDto)
  async getById(@Param('id') id: string) {
    return await this.devotionalService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'overseer', 'pastor')
  @ApiUuidPathParam('id', 'Devotional ID')
  @ApiOperation({ summary: 'Update devotional' })
  @ApiBaseResponse(DevotionalDto)
  async update(@Param('id') id: string, @Body() body: UpdateDevotionalDto) {
    return await this.devotionalService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'overseer')
  @ApiUuidPathParam('id', 'Devotional ID')
  @ApiOperation({ summary: 'Delete devotional' })
  async delete(@Param('id') id: string) {
    return await this.devotionalService.delete(id);
  }
}
