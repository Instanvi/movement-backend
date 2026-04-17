import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiBearerSession } from '../../core/swagger/auth-swagger.decorators';
import { OnboardingService } from './onboarding.service';
import { OnboardChurchDto, OnboardChurchResultDto } from './dto/onboarding.dto';
import { ApiBaseResponse } from '../../core/swagger/responses.decorator';

import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@ApiTags('onboarding')
@ApiBearerSession()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('church')
  @ApiOperation({ summary: 'Create church and HQ branch' })
  @ApiBody({ type: OnboardChurchDto })
  @ApiBaseResponse(OnboardChurchResultDto)
  async onboardChurch(
    @Session() session: UserSession,
    @Body() body: OnboardChurchDto,
  ) {
    return this.onboardingService.onboard(
      session.user.id,
      body.church,
      body.branch,
    );
  }
}
