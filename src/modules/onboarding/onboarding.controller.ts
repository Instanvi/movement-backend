import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiBearerSession } from '../../core/swagger/auth-swagger.decorators';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { OnboardingService } from './onboarding.service';
import { OnboardChurchDto, OnboardChurchResultDto } from './dto/onboarding.dto';
import type { AuthenticatedRequest } from '../../core/types/authenticated-request';
import { ApiBaseResponse } from '../../core/swagger/responses.decorator';

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
    @Request() req: AuthenticatedRequest,
    @Body() body: OnboardChurchDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    return this.onboardingService.onboard(userId, body.church, body.branch);
  }
}
