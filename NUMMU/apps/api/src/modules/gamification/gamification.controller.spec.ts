jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    verify: jest.fn(),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

describe('GamificationController', () => {
  let controller: GamificationController;
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
      getSummary: jest.fn().mockResolvedValue({ xp: { total: 450 } }),
      getBadges: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getAvailableBadges: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getXpHistory: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [{ provide: GamificationService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GamificationController>(GamificationController);
  });

  it('should scope getSummary strictly to the authenticated user ID and forward timezone offset', async () => {
    await controller.getSummary(mockUser, { tzOffsetMinutes: -330 });
    expect(service.getSummary).toHaveBeenCalledWith('user-auth-123', -330);
  });

  it('should scope getBadges strictly to the authenticated user ID', async () => {
    await controller.getBadges(mockUser, { page: 1, limit: 10 });
    expect(service.getBadges).toHaveBeenCalledWith('user-auth-123', { page: 1, limit: 10 });
  });

  it('should scope getAvailableBadges strictly to the authenticated user ID', async () => {
    await controller.getAvailableBadges(mockUser, { page: 2, limit: 20 });
    expect(service.getAvailableBadges).toHaveBeenCalledWith('user-auth-123', { page: 2, limit: 20 });
  });

  it('should scope getXpHistory strictly to the authenticated user ID and prevent cross-user leakage', async () => {
    await controller.getXpHistory(mockUser, { page: 1, limit: 20 });
    expect(service.getXpHistory).toHaveBeenCalledWith('user-auth-123', { page: 1, limit: 20 });
  });
});
