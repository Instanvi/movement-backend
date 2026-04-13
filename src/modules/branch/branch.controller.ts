import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/branch.dto';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
  ApiPaginatedResponse,
} from '../../core/swagger/responses.decorator';
import { PaginationQueryDto } from '../../core/dto/pagination-query.dto';
import {
  BranchDto,
} from './dto/branch.dto';

@ApiTags('branch')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/branches')
@UseGuards(AuthGuard, RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles('admin', 'overseer')
  @ApiOperation({ summary: 'Create branch' })
  @ApiBaseResponse(BranchDto)
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateBranchDto,
  ) {
    return await this.branchService.create(churchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List branches' })
  @ApiPaginatedResponse(BranchDto)
  async list(
    @Param('churchId') churchId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return await this.branchService.listByChurch(churchId, pagination);
  }

  @Get(':id')
  @ApiUuidPathParam('id', 'Branch ID')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiBaseResponse(BranchDto)
  async get(@Param('id') id: string) {
    return await this.branchService.getById(id);
  }

  @Patch(':id')
  @ApiUuidPathParam('id', 'Branch ID')
  @ApiOperation({ summary: 'Update branch' })
  @ApiBaseResponse(BranchDto)
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateBranchDto>,
  ) {
    return await this.branchService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'overseer')
  @ApiUuidPathParam('id', 'Branch ID')
  @ApiOperation({ summary: 'Delete branch' })
  async delete(@Param('id') id: string) {
    return await this.branchService.delete(id);
  }
}
