import { ReportController } from './report.controller';
import { ReportService } from './report.service';

describe('ReportController', () => {
  it('returns the overview from the report service', async () => {
    const getOverview = jest.fn().mockResolvedValue({
      totalDonations: { total: 5000, count: 8 },
    });
    const reportService = { getOverview } as unknown as ReportService;
    const controller = new ReportController(reportService);

    const result = await controller.getOverview('church-1');

    expect(getOverview).toHaveBeenCalledWith('church-1');
    expect(result).toEqual({
      totalDonations: { total: 5000, count: 8 },
    });
  });
});
