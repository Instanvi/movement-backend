import { ReportService } from './report.service';
import { ReportRepository } from '../../domain/repositories/report.repository';

describe('ReportService', () => {
  it('delegates overview lookup to the repository', async () => {
    const getOrganizationOverview = jest.fn().mockResolvedValue({
      branchPerformance: [],
    });
    const reportRepo = {
      getOrganizationOverview,
    } as unknown as ReportRepository;
    
    // Mock the branch repo returning our churchId
    const findOneBranch = jest.fn().mockResolvedValue({ churchId: 'church-1' });
    const branchRepo = {
      findOne: findOneBranch,
    } as any;
    
    const service = new ReportService(reportRepo, branchRepo);

    // Call with branch-1 now
    const result = await service.getOverview('branch-1');

    expect(findOneBranch).toHaveBeenCalledWith('branch-1');
    expect(getOrganizationOverview).toHaveBeenCalledWith('church-1');
    expect(result).toEqual({ branchPerformance: [] });
  });
});
