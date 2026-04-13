import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import {
  CreateBatchDto,
  DepositBatchDto,
  UpdateBatchDto,
} from './dto/batch.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiBranchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { BatchDto, BatchOverviewDto } from './dto/batch.dto';
import { BatchListFilter } from '../../domain/repositories/batch.repository';

const BATCH_FILTERS: BatchListFilter[] = ['all', 'open', 'archived'];

function parseBatchFilter(raw?: string): BatchListFilter {
  if (raw && BATCH_FILTERS.includes(raw as BatchListFilter)) {
    return raw as BatchListFilter;
  }
  return 'all';
}

@ApiTags('batches')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/batches')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create batch' })
  @ApiBody({ type: CreateBatchDto })
  @ApiBaseResponse(BatchDto)
  async create(
    @Param('branchId') branchId: string,
    @Body() body: CreateBatchDto,
  ) {
    return await this.batchService.create(branchId, body);
  }

  @Get()
  @ApiOperation({
    summary: 'Batches overview',
    description:
      'Summary counts plus batch rows with per-batch totals and distinct donor counts. Use filter=all|open|archived to match list tabs.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: BATCH_FILTERS,
    description:
      'open = not archived and status open; archived = archivedAt set',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Case-insensitive name match',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiBaseResponse(BatchOverviewDto)
  async list(
    @Param('branchId') branchId: string,
    @Query('filter') filterRaw?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filter = parseBatchFilter(filterRaw);
    const limitNum =
      limit != null && limit !== ''
        ? Math.min(500, Math.max(1, Number(limit)))
        : 100;
    const offsetNum =
      offset != null && offset !== '' ? Math.max(0, Number(offset)) : 0;
    return await this.batchService.getBatchOverview(branchId, {
      filter,
      search,
      limit: limitNum,
      offset: offsetNum,
    });
  }

  @Get(':id')
  @ApiUuidPathParam('id', 'Batch ID')
  @ApiOperation({ summary: 'Get batch by ID' })
  @ApiBaseResponse(BatchDto)
  async getById(@Param('branchId') branchId: string, @Param('id') id: string) {
    return await this.batchService.findOne(branchId, id);
  }

  @Post(':id/deposit')
  @ApiUuidPathParam('id', 'Batch ID')
  @ApiOperation({
    summary: 'Deposit batch',
    description:
      'Posts a credit transaction to the given asset (e.g. checking) account for the sum of non-archived donations on the batch, then sets the batch to closed and archives it. Populate the account dropdown from GET …/finance/accounts (type asset, not archived).',
  })
  @ApiBody({ type: DepositBatchDto })
  async deposit(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() body: DepositBatchDto,
  ) {
    return await this.batchService.depositBatch(branchId, id, body.accountId);
  }

  @Post(':id/archive')
  @ApiUuidPathParam('id', 'Batch ID')
  @ApiOperation({
    summary: 'Archive batch',
    description:
      'Sets archivedAt so the batch appears under Archived (no ledger transaction). Use POST …/deposit to record a bank deposit and close the batch.',
  })
  async archive(@Param('branchId') branchId: string, @Param('id') id: string) {
    return await this.batchService.archiveBatch(branchId, id);
  }

  @Patch(':id')
  @ApiUuidPathParam('id', 'Batch ID')
  @ApiOperation({ summary: 'Update batch' })
  @ApiBody({ type: UpdateBatchDto })
  async update(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() body: UpdateBatchDto,
  ) {
    return await this.batchService.update(branchId, id, body);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Batch ID')
  @ApiOperation({
    summary: 'Delete batch',
    description:
      'Only allowed when no donations reference this batch (donations would otherwise lose their batch link).',
  })
  async delete(@Param('branchId') branchId: string, @Param('id') id: string) {
    return await this.batchService.delete(branchId, id);
  }
}
