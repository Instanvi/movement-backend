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
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiPaginatedResponse,
} from '../../core/swagger/responses.decorator';
import { PaginationQueryDto } from '../../core/dto/pagination-query.dto';

@ApiTags('devotionals')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/devotionals')
@UseGuards(AuthGuard, RolesGuard)
export class DevotionalController {
  constructor(private readonly devotionalService: DevotionalService) {}

  @Post()
  @Roles('admin', 'overseer', 'pastor')
  @ApiOperation({ summary: 'Create devotional' })
  @ApiBaseResponse(DevotionalDto)
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateDevotionalDto,
  ) {
    return await this.devotionalService.create(churchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List devotionals' })
  @ApiPaginatedResponse(DevotionalDto)
  async list(
    @Param('churchId') churchId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return await this.devotionalService.listByChurch(churchId, pagination);
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
