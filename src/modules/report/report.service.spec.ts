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
    const service = new ReportService(reportRepo);

    const result = await service.getOverview('church-1');

    expect(getOrganizationOverview).toHaveBeenCalledWith('church-1');
    expect(result).toEqual({ branchPerformance: [] });
  });
});
