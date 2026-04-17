import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiChurchIdParam } from '../../core/swagger/path-params.decorators';
import { ChurchSettingService } from './church-setting.service';
import {
  UpdateChurchSettingDto,
  CreateCustomFieldDto,
  ChurchSettingDto,
  CustomFieldDto,
} from './dto/church-setting.dto';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('church-settings')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/settings')
@UseGuards(RolesGuard)
export class ChurchSettingController {
  constructor(private readonly settingService: ChurchSettingService) {}

  @Get()
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'Get church settings' })
  @ApiBaseResponse(ChurchSettingDto)
  async getSetting(@Param('churchId') churchId: string) {
    return await this.settingService.getSetting(churchId);
  }

  @Put()
  @Roles('admin')
  @ApiOperation({ summary: 'Update church settings' })
  @ApiBody({ type: UpdateChurchSettingDto })
  @ApiBaseResponse(ChurchSettingDto)
  async updateSetting(
    @Param('churchId') churchId: string,
    @Body() body: UpdateChurchSettingDto,
  ) {
    return await this.settingService.updateSetting(churchId, body);
  }

  @Get('custom-fields')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List custom member fields' })
  @ApiArrayResponse(CustomFieldDto)
  async getCustomFields(@Param('churchId') churchId: string) {
    return await this.settingService.getCustomFields(churchId);
  }

  @Post('custom-fields')
  @Roles('admin')
  @ApiOperation({ summary: 'Create custom member field' })
  @ApiBody({ type: CreateCustomFieldDto })
  @ApiBaseResponse(CustomFieldDto)
  async createCustomField(
    @Param('churchId') churchId: string,
    @Body() body: CreateCustomFieldDto,
  ) {
    return await this.settingService.createCustomField(churchId, body);
  }
}
