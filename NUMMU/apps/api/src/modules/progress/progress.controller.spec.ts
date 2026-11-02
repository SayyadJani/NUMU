jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    verify: jest.fn(),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

describe('ProgressController', () => {
  let controller: ProgressController;
  let service: Record<string, jest.Mock>;

  const mockUser: AuthenticatedUser = {
    id: 'user-auth-123',
    email: 'student@numu.io',
    username: 'student',
    name: 'Student User',
    role: Role.STUDENT,
    isActive: true,
    isEmailVerified: true,
  };

  beforeEach(async () => {
    service = {
      getOverview: jest.fn().mockResolvedValue({ totalProblemsSolved: 5 }),
      getTopicProgress: jest.fn().mockResolvedValue({ topics: [] }),
      getPatternProgress: jest.fn().mockResolvedValue({ patterns: [] }),
      getSolvedProblems: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getSubmissionHistory: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getActivitySummary: jest.fn().mockResolvedValue({ dailyActivity: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [{ provide: ProgressService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProgressController>(ProgressController);
  });

  it('should scope getOverview strictly to the authenticated user ID', async () => {
    await controller.getOverview(mockUser);
    expect(service.getOverview).toHaveBeenCalledWith('user-auth-123');
  });

  it('should scope getTopicProgress strictly to the authenticated user ID', async () => {
    await controller.getTopicProgress(mockUser);
    expect(service.getTopicProgress).toHaveBeenCalledWith('user-auth-123');
  });

  it('should scope getPatternProgress strictly to the authenticated user ID', async () => {
    await controller.getPatternProgress(mockUser);
    expect(service.getPatternProgress).toHaveBeenCalledWith('user-auth-123');
  });

  it('should scope getSolvedProblems strictly to the authenticated user ID', async () => {
    const query = { page: 1, limit: 10 };
    await controller.getSolvedProblems(mockUser, query);
    expect(service.getSolvedProblems).toHaveBeenCalledWith('user-auth-123', query);
  });

  it('should scope getSubmissionHistory strictly to the authenticated user ID', async () => {
    const query = { page: 1, limit: 10 };
    await controller.getSubmissionHistory(mockUser, query);
    expect(service.getSubmissionHistory).toHaveBeenCalledWith('user-auth-123', query);
  });

  it('should scope getActivity strictly to the authenticated user ID', async () => {
    const query = { startDate: '2026-10-01', endDate: '2026-10-19' };
    await controller.getActivity(mockUser, query);
    expect(service.getActivitySummary).toHaveBeenCalledWith('user-auth-123', query);
  });
});
