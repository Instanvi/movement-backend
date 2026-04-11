import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/branch.dto';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('branch')
@ApiChurchIdParam()
@Controller('churches/:churchId/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @ApiOperation({ summary: 'Create branch' })
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateBranchDto,
  ) {
    return await this.branchService.create(churchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List branches' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async list(
    @Param('churchId') churchId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return await this.branchService.listByChurch(churchId, { limit, offset });
  }

  @Get(':id')
  @ApiUuidPathParam('id', 'Branch ID')
  @ApiOperation({ summary: 'Get branch by ID' })
  async get(@Param('id') id: string) {
    return await this.branchService.getById(id);
  }

  @Patch(':id')
  @ApiUuidPathParam('id', 'Branch ID')
  @ApiOperation({ summary: 'Update branch' })
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateBranchDto>,
  ) {
    return await this.branchService.update(id, body);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Branch ID')
  @ApiOperation({ summary: 'Delete branch' })
  async delete(@Param('id') id: string) {
    return await this.branchService.delete(id);
  }
}
