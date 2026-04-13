import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiBearerSession } from '../../core/swagger/auth-swagger.decorators';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { OnboardingService } from './onboarding.service';
import { OnboardChurchDto, OnboardChurchResultDto } from './dto/onboarding.dto';
import { ApiBaseResponse } from '../../core/swagger/responses.decorator';
import { ActiveUser, ActiveUserEntity } from '../../core/decorators/active-user.decorator';

@ApiTags('onboarding')
@ApiBearerSession()
@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('church')
  @ApiOperation({ summary: 'Create church and HQ branch' })
  @ApiBody({ type: OnboardChurchDto })
  @ApiBaseResponse(OnboardChurchResultDto)
  async onboardChurch(
    @ActiveUser() user: ActiveUserEntity,
    @Body() body: OnboardChurchDto,
  ) {
    return this.onboardingService.onboard(user.id, body.church, body.branch);
  }
}
