import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardChurchDto } from './dto/onboarding.dto';

describe('OnboardingController', () => {
  it('delegates church onboarding to the service for the authenticated user', async () => {
    const onboard = jest.fn().mockResolvedValue({
      church: { id: 'church-1' },
      hqBranch: { id: 'branch-1' },
      branchCount: 1,
    }) as OnboardingService['onboard'];
    const onboardingService = { onboard } as unknown as OnboardingService;
    const controller = new OnboardingController(onboardingService);
    const body = {
      church: { name: 'Grace Chapel' },
      branch: { name: 'Headquarters' },
    } as OnboardChurchDto;

    const req = {
      auth: { user: { id: 'user-1' } },
    };

    const result = await controller.onboardChurch(req as never, body);

    expect(onboard).toHaveBeenCalledWith('user-1', body.church, body.branch);
    expect(result).toEqual({
      church: { id: 'church-1' },
      hqBranch: { id: 'branch-1' },
      branchCount: 1,
    });
  });
});
