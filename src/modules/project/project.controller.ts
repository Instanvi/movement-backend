import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/project.dto';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { ProjectDto } from './dto/project.dto';

@ApiTags('projects')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/projects')
@UseGuards(RolesGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiBaseResponse(ProjectDto)
  async create(
    @Param('branchId') branchId: string,
    @Body() body: CreateProjectDto,
  ) {
    return await this.projectService.create(branchId, body);
  }

  @Get('active')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List active projects for a branch' })
  @ApiQuery({ name: 'branchId', required: true, schema: { format: 'uuid' } })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiArrayResponse(ProjectDto)
  async listActive(
    @Query('branchId') branchId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return await this.projectService.listActive(branchId, { limit, offset });
  }
}
